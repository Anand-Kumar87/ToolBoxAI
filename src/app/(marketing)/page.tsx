"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  Settings, 
  Plus, 
  UploadCloud, 
  PieChart, 
  Users, 
  Zap, 
  Shield, 
  LayoutDashboard, 
  Image as ImageIcon, 
  Code2, 
  FileText,
  Lock,
  Cpu,
  Layers,
  ChevronRight,
  Star,
  Globe,
  Bot,
  Terminal,
  CpuIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CANONICAL_PLANS, UnifiedPlan } from "@/lib/plans";

// Animation Variants for Luxury Scroll Reveals
const fadeUp = {
  hidden: { opacity: 0, y: 40, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.7, 
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number]
    } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

export default function MarketingPage() {
  const [isYearly, setIsYearly] = React.useState(false);
  const [plans, setPlans] = React.useState<UnifiedPlan[]>(CANONICAL_PLANS);

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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden font-sans">
      
      {/* 1. HERO SECTION WITH LUXURY EMERALD DOME LIGHTING */}
      <section className="relative pt-36 pb-28 md:pt-48 md:pb-36 overflow-hidden flex flex-col items-center justify-center text-center">
        
        {/* Massive 100M-Dollar Glowing Curved Horizon Dome (As in Reference) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[750px] emerald-dome-glow pointer-events-none -z-10" />
        
        {/* Ambient Secondary Spherical Lights (Desktop only for peak mobile GPU frame rate) */}
        <div className="hidden md:block absolute -top-40 right-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="hidden md:block absolute top-48 -left-32 w-[450px] h-[450px] bg-teal-400/10 rounded-full blur-[140px] pointer-events-none -z-10" />
        
        {/* Subtle Cyber Grid Texture */}
        <div className="absolute inset-0 bg-grid-pattern opacity-70 pointer-events-none -z-10" />

        <div className="container mx-auto max-w-5xl px-4 relative z-10 flex flex-col items-center">
          
          {/* Animated Announcement Pill */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill text-xs font-bold text-primary mb-8 border border-primary/30 shadow-lg shadow-emerald-500/10 hover:border-primary/60 transition-all cursor-pointer group"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-foreground/90 group-hover:text-primary transition-colors">Korevante.ai is now fully live!</span>
            <ChevronRight className="h-3.5 w-3.5 text-primary/70 group-hover:translate-x-0.5 transition-transform" />
          </motion.div>

          {/* Bold Confident Luxury Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-[-0.04em] text-foreground mb-6 leading-[1.08] max-w-4xl mx-auto"
          >
            The Premium AI Workspace <br className="hidden sm:block"/>
            for <span className="gradient-text-mint dark:drop-shadow-[0_0_35px_rgba(0,242,176,0.35)]">Creators &amp; Developers</span>
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground/90 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
          >
            The complete automated system designed to generate content, process media, and scale your workflows — all in one highly professional suite.
          </motion.p>
          
          {/* Dual CTAs (Cyber Mint Pill) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto"
          >
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-14 px-9 sm:px-10 text-sm sm:text-base font-black rounded-full gradient-btn flex items-center justify-center gap-2.5 shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-400/60 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Sparkles className="h-4 w-4 shrink-0" /> Start Your Free Trial <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link href="/tools" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 sm:px-9 text-sm sm:text-base font-bold rounded-full border-2 border-border/80 bg-background/80 hover:bg-emerald-500/10 hover:border-emerald-500 text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Play className="h-4 w-4 text-primary fill-primary/20" /> See Action
              </Button>
            </Link>
          </motion.div>

          {/* Luxury Circular Dock (Matching Reference Layout) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-12 flex items-center justify-center gap-3 sm:gap-4 flex-wrap"
          >
            {[
              { icon: Bot, label: "AI Models" },
              { icon: ImageIcon, label: "Image Studio" },
              { icon: CpuIcon, label: "GPU Cloud" },
              { icon: Terminal, label: "Dev Tools" },
              { icon: Globe, label: "Global API" },
            ].map((dock, idx) => {
              const Icon = dock.icon;
              return (
                <div 
                  key={dock.label}
                  className="h-11 w-11 sm:h-12 sm:w-12 rounded-full glass-card flex items-center justify-center text-primary hover:scale-110 hover:border-primary/60 transition-all cursor-pointer shadow-lg shadow-emerald-500/5 group"
                  title={dock.label}
                >
                  <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                </div>
              );
            })}
          </motion.div>

          {/* Cinematic Frosted Glass Centerpiece */}
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-16 sm:mt-20 w-full max-w-5xl mx-auto relative group"
          >
            
            {/* Luminous Rim Backlight */}
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-teal-400/25 to-emerald-500/20 rounded-[3rem] blur-2xl -z-10 group-hover:blur-3xl transition-all duration-700 opacity-90" />

            {/* Floating Micro-UI 1 (Top Left) */}
            <div className="hidden md:flex absolute -top-8 -left-6 z-30 glass-card rounded-2xl px-4 py-3 items-center gap-3 animate-float border-primary/20 shadow-2xl">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-md">
                <Sparkles className="h-4 w-4 font-black" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-slate-900 dark:text-white">GPT-4o &amp; Claude 3.5</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Zero-latency pipeline
                </p>
              </div>
            </div>

            {/* Floating Micro-UI 2 (Top Right) */}
            <div className="hidden md:flex absolute -top-8 -right-6 z-30 glass-card rounded-2xl px-4 py-3 items-center gap-3 animate-float-delayed border-primary/20 shadow-2xl">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-400 to-cyan-400 flex items-center justify-center text-slate-950 shadow-md">
                <Zap className="h-4 w-4 font-black" />
              </div>
              <div className="text-left">
                <p className="text-xs font-black text-slate-900 dark:text-white">50+ Tools Active</p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-semibold">99.9% Uptime • ₹150/mo</p>
              </div>
            </div>

            {/* Main Window Frame (Dedicated Dark Luxury Studio) */}
            <div className="w-full rounded-[2.5rem] bg-[#070c10] overflow-hidden border border-emerald-500/25 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)] relative">
              
              {/* Window Header */}
              <div className="w-full h-11 bg-[#0b1218] border-b border-white/10 px-6 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500/80 shadow-sm" />
                  <div className="h-3 w-3 rounded-full bg-amber-500/80 shadow-sm" />
                  <div className="h-3 w-3 rounded-full bg-emerald-500/80 shadow-sm" />
                </div>
                <div className="hidden sm:flex items-center gap-2 px-4 py-1 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-semibold text-slate-300">
                  <Lock className="h-3 w-3 text-emerald-400" />
                  <span>app.korevante.com/workspace</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/40 text-emerald-300 bg-emerald-500/15">
                    Enterprise
                  </span>
                </div>
              </div>

              {/* Workspace Inner View */}
              <div className="flex w-full h-[460px] sm:h-[520px] bg-[#070c10] text-left">
                
                {/* Mock Sidebar */}
                <div className="w-16 sm:w-56 h-full border-r border-white/10 p-3 sm:p-5 flex flex-col justify-between bg-[#05080c]">
                  <div className="space-y-1 sm:space-y-2">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-400 mb-4">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="truncate">Search 50+ tools...</span>
                    </div>

                    <div className="flex items-center gap-3 p-2.5 rounded-xl text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer">
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="hidden sm:block text-xs font-bold">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm cursor-pointer">
                      <ImageIcon className="h-4 w-4" />
                      <span className="hidden sm:block text-xs font-bold">AI Studio</span>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer">
                      <Code2 className="h-4 w-4" />
                      <span className="hidden sm:block text-xs font-bold">Code Assistant</span>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-xl text-slate-400 hover:bg-white/[0.06] hover:text-white transition-colors cursor-pointer">
                      <FileText className="h-4 w-4" />
                      <span className="hidden sm:block text-xs font-bold">PDF Engine</span>
                    </div>
                  </div>

                  {/* Profile */}
                  <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.04] border border-white/10">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 text-xs font-black">
                      TV
                    </div>
                    <div className="hidden sm:block overflow-hidden">
                      <p className="text-xs font-bold text-white truncate">Creator Workspace</p>
                      <p className="text-[10px] text-emerald-400 font-bold">Pro License Active</p>
                    </div>
                  </div>
                </div>

                {/* Main Workspace Stage */}
                <div className="flex-1 p-4 sm:p-8 flex flex-col justify-between overflow-hidden relative">
                  
                  <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div>
                    {/* Top Section */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg sm:text-2xl font-black text-white">AI Creative Studio</h3>
                        <p className="text-xs text-slate-400 font-medium hidden sm:block">
                          Generate ultra-realistic visual assets with neural super-resolution.
                        </p>
                      </div>
                      <Button size="sm" className="gradient-btn text-xs font-black h-9 px-4 rounded-xl shadow-md">
                        <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Export 4K
                      </Button>
                    </div>

                    {/* Bento Mini-cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
                      <div className="bg-[#0b1218] rounded-2xl p-4 border border-white/10 hover:border-emerald-500/40 transition-colors">
                        <div className="h-8 w-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                        <h4 className="text-xs font-black text-white">Text to Image</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Photorealistic 4K renders</p>
                      </div>
                      <div className="bg-[#0b1218] rounded-2xl p-4 border border-white/10 hover:border-teal-500/40 transition-colors">
                        <div className="h-8 w-8 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300 mb-2">
                          <Zap className="h-4 w-4" />
                        </div>
                        <h4 className="text-xs font-black text-white">Neural 8X Upscale</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">Zero quality loss enhancement</p>
                      </div>
                      <div className="bg-[#0b1218] rounded-2xl p-4 border border-white/10 hover:border-cyan-500/40 transition-colors">
                        <div className="h-8 w-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 mb-2">
                          <CheckCircle2 className="h-4 w-4" />
                        </div>
                        <h4 className="text-xs font-black text-white">Smart Cutout</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">1-click background removal</p>
                      </div>
                    </div>

                    {/* Canvas Preview */}
                    <div className="w-full h-36 sm:h-44 rounded-2xl bg-[#05080c] border border-white/10 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-teal-500/10 pointer-events-none" />
                      <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2 shadow-inner">
                        <Sparkles className="h-6 w-6 animate-pulse" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-white">
                        Futuristic Cyberpunk Skyline • High Dynamic Range
                      </p>
                      <p className="text-[11px] text-slate-400 font-medium mt-1">
                        Rendered with Seed #482910 • 3840 × 2160 • 60 FPS
                      </p>
                    </div>
                  </div>

                  {/* Interactive Prompt Bar */}
                  <div className="mt-4 w-full bg-[#0b1218] rounded-full p-2 flex items-center justify-between border border-white/15 shadow-xl">
                    <span className="text-xs text-slate-300 font-medium pl-4 truncate">
                      A cinematic futuristic glass skyscraper with glowing cyan neon lights at twilight...
                    </span>
                    <Button size="sm" className="gradient-btn rounded-full px-5 text-xs font-black shrink-0 h-9">
                      <Sparkles className="h-3.5 w-3.5 mr-1" /> Generate
                    </Button>
                  </div>

                </div>
              </div>
            </div>

          </motion.div>

        </div>
      </section>

      {/* 2. ENTERPRISE FEATURES BENTO GRID (WITH SCROLL ANIMATIONS) */}
      <motion.section 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="py-28 bg-slate-100/60 dark:bg-black/40 relative z-20 border-y border-slate-200/80 dark:border-white/5"
      >
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-xs uppercase tracking-wider glass-pill px-4 py-1.5 border-0 font-bold text-emerald-600 dark:text-emerald-400">
              <Cpu className="h-3.5 w-3.5 mr-1.5" /> High-Performance Suite
            </Badge>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
              Replace Your Clunky Tools With A <br className="hidden md:block"/>
              <span className="gradient-text-mint">Smart, Enterprise System</span>
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-medium">
              Log in to a single powerful, premium dashboard to manage everything seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Bento Card 1: AI Content Generation */}
            <motion.div variants={fadeUp} className="glass-card rounded-3xl p-8 flex flex-col justify-between group border border-slate-200/90 dark:border-white/10 hover:border-emerald-500/50">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 mb-6 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform">
                  <UploadCloud className="h-6 w-6 font-black" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">AI Content Generation</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed">
                  Automate long-form blogs, marketing copy, and multi-language translations in seconds.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-4 border-t border-slate-200/80 dark:border-white/10">
                <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> SEO Blog Automation</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Social Media Copywriter</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Intelligent Email Drafter</li>
              </ul>
            </motion.div>

            {/* Bento Card 2: Image Studio & Editor */}
            <motion.div variants={fadeUp} className="glass-card rounded-3xl p-8 flex flex-col justify-between group border border-slate-200/90 dark:border-white/10 hover:border-teal-500/50">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-400 to-cyan-500 text-slate-950 mb-6 shadow-lg shadow-teal-500/25 group-hover:scale-110 transition-transform">
                  <Settings className="h-6 w-6 font-black" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Image Studio &amp; Editor</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed">
                  Server-side neural upscaling, instant transparent PNGs, and bulk format conversions.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-4 border-t border-slate-200/80 dark:border-white/10">
                <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Smart Background Removal</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Bulk Format Conversion</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Quality Preserving</li>
              </ul>
            </motion.div>

            {/* Bento Card 3: PDF & Document Suite */}
            <motion.div variants={fadeUp} className="glass-card rounded-3xl p-8 flex flex-col justify-between group border border-slate-200/90 dark:border-white/10 hover:border-cyan-500/50">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 mb-6 shadow-lg shadow-cyan-500/25 group-hover:scale-110 transition-transform">
                  <PieChart className="h-6 w-6 font-black" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">PDF &amp; Document Suite</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed">
                  High-speed pdf-lib engine for merging, splitting, page reordering, and OCR compression.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-4 border-t border-slate-200/80 dark:border-white/10">
                <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Split and Merge PDFs</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Advanced Metadata</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Secure Cloud Storage</li>
              </ul>
            </motion.div>

            {/* Bento Card 4: High-Speed Dev Tools */}
            <motion.div variants={fadeUp} className="glass-card rounded-3xl p-8 flex flex-col justify-between group border border-slate-200/90 dark:border-white/10 hover:border-emerald-500/50">
              <div>
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-green-500 text-slate-950 mb-6 shadow-lg shadow-green-500/25 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 font-black" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">High-Speed Dev Tools</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed">
                  Precision utilities for formatting, cryptographic key generation, and encoding.
                </p>
              </div>
              <ul className="space-y-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 pt-4 border-t border-slate-200/80 dark:border-white/10">
                <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Instant JSON Formatting</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Base64 Encoding</li>
                <li className="flex items-center gap-2.5"><CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> Cryptographic Gen</li>
              </ul>
            </motion.div>

          </div>

        </div>
      </motion.section>

      {/* 3. THREE-STEP PROCESS (LUXURY REDESIGN WITH AMBIENT DEPTH) */}
      <motion.section 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="py-32 relative z-20 overflow-hidden"
      >
        {/* Soft Ambient Radial Lighting */}
        <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[450px] bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[130px] pointer-events-none -z-10" />

        <div className="container mx-auto max-w-6xl px-4 text-center">
          
          <Badge variant="outline" className="mb-4 text-xs uppercase tracking-wider glass-pill px-4 py-1.5 border-0 font-bold text-emerald-600 dark:text-emerald-400">
            <Layers className="h-3.5 w-3.5 mr-1.5" /> Frictionless Workflow
          </Badge>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
            Your 3-Step Path to <span className="gradient-text-mint">Automated Output</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-xl mx-auto mb-16 font-medium">
            From registration to autonomous scaling in minutes. No complex configuration required.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            
            {/* Luminous Connecting Track */}
            <div className="hidden md:block absolute top-24 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-emerald-500/20 via-teal-400/40 to-cyan-500/20 -z-10" />
            
            {/* Step 1 */}
            <motion.div 
              variants={fadeUp} 
              className="glass-card rounded-[2rem] p-7 sm:p-8 flex flex-col justify-between text-left group border border-slate-200/90 dark:border-white/10 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300"
            >
              <div>
                {/* Step Top Chip */}
                <div className="flex items-center justify-between w-full mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> STEP 01
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Instant Access
                  </span>
                </div>

                {/* Glowing Icon Dock */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-teal-500/15 to-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6 shadow-lg shadow-emerald-500/10 group-hover:scale-105 transition-transform">
                  <Zap className="h-6 w-6" />
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                  Start Your Trial
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal mb-6">
                  Sign up in under 30 seconds. Get instant access to the entire 50+ tool ecosystem with zero risk.
                </p>
              </div>

              {/* Micro-UI Badges */}
              <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Zero Credit Card Required</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>7-Day Free Unlimited Access</span>
                </div>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div 
              variants={fadeUp} 
              className="glass-card rounded-[2rem] p-7 sm:p-8 flex flex-col justify-between text-left group border border-slate-200/90 dark:border-white/10 hover:border-teal-500/50 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300"
            >
              <div>
                {/* Step Top Chip */}
                <div className="flex items-center justify-between w-full mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider text-teal-700 dark:text-teal-300 bg-teal-500/10 border border-teal-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" /> STEP 02
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    50+ Tool Suite
                  </span>
                </div>

                {/* Glowing Icon Dock */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500/20 via-cyan-500/15 to-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-6 shadow-lg shadow-teal-500/10 group-hover:scale-105 transition-transform">
                  <Shield className="h-6 w-6" />
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                  Pick Your Tools
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal mb-6">
                  Switch between AI models, image manipulators, video compression, and dev tools from a single centralized dash.
                </p>
              </div>

              {/* Micro-UI Badges */}
              <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  <span>GPT-4o, Claude 3.5 &amp; Flux</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Bulk Media Batch Engines</span>
                </div>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div 
              variants={fadeUp} 
              className="glass-card rounded-[2rem] p-7 sm:p-8 flex flex-col justify-between text-left group border border-slate-200/90 dark:border-white/10 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/10 transition-all duration-300"
            >
              <div>
                {/* Step Top Chip */}
                <div className="flex items-center justify-between w-full mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" /> STEP 03
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Autopilot Scale
                  </span>
                </div>

                {/* Glowing Icon Dock */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-emerald-500/15 to-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-6 shadow-lg shadow-cyan-500/10 group-hover:scale-105 transition-transform">
                  <Sparkles className="h-6 w-6" />
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                  Scale on Autopilot
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal mb-6">
                  Automate hours of repetitive manual tasks. Multiply team output without adding headcount or complex infrastructure.
                </p>
              </div>

              {/* Micro-UI Badges */}
              <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>10x Throughput Acceleration</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                  <span>Zero Latency Cloud Processing</span>
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </motion.section>

      {/* 4. PRICING SECTION (WITH SCROLL ANIMATION) */}
      <motion.section 
        id="pricing" 
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="py-28 bg-slate-100/50 dark:bg-black/40 border-t border-slate-200/80 dark:border-white/5 relative z-20"
      >
        <div className="container mx-auto max-w-6xl px-4">
          
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 text-xs uppercase tracking-wider glass-pill px-4 py-1.5 border-0 font-bold text-emerald-600 dark:text-emerald-400">
              <Star className="h-3.5 w-3.5 mr-1.5" /> Honest &amp; Transparent
            </Badge>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
              Simple, Transparent Pricing
            </h2>

            {/* Switcher */}
            <div className="inline-flex items-center p-1.5 rounded-full glass-card gap-2 border border-slate-200/80 dark:border-white/10">
              <button 
                onClick={() => setIsYearly(false)}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all ${!isYearly ? 'gradient-btn shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setIsYearly(true)}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${isYearly ? 'gradient-btn shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Yearly <span className="bg-emerald-950 text-emerald-300 dark:bg-black/60 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[9px] uppercase font-black">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left items-stretch">
            {plans.map((plan) => {
              const currentPrice = isYearly ? plan.yearlyPrice : plan.price;
              return (
                <motion.div 
                  key={plan.id}
                  variants={fadeUp} 
                  className={`glass-card rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between border transition-all ${
                    plan.popular 
                      ? "relative transform md:-translate-y-4 ring-2 ring-emerald-500/70 dark:ring-emerald-400 shadow-2xl shadow-emerald-500/20 z-10 border-emerald-500/30" 
                      : "border-border/80 hover:border-primary/40"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 gradient-btn px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/30 text-white">
                      ★ {plan.badge || "Most Popular"}
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-black text-foreground">{plan.title}</h3>
                      {plan.badge && !plan.popular && (
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-6 font-medium leading-relaxed min-h-[36px]">
                      {plan.tagline}
                    </p>

                    <div className="flex items-baseline gap-1 mb-2 pb-4 border-b border-border/40">
                      <span className="text-4xl sm:text-5xl font-black text-foreground">₹{currentPrice}</span>
                      <span className="text-xs font-semibold text-muted-foreground">/ month</span>
                    </div>
                    {isYearly && (
                      <p className="text-xs font-bold text-emerald-500 mb-6">
                        Billed annually (₹{plan.yearlyPrice * 12}/year)
                      </p>
                    )}
                    
                    <Link href={plan.href || "/signup"} className="block w-full mb-8 mt-4">
                      <Button 
                        variant={plan.popular ? "default" : "outline"}
                        size="lg"
                        className={`w-full h-14 rounded-2xl font-black text-sm sm:text-base transition-all flex items-center justify-center gap-2 ${
                          plan.popular 
                            ? "gradient-btn shadow-2xl shadow-emerald-500/35 hover:shadow-emerald-400/50 hover:scale-[1.02] active:scale-[0.98] text-white dark:text-[#01140e]" 
                            : "border-2 border-border/80 bg-background/90 hover:bg-emerald-500/10 hover:border-emerald-500 text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                        }`}
                      >
                        <span>{plan.ctaText || "Start 7-Day Free Trial"}</span>
                        <ArrowRight className="h-4 w-4 ml-1 shrink-0" />
                      </Button>
                    </Link>
                    
                    <div className="text-xs font-black text-foreground mb-4 uppercase tracking-wider">Features Included:</div>
                    <ul className="space-y-3 text-xs font-semibold text-muted-foreground">
                      {plan.features.slice(0, 5).map((f) => (
                        <li key={f} className="flex items-start gap-2.5">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-foreground leading-tight">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

    </div>
  );
}
