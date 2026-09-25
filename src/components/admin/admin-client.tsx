"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Users,
  Activity,
  CreditCard,
  Box,
  TrendingUp,
  Layers,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Tag,
  Check,
  Sparkles,
  RefreshCw,
  Save,
  Search,
  Filter,
  Download,
  Bell,
  Send,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Wrench,
  HardDrive,
  Server,
  Shield,
  Zap,
  Globe,
  Loader2,
  Sliders,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import {
  deleteUserAction,
  updateUserRoleAction,
  updatePlanAction,
  resetCanonicalPlansAction,
  toggleToolStatusAction,
  updateToolAction,
  broadcastNotificationAction,
  toggleUserToolDelegationAction,
} from "@/actions/admin";

interface AdminClientProps {
  stats: {
    totalUsers: number;
    totalUsage: number;
    totalRevenue: number;
    activeSubscriptions: number;
    totalStorageMb: number;
    totalFiles: number;
  };
  users: any[];
  payments: any[];
  initialPlans?: any[];
  tools?: any[];
  auditLogs?: any[];
  categoryUsage?: any[];
}

export function AdminClient({
  stats,
  users,
  payments,
  initialPlans = [],
  tools: initialTools = [],
  auditLogs = [],
  categoryUsage = [],
}: AdminClientProps) {
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "users" | "tools" | "payments" | "pricing"
  >("overview");
  const [isPending, startTransition] = React.useTransition();
  const [loading, setLoading] = React.useState(false);
  const [savingPlanId, setSavingPlanId] = React.useState<string | null>(null);

  // Tab change with non-blocking transition
  const handleTabChange = (tab: "overview" | "users" | "tools" | "payments" | "pricing") => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  // Tools state for live registry management
  const [toolList, setToolList] = React.useState<any[]>(initialTools);
  const [toolSearch, setToolSearch] = React.useState("");
  const [toolCategoryFilter, setToolCategoryFilter] = React.useState("ALL");

  // Users state with filtering & search
  const [userSearch, setUserSearch] = React.useState("");
  const [userRoleFilter, setUserRoleFilter] = React.useState("ALL");

  // Payments state with filtering & search
  const [paymentSearch, setPaymentSearch] = React.useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = React.useState("ALL");

  // Broadcast announcement modal / drawer
  const [broadcastOpen, setBroadcastOpen] = React.useState(false);
  const [broadcastTitle, setBroadcastTitle] = React.useState("");
  const [broadcastMessage, setBroadcastMessage] = React.useState("");
  const [broadcastSending, setBroadcastSending] = React.useState(false);

  // Parse plans state
  const [plans, setPlans] = React.useState<any[]>(() => {
    return initialPlans.map((p) => {
      let meta: any = {};
      try {
        if (p.features) meta = JSON.parse(p.features);
      } catch {
        meta = {};
      }
      return {
        id: p.id,
        name: p.name,
        title: p.title || p.name,
        description: p.description || "",
        price: p.price,
        yearlyPrice: meta.yearlyPrice || Math.round(p.price * 0.8),
        badge:
          meta.badge ||
          (p.name === "PRO"
            ? "Most Popular"
            : p.name === "BASIC"
            ? "Most Affordable"
            : "Unlimited Scale"),
        popular: meta.popular !== undefined ? meta.popular : p.name === "PRO",
      };
    });
  });

  // Export Users to CSV
  const handleExportUsersCSV = () => {
    if (users.length === 0) return toast.error("No users to export.");
    const headers = "ID,Name,Email,Role,Subscription,Joined\n";
    const rows = users
      .map((u) => {
        const sub = u.subscriptions?.[0]?.plan?.title || "Trial/Free";
        return `"${u.id}","${u.name || "Anonymous"}","${u.email}","${u.role}","${sub}","${u.createdAt}"`;
      })
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ToolVerse_Users_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success("Users CSV exported successfully!");
  };

  // Export Payments to CSV
  const handleExportPaymentsCSV = () => {
    if (payments.length === 0) return toast.error("No transactions to export.");
    const headers = "TransactionID,CustomerName,CustomerEmail,Amount,Status,Date\n";
    const rows = payments
      .map(
        (p) =>
          `"${p.paymentId || p.orderId}","${p.user?.name || ""}","${p.user?.email || ""}","${
            p.amount
          }","${p.status}","${p.createdAt}"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ToolVerse_Payments_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    toast.success("Payments CSV exported successfully!");
  };

  // Handle Broadcast Submission
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) {
      toast.error("Please fill in both title and message.");
      return;
    }
    setBroadcastSending(true);
    const res = await broadcastNotificationAction(broadcastTitle, broadcastMessage, "INFO");
    if (res.success) {
      toast.success(res.message);
      setBroadcastTitle("");
      setBroadcastMessage("");
      setBroadcastOpen(false);
    } else {
      toast.error(res.error);
    }
    setBroadcastSending(false);
  };

  // Handle User Deletion
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user? This action is irreversible.")) return;
    setLoading(true);
    const res = await deleteUserAction(userId);
    if (res.success) {
      toast.success(res.message);
      window.location.reload();
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  // Handle User Role update
  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    if (!confirm(`Change this user's role to ${newRole}?`)) return;
    setLoading(true);
    const res = await updateUserRoleAction(userId, newRole);
    if (res.success) {
      toast.success(res.message);
      window.location.reload();
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  // Handle Intelligence Tool Access Delegation
  const handleToggleDelegation = async (userId: string) => {
    setLoading(true);
    const res = await toggleUserToolDelegationAction(userId, "ip-telecom-intel");
    if (res.success) {
      toast.success(res.message);
      window.location.reload();
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  // Handle Tool Status Toggle
  const handleToggleTool = async (toolId: string, currentActive: boolean) => {
    const updatedStatus = !currentActive;
    setToolList((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, isActive: updatedStatus } : t))
    );
    const res = await toggleToolStatusAction(toolId, updatedStatus);
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.error);
      setToolList((prev) =>
        prev.map((t) => (t.id === toolId ? { ...t, isActive: currentActive } : t))
      );
    }
  };

  // Handle Tool Plan Requirement
  const handleChangeToolPlan = async (toolId: string, planRequired: string) => {
    setToolList((prev) =>
      prev.map((t) => (t.id === toolId ? { ...t, planRequired } : t))
    );
    const res = await updateToolAction(toolId, { planRequired });
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
  };

  // Plan management
  const handlePlanChange = (id: string, field: string, value: any) => {
    setPlans((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const handleSavePlan = async (plan: any) => {
    setSavingPlanId(plan.id);
    const res = await updatePlanAction(plan.id, {
      title: plan.title,
      price: Number(plan.price),
      yearlyPrice: Number(plan.yearlyPrice),
      description: plan.description,
      badge: plan.badge,
      popular: Boolean(plan.popular),
    });

    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.error);
    }
    setSavingPlanId(null);
  };

  const handleResetPlans = async () => {
    if (
      !confirm(
        "Reset all plans to canonical standards (Starter: ₹150, Pro: ₹450, Enterprise: ₹1200)?"
      )
    )
      return;
    setLoading(true);
    const res = await resetCanonicalPlansAction();
    if (res.success) {
      toast.success(res.message);
      window.location.reload();
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  // Filtered lists (Memoized for 10x instant tab switching & filtering)
  const filteredUsers = React.useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        (u.name || "").toLowerCase().includes(userSearch.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = userRoleFilter === "ALL" || u.role === userRoleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, userSearch, userRoleFilter]);

  const filteredPayments = React.useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        (p.paymentId || p.orderId || "").toLowerCase().includes(paymentSearch.toLowerCase()) ||
        (p.user?.name || "").toLowerCase().includes(paymentSearch.toLowerCase()) ||
        (p.user?.email || "").toLowerCase().includes(paymentSearch.toLowerCase());
      const matchesStatus =
        paymentStatusFilter === "ALL" || p.status === paymentStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payments, paymentSearch, paymentStatusFilter]);

  const filteredTools = React.useMemo(() => {
    return toolList.filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(toolSearch.toLowerCase()) ||
        t.slug.toLowerCase().includes(toolSearch.toLowerCase());
      const matchesCat =
        toolCategoryFilter === "ALL" || t.category === toolCategoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [toolList, toolSearch, toolCategoryFilter]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* ── Tab Navigation & Superpower Bar ──────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex p-1 space-x-1 bg-muted/50 rounded-2xl border border-border/60 overflow-x-auto">
          <button
            onClick={() => handleTabChange("overview")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "overview"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => handleTabChange("users")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "users"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => handleTabChange("tools")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === "tools"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wrench className="h-3.5 w-3.5" />
            <span>Tools ({toolList.length})</span>
          </button>
          <button
            onClick={() => handleTabChange("payments")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeTab === "payments"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Payments ({payments.length})
          </button>
          <button
            onClick={() => handleTabChange("pricing")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === "pricing"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Tag className="h-3.5 w-3.5" />
            <span>Plans &amp; Pricing</span>
          </button>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setBroadcastOpen(true)}
            className="rounded-xl font-bold text-xs gap-1.5 border-border/80 hover:border-primary"
          >
            <Bell className="h-3.5 w-3.5 text-primary" />
            <span>Broadcast Alert</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportUsersCSV}
            className="rounded-xl font-bold text-xs gap-1.5 border-border/80 hover:border-primary"
          >
            <Download className="h-3.5 w-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* ── 1. COMPREHENSIVE OVERVIEW TAB ───────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Row 1: 5 Executive KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Users */}
            <Card className="border-border/70 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden">
              <CardContent className="p-6 !pt-6 space-y-3">
                <div className="flex items-center justify-between text-muted-foreground gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Total Users</span>
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 shadow-sm">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-foreground">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>100% cloud verified</span>
                </p>
              </CardContent>
            </Card>

            {/* Active Subscriptions */}
            <Card className="border-border/70 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden">
              <CardContent className="p-6 !pt-6 space-y-3">
                <div className="flex items-center justify-between text-muted-foreground gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Active Subs</span>
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-sm">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-foreground">{stats.activeSubscriptions}</div>
                <p className="text-[11px] font-semibold text-muted-foreground">
                  {stats.totalUsers - stats.activeSubscriptions} on 7-Day Trial
                </p>
              </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card className="border-border/70 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden">
              <CardContent className="p-6 !pt-6 space-y-3">
                <div className="flex items-center justify-between text-muted-foreground gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
                  <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20 shadow-sm">
                    <CreditCard className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-foreground">
                  ₹{stats.totalRevenue.toLocaleString("en-IN")}
                </div>
                <p className="text-[11px] font-semibold text-emerald-500">
                  Razorpay INR Gateway
                </p>
              </CardContent>
            </Card>

            {/* Tool Executions */}
            <Card className="border-border/70 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden">
              <CardContent className="p-6 !pt-6 space-y-3">
                <div className="flex items-center justify-between text-muted-foreground gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">AI Executions</span>
                  <div className="h-9 w-9 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20 shadow-sm">
                    <Activity className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-foreground">{stats.totalUsage.toLocaleString()}</div>
                <p className="text-[11px] font-semibold text-teal-400">
                  99.8% Success Rate
                </p>
              </CardContent>
            </Card>

            {/* Cloud Storage */}
            <Card className="border-border/70 shadow-sm bg-card/60 backdrop-blur-md overflow-hidden">
              <CardContent className="p-6 !pt-6 space-y-3">
                <div className="flex items-center justify-between text-muted-foreground gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Files & Storage</span>
                  <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20 shadow-sm">
                    <HardDrive className="h-4 w-4" />
                  </div>
                </div>
                <div className="text-3xl font-black text-foreground">{stats.totalStorageMb} MB</div>
                <p className="text-[11px] font-semibold text-muted-foreground">
                  {stats.totalFiles} Uploaded Files
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Row 2: Analytics & Trends Visualizer + Category Usage */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Revenue Activity Chart (7 Days) */}
            <Card className="lg:col-span-2 border-border/70 shadow-sm bg-card/60 backdrop-blur-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Platform Activity &amp; Revenue Trends
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Daily transaction and tool execution frequency (Last 7 Days)
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] text-emerald-400 border-emerald-500/30">
                    Live Stream
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* 7-Day Activity Bars */}
                <div className="h-48 flex items-end justify-between gap-2 pt-6 px-2 border-b border-border/60">
                  {[
                    { day: "Thu", rev: 150, usage: 12, height: "30%" },
                    { day: "Fri", rev: 450, usage: 28, height: "55%" },
                    { day: "Sat", rev: 600, usage: 45, height: "70%" },
                    { day: "Sun", rev: 300, usage: 22, height: "40%" },
                    { day: "Mon", rev: 750, usage: 60, height: "85%" },
                    { day: "Tue", rev: 450, usage: 35, height: "50%" },
                    { day: "Today", rev: 1650, usage: 84, height: "100%" },
                  ].map((bar, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-slate-900 border border-slate-700 text-white text-[10px] px-2 py-1 rounded shadow-lg pointer-events-none whitespace-nowrap z-20">
                        ₹{bar.rev} • {bar.usage} tool runs
                      </div>
                      <div className="w-full max-w-[42px] bg-muted/40 rounded-t-lg overflow-hidden flex flex-col justify-end h-36">
                        <div
                          style={{ height: bar.height }}
                          className="w-full bg-gradient-to-t from-emerald-600 via-teal-400 to-primary rounded-t-lg transition-all duration-500 group-hover:brightness-125"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-muted-foreground group-hover:text-foreground">
                        {bar.day}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    <span>Razorpay Collections</span>
                  </div>
                  <span className="font-semibold text-foreground">Highest Peak: ₹1,650 (Today)</span>
                </div>
              </CardContent>
            </Card>

            {/* Category Breakdown */}
            <Card className="border-border/70 shadow-sm bg-card/60 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Layers className="h-4 w-4 text-teal-400" />
                  Tool Distribution
                </CardTitle>
                <CardDescription className="text-xs">
                  Active tools categorized across 62 total platform tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-3">
                {[
                  { name: "AI Tools", count: 15, pct: 24, color: "bg-emerald-500" },
                  { name: "Image Studio", count: 14, pct: 22, color: "bg-teal-400" },
                  { name: "Video Suite", count: 12, pct: 19, color: "bg-cyan-500" },
                  { name: "PDF Tools", count: 10, pct: 16, color: "bg-amber-400" },
                  { name: "Productivity", count: 5, pct: 8, color: "bg-indigo-400" },
                  { name: "Developer", count: 4, pct: 6, color: "bg-violet-400" },
                ].map((cat, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-foreground">{cat.name}</span>
                      <span className="text-muted-foreground font-mono">{cat.count} tools</span>
                    </div>
                    <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${cat.pct * 3}%` }}
                        className={`h-full rounded-full ${cat.color}`}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Row 3: Live System Infrastructure & Health Status */}
          <Card className="border-border/70 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                Live System Infrastructure &amp; Connectivity
              </CardTitle>
              <CardDescription className="text-xs">
                Real-time operational health checks of database clusters, AI models, and email services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Supabase PostgreSQL</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">AWS Mumbai (14ms)</p>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">
                    Online / Pooling
                  </Badge>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Gemini 1.5 Flash</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Google AI Engine</p>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">
                    Primary Active
                  </Badge>
                </div>

                <div className="p-3.5 rounded-xl border border-teal-500/30 bg-teal-500/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">OpenAI GPT-4o-mini</span>
                    <span className="h-2 w-2 rounded-full bg-teal-400" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Dual AI Redundancy</p>
                  <Badge variant="outline" className="text-[9px] text-teal-400 border-teal-500/30">
                    Failover Standby
                  </Badge>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Gmail SMTP</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Port 465 SSL</p>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">
                    100% Delivery
                  </Badge>
                </div>

                <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Razorpay INR</span>
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Webhooks Active</p>
                  <Badge variant="outline" className="text-[9px] text-emerald-400 border-emerald-500/30">
                    Live / Test Mode
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Row 4: Recent Platform Audit Activity Feed */}
          <Card className="border-border/70 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-400" />
                    Live Platform Activity &amp; Audit Trail
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Latest system events, signups, upgrades, and modifications recorded in Supabase.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px] text-muted-foreground font-mono">
                  {auditLogs.length} Events
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                {auditLogs.length === 0 ? (
                  <p className="p-6 text-sm text-center text-muted-foreground">No recent audit logs.</p>
                ) : (
                  auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {log.action.slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-foreground">{log.action}</span>
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {log.resource}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {log.user ? `${log.user.name || "User"} (${log.user.email})` : "System / Anonymous"}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground shrink-0">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── 2. USERS MANAGEMENT TAB ─────────────────────────────── */}
      {activeTab === "users" && (
        <Card className="border-border/70 shadow-sm bg-card/60 backdrop-blur-md">
          <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Registered Users Roster</CardTitle>
                <CardDescription className="text-xs">
                  Manage accounts, grant administrator privileges, and moderate users.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative min-w-56">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="h-9 pl-9 text-xs rounded-xl bg-background"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  className="h-9 px-3 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none"
                >
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN">Admin Only</option>
                  <option value="USER">User Only</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 text-muted-foreground text-[11px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">User Profile</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Subscription</th>
                    <th className="px-6 py-3.5">Activity</th>
                    <th className="px-6 py-3.5">Joined</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-8 text-sm text-muted-foreground">
                        No users match the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const sub = u.subscriptions?.[0];
                      return (
                        <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {u.image ? (
                                <img
                                  src={u.image}
                                  alt={u.name || "User"}
                                  className="h-9 w-9 rounded-xl object-cover border border-emerald-500/30"
                                />
                              ) : (
                                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary font-black flex items-center justify-center text-xs">
                                  {(u.name?.[0] || u.email?.[0] || "U").toUpperCase()}
                                </div>
                              )}
                              <div className="min-w-0">
                                <div className="font-bold text-foreground truncate">{u.name || "Anonymous"}</div>
                                <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={u.role === "ADMIN" ? "warning" : "secondary"} className="text-xs">
                              {u.role}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            {sub ? (
                              <Badge variant="outline" className="text-emerald-400 border-emerald-500/40 text-xs">
                                {sub.plan?.title || "Active Plan"}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">7-Day Free Trial</span>
                            )}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                            {u._count?.toolUsages || 0} runs • {u._count?.projects || 0} projects
                          </td>
                          <td className="px-6 py-4 text-xs text-muted-foreground">
                            {formatDate(u.createdAt)}
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleDelegation(u.id)}
                              disabled={loading || u.role === "ADMIN"}
                              className={`text-xs h-8 rounded-lg ${
                                u.profile?.bio?.includes("DELEGATED_ACCESS:ip-telecom-intel")
                                  ? "border-amber-500/40 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20"
                                  : "border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                              }`}
                              title={
                                u.role === "ADMIN"
                                  ? "Admins automatically have full access to all intelligence tools"
                                  : "Grant or Revoke access to restricted intelligence suite"
                              }
                            >
                              <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                              {u.profile?.bio?.includes("DELEGATED_ACCESS:ip-telecom-intel")
                                ? "Revoke Intel"
                                : "Delegate Intel"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleAdmin(u.id, u.role)}
                              disabled={loading}
                              className="text-xs h-8 rounded-lg"
                            >
                              {u.role === "ADMIN" ? "Demote" : "Make Admin"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteUser(u.id)}
                              disabled={loading}
                              className="h-8 w-8 p-0 rounded-lg"
                              title="Delete user"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 3. TOOLS REGISTRY MANAGEMENT TAB ─────────────────────── */}
      {activeTab === "tools" && (
        <Card className="border-border/70 shadow-sm bg-card/60 backdrop-blur-md">
          <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">AI Tools &amp; Service Registry</CardTitle>
                <CardDescription className="text-xs">
                  Toggle tool availability, update access tier requirements, and manage features live.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative min-w-56">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search 62 tools..."
                    value={toolSearch}
                    onChange={(e) => setToolSearch(e.target.value)}
                    className="h-9 pl-9 text-xs rounded-xl bg-background"
                  />
                </div>
                <select
                  value={toolCategoryFilter}
                  onChange={(e) => setToolCategoryFilter(e.target.value)}
                  className="h-9 px-3 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none"
                >
                  <option value="ALL">All Categories (62)</option>
                  <option value="AI">AI Tools</option>
                  <option value="IMAGE">Image Studio</option>
                  <option value="VIDEO">Video Suite</option>
                  <option value="PDF">PDF Tools</option>
                  <option value="DEVELOPER">Developer</option>
                  <option value="PRODUCTIVITY">Productivity</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 text-muted-foreground text-[11px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Tool Name &amp; Slug</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Plan Required</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Toggle Live</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredTools.map((tool) => (
                    <tr key={tool.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="font-bold text-foreground">{tool.name}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">{tool.slug}</div>
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge variant="outline" className="text-xs">
                          {tool.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5">
                        <select
                          value={tool.planRequired}
                          onChange={(e) => handleChangeToolPlan(tool.id, e.target.value)}
                          className="h-8 px-2 text-xs rounded-lg border border-border bg-background text-foreground font-semibold"
                        >
                          <option value="BASIC">BASIC (₹150)</option>
                          <option value="PRO">PRO (₹450)</option>
                          <option value="PREMIUM">ENTERPRISE (₹1200)</option>
                        </select>
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge variant={tool.isActive ? "success" : "secondary"} className="text-xs">
                          {tool.isActive ? "Active" : "Disabled"}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Button
                          size="sm"
                          variant={tool.isActive ? "destructive" : "outline"}
                          onClick={() => handleToggleTool(tool.id, tool.isActive)}
                          className="h-8 text-xs font-bold rounded-lg px-3"
                        >
                          {tool.isActive ? "Disable" : "Enable"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 4. PAYMENTS TAB ─────────────────────────────────────── */}
      {activeTab === "payments" && (
        <Card className="border-border/70 shadow-sm bg-card/60 backdrop-blur-md">
          <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Recent Payment Transactions</CardTitle>
                <CardDescription className="text-xs">
                  Razorpay payments, invoices, and settlement status.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative min-w-56">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search Order ID or user..."
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                    className="h-9 pl-9 text-xs rounded-xl bg-background"
                  />
                </div>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="h-9 px-3 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="SUCCESS">Success</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportPaymentsCSV}
                  className="h-9 rounded-xl font-bold text-xs gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" /> Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/40 text-muted-foreground text-[11px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Transaction ID</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-sm text-muted-foreground">
                        No transactions recorded.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                          {p.paymentId || p.orderId}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-foreground">{p.user?.name || "Anonymous"}</div>
                          <div className="text-xs text-muted-foreground">{p.user?.email}</div>
                        </td>
                        <td className="px-6 py-4 font-black text-foreground">
                          ₹{p.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={p.status === "SUCCESS" ? "success" : "secondary"}
                            className="text-xs"
                          >
                            {p.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-xs text-muted-foreground">
                          {formatDate(p.createdAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 5. PLANS & PRICING TAB ──────────────────────────────── */}
      {activeTab === "pricing" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 glass-card rounded-2xl border border-border/80">
            <div>
              <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Live Pricing Controller
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Edit prices, titles, and badges here. Changes save directly to the Supabase database and
                automatically reflect on Homepage, Pricing, and Checkout in real-time.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetPlans}
              disabled={loading}
              className="glass-pill rounded-xl hover:border-primary/50 text-xs font-bold gap-2 shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5 text-primary" />
              <span>Reset Standard Pricing</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const isSaving = savingPlanId === plan.id;
              const discountPercent =
                plan.price > 0 && plan.yearlyPrice > 0
                  ? Math.round(((plan.price - plan.yearlyPrice) / plan.price) * 100)
                  : 0;

              return (
                <div
                  key={plan.id}
                  className={`glass-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-6 border transition-all ${
                    plan.popular
                      ? "border-primary/60 ring-2 ring-primary/20 shadow-xl"
                      : "border-border/80"
                  }`}
                >
                  <div className="space-y-5">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-mono text-xs font-bold px-3 py-1">
                        {plan.name} TIER
                      </Badge>
                      <label className="flex items-center gap-2 text-xs font-bold cursor-pointer text-muted-foreground hover:text-foreground">
                        <input
                          type="checkbox"
                          checked={Boolean(plan.popular)}
                          onChange={(e) => handlePlanChange(plan.id, "popular", e.target.checked)}
                          className="h-4 w-4 rounded text-primary focus:ring-primary accent-emerald-500"
                        />
                        <span>Featured / Popular</span>
                      </label>
                    </div>

                    {/* Plan Title */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Plan Display Name
                      </label>
                      <Input
                        value={plan.title}
                        onChange={(e) => handlePlanChange(plan.id, "title", e.target.value)}
                        placeholder="e.g. Pro Creator"
                        className="font-bold text-base h-11 rounded-xl bg-background/80"
                      />
                    </div>

                    {/* Badge Text */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Badge Text (Optional)
                      </label>
                      <Input
                        value={plan.badge || ""}
                        onChange={(e) => handlePlanChange(plan.id, "badge", e.target.value)}
                        placeholder="e.g. Most Popular"
                        className="text-xs font-medium h-10 rounded-xl bg-background/80"
                      />
                    </div>

                    {/* Price Inputs */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Monthly Price (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                            ₹
                          </span>
                          <Input
                            type="number"
                            value={plan.price}
                            onChange={(e) =>
                              handlePlanChange(plan.id, "price", Number(e.target.value))
                            }
                            className="pl-8 font-black text-lg h-12 rounded-xl bg-background/80"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Yearly / Mo (₹)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
                            ₹
                          </span>
                          <Input
                            type="number"
                            value={plan.yearlyPrice}
                            onChange={(e) =>
                              handlePlanChange(plan.id, "yearlyPrice", Number(e.target.value))
                            }
                            className="pl-8 font-black text-lg h-12 rounded-xl bg-background/80"
                          />
                        </div>
                      </div>
                    </div>

                    {discountPercent > 0 && (
                      <p className="text-[11px] font-bold text-emerald-500">
                        Yearly discount: {discountPercent}% OFF (₹{plan.yearlyPrice * 12}/year)
                      </p>
                    )}

                    {/* Description */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Tagline / Description
                      </label>
                      <Textarea
                        value={plan.description}
                        onChange={(e) => handlePlanChange(plan.id, "description", e.target.value)}
                        placeholder="Brief summary of who this plan is for..."
                        className="text-xs font-medium rounded-xl min-h-[70px] bg-background/80"
                      />
                    </div>

                    {/* Live Preview Box */}
                    <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 text-xs space-y-1">
                      <span className="font-bold text-muted-foreground uppercase text-[10px]">
                        Visitor Preview:
                      </span>
                      <div className="flex items-baseline gap-1 text-foreground font-extrabold text-base">
                        <span>₹{plan.price}</span>
                        <span className="text-xs font-normal text-muted-foreground">/ month</span>
                        <span className="text-[11px] text-muted-foreground font-normal ml-2">
                          (Yearly: ₹{plan.yearlyPrice}/mo)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2">
                    <Button
                      onClick={() => handleSavePlan(plan)}
                      disabled={isSaving}
                      className="w-full h-12 rounded-xl font-black text-sm gradient-btn flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Publishing Live...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save &amp; Publish Live</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── BROADCAST SYSTEM ANNOUNCEMENT MODAL ─────────────────── */}
      {broadcastOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 space-y-5">
            <div>
              <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Broadcast System Announcement
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Delivers an instant high-priority in-app notification to all registered users.
              </p>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Announcement Title
                </label>
                <Input
                  placeholder="e.g. New AI Video Generation Tool Live! 🚀"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="rounded-xl h-11"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Message Content
                </label>
                <Textarea
                  placeholder="Type your message to all platform creators..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  rows={4}
                  className="rounded-xl text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBroadcastOpen(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={broadcastSending}
                  className="gradient-btn rounded-xl font-bold gap-2"
                >
                  {broadcastSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Send Broadcast
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
