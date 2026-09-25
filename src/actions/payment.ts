"use server";

import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { razorpay } from "@/lib/razorpay";
import { getServerAuthSession } from "@/lib/auth";
import { SUBSCRIPTION_PLANS } from "@/config/plans";
import { PlanTier } from "@/types";

type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

function isMockRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID || "";
  const keySecret = process.env.RAZORPAY_KEY_SECRET || "";
  return (
    !keyId || 
    keyId.trim() === "" || 
    keyId.includes("placeholder") || 
    !keySecret || 
    keySecret.trim() === "" || 
    keySecret.includes("placeholder")
  );
}

// ─────────────────────────────────────────────────────────────
// Create Razorpay Order for new subscription
// ─────────────────────────────────────────────────────────────
export async function createOrderAction(
  planTier: PlanTier
): Promise<ActionResult<{ orderId: string; amount: number; currency: string; keyId: string }>> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) return { success: false, error: "Not authenticated" };
    const userId = (session.user as any).id as string;

    // Resolve price from database or fallback to canonical
    const dbPlan = await prisma.plan.findUnique({ where: { name: planTier } });
    const fallbackPlan = SUBSCRIPTION_PLANS[planTier];
    const planPrice = dbPlan ? dbPlan.price : fallbackPlan ? fallbackPlan.price : 450;

    // Amount in paise (INR × 100)
    const amountPaise = Math.round(planPrice * 100);

    // MOCK MODE FOR LOCAL DEVELOPMENT OR PLACEHOLDER KEYS
    if (isMockRazorpay()) {
      console.warn("[Razorpay] Mocking order creation because live keys are not configured.");
      const mockOrderId = `mock_order_${Date.now()}`;
      
      await prisma.payment.create({
        data: {
          userId,
          orderId: mockOrderId,
          amount: planPrice,
          currency: "INR",
          status: "PENDING",
          metadata: JSON.stringify({ isMock: true, planTier }),
        },
      });

      return {
        success: true,
        data: {
          orderId: mockOrderId,
          amount: amountPaise,
          currency: "INR",
          keyId: "mock_key_id",
        },
      };
    }

    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: `tv_${userId.slice(0, 8)}_${Date.now()}`,
      notes: {
        userId,
        planTier,
        platform: "korevante-studio",
      },
    });

    // Record pending payment
    await prisma.payment.create({
      data: {
        userId,
        orderId: order.id,
        amount: planPrice,
        currency: "INR",
        status: "PENDING",
        metadata: JSON.stringify({ planTier }),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: "PAYMENT_ORDER_CREATED",
        resource: "payment",
        metadata: JSON.stringify({ planTier }),
      },
    });

    return {
      success: true,
      data: {
        orderId: order.id,
        amount: amountPaise,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID || "",
      },
    };
  } catch (error: any) {
    console.error("[createOrderAction]", error);
    return { success: false, error: "Failed to create payment order. Please try again." };
  }
}

// ─────────────────────────────────────────────────────────────
// Verify Razorpay Payment Signature (Server-side ONLY)
// ─────────────────────────────────────────────────────────────
export async function verifyPaymentAction(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  planTier: PlanTier;
}): Promise<ActionResult<{ subscriptionId: string }>> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) return { success: false, error: "Not authenticated" };
    const userId = (session.user as any).id as string;

    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, planTier } = params;

    // MOCK MODE BYPASS FOR LOCAL DEVELOPMENT ONLY (Strictly disabled in production)
    const isDevelopment = process.env.NODE_ENV !== "production";
    if (isDevelopment && (razorpayOrderId.startsWith("mock_order_") || isMockRazorpay())) {
      console.warn("[Razorpay] Mocking verification bypass for development.");
      const dbPlan = await prisma.plan.findUnique({ where: { name: planTier } })
        || await prisma.plan.findFirst({ where: { name: planTier } });
      if (!dbPlan) return { success: false, error: "Plan not found" };

      // Update mock payment
      await prisma.payment.upsert({
        where: { orderId: razorpayOrderId },
        update: {
          paymentId: razorpayPaymentId || `mock_pay_${Date.now()}`,
          status: "SUCCESS",
          method: "MOCK_MODE",
        },
        create: {
          userId,
          orderId: razorpayOrderId,
          paymentId: razorpayPaymentId || `mock_pay_${Date.now()}`,
          amount: dbPlan.price,
          currency: "INR",
          status: "SUCCESS",
          method: "MOCK_MODE",
        },
      });

      // Grant subscription
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      // Cancel any active subscriptions
      await prisma.subscription.updateMany({
        where: { userId, status: "ACTIVE" },
        data: { status: "CANCELLED" },
      });

      const sub = await prisma.subscription.create({
        data: {
          userId,
          planId: dbPlan.id,
          status: "ACTIVE",
          currentPeriodStart: new Date(),
          currentPeriodEnd: endDate,
          razorpaySubscriptionId: razorpayPaymentId || `mock_sub_${Date.now()}`,
        },
      });

      // Cancel trial (user is now paid)
      await prisma.trial.updateMany({
        where: { userId, trialStatus: "ACTIVE" },
        data: { trialStatus: "CANCELLED" },
      });

      await prisma.notification.create({
        data: {
          userId,
          title: `${dbPlan.title} Plan Activated 🎉`,
          message: `Your payment was successful and your ${dbPlan.title} subscription is now active until ${endDate.toLocaleDateString("en-IN", { dateStyle: "long" })}.`,
          type: "SUCCESS",
          link: "/dashboard/billing",
        },
      });

      return { success: true, data: { subscriptionId: sub.id } };
    }

    // ── Cryptographic Signature Verification ──────────────────
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) return { success: false, error: "Payment configuration error" };

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    // SECURITY: Constant-time comparison to prevent timing attacks
    const expectedBuf = Buffer.from(expectedSignature, "utf8");
    const actualBuf = Buffer.from(razorpaySignature || "", "utf8");
    const isSignatureValid =
      expectedBuf.length === actualBuf.length &&
      crypto.timingSafeEqual(expectedBuf, actualBuf);

    if (!isSignatureValid) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "PAYMENT_SIGNATURE_MISMATCH",
          resource: "payment",
          metadata: JSON.stringify({}),
        },
      });
      return { success: false, error: "Payment verification failed. Signature mismatch." };
    }

    // ── Fetch plan from DB ────────────────────────────────────
    const dbPlan = await prisma.plan.findUnique({ where: { name: planTier } });
    if (!dbPlan) return { success: false, error: "Plan not found" };

    // ── Idempotency: Check if already processed ───────────────
    const existingPayment = await prisma.payment.findUnique({
      where: { paymentId: razorpayPaymentId },
    });
    if (existingPayment?.status === "SUCCESS") {
      const sub = await prisma.subscription.findFirst({
        where: { userId, status: "ACTIVE" },
      });
      return { success: true, data: { subscriptionId: sub?.id ?? "" } };
    }

    // ── Create/Update Subscription & Mark Payment Success ──────
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const [subscription] = await prisma.$transaction([
      // Cancel any existing active subscription
      prisma.subscription.updateMany({
        where: { userId, status: "ACTIVE" },
        data: { status: "CANCELLED", cancelAtPeriodEnd: false },
      }),
    ]) as any;

    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        planId: dbPlan.id,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    // Mark payment as successful
    await prisma.payment.update({
      where: { orderId: razorpayOrderId },
      data: {
        paymentId: razorpayPaymentId,
        signature: razorpaySignature,
        status: "SUCCESS",
        subscriptionId: newSubscription.id,
        method: "razorpay",
        metadata: JSON.stringify({}),
      },
    });

    // Mark trial as cancelled (subscription takes over)
    await prisma.trial.updateMany({
      where: { userId, trialStatus: "ACTIVE" },
      data: { trialStatus: "CANCELLED" },
    });

    // Send success notification
    await prisma.notification.create({
      data: {
        userId,
        title: `${dbPlan.title} Plan Activated 🎉`,
        message: `Your ${dbPlan.title} subscription is now active. Enjoy ${dbPlan.title}-tier access to all tools. Renews on ${periodEnd.toLocaleDateString("en-IN", { dateStyle: "long" })}.`,
        type: "SUCCESS",
        link: "/dashboard/billing",
      },
    });

    await prisma.auditLog.create({
      data: {
        userId,
        action: "PAYMENT_SUCCESS",
        resource: "subscription",
        metadata: JSON.stringify({}),
      },
    });

    return { success: true, data: { subscriptionId: newSubscription.id } };
  } catch (error: any) {
    console.error("[verifyPaymentAction]", error);
    return { success: false, error: "Payment processing failed. Contact support with your payment ID." };
  }
}

// ─────────────────────────────────────────────────────────────
// Cancel Subscription
// ─────────────────────────────────────────────────────────────
export async function cancelSubscriptionAction(): Promise<
  { success: true; message: string } | { success: false; error: string }
> {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) return { success: false, error: "Not authenticated" };
    const userId = (session.user as any).id as string;

    const sub = await prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
    });

    if (!sub) return { success: false, error: "No active subscription found." };

    await prisma.subscription.update({
      where: { id: sub.id },
      data: { cancelAtPeriodEnd: true },
    });

    await prisma.notification.create({
      data: {
        userId,
        title: "Subscription Cancellation Scheduled",
        message: `Your subscription has been set to cancel at the end of the current billing period (${sub.currentPeriodEnd.toLocaleDateString("en-IN", { dateStyle: "long" })}). You'll retain access until then.`,
        type: "WARNING",
        link: "/dashboard/billing",
      },
    });

    await prisma.auditLog.create({
      data: { userId, action: "SUBSCRIPTION_CANCEL_REQUESTED", resource: "subscription", metadata: JSON.stringify({}) },
    });

    return { success: true, message: "Subscription will be cancelled at the end of the billing period." };
  } catch (error) {
    return { success: false, error: "Failed to cancel subscription." };
  }
}
