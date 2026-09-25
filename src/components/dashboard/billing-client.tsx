"use client";

import * as React from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldAlert, 
  Crown, 
  Zap, 
  Check, 
  ShieldCheck,
  CreditCard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RazorpayCheckout } from "@/components/payment/razorpay-checkout";
import { cancelSubscriptionAction } from "@/actions/payment";
import { CANONICAL_PLANS, UnifiedPlan } from "@/lib/plans";
import { PlanTier } from "@/types";
import { useRouter } from "next/navigation";

const PLAN_ORDER: PlanTier[] = ["BASIC", "PRO", "PREMIUM"];

interface BillingClientProps {
  hasActiveSub: boolean;
  cancelAtPeriodEnd: boolean;
  currentPlanKey: PlanTier | null;
  userEmail: string;
  userName: string;
  trialActive: boolean;
  daysRemaining: number;
  plans?: UnifiedPlan[];
}

export function BillingClient({
  hasActiveSub,
  cancelAtPeriodEnd,
  currentPlanKey,
  userEmail,
  userName,
  trialActive,
  daysRemaining,
  plans,
}: BillingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkoutSectionRef = React.useRef<HTMLDivElement>(null);

  // Map unified plans to lookup
  const activePlans = plans && plans.length > 0 ? plans : CANONICAL_PLANS;
  const plansMap: Record<PlanTier, UnifiedPlan> = React.useMemo(() => {
    const basic = activePlans.find((p) => p.name === "BASIC") || CANONICAL_PLANS[0];
    const pro = activePlans.find((p) => p.name === "PRO") || CANONICAL_PLANS[1];
    const premium = activePlans.find((p) => p.name === "PREMIUM") || CANONICAL_PLANS[2];
    return {
      BASIC: basic,
      PRO: pro,
      PREMIUM: premium,
    };
  }, [activePlans]);

  // Read URL query parameter for pre-selection (e.g. /dashboard/billing?plan=pro)
  const urlPlanParam = (searchParams.get("plan") || "").toLowerCase().trim();
  const initialSelectedPlan: PlanTier | null = React.useMemo(() => {
    if (urlPlanParam === "pro") return "PRO";
    if (urlPlanParam === "enterprise" || urlPlanParam === "premium") return "PREMIUM";
    if (urlPlanParam === "starter" || urlPlanParam === "basic") return "BASIC";
    // If on trial or no active sub, default to Pro Creator
    if (trialActive || !hasActiveSub) return "PRO";
    return null;
  }, [urlPlanParam, trialActive, hasActiveSub]);

  const [selectedPlan, setSelectedPlan] = React.useState<PlanTier | null>(initialSelectedPlan);
  const [cancelLoading, setCancelLoading] = React.useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = React.useState(false);

  // Update selected plan if URL param changes
  React.useEffect(() => {
    if (urlPlanParam === "pro") setSelectedPlan("PRO");
    else if (urlPlanParam === "enterprise" || urlPlanParam === "premium") setSelectedPlan("PREMIUM");
    else if (urlPlanParam === "starter" || urlPlanParam === "basic") setSelectedPlan("BASIC");

    if (searchParams.get("checkout") === "true") {
      setTimeout(() => {
        checkoutSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 400);
    }
  }, [urlPlanParam, searchParams]);

  function handleSelectPlan(planKey: PlanTier) {
    setSelectedPlan(planKey);
    setTimeout(() => {
      checkoutSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100);
  }

  async function handleCancel() {
    setCancelLoading(true);
    try {
      const result = await cancelSubscriptionAction();
      if (result.success) {
        toast.success(result.message);
        setShowCancelConfirm(false);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } finally {
      setCancelLoading(false);
    }
  }

  const currentSelectedPlanData = selectedPlan ? plansMap[selectedPlan] : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 👑 Premium Plan Selection Cards */}
      <div className="glass-card rounded-[2.5rem] p-6 sm:p-10 border-white/10 dark:border-white/5 relative overflow-hidden shadow-2xl">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-pill text-[11px] font-extrabold uppercase tracking-wider text-primary mb-3 border border-primary/20">
            <Sparkles className="h-3.5 w-3.5" /> Direct Workspace Billing
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {hasActiveSub ? "Manage & Upgrade Workspace" : "Choose Your Subscription Plan"}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 font-medium">
            {trialActive && !hasActiveSub
              ? `Your free trial has ${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining. Upgrade now to lock in permanent access.`
              : "Select a tier below to activate instant access via Razorpay (UPI, NetBanking, Cards)."}
          </p>
        </div>

        {/* 3 Unified Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLAN_ORDER.map((planKey) => {
            const plan = plansMap[planKey];
            const isCurrent = currentPlanKey === planKey;
            const isSelected = selectedPlan === planKey;
            const isPopular = plan.popular;

            return (
              <div
                key={planKey}
                onClick={() => handleSelectPlan(planKey)}
                className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 transition-all duration-300 glass-card cursor-pointer ${
                  isSelected
                    ? "ring-2 ring-primary border-primary bg-primary/10 shadow-2xl shadow-emerald-500/15 scale-[1.02]"
                    : "border-border/60 hover:border-primary/40 hover:bg-white/[0.02] hover:scale-[1.01]"
                }`}
              >
                {/* Popular or Current Badge */}
                <div className="absolute -top-3.5 left-0 right-0 flex justify-center pointer-events-none">
                  {isCurrent ? (
                    <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md">
                      Current Active Tier
                    </div>
                  ) : isPopular ? (
                    <div className="gradient-btn text-white dark:text-[#01140e] px-3.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg shadow-emerald-500/30">
                      ★ Most Popular
                    </div>
                  ) : null}
                </div>

                <div>
                  <div className="flex items-center justify-between mt-2 mb-3">
                    <span className="text-lg font-black text-foreground">
                      {plan.title}
                    </span>
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected 
                        ? "border-primary bg-primary text-slate-950 font-bold shadow-sm" 
                        : "border-border/80"
                    }`}>
                      {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1 mb-3 pb-3 border-b border-border/30">
                    <span className="text-3xl sm:text-4xl font-black text-foreground">
                      ₹{plan.price.toLocaleString("en-IN")}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">/ month</span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-6 font-medium leading-relaxed min-h-[36px]">
                    {plan.tagline}
                  </p>

                  <div className="text-[11px] font-black uppercase tracking-wider text-foreground mb-3">
                    Includes:
                  </div>
                  <ul className="space-y-2.5 mb-6 text-xs text-muted-foreground font-medium">
                    {plan.features.slice(0, 5).map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="leading-snug text-foreground/90">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Action Button */}
                <div className="pt-4 border-t border-border/30 mt-auto">
                  <Button
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className={`w-full h-11 rounded-xl text-xs font-black transition-all ${
                      isSelected
                        ? "gradient-btn shadow-md shadow-emerald-500/30 text-white dark:text-[#01140e]"
                        : "border-border/80 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectPlan(planKey);
                    }}
                  >
                    {isCurrent && hasActiveSub && !trialActive ? (
                      "Selected Plan (Active)"
                    ) : isCurrent && trialActive ? (
                      `Activate Paid Plan (₹${plan.price})`
                    ) : (
                      `Select ${plan.title} (₹${plan.price})`
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Razorpay Checkout Area */}
        {selectedPlan && currentSelectedPlanData && (
          <div 
            ref={checkoutSectionRef}
            className="mt-10 max-w-2xl mx-auto p-7 sm:p-9 rounded-[2rem] glass-card border border-primary/40 shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-500 relative overflow-hidden text-center bg-gradient-to-b from-primary/5 via-card/80 to-transparent"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
            
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black mb-3">
              <Crown className="h-3.5 w-3.5" />
              <span>Confirm Order Selection</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-foreground mb-1.5">
              Upgrade to {currentSelectedPlanData.title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-6 font-medium max-w-md mx-auto">
              You are activating the <strong>{currentSelectedPlanData.title}</strong> tier at <strong>₹{currentSelectedPlanData.price.toLocaleString("en-IN")}/month</strong>. Instant activation with high-speed tool throughput.
            </p>
            
            <div className="p-4 rounded-xl bg-card/90 border border-border/50 mb-6 flex items-center justify-between text-left">
              <div>
                <div className="text-xs font-bold text-foreground">{currentSelectedPlanData.title} Monthly Pass</div>
                <div className="text-[11px] text-muted-foreground">Automatic monthly renewal • Cancel anytime</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-emerald-500">₹{currentSelectedPlanData.price}</div>
                <div className="text-[10px] text-muted-foreground">tax included</div>
              </div>
            </div>

            <RazorpayCheckout
              planTier={selectedPlan}
              planTitle={currentSelectedPlanData.title}
              planPrice={currentSelectedPlanData.price}
              userEmail={userEmail}
              userName={userName}
              onSuccess={() => {
                toast.success("Payment verified! Subscription activated. Loading dashboard...");
                router.push("/dashboard");
                router.refresh();
              }}
            />
          </div>
        )}
      </div>

      {/* ⚠️ Cancel Subscription Section */}
      {hasActiveSub && (
        <Card className="glass-card border-white/10 dark:border-white/5 shadow-sm">
          <CardHeader className="pb-4 border-b border-border/40">
            <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-muted-foreground" /> Subscription Control
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-foreground">Cancel Automated Renewal</p>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  {cancelAtPeriodEnd
                    ? "Your subscription is scheduled to expire at the end of the current billing cycle."
                    : "You will retain complete access to all features until the end of your prepaid period."}
                </p>
              </div>
              {!cancelAtPeriodEnd && (
                <div className="shrink-0">
                  {showCancelConfirm ? (
                    <div className="flex items-center gap-2 animate-in fade-in">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs font-bold"
                        onClick={() => setShowCancelConfirm(false)}
                        disabled={cancelLoading}
                      >
                        Nevermind
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-xs font-black rounded-xl"
                        onClick={handleCancel}
                        disabled={cancelLoading}
                      >
                        {cancelLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirm Cancel"}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold text-xs rounded-xl"
                      onClick={() => setShowCancelConfirm(true)}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
