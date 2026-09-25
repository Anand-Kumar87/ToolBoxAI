"use client";

import * as React from "react";
import Link from "next/link";
import { ShieldCheck, Cookie, ChevronDown, ChevronUp, Check, X } from "lucide-react";

interface CookieConsent {
  necessary: boolean;
  analytics: boolean;
  preferences: boolean;
  timestamp: string;
}

const STORAGE_KEY = "korevante_cookie_consent";

export function CookieBanner() {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [analytics, setAnalytics] = React.useState(true);
  const [preferences, setPreferences] = React.useState(true);

  React.useEffect(() => {
    // Check if consent has already been given
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Small delay for smooth entry animation
        const timer = setTimeout(() => setIsVisible(true), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      // LocalStorage access restricted, default to non-visible
    }
  }, []);

  // Listen for manual trigger to reopen preferences (from footer or settings)
  React.useEffect(() => {
    const handleReopen = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setAnalytics(Boolean(parsed.analytics));
          setPreferences(Boolean(parsed.preferences));
        }
      } catch {}
      setIsExpanded(true);
      setIsVisible(true);
    };

    window.addEventListener("open-cookie-preferences", handleReopen);
    return () => window.removeEventListener("open-cookie-preferences", handleReopen);
  }, []);

  const saveConsent = (analyticsVal: boolean, preferencesVal: boolean) => {
    const consent: CookieConsent = {
      necessary: true, // Always required
      analytics: analyticsVal,
      preferences: preferencesVal,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {}

    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    saveConsent(true, true);
  };

  const handleDeclineNonEssential = () => {
    saveConsent(false, false);
  };

  const handleSaveCustom = () => {
    saveConsent(analytics, preferences);
  };

  if (!isVisible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 z-[999] mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-background/95 p-5 shadow-2xl backdrop-blur-xl sm:p-6 dark:bg-zinc-950/95 dark:border-white/10 dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
        {/* Glow Accents */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative flex flex-col gap-4">
          {/* Header Row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Cookie className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-base font-bold text-foreground">
                    Cookie & Privacy Preferences
                  </h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="h-3 w-3" /> GDPR & CCPA
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  We use essential cookies to maintain secure sessions, verify permissions, and power 50+ creative tools. You can customize your preferences anytime. Learn more in our{" "}
                  <Link href="/privacy" className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/terms" className="text-emerald-400 underline underline-offset-2 hover:text-emerald-300">
                    Terms
                  </Link>.
                </p>
              </div>
            </div>

            {/* Close / Dismiss as Necessary */}
            <button
              onClick={handleDeclineNonEssential}
              className="hidden sm:inline-flex text-muted-foreground hover:text-foreground p-1 transition-colors"
              title="Close and keep essential only"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Expandable Preferences Accordion */}
          {isExpanded && (
            <div className="space-y-2.5 rounded-xl border border-border/50 bg-muted/30 p-3.5 sm:p-4 animate-in fade-in duration-200">
              {/* Category 1: Strictly Necessary */}
              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                <div>
                  <div className="font-semibold text-foreground flex items-center gap-1.5">
                    Strictly Necessary Cookies
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">Always Active</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Required for authentication, security verification, CSRF defense, and tool billing status.
                  </p>
                </div>
                <div className="flex h-5 w-9 shrink-0 items-center justify-end rounded-full bg-emerald-500 px-1 opacity-80 cursor-not-allowed">
                  <div className="h-3.5 w-3.5 rounded-full bg-white shadow-sm" />
                </div>
              </div>

              <div className="h-px bg-border/40" />

              {/* Category 2: Performance & Analytics */}
              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                <div>
                  <div className="font-semibold text-foreground">Performance & Tool Analytics</div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Helps us measure tool execution speed, error rates, and improve AI model throughput anonymously.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAnalytics(!analytics)}
                  className={`flex h-5 w-9 shrink-0 items-center rounded-full px-1 transition-colors ${
                    analytics ? "bg-emerald-500 justify-end" : "bg-muted-foreground/30 justify-start"
                  }`}
                  aria-label="Toggle analytics cookies"
                >
                  <div className="h-3.5 w-3.5 rounded-full bg-white shadow-sm" />
                </button>
              </div>

              <div className="h-px bg-border/40" />

              {/* Category 3: Personalization */}
              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                <div>
                  <div className="font-semibold text-foreground">Personalization & Theme Settings</div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Remembers your preferred dark/light theme, recent tools history, and workspace view presets.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferences(!preferences)}
                  className={`flex h-5 w-9 shrink-0 items-center rounded-full px-1 transition-colors ${
                    preferences ? "bg-emerald-500 justify-end" : "bg-muted-foreground/30 justify-start"
                  }`}
                  aria-label="Toggle personalization cookies"
                >
                  <div className="h-3.5 w-3.5 rounded-full bg-white shadow-sm" />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons Row */}
          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" /> Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" /> Customize Preferences
                </>
              )}
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {isExpanded ? (
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-black transition-all hover:bg-emerald-400 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                >
                  <Check className="h-3.5 w-3.5" /> Save Preferences
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleDeclineNonEssential}
                    className="w-full sm:w-auto rounded-xl border border-border bg-background/50 px-3.5 py-2 text-xs font-medium text-muted-foreground transition-all hover:bg-accent hover:text-foreground"
                  >
                    Essential Only
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-5 py-2 text-xs font-bold text-black transition-all hover:opacity-90 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                  >
                    Accept All Cookies
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
