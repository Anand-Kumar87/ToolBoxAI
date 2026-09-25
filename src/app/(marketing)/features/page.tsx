import Link from "next/link";
import { 
  Sparkles, ArrowRight, CheckCircle2, Image as ImageIcon, Video, 
  FileText, Code2, Zap, ShieldCheck, Cpu, Layers, Clock, 
  TrendingUp, Users, Globe, Lock, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    title: "AI Content Generation Suite",
    icon: Sparkles,
    badgeColor: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
    tools: 15,
    description: "15 production-ready tools covering every content format with next-generation neural text intelligence.",
    highlights: [
      "Long-form Blog & Article Writer", 
      "YouTube Title & Description AI", 
      "SEO Keyword & Search Intent Generator", 
      "Adaptive Email Drafter (5 Tone Presets)", 
      "Grammar Checker & Contextual Paraphraser", 
      "Multi-Language Neural Translator (50+ languages)", 
      "ATS-Optimized AI Resume Architect", 
      "Viral Social Media Caption Studio"
    ],
  },
  {
    title: "Image Processing Studio",
    icon: ImageIcon,
    badgeColor: "from-teal-500/20 to-cyan-500/10 border-teal-500/30 text-teal-400",
    tools: 14,
    description: "High-performance image manipulation powered by dedicated server-side canvas and neural processing.",
    highlights: [
      "One-Click Background Remover (Alpha PNG)", 
      "Neural Network 2x/4x Upscaler", 
      "Lossless & Perceptual Image Compressor", 
      "Platform Preset Resizer (YouTube, IG, X)", 
      "Cinematic Tone & Color Grading Library", 
      "Multi-Layer Canvas Collage Maker", 
      "Biometric Passport Photo Framer", 
      "Precision Typography & Watermark Engine"
    ],
  },
  {
    title: "Video & Audio Processing",
    icon: Video,
    badgeColor: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400",
    tools: 12,
    description: "FFmpeg-accelerated server-side media processing with real-time asynchronous background job queuing.",
    highlights: [
      "Hardware-Accelerated Video Compressor", 
      "Lossless Video Trimmer & Segment Cutter", 
      "Video to High-FPS Animated GIF Converter", 
      "Studio Audio Extractor (MP3, WAV, FLAC)", 
      "Hardcoded Subtitle Burner (SRT / VTT)", 
      "Variable Video Speed Controller (0.25x – 4x)", 
      "Full Resolution Converter (480p to 4K)", 
      "Multi-Clip Video Merger & Stitcher"
    ],
  },
  {
    title: "PDF Document Engine",
    icon: FileText,
    badgeColor: "from-cyan-500/20 to-emerald-500/10 border-cyan-500/30 text-cyan-400",
    tools: 10,
    description: "Enterprise-grade PDF manipulation built on isolated server runtimes with zero third-party data leakage.",
    highlights: [
      "Unlimited Multi-File PDF Merger", 
      "Precise Page-Range PDF Splitter", 
      "DPI-Preserving PDF Compression Engine", 
      "Batch Image to Multi-Page PDF Compiler", 
      "Vector PDF to High-Res PNG / JPG Exporter", 
      "Embedded Text & Metadata Extractor", 
      "Interactive Drag-and-Drop Page Reorder", 
      "Fillable Digital Form Flattening Support"
    ],
  },
  {
    title: "Developer Utilities",
    icon: Code2,
    badgeColor: "from-teal-500/20 to-emerald-500/10 border-teal-500/30 text-teal-400",
    tools: 4,
    description: "Cryptographic, formatting, and encoding utilities engineered for engineers who value zero-latency tooling.",
    highlights: [
      "Strict JSON Formatter, Minifier & Schema Validator", 
      "Multi-Type Base64 Encoder & Decoder", 
      "RFC-Compliant URL Component Encoder", 
      "Cryptographically Secure Password & Token Generator"
    ],
  },
  {
    title: "Productivity & Utilities",
    icon: Zap,
    badgeColor: "from-emerald-500/20 to-cyan-500/10 border-emerald-500/30 text-emerald-400",
    tools: 6,
    description: "Everyday workflow accelerators designed to eliminate context switching and repetitive manual tasks.",
    highlights: [
      "Vector QR Code Studio (Custom Colors & Logos)", 
      "High-Tolerance QR Code Image Scanner", 
      "Multi-Unit Engineering & Metric Converter", 
      "Hex, RGB, HSL & CMYK Color Studio", 
      "Text Case Transformer (Camel, Pascal, Kebab, Snake)", 
      "Network DNS & Public Domain Inspect"
    ],
  },
];

const PLATFORM_HIGHLIGHTS = [
  { label: "50+", sublabel: "Production-Ready Tools", icon: Layers },
  { label: "7 Days", sublabel: "Full Access Free Trial", icon: Clock },
  { label: "₹150", sublabel: "Transparent Monthly Entry", icon: TrendingUp },
  { label: "99.99%", sublabel: "Verified Infrastructure SLA", icon: Cpu },
];

export default function FeaturesPage() {
  return (
    <div className="flex flex-col relative overflow-hidden">
      {/* Ambient Horizon Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] emerald-dome-glow pointer-events-none -z-10" />

      {/* Hero */}
      <section className="relative pt-24 pb-20 md:pt-32 md:pb-28 border-b border-border/40 overflow-hidden">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill mb-8 border border-primary/25 text-xs font-bold text-foreground shadow-sm">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="tracking-wide uppercase font-extrabold text-[11px]">All-In-One Enterprise Platform</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-foreground max-w-4xl mx-auto leading-[1.08]">
            Every Tool You Need,{" "}
            <span className="gradient-text-mint block sm:inline">
              One Unified Workspace
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
            Stop switching between 15 different fragmented subscriptions. ToolVerse AI consolidates 50+ enterprise-grade tools into a single fast, private, and secure workspace.
          </p>

          {/* Luxury CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5 w-full max-w-md mx-auto sm:max-w-none">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="w-full sm:w-auto h-14 px-9 sm:px-10 rounded-full font-black text-sm sm:text-base gradient-btn flex items-center justify-center gap-2.5 shadow-2xl shadow-emerald-500/35 hover:shadow-emerald-400/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>Start 7-Day Free Trial</span>
                <ArrowRight className="h-4 w-4 ml-0.5" />
              </Button>
            </Link>
            <Link href="/tools" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full sm:w-auto h-14 px-8 sm:px-9 rounded-full font-bold text-sm sm:text-base border-2 border-border/80 bg-background/80 hover:bg-emerald-500/10 hover:border-emerald-500 text-foreground hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Layers className="h-4 w-4 text-primary" />
                <span>Browse All Tools</span>
              </Button>
            </Link>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-primary" /> No Credit Card Required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-primary" /> Instant Access
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-primary" /> Cancel Anytime
            </span>
          </div>

        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-14 border-b border-border/40 relative">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {PLATFORM_HIGHLIGHTS.map((stat) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={stat.label} 
                  className="glass-card rounded-2xl p-6 sm:p-7 text-center space-y-3 group hover:border-primary/40 transition-all"
                >
                  <div className="h-11 w-11 mx-auto rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">{stat.label}</div>
                  <div className="text-xs sm:text-sm font-semibold text-muted-foreground">{stat.sublabel}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6 Feature Suites */}
      <section className="py-24 relative">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill mb-4 border border-primary/20 text-xs font-bold text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span>CORE ARCHITECTURE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight leading-tight">
              6 Comprehensive Tool Suites
            </h2>
            <p className="text-muted-foreground mt-4 text-base sm:text-lg font-medium leading-relaxed">
              Every tool runs on dedicated server-side engines, strictly secured with cryptographically verified session handling.
            </p>
          </div>

          <div className="space-y-8">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              const isEven = i % 2 === 0;
              return (
                <div 
                  key={feature.title} 
                  className="glass-card rounded-3xl overflow-hidden border border-border/80 hover:border-primary/40 transition-all duration-300"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
                    
                    {/* Suite Header & Details */}
                    <div className={`p-8 sm:p-10 md:col-span-5 flex flex-col justify-between space-y-6 ${!isEven ? "md:order-2" : ""}`}>
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <div className={`h-13 w-13 rounded-2xl bg-gradient-to-tr ${feature.badgeColor} border flex items-center justify-center text-primary shadow-lg`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <Badge variant="secondary" className="px-3 py-1 font-bold text-xs bg-primary/10 text-primary border border-primary/20">
                            {feature.tools} Production Tools
                          </Badge>
                        </div>
                        <div>
                          <h3 className="text-2xl font-black text-foreground tracking-tight mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                            {feature.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <Link href={`/tools?category=${feature.title.split(" ")[0].toUpperCase()}`}>
                          <Button 
                            variant="outline" 
                            size="default" 
                            className="glass-pill hover:border-primary/50 text-foreground font-bold text-xs sm:text-sm rounded-xl px-5 h-11 gap-2 group/btn"
                          >
                            <span>Explore {feature.title.split(" ")[0]} Suite</span>
                            <ArrowRight className="h-3.5 w-3.5 text-primary group-hover/btn:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Features Grid */}
                    <div className={`p-8 sm:p-10 md:col-span-7 bg-muted/20 border-t md:border-t-0 ${isEven ? "md:border-l" : "md:border-r"} border-border/40 flex items-center ${!isEven ? "md:order-1" : ""}`}>
                      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {feature.highlights.map((item) => (
                          <div 
                            key={item} 
                            className="flex items-start gap-3 p-2.5 rounded-xl bg-background/50 border border-border/40 hover:border-primary/30 transition-colors"
                          >
                            <div className="h-5 w-5 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 mt-0.5 text-primary">
                              <Check className="h-3 w-3" />
                            </div>
                            <span className="text-xs sm:text-sm text-foreground font-semibold leading-snug">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Platform Security & Architecture */}
      <section className="py-24 bg-muted/10 border-t border-border/40 relative">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill mb-4 border border-primary/20 text-xs font-bold text-foreground">
              <Lock className="h-3.5 w-3.5 text-primary" />
              <span>BUILT FOR SCALE</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight">
              Enterprise Security &amp; Reliability
            </h2>
            <p className="text-muted-foreground mt-4 text-base font-medium">
              Every operation follows zero-trust isolation and cryptographic safety guarantees.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: "Server-side Payment Verification", desc: "Every Razorpay transaction is cryptographically validated using HMAC SHA256 signatures server-side — client callbacks are never trusted." },
              { icon: Cpu, title: "Isolated Job Queue Execution", desc: "Heavy video encoding, AI generations, and PDF compilation run in dedicated background pipelines to ensure zero UI lag." },
              { icon: Lock, title: "Bcrypt Cost Factor 12 Hashing", desc: "User passwords and sensitive secrets are salted and hashed using bcrypt (cost 12). Raw credentials are never stored in memory or disk." },
              { icon: Globe, title: "Cryptographic Usage Gating", desc: "Access tiers, trial limits, and feature permissions are verified against PostgreSQL rows server-side on every single API route." },
              { icon: ShieldCheck, title: "Strict MIME & Byte Validation", desc: "File uploads undergo binary magic number inspection, strict MIME verification, and virus scan heuristics with unique randomized UUID keys." },
              { icon: Users, title: "Hardware-Protected RBAC", desc: "Strict role-based access control middleware runs at edge and server layer for seamless separation between team members and administrators." },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div 
                  key={item.title} 
                  className="glass-card rounded-2xl p-7 space-y-4 hover:border-primary/40 transition-all group"
                >
                  <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-emerald-500/15 to-teal-500/5 border border-emerald-500/25 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-medium">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-24 border-t border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 emerald-radial-glow pointer-events-none" />
        <div className="container mx-auto max-w-4xl px-4 text-center space-y-8 relative z-10">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
            Ready to Replace 10 Subscriptions with <span className="gradient-text-mint">One Luxury Hub</span>?
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto font-medium">
            Start your 7-day free trial right now — zero credit card required. Experience complete unlocked access in 10 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup">
              <Button 
                size="lg" 
                className="h-14 px-10 rounded-full font-black text-base gradient-btn flex items-center gap-2.5 shadow-2xl shadow-emerald-500/35 hover:shadow-emerald-400/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Start Free 7-Day Trial</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
