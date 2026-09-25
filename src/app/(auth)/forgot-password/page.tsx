"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Loader2, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { forgotPasswordAction } from "@/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message ?? "Invalid email");
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPasswordAction({ email: parsed.data.email });
      if (result.success) {
        setSubmitted(true);
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 px-4 py-12">
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
          {submitted ? (
            <div className="text-center space-y-5">
              <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Check your inbox</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link. Check your spam folder if it doesn&apos;t arrive within a few minutes.
                </p>
              </div>
              <Link href="/login">
                <Button variant="outline" className="w-full gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-foreground">Forgot password?</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  No worries — enter your email and we&apos;ll send you a secure reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  error={error}
                  autoComplete="email"
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
                      <span>Sending link...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
