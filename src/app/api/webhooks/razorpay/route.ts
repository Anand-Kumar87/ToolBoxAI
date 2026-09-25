import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// Razorpay sends webhook events with HMAC-SHA256 signature
// This handler verifies the signature and processes subscription events

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET not configured");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // ── Verify Webhook Signature ──────────────────────────────
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  // SECURITY: Constant-time comparison to prevent timing attacks
  const expectedBuf = Buffer.from(expectedSignature, "utf8");
  const actualBuf = Buffer.from(signature, "utf8");
  const isSignatureValid =
    expectedBuf.length === actualBuf.length &&
    crypto.timingSafeEqual(expectedBuf, actualBuf);

  if (!isSignatureValid) {
    console.warn("[Razorpay Webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // ── Parse & Route Event ───────────────────────────────────
  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const eventType = event.event;
  const payload = event.payload;

  try {
    switch (eventType) {
      case "payment.captured": {
        const payment = payload.payment?.entity;
        if (!payment) break;

        await prisma.payment.updateMany({
          where: { orderId: payment.order_id },
          data: {
            paymentId: payment.id,
            status: "SUCCESS",
            method: payment.method,
            metadata: JSON.stringify({}),
          },
        });
        break;
      }

      case "payment.failed": {
        const payment = payload.payment?.entity;
        if (!payment) break;

        await prisma.payment.updateMany({
          where: { orderId: payment.order_id },
          data: {
            status: "FAILED",
            metadata: JSON.stringify({}),
          },
        });

        // Notify user of failed payment
        const failedPayment = await prisma.payment.findFirst({
          where: { orderId: payment.order_id },
        });
        if (failedPayment?.userId) {
          await prisma.notification.create({
            data: {
              userId: failedPayment.userId,
              title: "Payment Failed",
              message: "Your payment could not be processed. Please try again or use a different payment method.",
              type: "ERROR",
              link: "/dashboard/billing",
            },
          });
        }
        break;
      }

      case "subscription.charged":
      case "subscription.activated": {
        const subscription = payload.subscription?.entity;
        if (!subscription) break;

        // Update subscription in DB
        await prisma.subscription.updateMany({
          where: { razorpaySubscriptionId: subscription.id },
          data: {
            status: "ACTIVE",
            currentPeriodEnd: new Date(subscription.current_end * 1000),
          },
        });
        break;
      }

      case "subscription.cancelled":
      case "subscription.expired": {
        const subscription = payload.subscription?.entity;
        if (!subscription) break;

        await prisma.subscription.updateMany({
          where: { razorpaySubscriptionId: subscription.id },
          data: { status: eventType.includes("cancelled") ? "CANCELLED" : "EXPIRED" },
        });
        break;
      }

      default:
        // Acknowledge but ignore unknown events
        break;
    }

    // Log the webhook event
    await prisma.auditLog.create({
      data: {
        action: `WEBHOOK_${eventType.toUpperCase().replace(".", "_")}`,
        resource: "webhook",
        metadata: JSON.stringify({}),
      },
    });

    return NextResponse.json({ received: true, event: eventType });
  } catch (error: any) {
    console.error("[Razorpay Webhook] Handler error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
