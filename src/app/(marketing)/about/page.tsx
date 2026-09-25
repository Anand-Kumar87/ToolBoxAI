import Link from "next/link";
import { Shield, Zap, Users, Code2, Heart, Globe, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About ToolVerse AI - Our Mission & Story",
  description: "Learn about ToolVerse AI's mission to consolidate 50+ high-performance AI, image, video, and PDF tools into one ultra-fast, affordable platform.",
};

export default function AboutPage() {
  return (
    <div className="flex flex-col relative overflow-hidden">
      {/* Ambient Horizon Dome Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] emerald-dome-glow pointer-events-none -z-10" />

      {/* Hero */}
      <section className="pt-24 pb-20 md:pt-32 md:pb-28 text-center border-b border-border/40 relative">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill mb-8 border border-primary/25 text-xs font-bold text-foreground shadow-sm">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="tracking-wide uppercase font-extrabold text-[11px]">OUR ORIGIN &amp; PHILOSOPHY</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1] mb-6">
            Built for creators who{" "}
            <span className="gradient-text-mint block sm:inline">
              refuse to overpay
            </span>
          </h1>

          <p className="text-muted-foreground text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-medium">
            ToolVerse AI was born out of frustration with fragmented SaaS ecosystems — where freelancers, developers, and creators are forced to pay for 10 separate subscriptions just to get their daily work done.
          </p>
        </div>
      </section>

      {/* Mission & Highlight Metrics */}
      <section className="py-24 relative">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Mission Text */}
            <div className="space-y-6 lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-pill border border-primary/20 text-xs font-bold text-primary">
                <span>OUR MISSION</span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
                Democratizing high-performance software for everyone
              </h2>

              <div className="space-y-5 text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
                <p>
                  Historically, enterprise-grade AI models, server-side video compression, high-resolution upscaling, and programmatic PDF manipulation required either expensive recurring subscriptions or deep DevOps expertise.
                </p>
                <p>
                  ToolVerse AI completely disrupts this standard. Every single tool in our ecosystem is built natively to production specifications, secured by enterprise cryptography, and priced transparently starting at just ₹150 per month.
                </p>
                <p>
                  Whether you are an independent creator in Mumbai, a product designer in Bengaluru, or an engineer in New Delhi, you deserve equal access to cutting-edge tools without artificial paywalls.
                </p>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5 w-full sm:w-auto">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    className="w-full sm:w-auto h-14 sm:h-15 px-9 sm:px-10 rounded-full font-black text-sm sm:text-base gradient-btn flex items-center justify-center gap-2.5 shadow-2xl shadow-emerald-500/35 hover:shadow-emerald-400/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span>Join Our Mission</span>
                    <ArrowRight className="h-4 w-4 ml-0.5" />
                  </Button>
                </Link>
                <Link href="/features" className="w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="w-full sm:w-auto h-14 sm:h-15 px-8 sm:px-9 rounded-full font-bold text-sm sm:text-base border-2 border-border/80 bg-background/80 hover:bg-emerald-500/10 hover:border-emerald-500 text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
                  >
                    <span>Explore Architecture</span>
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* 4 Highlight Cards with Luxury Icon Docks and Perfect Spacing */}
            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {[
                { 
                  icon: Zap, 
                  label: "50+ Tools", 
                  sublabel: "Every feature fully implemented and production-ready." 
                },
                { 
                  icon: Shield, 
                  label: "Enterprise Security", 
                  sublabel: "Server-side cryptographic token & session enforcement." 
                },
                { 
                  icon: Users, 
                  label: "Built for Creators", 
                  sublabel: "Optimized for freelancers, agencies, and high-velocity teams." 
                },
                { 
                  icon: Globe, 
                  label: "Made in India", 
                  sublabel: "Native INR pricing, instant UPI, and localized Razorpay flows." 
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={item.label} 
                    className="glass-card rounded-2xl p-6 sm:p-7 flex flex-col items-start gap-4 group hover:border-primary/50 transition-all duration-300"
                  >
                    {/* Dedicated Luxury Icon Dock */}
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-primary group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-300">
                      <Icon className="h-6 w-6" />
                    </div>

                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-foreground text-lg tracking-tight">
                        {item.label}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">
                        {item.sublabel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-muted/10 border-t border-border/40 relative">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-pill mb-4 border border-primary/20 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              <span>CORE VALUES</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
              What We Stand For
            </h2>
            <p className="text-muted-foreground mt-4 text-base sm:text-lg font-medium">
              We design every component with relentless attention to speed, user agency, and absolute transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { 
                icon: Shield, 
                title: "Security by Architecture", 
                desc: "Every API endpoint validates permissions server-side. Payments are cryptographically validated using HMAC signatures, and sensitive assets are isolated behind zero-trust storage." 
              },
              { 
                icon: Zap, 
                title: "Zero Fake Buttons", 
                desc: "We never ship placeholder UIs or artificial 'coming soon' buttons for marketing hype. If a tool appears on ToolVerse AI, it is 100% active, tested, and ready to use." 
              },
              { 
                icon: Heart, 
                title: "Strict User Privacy", 
                desc: "Your data belongs solely to you. We never train public models on your uploaded files, and all processing temporary artifacts are automatically sanitized and purged." 
              },
              { 
                icon: Code2, 
                title: "High-Performance Modern Stack", 
                desc: "Engineered on Next.js 15, React 19, TypeScript, Tailwind CSS, Prisma, and native processing binaries for unmatched sub-second response times." 
              },
              { 
                icon: Users, 
                title: "Radical Pricing Honesty", 
                desc: "Starting at ₹150/month with full access to our comprehensive suite. No hidden limits, no bait-and-switch annual commitments, and transparent cancel-anytime billing." 
              },
              { 
                icon: Globe, 
                title: "India-First & Global Reach", 
                desc: "Built in New Delhi with complete support for Indian payment ecosystems (UPI, RuPay, NetBanking) while serving high-throughput global requests reliably 24/7." 
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.title} 
                  className="glass-card rounded-2xl p-7 space-y-4 hover:border-primary/40 transition-all duration-300 group"
                >
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-emerald-500/15 to-teal-500/5 border border-emerald-500/25 flex items-center justify-center text-primary group-hover:scale-110 group-hover:shadow-md group-hover:shadow-emerald-500/15 transition-all">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-extrabold text-foreground text-lg tracking-tight">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* CTA section */}
      <section className="py-24 border-t border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 emerald-radial-glow pointer-events-none" />
        <div className="container mx-auto max-w-4xl px-4 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
            Join Thousands of High-Velocity Creators
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto font-medium">
            Activate your 7-day free trial in seconds and experience the future of unified software suites.
          </p>
          <div className="pt-2">
            <Link href="/signup">
              <Button size="lg" className="h-14 px-10 rounded-full font-black text-base gradient-btn shadow-2xl shadow-emerald-500/35 hover:shadow-emerald-400/50 hover:scale-[1.02] active:scale-[0.98] transition-all">
                Get Started for Free <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
