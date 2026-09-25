"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Sparkles, Eye, EyeOff, Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPasswordAction } from "@/actions/auth";

// Inner component that safely uses useSearchParams inside Suspense
function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [form, setForm] = React.useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  if (!token) {
    return (
      <div className="text-center space-y-4 max-w-sm">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Invalid Reset Link</h2>
        <p className="text-sm text-muted-foreground">
          This password reset link is invalid or has expired. Please request a new one.
        </p>
        <Link href="/forgot-password">
          <Button variant="gradient" className="w-full">Request New Link</Button>
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});

    if (form.password.length < 8) {
      setErrors({ password: "Password must be at least 8 characters" });
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      const result = await resetPasswordAction({
        token,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      if (!result.success) {
        toast.error(result.error);
        setLoading(false);
        return;
      }

      setSuccess(true);
      toast.success("Password updated! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      toast.error("Failed to reset password. Please try again.");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4 max-w-sm">
        <div className="mx-auto h-14 w-14 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <ShieldCheck className="h-7 w-7 text-emerald-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Password Updated!</h2>
        <p className="text-sm text-muted-foreground">
          Your password has been reset successfully. Redirecting to login…
        </p>
        <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center space-x-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            ToolVerse <span className="text-primary">AI</span>
          </span>
        </Link>
      </div>

      <div className="glass-panel rounded-2xl p-8 shadow-xl shadow-black/5">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">Set new password</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create a strong password with at least 8 characters.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Input
              label="New password"
              type={showPassword ? "text" : "password"}
              placeholder="Min 8 chars, uppercase & number"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              error={errors.password}
              autoComplete="new-password"
              disabled={loading}
            />
            <button
              type="button"
              className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          <Input
            label="Confirm new password"
            type={showPassword ? "text" : "password"}
            placeholder="Repeat your new password"
            value={form.confirmPassword}
            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            error={errors.confirmPassword}
            autoComplete="new-password"
            disabled={loading}
          />

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full gap-2 font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Updating password...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Reset Password</span>
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function ResetPasswordSkeleton() {
  return (
    <div className="w-full max-w-md">
      <div className="glass-panel rounded-2xl p-8 shadow-xl animate-pulse space-y-4">
        <div className="h-7 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-2/3" />
        <div className="h-11 bg-muted rounded-xl mt-4" />
        <div className="h-11 bg-muted rounded-xl" />
        <div className="h-12 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-12">
      <React.Suspense fallback={<ResetPasswordSkeleton />}>
        <ResetPasswordForm />
      </React.Suspense>
    </div>
  );
}
