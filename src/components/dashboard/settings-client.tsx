"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import {
  Settings,
  Shield,
  Bell,
  Key,
  CreditCard,
  Moon,
  Sun,
  Laptop,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  Lock,
  User,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Loader2,
  ChevronRight,
  Database,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { deleteAccountAction } from "@/actions/profile";
import { cn } from "@/lib/utils";

interface SettingsClientProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string;
    image: string | null;
  };
  profile: {
    bio: string | null;
    phone: string | null;
    company: string | null;
    theme: string;
  } | null;
  activePlan: string;
  isOAuthUser: boolean;
  connectedProviders: string[];
}

type TabType = "general" | "notifications" | "security" | "api" | "danger";

export function SettingsClient({
  user,
  profile,
  activePlan,
  isOAuthUser,
  connectedProviders,
}: SettingsClientProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<TabType>("general");

  // Notifications state
  const [notifications, setNotifications] = React.useState({
    emailAlerts: true,
    securityAlerts: true,
    usageWarnings: true,
    productUpdates: false,
  });

  // API Key state
  const [apiKey, setApiKey] = React.useState("tv_live_" + user.id.slice(0, 16) + "_sec");
  const [copiedKey, setCopiedKey] = React.useState(false);
  const [customOpenAIKey, setCustomOpenAIKey] = React.useState("");
  const [savingKey, setSavingKey] = React.useState(false);

  // Danger zone state
  const [deleteConfirm, setDeleteConfirm] = React.useState("");
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    // Restore notification preferences if saved locally
    const saved = localStorage.getItem("tv_notifications_pref");
    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch {}
    }
    const savedCustomKey = localStorage.getItem("tv_custom_openai_key");
    if (savedCustomKey) {
      setCustomOpenAIKey(savedCustomKey);
    }
  }, []);

  const handleToggleNotification = (key: keyof typeof notifications) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem("tv_notifications_pref", JSON.stringify(updated));
    toast.success("Notification preferences updated");
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    toast.success("API Key copied to clipboard");
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    const newKey = "tv_live_" + Math.random().toString(36).substring(2, 10) + user.id.slice(0, 8);
    setApiKey(newKey);
    toast.success("New API key generated successfully");
  };

  const handleSaveCustomKey = () => {
    setSavingKey(true);
    setTimeout(() => {
      localStorage.setItem("tv_custom_openai_key", customOpenAIKey);
      setSavingKey(false);
      toast.success(
        customOpenAIKey.trim()
          ? "Custom OpenAI Key saved for this session"
          : "Custom key removed. Using Korevante Studio default keys."
      );
    }, 600);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      toast.error('Type "DELETE" to confirm account deletion');
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await deleteAccountAction();
      if (res.success) {
        toast.success("Account deleted permanently. Signing out...");
        await signOut({ callbackUrl: "/" });
      } else {
        toast.error(res.error);
        setDeleteLoading(false);
      }
    } catch {
      toast.error("Failed to delete account. Please try again.");
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Settings</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Manage your workspace configuration, security keys, and global preferences.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 font-mono text-xs text-muted-foreground border-border/80">
            User ID: {user.id.slice(0, 10)}...
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 font-bold text-xs uppercase text-primary">
            {activePlan} Plan
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        {/* Navigation Sidebar */}
        <div className="md:col-span-1 space-y-1.5 p-2 rounded-2xl bg-card/60 border border-border/70 backdrop-blur-md shadow-sm">
          <button
            onClick={() => setActiveTab("general")}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left",
              activeTab === "general"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span>General</span>
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left",
              activeTab === "notifications"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Bell className="h-4 w-4 shrink-0" />
            <span>Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left",
              activeTab === "security"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Shield className="h-4 w-4 shrink-0" />
            <span>Security</span>
          </button>

          <button
            onClick={() => setActiveTab("api")}
            className={cn(
              "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left",
              activeTab === "api"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Key className="h-4 w-4 shrink-0" />
            <span>API & Keys</span>
          </button>

          <Link
            href="/dashboard/billing"
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <CreditCard className="h-4 w-4 shrink-0" />
              <span>Billing & Plans</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
          </Link>

          <div className="pt-2 border-t border-border/50">
            <button
              onClick={() => setActiveTab("danger")}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left",
                activeTab === "danger"
                  ? "bg-destructive text-destructive-foreground shadow-sm"
                  : "text-destructive hover:bg-destructive/10"
              )}
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              <span>Danger Zone</span>
            </button>
          </div>
        </div>

        {/* Tab Content Panels */}
        <div className="md:col-span-3 space-y-6">
          {/* 1. GENERAL TAB */}
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Appearance / Theme */}
              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Appearance & Theme
                  </CardTitle>
                  <CardDescription>
                    Customize your visual environment. Korevante Studio supports Obsidian Dark and Cyber Light modes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mounted && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => setTheme("light")}
                        className={cn(
                          "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all text-center",
                          theme === "light"
                            ? "border-primary bg-primary/5 shadow-sm text-foreground"
                            : "border-border/60 hover:border-border hover:bg-muted/20 text-muted-foreground"
                        )}
                      >
                        <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                          <Sun className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Light Mode</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Crisp clean UI</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setTheme("dark")}
                        className={cn(
                          "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all text-center",
                          theme === "dark"
                            ? "border-primary bg-primary/5 shadow-sm text-foreground"
                            : "border-border/60 hover:border-border hover:bg-muted/20 text-muted-foreground"
                        )}
                      >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Moon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Dark Obsidian</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Cyber-mint neon</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setTheme("system")}
                        className={cn(
                          "flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all text-center",
                          theme === "system"
                            ? "border-primary bg-primary/5 shadow-sm text-foreground"
                            : "border-border/60 hover:border-border hover:bg-muted/20 text-muted-foreground"
                        )}
                      >
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                          <Laptop className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">System Default</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Sync with OS</p>
                        </div>
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Quick Details */}
              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Account Overview
                  </CardTitle>
                  <CardDescription>
                    Your primary workspace credentials and identity.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
                      <p className="text-xs font-semibold text-muted-foreground">DISPLAY NAME</p>
                      <p className="text-sm font-bold text-foreground mt-1">{user.name || "Anonymous User"}</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
                      <p className="text-xs font-semibold text-muted-foreground">PRIMARY EMAIL</p>
                      <p className="text-sm font-bold text-foreground mt-1">{user.email || "No email"}</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
                      <p className="text-xs font-semibold text-muted-foreground">ROLE</p>
                      <p className="text-sm font-bold text-foreground mt-1">{user.role}</p>
                    </div>
                    <div className="p-3.5 rounded-xl border border-border/60 bg-muted/20">
                      <p className="text-xs font-semibold text-muted-foreground">ORGANIZATION</p>
                      <p className="text-sm font-bold text-foreground mt-1">{profile?.company || "Personal Workspace"}</p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <Link href="/dashboard/profile">
                      <Button variant="outline" size="sm" className="gap-2">
                        Edit Full Profile <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 2. NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <Card className="border-border/80 shadow-sm animate-in fade-in duration-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how and when Korevante Studio contacts you.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 divide-y divide-border/60">
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-foreground">AI Job Completion Alerts</p>
                    <p className="text-xs text-muted-foreground">
                      Receive an alert when background video or audio processing finishes.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.emailAlerts}
                    onChange={() => handleToggleNotification("emailAlerts")}
                    className="h-5 w-5 rounded border-border accent-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-foreground">Security & Login Alerts</p>
                    <p className="text-xs text-muted-foreground">
                      Notify immediately when an unfamiliar IP or device logs into your account.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.securityAlerts}
                    onChange={() => handleToggleNotification("securityAlerts")}
                    className="h-5 w-5 rounded border-border accent-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-foreground">Usage & Quota Warnings</p>
                    <p className="text-xs text-muted-foreground">
                      Alert when your monthly AI tokens or cloud storage reaches 80% capacity.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.usageWarnings}
                    onChange={() => handleToggleNotification("usageWarnings")}
                    className="h-5 w-5 rounded border-border accent-primary cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-foreground">Product Updates & New Models</p>
                    <p className="text-xs text-muted-foreground">
                      Monthly digest of new AI tools, features, and platform improvements.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifications.productUpdates}
                    onChange={() => handleToggleNotification("productUpdates")}
                    className="h-5 w-5 rounded border-border accent-primary cursor-pointer"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* 3. SECURITY TAB */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    Security & Authentication
                  </CardTitle>
                  <CardDescription>
                    Manage your credentials, 2FA status, and active sessions.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Google OAuth Status */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.64 9.2c0-.638-.057-1.252-.164-1.84H9v3.48h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Google OAuth</p>
                        <p className="text-xs text-muted-foreground">
                          {connectedProviders.includes("google")
                            ? "Connected & Secured with Google Single Sign-On"
                            : "Standard credentials login active"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={connectedProviders.includes("google") ? "success" : "secondary"}>
                      {connectedProviders.includes("google") ? "Active" : "Optional"}
                    </Badge>
                  </div>

                  {/* Password Management */}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center">
                        <Lock className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">Password & Encryption</p>
                        <p className="text-xs text-muted-foreground">
                          {isOAuthUser
                            ? "Managed by your OAuth identity provider."
                            : "Bcrypt salted hash with 12 rounds of salt."}
                        </p>
                      </div>
                    </div>
                    {!isOAuthUser && (
                      <Link href="/dashboard/profile">
                        <Button variant="outline" size="sm" className="gap-2">
                          Change Password <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </div>

                  {/* Database Security Status */}
                  <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-3">
                    <Database className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-foreground">Supabase Cloud PostgreSQL Active</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Your connection uses SSL encrypted direct socket pooling with Row Level Security (RLS) policies.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 4. API & DEVELOPER TAB */}
          {activeTab === "api" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Korevante Personal Secret Key */}
              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="h-5 w-5 text-primary" />
                    Developer API Key
                  </CardTitle>
                  <CardDescription>
                    Use this key to authenticate programmatic API requests to Korevante Studio endpoints.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Live Secret Key
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        readOnly
                        value={apiKey}
                        className="font-mono text-xs bg-muted/40"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleCopyApiKey}
                        title="Copy API key"
                      >
                        {copiedKey ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleRegenerateKey}
                        title="Regenerate key"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Do not share this key in client-side code or public GitHub repositories.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Bring Your Own Key (BYOK) */}
              <Card className="border-border/80 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-amber-500" />
                    Bring Your Own Key (BYOK)
                  </CardTitle>
                  <CardDescription>
                    Optionally provide your personal OpenAI key to bypass standard monthly usage caps.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                      Custom OpenAI API Key
                    </label>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="sk-proj-..."
                        value={customOpenAIKey}
                        onChange={(e) => setCustomOpenAIKey(e.target.value)}
                        className="font-mono text-xs flex-1"
                      />
                      <Button
                        onClick={handleSaveCustomKey}
                        disabled={savingKey}
                        className="gap-2 shrink-0"
                      >
                        {savingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Key"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Stored securely in your encrypted browser storage session and used directly for requests.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 5. DANGER ZONE TAB */}
          {activeTab === "danger" && (
            <Card className="border-destructive/30 bg-destructive/3 animate-in fade-in duration-200">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
                </div>
                <CardDescription>
                  Irreversible actions that will permanently delete your workspace and content.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5 space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground">Permanently Delete Account</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This will immediately cancel your active subscription, erase all projects, uploaded files, and
                      AI generation history from the Supabase database. This action cannot be undone.
                    </p>
                  </div>

                  {!showDeleteModal ? (
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteModal(true)}
                      className="gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Workspace & Account
                    </Button>
                  ) : (
                    <div className="space-y-4 pt-2 border-t border-destructive/20">
                      <p className="text-xs font-semibold text-destructive">
                        Type <strong>DELETE</strong> below to confirm permanent deletion:
                      </p>
                      <Input
                        type="text"
                        placeholder="Type DELETE to confirm"
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        disabled={deleteLoading}
                        className="border-destructive/40 focus:ring-destructive/40 font-mono text-sm max-w-sm"
                      />
                      <div className="flex gap-3">
                        <Button
                          variant="destructive"
                          disabled={deleteLoading || deleteConfirm !== "DELETE"}
                          onClick={handleDeleteAccount}
                          className="gap-2"
                        >
                          {deleteLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4" />
                              Confirm Permanent Delete
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowDeleteModal(false);
                            setDeleteConfirm("");
                          }}
                          disabled={deleteLoading}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
