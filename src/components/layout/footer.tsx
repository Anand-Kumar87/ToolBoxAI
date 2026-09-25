import Link from "next/link";
import { Sparkles, Shield, Zap, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";

export function Footer() {
  return (
    <footer className="w-full mt-24 pt-16 pb-10 border-t border-border/40 bg-background relative z-10 overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-gradient-to-t from-emerald-500/12 via-teal-500/6 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4 lg:grid-cols-5 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <Logo size="lg" href="/" />
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed font-medium">
              Empowering creators, professionals, and teams with 50+ high-performance AI, Image, Video, PDF, and Productivity tools in one unified, lightning-fast platform.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1 font-semibold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-foreground">
                <Shield className="h-3.5 w-3.5 text-emerald-500" />
                Enterprise Grade Security
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill text-foreground">
                <Zap className="h-3.5 w-3.5 text-cyan-400" />
                7-Day Free Trial
              </span>
            </div>
          </div>

          {/* Tool Suites */}
          <div>
            <h4 className="text-xs font-black tracking-wider uppercase text-foreground mb-4">
              Tool Suites
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-muted-foreground">
              <li>
                <Link href="/tools?category=AI" className="hover:text-primary transition-colors">
                  AI Content Generation
                </Link>
              </li>
              <li>
                <Link href="/tools?category=IMAGE" className="hover:text-primary transition-colors">
                  Image Editing &amp; Studio
                </Link>
              </li>
              <li>
                <Link href="/tools?category=VIDEO" className="hover:text-primary transition-colors">
                  Video &amp; Audio Suite
                </Link>
              </li>
              <li>
                <Link href="/tools?category=PDF" className="hover:text-primary transition-colors">
                  PDF Documents
                </Link>
              </li>
              <li>
                <Link href="/tools?category=DEVELOPER" className="hover:text-primary transition-colors">
                  Developer Utilities
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-black tracking-wider uppercase text-foreground mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-muted-foreground">
              <li>
                <Link href="/features" className="hover:text-primary transition-colors">
                  All Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-primary transition-colors flex items-center gap-1.5">
                  Pricing Plans
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                    ₹150/mo
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-xs font-black tracking-wider uppercase text-foreground mb-4">
              Legal &amp; Trust
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm font-semibold text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-primary transition-colors">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground font-semibold gap-4">
          <p>© {new Date().getFullYear()} Korevante Studio. All rights reserved. Built for creators worldwide.</p>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All systems operational
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" /> Razorpay Verified Merchant
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
