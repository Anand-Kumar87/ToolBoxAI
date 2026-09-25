import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { evaluateTrial } from "@/services/usage";
import { 
  Sparkles, 
  ArrowRight, 
  Clock, 
  TrendingUp, 
  Zap, 
  Image, 
  FileText, 
  Video, 
  Code2,
  CheckCircle2, 
  AlertCircle,
  Crown,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Activity,
  HardDrive
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

async function getDashboardData(userId: string) {
  const [user, toolUsageCount, recentUsages, projects, processingJobs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        trial: true,
        subscriptions: {
          where: { status: "ACTIVE" },
          include: { plan: true },
          take: 1,
          orderBy: { createdAt: "desc" },
        },
        notifications: {
          where: { isRead: false },
          take: 5,
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.toolUsage.count({ where: { userId } }),
    prisma.toolUsage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.project.count({ where: { userId, isArchived: false } }),
    prisma.processingJob.count({ where: { userId, status: { in: ["PENDING", "QUEUED", "PROCESSING"] } } }),
  ]);

  return { user, toolUsageCount, recentUsages, projects, processingJobs };
}

const QUICK_TOOLS = [
  { 
    name: "AI Content Writer", 
    href: "/tools/ai/ai-content-writer", 
    icon: Sparkles, 
    category: "AI & Copywriting",
    badge: "Fast"
  },
  { 
    name: "Background Remover", 
    href: "/tools/image/background-remover", 
    icon: Image, 
    category: "Neural Image",
    badge: "AI 4K"
  },
  { 
    name: "PDF Merge & Split", 
    href: "/tools/pdf/pdf-merge", 
    icon: FileText, 
    category: "Document Studio",
    badge: "Instant"
  },
  { 
    name: "Video Compressor", 
    href: "/tools/video/video-compressor", 
    icon: Video, 
    category: "Media Pipeline",
    badge: "Lossless"
  },
  { 
    name: "JSON Formatter", 
    href: "/tools/developer/json-formatter", 
    icon: Code2, 
    category: "Dev Utilities",
    badge: "Secure"
  },
  { 
    name: "Browse All 50+ Tools", 
    href: "/tools", 
    icon: Zap, 
    category: "Full Suite",
    badge: "Unified"
  },
];

export default async function DashboardPage() {
  const session = await getServerAuthSession();
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;
  const { user, toolUsageCount, recentUsages, projects, processingJobs } = await getDashboardData(userId);

  if (!user) redirect("/login");

  const activeSub = user.subscriptions[0];
  const { isActive: trialActive, daysRemaining } = evaluateTrial(user.trial as any);

  // Determine subscription display info
  const planTitle = activeSub?.plan.title ?? (trialActive ? "Free Trial" : "No Active Plan");

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formattedDate = new Date().toLocaleDateString("en-IN", { 
    weekday: "long", 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-2 border-b border-border/40">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[11px] font-bold text-primary mb-2.5 border border-primary/20">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Workspace
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
            {greeting()}, <span className="gradient-text">{user.name?.split(" ")[0] || "Creator"}</span> 👋
          </h1>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5 font-medium">
            <Calendar className="h-3.5 w-3.5 text-primary/80" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Subscription / Trial Status Header Dock */}
        <div className="flex flex-wrap items-center gap-3">
          {activeSub ? (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl glass-card border border-emerald-500/40 bg-emerald-500/10 shadow-sm">
              <Crown className="h-4 w-4 text-emerald-400" />
              <span className="text-xs font-black text-foreground">
                {activeSub.plan.title} Plan Active
              </span>
            </div>
          ) : trialActive ? (
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl glass-card border border-amber-500/30 bg-amber-500/5 shadow-sm">
              <Clock className="h-4 w-4 text-amber-400" />
              <div>
                <div className="text-xs font-black text-foreground">
                  7-Day Free Trial
                </div>
                <div className="text-[10px] font-semibold text-amber-400">
                  {daysRemaining} day{daysRemaining !== 1 ? "s" : ""} left • Unpaid
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl glass-card border border-red-500/30 bg-red-500/5 shadow-sm">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-xs font-black text-red-400">
                Trial Expired
              </span>
            </div>
          )}

          <Link href="/dashboard/billing">
            <Button 
              variant="outline" 
              size="sm" 
              className="h-10 px-4 rounded-xl border-2 border-border/80 bg-background/80 hover:bg-emerald-500/10 hover:border-emerald-500 text-xs font-extrabold hover:text-emerald-500 transition-all"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Upgrade Plan
            </Button>
          </Link>
        </div>
      </div>

      {/* Trial Countdown Notice (when <= 3 days) */}
      {!activeSub && trialActive && daysRemaining <= 3 && (
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 glass-card">
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-black text-amber-600 dark:text-amber-400">
              Free trial concluding in {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 font-medium">
              Keep your projects, output files, and unlimited 50+ tool access uninterrupted by selecting a subscription.
            </p>
          </div>
          <Link href="/dashboard/billing">
            <Button size="sm" className="gradient-btn shrink-0 rounded-xl text-xs font-black text-white dark:text-[#01140e] shadow-md shadow-emerald-500/20">
              Upgrade Now <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* 4 Metric Cards - Luxury Symmetrical Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: "Total Operations",
            value: toolUsageCount.toLocaleString(),
            icon: TrendingUp,
            tag: "Lifetime Uses",
            status: "Normal",
          },
          {
            title: "Active Projects",
            value: projects.toLocaleString(),
            icon: CheckCircle2,
            tag: "Stored Workspaces",
            status: "Synched",
          },
          {
            title: "Processing Jobs",
            value: processingJobs.toLocaleString(),
            icon: Zap,
            tag: "Active Queue",
            status: processingJobs > 0 ? "In Progress" : "Idle (0 Latency)",
          },
          {
            title: "Plan Tier",
            value: planTitle,
            icon: Crown,
            tag: trialActive ? `${daysRemaining} Days Trial Left` : "Active Subscription",
            status: "Unlimited Access",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div 
              key={stat.title} 
              className="glass-card rounded-2xl p-6 border-white/10 dark:border-white/5 relative overflow-hidden group hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Subtle top-right ambient glow */}
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />

              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-black uppercase tracking-wider text-muted-foreground truncate">
                    {stat.title}
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-2 truncate">
                    {stat.value}
                  </p>
                </div>

                {/* Dedicated Centered Luxury Icon Dock */}
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500/15 via-teal-500/10 to-transparent border border-emerald-500/25 flex items-center justify-center shrink-0 text-emerald-400 group-hover:scale-105 group-hover:border-emerald-400/50 transition-all duration-300 shadow-sm shadow-emerald-500/10">
                  <Icon className="h-6 w-6 shrink-0" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-border/30 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-muted-foreground truncate">{stat.tag}</span>
                <span className="font-bold text-emerald-500 truncate">{stat.status}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content: Quick Launch Studio & Account Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Launch Tools - 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-foreground tracking-tight">
                Quick Studio Launch
              </h2>
              <p className="text-xs text-muted-foreground font-medium">
                Jump directly into production-grade neural tools
              </p>
            </div>
            <Link 
              href="/tools" 
              className="text-xs font-bold text-primary hover:text-emerald-400 transition-colors inline-flex items-center gap-1 group"
            >
              Browse 50+ Tools
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {QUICK_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.name} href={tool.href} className="group block">
                  <div className="h-full flex items-center justify-between p-4 rounded-2xl border border-border/60 dark:border-white/10 bg-card/60 backdrop-blur-md hover:bg-emerald-500/5 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-200">
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-11 w-11 rounded-xl bg-gradient-to-tr from-emerald-500/15 to-teal-500/10 border border-emerald-500/20 flex items-center justify-center text-primary group-hover:scale-105 group-hover:border-emerald-400/50 transition-all shrink-0">
                        <Icon className="h-5 w-5 shrink-0" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-black text-foreground group-hover:text-primary transition-colors leading-snug truncate">
                          {tool.name}
                        </div>
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">
                          {tool.category}
                        </div>
                      </div>
                    </div>
                    
                    <div className="shrink-0 pl-2">
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Account & Subscription Summary - 1/3 width */}
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-black text-foreground tracking-tight">
              Workspace Summary
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              Subscription &amp; infrastructure details
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6 border-white/10 dark:border-white/5 space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-border/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Crown className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-black text-foreground">{planTitle}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Current Tier</div>
                </div>
              </div>
              <Badge variant="outline" className="text-xs font-black border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                {trialActive ? "Trial Active" : activeSub ? "Subscribed" : "Free Access"}
              </Badge>
            </div>

            {/* Usage Details */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Member Since
                </span>
                <span className="font-bold text-foreground">{formatDate(user.createdAt)}</span>
              </div>

              {user.trial && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-emerald-400" /> Trial Status
                  </span>
                  <span className="font-bold text-emerald-500">
                    {trialActive ? `${daysRemaining} days remaining` : "Expired"}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-emerald-400" /> AI Processing Quota
                </span>
                <span className="font-bold text-foreground">
                  {planTitle.toLowerCase().includes("pro") || planTitle.toLowerCase().includes("enterprise") ? "Unlimited Requests" : "20 requests/day"}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                  <HardDrive className="h-3.5 w-3.5 text-emerald-400" /> Cloud Storage
                </span>
                <span className="font-bold text-foreground">Encrypted &amp; Synced</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <Link href="/dashboard/billing" className="block w-full">
                <Button className="w-full h-11 gradient-btn rounded-xl font-black text-xs text-white dark:text-[#01140e] shadow-lg shadow-emerald-500/25">
                  <Sparkles className="h-3.5 w-3.5 mr-2" />
                  Upgrade or Change Plan
                </Button>
              </Link>
              <Link href="/dashboard/billing" className="block w-full">
                <Button variant="outline" size="sm" className="w-full h-10 rounded-xl text-xs font-bold border-border/80 hover:border-emerald-500/50">
                  Manage Billing &amp; Invoices
                </Button>
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Recent Tool Activity */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-foreground tracking-tight">
              Recent Activity
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              {recentUsages.length > 0 ? `Your last ${recentUsages.length} executed operations` : "Your workspace operation log"}
            </p>
          </div>
          {recentUsages.length > 0 && (
            <Link href="/tools">
              <Button variant="ghost" size="sm" className="gap-1 text-xs font-bold text-primary hover:text-emerald-400">
                Launch New Tool <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          )}
        </div>

        {recentUsages.length > 0 ? (
          <div className="glass-card rounded-2xl border-white/10 dark:border-white/5 overflow-hidden">
            <div className="divide-y divide-border/30">
              {recentUsages.map((usage) => (
                <div
                  key={usage.id}
                  className="flex items-center justify-between py-3.5 px-5 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                        {usage.toolSlug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider truncate">
                        {usage.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right shrink-0">
                    <span className="text-[11px] font-bold text-muted-foreground hidden sm:inline">
                      {new Date(usage.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {usage.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="glass-card rounded-[2rem] p-10 text-center border-dashed border-border/80 flex flex-col items-center justify-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-primary shadow-lg shadow-emerald-500/10">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="max-w-md">
              <h3 className="text-base font-black text-foreground">Your Workspace is Ready</h3>
              <p className="text-xs text-muted-foreground mt-1 font-medium leading-relaxed">
                You haven&apos;t run any tools yet. Choose from our 50+ high-performance AI, Image, Video, and PDF utilities to get started.
              </p>
            </div>
            <Link href="/tools">
              <Button className="gradient-btn rounded-xl px-6 h-11 text-xs font-black text-white dark:text-[#01140e] shadow-lg shadow-emerald-500/25">
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                Explore 50+ Production Tools
              </Button>
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
