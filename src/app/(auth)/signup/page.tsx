"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { 
  Sparkles, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2, 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  Check, 
  Crown 
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";
import { signupSchema } from "@/lib/validations/auth";
import { signupAction } from "@/actions/auth";

type PlanKey = "starter" | "pro" | "enterprise";

interface PlanDetails {
  key: PlanKey;
  title: string;
  badge: string;
  price: number;
  tagline: string;
  popular?: boolean;
  perks: string[];
}

const PLANS: Record<PlanKey, PlanDetails> = {
  starter: {
    key: "starter",
    title: "Starter",
    badge: "Essential Toolkit",
    price: 150,
    tagline: "Ideal for freelancers, hobbyists & casual creators.",
    perks: [
      "20 AI Content Generation requests / day",
      "Full Image Studio (Crop, Resize, Filters)",
      "Standard PDF Utilities (Merge, Split, Convert)",
      "Basic Developer Tools (JSON, Base64, URL)",
      "Max file upload size: 25 MB",
    ],
  },
  pro: {
    key: "pro",
    title: "Pro Creator",
    badge: "Most Popular",
    price: 450,
    tagline: "Designed for content creators, agencies & power users.",
    popular: true,
    perks: [
      "Unlimited AI Content Generation requests",
      "Full Image Studio + AI Background Removal",
      "Neural 4x Super-Resolution Image Upscaling",
      "Full Video & Audio Suite (Compress, Trim, Subtitles)",
      "Developer Suite + API Key Support",
      "Max file upload size: 250 MB",
    ],
  },
  enterprise: {
    key: "enterprise",
    title: "Enterprise",
    badge: "Unlimited Scale",
    price: 1200,
    tagline: "For teams, studios & high-volume automated pipelines.",
    perks: [
      "Everything in Pro Creator included",
      "Unlimited batch processing for all 50+ tools",
      "4K Video Rendering & multi-gigabyte files",
      "Max file upload size: 2 GB per file",
      "Zero rate limits & dedicated worker queue",
      "Multiple user seats (Up to 10 team members)",
    ],
  },
};

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawPlan = (searchParams.get("plan") || "").toLowerCase().trim();

  // Determine initial plan from query param
  const initialPlanKey: PlanKey = React.useMemo(() => {
    if (rawPlan === "enterprise" || rawPlan === "premium") return "enterprise";
    if (rawPlan === "starter" || rawPlan === "basic") return "starter";
    return "pro"; // Default to pro if user clicked Pro or came without param
  }, [rawPlan]);

  const [selectedPlanKey, setSelectedPlanKey] = React.useState<PlanKey>(initialPlanKey);
  const [form, setForm] = React.useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [success, setSuccess] = React.useState(false);

  // Sync state if query param changes
  React.useEffect(() => {
    if (rawPlan === "enterprise" || rawPlan === "premium") {
      setSelectedPlanKey("enterprise");
    } else if (rawPlan === "starter" || rawPlan === "basic") {
      setSelectedPlanKey("starter");
    } else if (rawPlan === "pro") {
      setSelectedPlanKey("pro");
    }
  }, [rawPlan]);

  const activePlan = PLANS[selectedPlanKey];

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const parsed = signupSchema.safeParse({
      ...form,
      plan: selectedPlanKey,
    });

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const err of parsed.error.errors) {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await signupAction({
        ...parsed.data,
        plan: selectedPlanKey,
      });

      if (!result.success) {
        toast.error(result.error);
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success(`Account created with ${activePlan.title} 7-Day Free Trial!`);

      // Auto sign-in after successful signup
      const signInResult = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (signInResult?.error) {
        toast.error("Account created but login failed. Please sign in manually.");
        router.push("/login");
        return;
      }

      const targetRoute = selectedPlanKey ? `/dashboard/billing?plan=${selectedPlanKey}&checkout=true` : "/dashboard";
      router.push(targetRoute);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleGoogleSignUp() {
    setLoading(true);
    try {
      const targetUrl = selectedPlanKey ? `/dashboard/billing?plan=${selectedPlanKey}&checkout=true` : "/dashboard";
      await signIn("google", { callbackUrl: targetUrl });
    } catch {
      toast.error("Google sign-up could not be initiated. Please try again.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="glass-card rounded-[2.5rem] p-10 max-w-md w-full text-center space-y-4 border-white/15 shadow-2xl">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-foreground">Welcome to Korevante Studio!</h2>
          <p className="text-muted-foreground text-sm font-medium">
            Your 7-day free trial of <span className="text-emerald-400 font-bold">{activePlan.title}</span> is active. Entering your dashboard…
          </p>
          <div className="flex justify-center pt-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      
      {/* Ambient Cyber-Mint background glows */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        
        {/* Left: Value Prop & Selected Plan Overview */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6">
          <div>
            <div className="flex items-center justify-between mb-6">
              <Logo size="lg" href="/" />
              <Link href="/" className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group">
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5 group-hover:-translate-x-1 transition-transform text-primary" />
                Home
              </Link>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[11px] font-bold text-primary mb-3 border border-primary/20">
              <Sparkles className="h-3 w-3" /> 7-Day Unrestricted Free Trial
            </div>

            <h1 className="text-3xl xl:text-4xl font-black tracking-tight text-foreground leading-tight">
              Start with <span className="gradient-text">{activePlan.title}</span>
            </h1>
            <p className="mt-2 text-xs xl:text-sm text-muted-foreground leading-relaxed font-medium">
              {activePlan.tagline} Switch or cancel anytime in one click.
            </p>
          </div>

          {/* Plan Selector Pills */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              Choose your trial tier:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(PLANS) as PlanKey[]).map((key) => {
                const p = PLANS[key];
                const isSelected = selectedPlanKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedPlanKey(key)}
                    className={`px-3 py-2 rounded-xl text-left border transition-all ${
                      isSelected
                        ? "bg-primary/15 border-primary text-foreground shadow-sm shadow-emerald-500/20"
                        : "bg-card/60 border-border/60 text-muted-foreground hover:text-foreground hover:bg-card"
                    }`}
                  >
                    <div className="text-xs font-black truncate">{p.title}</div>
                    <div className="text-[11px] font-semibold text-emerald-500">₹{p.price}/mo</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Plan Details Card */}
          <div className="glass-card rounded-2xl p-5 border border-primary/30 space-y-3.5 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-foreground">{activePlan.title} Plan</span>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                    {activePlan.badge}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                  7-Day Free Trial • ₹0 due today
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-foreground">₹{activePlan.price}</div>
                <div className="text-[10px] font-semibold text-muted-foreground">/ month</div>
              </div>
            </div>

            <div className="border-t border-border/40 pt-3 space-y-2">
              {activePlan.perks.map((perk) => (
                <div key={perk} className="flex items-start gap-2.5">
                  <div className="h-4 w-4 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0 mt-0.5 text-emerald-400">
                    <Check className="h-2.5 w-2.5" />
                  </div>
                  <span className="text-xs text-foreground font-semibold leading-tight">{perk}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span>No charge during trial. Cancel anytime in dashboard.</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground font-semibold flex items-center justify-between pt-2">
            <span>Want to compare all specifications?</span>
            <Link href="/pricing" className="text-primary font-bold hover:underline">
              View Comparison Table →
            </Link>
          </div>
        </div>

        {/* Right: Signup Form Card */}
        <div className="lg:col-span-7">
          {/* Mobile Brand Header */}
          <div className="lg:hidden text-center mb-6">
            <div className="flex items-center justify-center mb-3">
              <Logo size="lg" href="/" />
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Start your 7-day free trial with 50+ AI &amp; media tools
            </p>

            {/* Mobile Plan Selector */}
            <div className="mt-4 grid grid-cols-3 gap-2 max-w-sm mx-auto">
              {(Object.keys(PLANS) as PlanKey[]).map((key) => {
                const p = PLANS[key];
                const isSelected = selectedPlanKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedPlanKey(key)}
                    className={`px-2 py-1.5 rounded-xl text-center border transition-all ${
                      isSelected
                        ? "bg-primary/20 border-primary text-foreground font-bold"
                        : "bg-card/60 border-border/60 text-muted-foreground text-xs"
                    }`}
                  >
                    <div className="text-xs font-black">{p.title}</div>
                    <div className="text-[10px] text-emerald-500 font-bold">₹{p.price}/mo</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-[2.5rem] p-7 sm:p-10 border-white/15 shadow-2xl relative">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-2xl font-black text-foreground">Create your account</h2>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  Instant access to your <span className="text-emerald-400 font-bold">{activePlan.title}</span> workspace
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black self-start sm:self-auto">
                <Crown className="h-3.5 w-3.5" />
                <span>₹{activePlan.price}/mo (Trial: ₹0)</span>
              </div>
            </div>

            {/* Google Sign Up */}
            <Button
              variant="outline"
              className="w-full mb-6 gap-3 h-11 font-bold glass-pill hover:border-primary/50 rounded-xl text-xs sm:text-sm"
              onClick={handleGoogleSignUp}
              disabled={loading}
              type="button"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.638-.057-1.252-.164-1.84H9v3.48h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                <span className="bg-card px-3">
                  Or register with email
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                id="name"
                label="Full Name"
                placeholder="John Doe"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                error={errors.name}
                disabled={loading}
              />

              <Input
                id="email"
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                error={errors.email}
                disabled={loading}
              />

              <div>
                <label className="text-sm font-semibold text-foreground px-0.5">Password</label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 8 chars, 1 uppercase, 1 number"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    error={errors.password}
                    disabled={loading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 gradient-btn rounded-xl font-black text-sm mt-2 shadow-lg shadow-emerald-500/25 text-white dark:text-[#01140e]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Activating Free Trial...
                  </>
                ) : (
                  `Start 7-Day Free Trial • ${activePlan.title}`
                )}
              </Button>
            </form>

            <p className="text-center text-xs text-muted-foreground mt-6 font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Sign in
              </Link>
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

function SignupSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6 p-8 glass-card rounded-[2.5rem] animate-pulse">
        <div className="h-8 w-32 bg-muted/40 rounded-xl" />
        <div className="h-12 w-full bg-muted/40 rounded-xl" />
        <div className="h-12 w-full bg-muted/40 rounded-xl" />
        <div className="h-12 w-full bg-muted/40 rounded-xl" />
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <React.Suspense fallback={<SignupSkeleton />}>
      <SignupForm />
    </React.Suspense>
  );
}
