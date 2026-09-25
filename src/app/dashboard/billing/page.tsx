import * as React from "react";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateTrial } from "@/services/usage";
import { getUnifiedPlans } from "@/lib/plans";
import { formatDate } from "@/lib/utils";
import { Metadata } from "next";
import { BillingClient } from "@/components/dashboard/billing-client";
import {
  CreditCard, Crown, Clock, CheckCircle2, AlertCircle, Receipt,
  CalendarClock, ShieldCheck, Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata: Metadata = { title: "Billing & Subscription | ToolVerse AI" };

export default async function BillingPage() {
  const session = await getServerAuthSession();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;
  const userEmail = session.user.email || "";
  const userName = session.user.name || "";

  const [user, payments, unifiedPlans] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        trial: true,
        subscriptions: {
          include: { plan: true },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    }),
    prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    getUnifiedPlans(),
  ]);

  if (!user) redirect("/login");

  const activeSub = user.subscriptions.find((s) => s.status === "ACTIVE");
  const { isActive: trialActive, daysRemaining } = evaluateTrial(user.trial as any);
  const currentPlanKey = (activeSub?.plan.name as any) ?? null;
  const currentPlan = unifiedPlans.find((p) => p.name === currentPlanKey);

  const displayTitle = currentPlan?.title || activeSub?.plan.title || (trialActive ? "Free Trial" : "No Plan Selected");
  const displayPrice = currentPlan?.price || activeSub?.plan.price;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="pb-2 border-b border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[11px] font-bold text-primary mb-2 border border-primary/20">
            <Zap className="h-3.5 w-3.5" /> Workspace Financial Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Billing &amp; Subscription
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
            Manage your subscription tier, Razorpay invoices, and real-time limits.
          </p>
        </div>
      </div>

      {/* Current Plan Status Card */}
      <div className="glass-card rounded-[2rem] p-6 sm:p-8 border-white/10 dark:border-white/5 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {activeSub && !trialActive ? (
                <Badge variant="outline" className="gap-1.5 text-xs py-1 px-3 bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-extrabold">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Active Paid Subscription
                </Badge>
              ) : trialActive ? (
                <Badge variant="outline" className="gap-1.5 text-xs py-1 px-3 bg-amber-500/10 border-amber-500/30 text-amber-400 font-extrabold">
                  <Clock className="h-3.5 w-3.5" />
                  7-Day Free Trial Active
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1.5 text-xs py-1 px-3 font-extrabold">
                  <AlertCircle className="h-3.5 w-3.5" />
                  No Active Subscription
                </Badge>
              )}
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2.5">
                <Crown className="h-7 w-7 text-primary" />
                {displayTitle} Plan
              </h2>
              {displayPrice && (
                <p className="text-sm font-bold text-emerald-400 mt-1">
                  ₹{displayPrice.toLocaleString("en-IN")}/month
                </p>
              )}
              {trialActive && !activeSub && (
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">
                  {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} remaining in your unrestricted free trial
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-xs text-muted-foreground font-medium">
              {activeSub && (
                <>
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-3.5 w-3.5 text-primary" />
                    <span>Started: {formatDate(activeSub.currentPeriodStart)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarClock className="h-3.5 w-3.5 text-primary" />
                    <span>
                      {activeSub.cancelAtPeriodEnd ? "Expires" : "Renews"}:{" "}
                      {formatDate(activeSub.currentPeriodEnd)}
                    </span>
                  </div>
                </>
              )}
              {user.trial && (
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>Trial ends: {formatDate(user.trial.trialEndDate)}</span>
                </div>
              )}
            </div>

            {activeSub?.cancelAtPeriodEnd && (
              <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3.5 py-2 w-fit font-bold">
                <AlertCircle className="h-4 w-4" />
                Subscription scheduled to end on {formatDate(activeSub.currentPeriodEnd)}
              </div>
            )}
          </div>

          {/* Plan Limits Highlight Dock */}
          <div className="space-y-3 p-5 rounded-2xl bg-card/70 border border-border/50 text-xs min-w-[240px]">
            <p className="font-black text-foreground text-xs uppercase tracking-wider mb-3">
              Included Tier Capabilities
            </p>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground font-medium">AI Requests</span>
              <span className="font-bold text-foreground">
                {currentPlanKey === "PREMIUM" || currentPlanKey === "PRO" ? "Unlimited" : "20 requests/day"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground font-medium">Max Upload</span>
              <span className="font-bold text-foreground">
                {currentPlanKey === "PREMIUM" ? "2 GB" : currentPlanKey === "PRO" ? "250 MB" : "25 MB"}
              </span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground font-medium">Neural 4K Upscale</span>
              <span className="font-bold text-emerald-400">
                {currentPlanKey === "PREMIUM" || currentPlanKey === "PRO" ? "Included" : "Pro Tier"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Billing & Plan Upgrader */}
      <React.Suspense fallback={
        <div className="glass-card p-12 rounded-[2.5rem] text-center">
          <div className="h-8 w-48 bg-muted/40 rounded-xl mx-auto mb-4 animate-pulse" />
          <div className="h-48 w-full bg-muted/20 rounded-2xl animate-pulse" />
        </div>
      }>
        <BillingClient
          hasActiveSub={!!activeSub}
          cancelAtPeriodEnd={activeSub?.cancelAtPeriodEnd ?? false}
          currentPlanKey={currentPlanKey}
          userEmail={userEmail}
          userName={userName}
          trialActive={trialActive}
          daysRemaining={daysRemaining}
          plans={unifiedPlans}
        />
      </React.Suspense>

      {/* Payment History */}
      <Card className="glass-card border-white/10 dark:border-white/5 rounded-3xl overflow-hidden shadow-lg">
        <CardHeader className="border-b border-border/40 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-black flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                Payment &amp; Invoice History
              </CardTitle>
              <CardDescription className="text-xs mt-0.5 font-medium">
                Verified transactions processed via Razorpay gateway
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CreditCard className="h-10 w-10 mx-auto mb-3 opacity-30 text-primary" />
              <p className="text-sm font-bold text-foreground">No transactions recorded yet</p>
              <p className="text-xs mt-1 text-muted-foreground">
                Invoices and payment receipts will appear here immediately after your first transaction.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-[11px] font-black text-muted-foreground uppercase tracking-wider bg-muted/10">
                    <th className="text-left py-3.5 px-6">Date</th>
                    <th className="text-left py-3.5 px-4">Transaction ID</th>
                    <th className="text-left py-3.5 px-4">Amount</th>
                    <th className="text-left py-3.5 px-4">Gateway</th>
                    <th className="text-left py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 text-muted-foreground text-xs font-medium">
                        {formatDate(payment.createdAt)}
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-foreground font-bold">
                        {payment.orderId.slice(0, 22)}…
                      </td>
                      <td className="py-4 px-4 font-black text-foreground">
                        ₹{payment.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-4 text-muted-foreground text-xs font-semibold">
                        {payment.method === "MOCK_MODE" ? "Razorpay (Test)" : payment.method || "Razorpay"}
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            payment.status === "SUCCESS"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : payment.status === "FAILED"
                              ? "bg-red-500/10 text-red-400 border-red-500/30"
                              : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {payment.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
