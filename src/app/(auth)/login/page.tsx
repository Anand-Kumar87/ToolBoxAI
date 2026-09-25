"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { 
  Eye, 
  EyeOff, 
  Loader2, 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Wand2, 
  Layers,
  LucideIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/logo";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

interface ShowcaseSlide {
  id: number;
  icon: LucideIcon;
  badge: string;
  title: string;
  description: string;
  features: string[];
}

const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    id: 0,
    icon: Sparkles,
    badge: "AI Generation",
    title: "Accelerate Your Output",
    description: "Experience the ultimate unified platform for AI generation, neural media editing, and developer utilities.",
    features: [
      "50+ Production-Ready Tools Under 1 Plan",
      "Zero Latency Server-Side Processing",
      "Enterprise Grade Security & Privacy",
    ],
  },
  {
    id: 1,
    icon: Wand2,
    badge: "Neural Media Engine",
    title: "Neural Studio at Scale",
    description: "Supercharge your imagery, compress 4K videos, and merge massive PDF documents with pinpoint fidelity.",
    features: [
      "4x Neural Super-Resolution Upscaling",
      "Instant Transparent Background Removal",
      "Lossless Multi-Format Transcoding",
    ],
  },
  {
    id: 2,
    icon: Layers,
    badge: "Productivity & Scale",
    title: "Built for Creators & Teams",
    description: "Streamlined workflow automation, code utilities, and single-click exports crafted for maximum throughput.",
    features: [
      "Dedicated Background Processing Queue",
      "Instant Export & Cloud Storage Sync",
      "REST API & Webhook Capabilities",
    ],
  },
];

function LoginShowcaseCarousel() {
  const [current, setCurrent] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SHOWCASE_SLIDES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const slide = SHOWCASE_SLIDES[current];
  const Icon = slide.icon;

  return (
    <div 
      className="relative z-10 w-full max-w-md glass-card rounded-[2.5rem] p-10 border-white/15 shadow-2xl overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="flex flex-col items-center text-center"
        >
          {/* Icon Dock */}
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-[#01140e] shadow-xl shadow-emerald-500/25 mb-4">
            <Icon className="h-8 w-8" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-extrabold uppercase tracking-wider mb-3">
            {slide.badge}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3 leading-tight">
            {slide.title}
          </h2>
          
          <p className="text-muted-foreground text-xs sm:text-sm font-medium leading-relaxed mb-6 min-h-[44px]">
            {slide.description}
          </p>

          <div className="w-full space-y-3 pt-5 border-t border-border/30 text-left">
            {slide.features.map((feat) => (
              <div key={feat} className="flex items-center gap-3 text-xs font-bold text-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Interactive indicator dots */}
      <div className="mt-8 flex items-center justify-center gap-2">
        {SHOWCASE_SLIDES.map((s, idx) => {
          const isActive = current === idx;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                isActive 
                  ? "w-8 gradient-btn shadow-sm shadow-emerald-500/50" 
                  : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawPlan = searchParams.get("plan");
  const callbackUrl = searchParams.get("callbackUrl") || (rawPlan ? `/dashboard/billing?plan=${rawPlan}&checkout=true` : "/dashboard");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      for (const err of parsed.error.errors) {
        const field = err.path[0] as string;
        if (field === "email" || field === "password") {
          fieldErrors[field] = err.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
        setLoading(false);
        return;
      }

      toast.success("Logged in successfully! Welcome back.");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      toast.error("Google sign-in could not be initiated. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-6 duration-700">
      
      {/* Top Brand Logo & Back to Home */}
      <div className="flex items-center justify-between mb-8">
        <Logo size="sm" href="/" />
        <Link href="/" className="inline-flex items-center text-xs font-bold text-muted-foreground hover:text-foreground transition-colors group">
           <ArrowLeft className="h-3.5 w-3.5 mr-1.5 group-hover:-translate-x-1 transition-transform text-primary" />
           Back to Home
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[11px] font-bold text-primary mb-3 border border-primary/20">
          <Sparkles className="h-3 w-3" /> Secure Workspace Login
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight mb-2">Welcome Back</h1>
        <p className="text-sm text-muted-foreground font-medium">Sign in to your Korevante Studio workspace</p>
      </div>

      {/* Google OAuth Button */}
      <Button
        variant="outline"
        className="w-full mb-6 gap-3 h-12 font-bold glass-pill hover:border-primary/50 rounded-xl"
        onClick={handleGoogleSignIn}
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
          <span className="bg-background px-3">
            Or sign in with email
          </span>
        </div>
      </div>

      {/* Email & Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            disabled={loading}
            autoComplete="email"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5 px-0.5">
            <label className="text-sm font-semibold text-foreground">Password</label>
            <Link
              href="/forgot-password"
              className="text-xs text-primary font-bold hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              disabled={loading}
              autoComplete="current-password"
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
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Signing in...
            </>
          ) : (
            "Sign In to Workspace"
          )}
        </Button>
      </form>

      {/* Sign up prompt */}
      <p className="text-center text-xs text-muted-foreground mt-8 font-medium">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="text-primary font-bold hover:underline">
          Start 7-Day Free Trial
        </Link>
      </p>

    </div>
  );
}

function LoginSkeleton() {
  return (
    <div className="w-full max-w-md space-y-6 animate-pulse">
      <div className="h-4 w-24 bg-muted/40 rounded-full" />
      <div className="h-10 w-48 bg-muted/40 rounded-xl" />
      <div className="h-12 w-full bg-muted/40 rounded-xl" />
      <div className="space-y-4 pt-4">
        <div className="h-11 w-full bg-muted/40 rounded-xl" />
        <div className="h-11 w-full bg-muted/40 rounded-xl" />
        <div className="h-12 w-full bg-muted/40 rounded-xl" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background relative overflow-hidden">
      
      {/* Background ambient lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Left side: Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-20 relative z-10">
         <React.Suspense fallback={<LoginSkeleton />}>
            <LoginForm />
         </React.Suspense>
      </div>

      {/* Right side: Futuristic Fintech / AI Animated Showcase */}
      <div className="hidden md:flex w-1/2 relative overflow-hidden flex-col items-center justify-center text-center p-12 bg-muted/10 border-l border-border/30">
         
         <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
         
         <LoginShowcaseCarousel />
      </div>
    </div>
  );
}
