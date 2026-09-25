"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Wrench,
  Sparkles,
  Image,
  Video,
  FileText,
  Code2,
  Zap,
  FolderOpen,
  Files,
  CreditCard,
  User,
  Settings,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo, LogoIcon } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const NAV_SECTIONS = [
  {
    label: "Main",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { name: "All Tools", href: "/tools", icon: Wrench },
    ],
  },
  {
    label: "Tool Categories",
    items: [
      { name: "AI Tools", href: "/tools?category=AI", icon: Sparkles, badge: "15" },
      { name: "Image Studio", href: "/tools?category=IMAGE", icon: Image, badge: "14" },
      { name: "Video Suite", href: "/tools?category=VIDEO", icon: Video, badge: "12" },
      { name: "PDF Tools", href: "/tools?category=PDF", icon: FileText, badge: "10" },
      { name: "Developer", href: "/tools?category=DEVELOPER", icon: Code2, badge: "4" },
      { name: "Productivity", href: "/tools?category=PRODUCTIVITY", icon: Zap, badge: "5" },
    ],
  },
  {
    label: "Workspace",
    items: [
      { name: "Projects", href: "/dashboard/projects", icon: FolderOpen },
      { name: "My Files", href: "/dashboard/files", icon: Files },
      { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
      { name: "Profile", href: "/dashboard/profile", icon: User },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const user = session?.user as any;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn(
        "flex items-center h-16 border-b border-border/40 px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed ? (
          <Logo size="sm" href="/" />
        ) : (
          <Link href="/" title="Korevante Studio" className="flex items-center justify-center hover:scale-105 transition-transform">
            <LogoIcon className="h-7 w-7" />
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn("h-8 w-8 hidden lg:flex rounded-lg hover:bg-white/5", collapsed && "ml-0 mt-2")}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 space-y-6 px-3">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/70 px-2.5 mb-2">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "?");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => setMobileOpen(false)}
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition-all duration-150 group",
                      isActive
                        ? "bg-primary/15 text-primary border border-primary/20 shadow-sm"
                        : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                      collapsed ? "justify-center px-2" : ""
                    )}
                  >
                    <Icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-primary" : "")} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.name}</span>
                        {(item as any).badge && (
                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {(item as any).badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Admin Link */}
        {user?.role === "ADMIN" && (
          <div>
            {!collapsed && (
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-500/80 px-2.5 mb-2">
                Administration
              </p>
            )}
            <Link
              href="/admin"
              prefetch={true}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-amber-500 hover:bg-amber-500/10 border border-amber-500/20 transition-all",
                collapsed ? "justify-center px-2" : ""
              )}
            >
              <ShieldAlert className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span>Admin Panel</span>}
            </Link>
          </div>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-border/40 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/[0.02] border border-white/5">
            {user?.image ? (
              <img
                src={user.image}
                alt={user?.name || "User"}
                className="h-8 w-8 rounded-xl object-cover border border-emerald-500/30 shadow-sm shadow-emerald-500/20 flex-shrink-0"
              />
            ) : (
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-[#01140e] text-xs font-black flex-shrink-0 shadow-sm shadow-emerald-500/20">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{user?.name || "User"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="h-7 w-7 text-muted-foreground hover:text-destructive flex-shrink-0 rounded-lg hover:bg-destructive/10"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            {user?.image ? (
              <img
                src={user.image}
                alt={user?.name || "User"}
                className="h-8 w-8 rounded-xl object-cover border border-emerald-500/30 shadow-sm mx-auto"
                title={user?.name || "User"}
              />
            ) : (
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-[#01140e] text-xs font-black mx-auto shadow-sm">
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full h-8 text-muted-foreground hover:text-destructive rounded-xl"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed left-4 top-4 bottom-4 rounded-[2rem] h-[calc(100vh-2rem)] glass-panel z-40 transition-all duration-300 border-white/10 shadow-2xl",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 gradient-btn shadow-xl text-white border-0"
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Sidebar overlay */}
      {mobileOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-md z-40 transition-opacity" 
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-2 top-2 bottom-2 w-72 rounded-[2rem] glass-panel z-50 flex flex-col border-white/15 shadow-2xl">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
