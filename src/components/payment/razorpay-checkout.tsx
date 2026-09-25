"use client";

import * as React from "react";
import Script from "next/script";
import { toast } from "sonner";
import { Loader2, CreditCard, ShieldCheck, CheckCircle2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createOrderAction, verifyPaymentAction } from "@/actions/payment";
import { PlanTier } from "@/types";
import { useRouter } from "next/navigation";
import { SUBSCRIPTION_PLANS } from "@/config/plans";

interface RazorpayCheckoutProps {
  planTier: PlanTier;
  userEmail: string;
  userName: string;
  planTitle?: string;
  planPrice?: number;
  onSuccess?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export function RazorpayCheckout({
  planTier,
  userEmail,
  userName,
  planTitle,
  planPrice,
  onSuccess,
}: RazorpayCheckoutProps) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const fallbackPlan = SUBSCRIPTION_PLANS[planTier];
  const displayTitle = planTitle || fallbackPlan?.title || (planTier === "PREMIUM" ? "Enterprise" : planTier === "PRO" ? "Pro Creator" : "Starter");
  const displayPrice = planPrice ?? fallbackPlan?.price ?? (planTier === "PREMIUM" ? 1200 : planTier === "PRO" ? 450 : 150);

  async function handlePayment() {
    setLoading(true);

    try {
      const orderRes = await createOrderAction(planTier);
      if (!orderRes.success) {
        toast.error(orderRes.error);
        setLoading(false);
        return;
      }

      const { orderId, amount, currency, keyId } = orderRes.data;

      // MOCK MODE BYPASS (Local development or when placeholder keys are in .env)
      if (keyId === "mock_key_id") {
        toast.loading("Processing secure simulated payment...", { id: "pay-sim" });
        
        // Small realistic delay for great UX feel
        await new Promise((resolve) => setTimeout(resolve, 800));

        const verifyRes = await verifyPaymentAction({
          razorpayOrderId: orderId,
          razorpayPaymentId: "mock_pay_" + Date.now(),
          razorpaySignature: "mock_signature",
          planTier: planTier,
        });

        toast.dismiss("pay-sim");

        if (verifyRes.success) {
          toast.success(`Payment successful! Your ${displayTitle} subscription is now active.`);
          if (onSuccess) onSuccess();
          router.refresh();
        } else {
          toast.error(verifyRes.error || "Payment verification failed.");
        }
        setLoading(false);
        return;
      }

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "Korevante Studio",
        description: `Subscription to ${displayTitle} Plan`,
        order_id: orderId,
        handler: async function (response: any) {
          const verifyRes = await verifyPaymentAction({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            planTier: planTier,
          });

          if (verifyRes.success) {
            toast.success(`Payment successful! Your ${displayTitle} subscription is now active.`);
            if (onSuccess) onSuccess();
            router.refresh();
          } else {
            toast.error(verifyRes.error || "Payment verification failed.");
          }
        },
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: "#10b981", // Cyber-Mint brand color
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error(response.error?.description || "Payment failed. Please try another method.");
      });

      rzp.open();
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="flex flex-col items-center w-full">
        <Button
          onClick={handlePayment}
          disabled={loading}
          size="lg"
          className="w-full h-14 gradient-btn font-black text-base sm:text-lg rounded-2xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-400/40 text-white dark:text-[#01140e] transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-1" />
              Processing Secure Order...
            </>
          ) : (
            <>
              <ShieldCheck className="h-5 w-5 mr-1" />
              Pay ₹{displayPrice.toLocaleString("en-IN")} &amp; Activate {displayTitle}
            </>
          )}
        </Button>
        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 text-emerald-500">
            <Lock className="h-3.5 w-3.5" /> 256-Bit SSL Encryption
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5 text-primary" /> Razorpay Verified • UPI, Cards &amp; NetBanking
          </span>
        </div>
      </div>
    </>
  );
}
