"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  Lock,
  Trash2,
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Building2,
  FileText,
  Camera,
  Crown,
  Shield,
  Calendar,
  Sparkles,
  Upload,
  Check,
  FolderOpen,
  Files,
  X,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  updateProfileAction,
  uploadAvatarAction,
  changePasswordAction,
  deleteAccountAction,
} from "@/actions/profile";
import { cn } from "@/lib/utils";

const AVATAR_PRESETS = [
  { id: "robot", name: "Cyber AI Robot", url: "https://api.dicebear.com/7.x/bottts/svg?seed=KorevanteAI" },
  { id: "designer", name: "3D Designer", url: "https://api.dicebear.com/7.x/personas/svg?seed=CreatorPro" },
  { id: "ninja", name: "Cyber Ninja", url: "https://api.dicebear.com/7.x/lorelei/svg?seed=CyberNinja" },
  { id: "leader", name: "Tech Leader", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=TechLeader" },
  { id: "explorer", name: "Cosmic Explorer", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=CosmicExplorer" },
  { id: "obsidian", name: "Obsidian Matrix", url: "https://api.dicebear.com/7.x/identicon/svg?seed=ObsidianShield" },
];

export interface ProfileFormProps {
  initialData: {
    name: string;
    bio: string;
    phone: string;
    company: string;
    email: string;
    avatarUrl: string;
    role: string;
    createdAt: string;
    emailVerified: boolean;
    planTitle: string;
    isOAuthUser: boolean;
    connectedProviders: string[];
    projectsCount: number;
    filesCount: number;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const router = useRouter();
  const { update: updateSession } = useSession();

  // Profile fields state
  const [profile, setProfile] = React.useState({
    name: initialData.name,
    bio: initialData.bio,
    phone: initialData.phone,
    company: initialData.company,
    avatarUrl: initialData.avatarUrl,
  });
  const [profileLoading, setProfileLoading] = React.useState(false);

  // Avatar Modal State
  const [avatarModalOpen, setAvatarModalOpen] = React.useState(false);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  // Password state
  const [passwords, setPasswords] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = React.useState(false);
  const [passwordLoading, setPasswordLoading] = React.useState(false);

  // Delete state
  const [deleteConfirm, setDeleteConfirm] = React.useState("");
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  // Submit profile details
  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const result = await updateProfileAction(profile);
      if (result.success) {
        if (updateSession) {
          await updateSession({ name: profile.name });
        }
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    } finally {
      setProfileLoading(false);
    }
  }

  // Handle direct file upload from local computer
  async function handleAvatarFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file must be under 5MB.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const res = await uploadAvatarAction(formData);
      if (res.success) {
        if (res.avatarUrl) {
          setProfile((prev) => ({ ...prev, avatarUrl: res.avatarUrl! }));
          if (updateSession) {
            await updateSession({ image: res.avatarUrl });
          }
        }
        toast.success(res.message);
        setAvatarModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to upload avatar");
      }
    } catch {
      toast.error("An error occurred while uploading your avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  // Choose preset AI avatar
  async function handleSelectPreset(presetUrl: string) {
    setUploadingAvatar(true);
    try {
      const res = await updateProfileAction({ ...profile, avatarUrl: presetUrl });
      if (res.success) {
        setProfile((prev) => ({ ...prev, avatarUrl: presetUrl }));
        if (updateSession) {
          await updateSession({ image: presetUrl });
        }
        toast.success("AI Avatar updated successfully!");
        setAvatarModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwords.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setPasswordLoading(true);
    try {
      const result = await changePasswordAction(passwords);
      if (result.success) {
        toast.success(result.message);
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error(result.error);
      }
    } finally {
      setPasswordLoading(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") {
      toast.error('Type "DELETE" to confirm account deletion');
      return;
    }
    setDeleteLoading(true);
    try {
      const result = await deleteAccountAction();
      if (result.success) {
        toast.success("Account deleted. Signing out...");
        await signOut({ callbackUrl: "/" });
      } else {
        toast.error(result.error);
        setDeleteLoading(false);
      }
    } catch {
      toast.error("Failed to delete account.");
      setDeleteLoading(false);
    }
  }

  const userMonogram = (profile.name?.[0] || initialData.email?.[0] || "U").toUpperCase();

  return (
    <div className="space-y-8 pb-16">
      {/* ── 1. LUXURY PROFILE HEADER CARD ────────────────────────── */}
      <Card className="border-border/80 shadow-xl overflow-hidden relative group bg-card/60 backdrop-blur-md">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-primary" />
        <CardContent className="p-6 sm:p-8 !pt-8 sm:!pt-10">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
            {/* Avatar with Camera badge */}
            <div className="relative group/avatar flex-shrink-0">
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl overflow-hidden p-1 bg-gradient-to-tr from-emerald-500 via-teal-400 to-primary/40 shadow-xl shadow-emerald-500/20">
                <div className="h-full w-full rounded-[22px] overflow-hidden bg-background flex items-center justify-center relative">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name || "User Avatar"}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover/avatar:scale-105"
                      onError={() => setProfile((prev) => ({ ...prev, avatarUrl: "" }))}
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white text-3xl font-black">
                      {userMonogram}
                    </div>
                  )}

                  {/* Online pulse dot */}
                  <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />
                </div>
              </div>

              {/* Quick Change Avatar Button */}
              <button
                type="button"
                onClick={() => setAvatarModalOpen(true)}
                className="absolute -bottom-2 -right-2 h-9 w-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-background"
                title="Change Avatar"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            {/* User Meta Details */}
            <div className="flex-1 text-center md:text-left space-y-3 min-w-0">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight truncate">
                  {profile.name || "Korevante Creator"}
                </h2>
                {initialData.role === "ADMIN" && (
                  <Badge variant="warning" className="px-2.5 py-0.5 font-bold text-xs gap-1">
                    <Shield className="h-3 w-3" /> Admin
                  </Badge>
                )}
                <Badge variant="premium" className="px-2.5 py-0.5 font-bold text-xs gap-1.5 shadow-sm">
                  <Crown className="h-3 w-3 text-amber-300" />
                  {initialData.planTitle}
                </Badge>
                {initialData.emailVerified && (
                  <Badge variant="success" className="px-2.5 py-0.5 font-bold text-xs gap-1">
                    <Check className="h-3 w-3" /> Verified
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs font-semibold text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-primary" />
                  <span>{initialData.email}</span>
                </div>
                {profile.company && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    <span>{profile.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Joined {initialData.createdAt}</span>
                </div>
              </div>

              {profile.bio && (
                <p className="text-sm text-foreground/80 italic bg-muted/30 px-3.5 py-2 rounded-xl border border-border/60 max-w-xl">
                  &ldquo;{profile.bio}&rdquo;
                </p>
              )}

              {/* Mini Stats Bar */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-1">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/80 border border-border/70 text-xs font-bold text-muted-foreground">
                  <FolderOpen className="h-3.5 w-3.5 text-teal-400" />
                  <span>{initialData.projectsCount} Projects</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/80 border border-border/70 text-xs font-bold text-muted-foreground">
                  <Files className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{initialData.filesCount} Files</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAvatarModalOpen(true)}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1 ml-auto"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Customize Avatar
                </button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. PERSONAL INFORMATION FORM ─────────────────────────── */}
      <Card className="border-border/80 shadow-sm bg-card/60 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
          <CardDescription>
            Update your public profile, company association, and contact preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Full Name
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                    disabled={profileLoading}
                    placeholder="Enter your full name"
                    className="w-full h-11 pl-11 pr-4 rounded-xl border border-border/80 bg-background/80 text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="flex h-11 w-full rounded-xl border border-border/60 bg-muted/40 pl-11 pr-3 py-2 text-sm font-semibold text-muted-foreground items-center justify-between">
                    <span className="truncate">{initialData.email}</span>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground/80 font-mono shrink-0 gap-1">
                      <Lock className="h-2.5 w-2.5" /> Read-only
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Phone */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Phone Number (optional)
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    autoComplete="off"
                    value={profile.phone}
                    onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                    disabled={profileLoading}
                    placeholder="+91 98765 43210"
                    className="w-full h-11 pl-11 pr-4 rounded-xl border border-border/80 bg-background/80 text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Company */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Company / Organization (optional)
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={profile.company}
                    onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))}
                    disabled={profileLoading}
                    placeholder="Company or Studio Name"
                    className="w-full h-11 pl-11 pr-4 rounded-xl border border-border/80 bg-background/80 text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                  Bio & Professional Summary
                </label>
                <span className="text-xs text-muted-foreground font-mono">{profile.bio.length}/200</span>
              </div>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
                disabled={profileLoading}
                placeholder="Tell us about yourself, your creative projects, and how you use Korevante Studio..."
                maxLength={200}
                rows={3}
                className="w-full rounded-xl border border-border/80 bg-background/80 px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
              />
            </div>

            <div className="flex justify-end pt-3">
              <Button
                type="submit"
                disabled={profileLoading}
                className="gap-2 px-6 h-11 rounded-xl font-bold shadow-lg shadow-emerald-500/20 gradient-btn"
              >
                {profileLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── 3. CHANGE PASSWORD ───────────────────────────────────── */}
      {!initialData.isOAuthUser && (
        <Card className="border-border/80 shadow-sm bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              Change Password
            </CardTitle>
            <CardDescription>
              Ensure your account is protected with a salted bcrypt password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              <div className="relative space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                    disabled={passwordLoading}
                    placeholder="Enter current password"
                    className="w-full h-11 px-4 pr-11 rounded-xl border border-border/80 bg-background/80 text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(!showPasswords)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    New Password
                  </label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                    disabled={passwordLoading}
                    placeholder="Minimum 8 characters"
                    className="w-full h-11 px-4 rounded-xl border border-border/80 bg-background/80 text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Confirm New Password
                  </label>
                  <input
                    type={showPasswords ? "text" : "password"}
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                    disabled={passwordLoading}
                    placeholder="Repeat new password"
                    className="w-full h-11 px-4 rounded-xl border border-border/80 bg-background/80 text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  disabled={passwordLoading}
                  variant="outline"
                  className="gap-2 h-11 px-6 rounded-xl font-bold"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── 4. CONNECTED ACCOUNTS ───────────────────────────────── */}
      {initialData.connectedProviders.length > 0 && (
        <Card className="border-border/80 shadow-sm bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-lg">Connected Accounts</CardTitle>
            <CardDescription>OAuth single sign-on providers linked to your workspace.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {initialData.connectedProviders.map((provider) => (
              <div
                key={provider}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-border/60 bg-muted/20"
              >
                <div className="h-9 w-9 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                  {provider === "google" ? (
                    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.64 9.2c0-.638-.057-1.252-.164-1.84H9v3.48h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold capitalize text-foreground">{provider} Authentication</p>
                  <p className="text-xs text-muted-foreground">Connected & Verified</p>
                </div>
                <Badge variant="success" className="ml-auto text-xs font-bold">
                  Active
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ── 5. DANGER ZONE ─────────────────────────────────────── */}
      <Card className="border-destructive/30 bg-destructive/3">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Permanently delete your account, projects, uploaded files, and all associated workspace data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showDeleteModal ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              className="gap-2 rounded-xl"
            >
              <Trash2 className="h-4 w-4" />
              Delete My Account
            </Button>
          ) : (
            <div className="space-y-4 p-4 rounded-xl bg-destructive/10 border border-destructive/20 max-w-lg">
              <p className="text-xs font-bold text-destructive">
                Type <strong>DELETE</strong> in the box below to permanently remove your account:
              </p>
              <input
                type="text"
                placeholder="Type DELETE"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                disabled={deleteLoading}
                className="w-full h-10 px-3 rounded-lg border border-destructive/40 bg-background text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-destructive"
              />
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={deleteLoading || deleteConfirm !== "DELETE"}
                  onClick={handleDeleteAccount}
                  className="gap-2"
                >
                  {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Confirm Permanent Delete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
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
        </CardContent>
      </Card>

      {/* ── AVATAR PICKER MODAL ──────────────────────────────────── */}
      {avatarModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl bg-card border border-border shadow-2xl p-6 space-y-6 relative">
            <button
              onClick={() => setAvatarModalOpen(false)}
              className="absolute top-5 right-5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-xl font-black text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Customize Avatar
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Upload your personal photo or select from stylish 3D AI avatars.
              </p>
            </div>

            {/* Upload from Computer */}
            <div className="p-4 rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/50 transition-all bg-muted/20 text-center space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/svg+xml"
                onChange={handleAvatarFileUpload}
                className="hidden"
              />
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Upload Custom Image</p>
                <p className="text-xs text-muted-foreground mt-0.5">Supports PNG, JPG, WEBP up to 5MB</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl font-bold gap-2 text-xs"
              >
                {uploadingAvatar ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-3.5 w-3.5" />
                    Browse Photo
                  </>
                )}
              </Button>
            </div>

            {/* Preset AI Avatars */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Or Pick a 3D AI Preset
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {AVATAR_PRESETS.map((preset) => {
                  const isSelected = profile.avatarUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={() => handleSelectPreset(preset.url)}
                      className={cn(
                        "group relative rounded-2xl p-1.5 border-2 transition-all flex flex-col items-center gap-1.5 bg-background hover:scale-105",
                        isSelected
                          ? "border-primary ring-2 ring-primary/30 shadow-lg"
                          : "border-border/60 hover:border-border"
                      )}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="h-12 w-12 rounded-xl object-cover bg-muted/40"
                      />
                      <span className="text-[10px] font-bold text-muted-foreground truncate w-full text-center">
                        {preset.name.split(" ")[0]}
                      </span>
                      {isSelected && (
                        <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAvatarModalOpen(false)}
                className="rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
