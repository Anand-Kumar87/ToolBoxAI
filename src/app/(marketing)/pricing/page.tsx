"use client";

import * as React from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { 
  Check, 
  Sparkles, 
  Zap, 
  Shield, 
  ArrowRight, 
  HelpCircle, 
  ChevronDown, 
  Lock, 
  Star,
  CheckCircle2,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CANONICAL_PLANS, UnifiedPlan } from "@/lib/plans";

const PRICING_PLANS = CANONICAL_PLANS;

const COMPARISON_CATEGORIES = [
  {
    name: "AI & Content Tools",
    features: [
      { name: "Daily AI generation requests", starter: "20 / day", pro: "Unlimited", enterprise: "Unlimited" },
      { name: "GPT & Claude integration", starter: true, pro: true, enterprise: true },
      { name: "Long-form blog & article generator", starter: "Up to 500 words", pro: "Unlimited", enterprise: "Unlimited" },
      { name: "SEO & Keyword analyzer", starter: true, pro: true, enterprise: true },
      { name: "Multi-language translation", starter: "10 languages", pro: "50+ languages", enterprise: "All languages" },
    ],
  },
  {
    name: "Image & Media Suite",
    features: [
      { name: "Standard image edits (crop, resize, format)", starter: true, pro: true, enterprise: true },
      { name: "AI Background remover (transparent PNG)", starter: false, pro: true, enterprise: true },
      { name: "Neural network 4x image upscaler", starter: false, pro: true, enterprise: true },
      { name: "Batch image processing", starter: "Up to 3 images", pro: "Up to 50 images", enterprise: "Unlimited batch" },
      { name: "High-resolution output (4K)", starter: false, pro: true, enterprise: true },
    ],
  },
  {
    name: "Video & Audio Processing",
    features: [
      { name: "FFmpeg server-side video compression", starter: false, pro: true, enterprise: true },
      { name: "Video trimming & cutter", starter: false, pro: true, enterprise: true },
      { name: "Extract audio (MP3/WAV)", starter: false, pro: true, enterprise: true },
      { name: "Hardcoded subtitle generation", starter: false, pro: true, enterprise: true },
      { name: "Maximum video file size", starter: "N/A", pro: "250 MB", enterprise: "2 GB" },
    ],
  },
  {
    name: "PDF & Document Engine",
    features: [
      { name: "PDF Merge & Split", starter: true, pro: true, enterprise: true },
      { name: "PDF Compressor & Optimizer", starter: "Basic", pro: "High compression", enterprise: "Lossless max" },
      { name: "Image to PDF converter", starter: true, pro: true, enterprise: true },
      { name: "PDF page reorder & rotation", starter: true, pro: true, enterprise: true },
    ],
  },
  {
    name: "Platform & Security",
    features: [
      { name: "Encrypted cloud storage", starter: "1 GB", pro: "50 GB", enterprise: "1 TB" },
      { name: "Cryptographic payment verification", starter: true, pro: true, enterprise: true },
      { name: "API Key usage (BYOK)", starter: false, pro: true, enterprise: true },
      { name: "Team user seats", starter: "1 user", pro: "1 user", enterprise: "Up to 10 users" },
      { name: "Support level", starter: "Community & Email", pro: "Priority Chat", enterprise: "Dedicated SLA" },
    ],
  },
];

const FAQS = [
  {
    q: "How does the 7-day free trial work?",
    a: "When you sign up, you automatically receive 7 full days of access to our complete tool suite. No credit card is required upfront. You can test all AI, image, video, and PDF tools without any commitment.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We use Razorpay as our primary payment partner. We support all major Indian and international payment methods including UPI (Google Pay, PhonePe, Paytm), NetBanking across 50+ banks, Credit/Debit cards (Visa, Mastercard, RuPay), and Wallets.",
  },
  {
    q: "Can I cancel or change my plan anytime?",
    a: "Yes, absolutely. You can cancel your subscription at any time directly from your Billing dashboard. When canceled, your subscription remains active until the end of your current billing period, with zero cancellation fees.",
  },
  {
    q: "Are there any hidden fees or surge pricing?",
    a: "No hidden charges whatsoever. The price you see (₹150, ₹450, or ₹1,200) is the exact amount billed. All taxes and platform transaction fees are included.",
  },
  {
    q: "Can I bring my own OpenAI / Anthropic API keys?",
    a: "Yes! On the Pro and Enterprise plans, you can link your personal API keys in Dashboard > Settings to bypass any standard platform request limitations.",
  },
  {
    q: "What is your refund policy?",
    a: "We offer a 7-day refund guarantee on your first subscription payment if you are not fully satisfied with our tools. Simply contact support@korevante.com with your order details.",
  },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;
  const [isYearly, setIsYearly] = React.useState(false);
  const [plans, setPlans] = React.useState<UnifiedPlan[]>(CANONICAL_PLANS);
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  React.useEffect(() => {
    fetch("/api/plans")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.plans) && data.plans.length > 0) {
          setPlans(data.plans);
        }
      })
      .catch((err) => console.error("Failed to load live plans:", err));
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      {/* Header Section */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden text-center">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-emerald-500/20 via-teal-500/10 to-transparent rounded-full blur-[100px] pointer-events-none -z-10" />
        <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none -z-10" />

        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <Badge variant="outline" className="mb-4 text-xs uppercase tracking-wider glass-pill px-4 py-1.5 border-0 font-bold text-primary">
            <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" /> Transparent, Predictable Pricing
          </Badge>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground mb-6 leading-tight">
            One Simple Subscription, <br className="hidden sm:inline" />
            <span className="gradient-text">50+ Powerful Tools</span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Stop paying ₹1,000s across separate apps for AI writing, image upscaling, video cutting, and PDF editing. Get everything in one lightning-fast workspace.
          </p>

          {/* Billing Switcher (Monthly / Yearly) */}
          <div className="inline-flex items-center p-1.5 rounded-full glass-card gap-2 border-white/10">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-bold transition-all",
                !isYearly ? "gradient-btn text-white shadow-md" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5",
                isYearly ? "gradient-btn text-white shadow-md" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Annual Billing
              <span className="text-[9px] uppercase font-black tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> 7-Day Free Trial
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Cancel Anytime in 1 Click
            </span>
          </div>
        </div>
      </section>

      {/* Plan Cards */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan) => {
              const price = isYearly ? plan.yearlyPrice : plan.price;
              const targetHref = isAuthenticated 
                ? `/dashboard/billing?plan=${plan.name.toLowerCase()}` 
                : (plan.href || `/signup?plan=${plan.name.toLowerCase()}`);
              const ctaText = isAuthenticated 
                ? `Upgrade to ${plan.title}` 
                : (plan.ctaText || "Start 7-Day Free Trial");

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between transition-all duration-300 relative glass-card",
                    plan.popular
                      ? "ring-2 ring-primary/40 shadow-2xl scale-100 lg:scale-105 z-10 border-primary/30"
                      : "border-white/10"
                  )}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 gradient-btn px-4 py-1 rounded-full text-[10px] font-black tracking-wider uppercase shadow-lg shadow-emerald-500/35 text-white">
                      ★ {plan.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-black text-foreground">{plan.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 font-medium">{plan.tagline}</p>
                      </div>
                      {!plan.popular && plan.badge && (
                        <Badge variant="outline" className="text-xs glass-pill border-0 font-bold text-muted-foreground">
                          {plan.badge}
                        </Badge>
                      )}
                    </div>

                    {/* Price display */}
                    <div className="my-6 pb-6 border-b border-border/30">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-muted-foreground">₹</span>
                        <span className="text-5xl font-black tracking-tight text-foreground">{price}</span>
                        <span className="text-xs font-semibold text-muted-foreground">/ month</span>
                      </div>
                      {isYearly && (
                        <p className="text-xs text-emerald-400 font-bold mt-1">
                          Billed annually (₹{price * 12}/year)
                        </p>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="space-y-3.5 mb-8">
                      <p className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                        Included Features:
                      </p>
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-3">
                          <div className="h-4 w-4 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                            <Check className="h-2.5 w-2.5" />
                          </div>
                          <span className="text-xs sm:text-sm text-foreground font-semibold leading-tight">
                            {feature}
                          </span>
                        </div>
                      ))}
                      {plan.notIncluded.map((feature) => (
                        <div key={feature} className="flex items-start gap-3 opacity-40">
                          <div className="h-4 w-4 rounded-full bg-muted/30 flex items-center justify-center shrink-0 mt-0.5 text-muted-foreground">
                            <X className="h-2.5 w-2.5" />
                          </div>
                          <span className="text-xs sm:text-sm text-muted-foreground line-through leading-tight font-medium">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="pt-4">
                    <Link href={targetHref} className="w-full block">
                      <Button
                        variant={plan.popular ? "default" : "outline"}
                        size="lg"
                        className={cn(
                          "w-full h-14 rounded-2xl font-black text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2",
                          plan.popular 
                            ? "gradient-btn shadow-2xl shadow-emerald-500/35 hover:shadow-emerald-400/50 hover:scale-[1.02] active:scale-[0.98] text-white dark:text-[#01140e]" 
                            : "border-2 border-border/80 bg-background/90 hover:bg-emerald-500/10 hover:border-emerald-500 text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                        )}
                      >
                        <span>{ctaText}</span>
                        <ArrowRight className="h-4 w-4 ml-1 shrink-0" />
                      </Button>
                    </Link>
                    <p className="text-center text-[11px] text-muted-foreground mt-3 font-semibold">
                      Instant activation • Razorpay verified
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature-by-Feature Comparison Matrix */}
      <section className="py-20 bg-muted/10 border-t border-border/20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-3 text-xs uppercase tracking-wider glass-pill border-0 px-3 py-1 font-bold text-primary">
              Deep Dive
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">
              Compare All Features
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto mt-2 font-medium">
              Transparent side-by-side comparison of capabilities across all subscription tiers.
            </p>
          </div>

          <div className="glass-card rounded-[2.5rem] overflow-hidden p-6 md:p-8 border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="py-4 px-6 text-sm font-black text-foreground w-2/5">Feature</th>
                    <th className="py-4 px-4 text-sm font-black text-foreground text-center w-1/5">Starter</th>
                    <th className="py-4 px-4 text-sm font-black text-primary text-center w-1/5">Pro Creator</th>
                    <th className="py-4 px-4 text-sm font-black text-foreground text-center w-1/5">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_CATEGORIES.map((category) => (
                    <React.Fragment key={category.name}>
                      <tr className="bg-white/[0.02]">
                        <td colSpan={4} className="py-3 px-6 text-[10px] font-black uppercase tracking-wider text-primary">
                          {category.name}
                        </td>
                      </tr>
                      {category.features.map((item) => (
                        <tr key={item.name} className="border-b border-border/20 hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-6 text-xs sm:text-sm font-semibold text-foreground">{item.name}</td>
                          
                          <td className="py-3 px-4 text-center text-xs font-semibold text-muted-foreground">
                            {typeof item.starter === "boolean" ? (
                              item.starter ? (
                                <Check className="h-4 w-4 text-cyan-400 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                              )
                            ) : (
                              item.starter
                            )}
                          </td>

                          <td className="py-3 px-4 text-center text-xs font-bold text-foreground">
                            {typeof item.pro === "boolean" ? (
                              item.pro ? (
                                <Check className="h-4 w-4 text-cyan-400 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                              )
                            ) : (
                              item.pro
                            )}
                          </td>

                          <td className="py-3 px-4 text-center text-xs font-black text-primary">
                            {typeof item.enterprise === "boolean" ? (
                              item.enterprise ? (
                                <Check className="h-4 w-4 text-cyan-400 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-muted-foreground/30 mx-auto" />
                              )
                            ) : (
                              item.enterprise
                            )}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-3 text-xs uppercase tracking-wider glass-pill border-0 px-3 py-1 font-bold text-primary">
              Got Questions?
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto mt-2 font-medium">
              Everything you need to know about our billing, trials, and tool limits.
            </p>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="glass-card rounded-2xl overflow-hidden border-white/10"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex items-center justify-between p-6 text-left font-bold text-sm sm:text-base text-foreground gap-4"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 text-primary shrink-0 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-0 text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Still have questions */}
          <div className="mt-12 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Have a question not answered here?{" "}
              <Link href="/contact" className="text-primary font-bold hover:underline">
                Contact our support team &rarr;
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-16 md:py-24 border-t border-border/20">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <div className="glass-card rounded-[3rem] p-10 md:p-16 relative overflow-hidden border-white/15 shadow-2xl">
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl sm:text-5xl font-black text-foreground leading-tight">
                Try Korevante Studio Free for 7 Days
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto font-medium">
                Experience full, unrestricted access to 50+ cutting-edge tools. No credit card required.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={isAuthenticated ? "/dashboard/billing" : "/signup"}>
                  <Button className="gradient-btn h-14 px-10 rounded-full font-black text-base shadow-2xl shadow-emerald-500/35 hover:shadow-emerald-400/50 hover:scale-[1.02] active:scale-[0.98] transition-all text-white dark:text-[#01140e]">
                    {isAuthenticated ? "Manage Your Workspace Billing" : "Start Your Free Trial Now"} <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/tools">
                  <Button variant="outline" className="h-14 px-9 rounded-full font-bold text-base border-2 border-border/80 bg-background/80 hover:bg-emerald-500/10 hover:border-emerald-500 text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Explore 50+ Tools
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
