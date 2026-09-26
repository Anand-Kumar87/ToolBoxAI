"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { 
  Sparkles, 
  Menu, 
  X, 
  LayoutDashboard, 
  LogOut,
  ChevronRight,
  ShieldAlert,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "50+ Tools", href: "/tools" },
  { name: "About Us", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  // Monitor scroll for subtle shadow increase
  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4 transition-all duration-300 pointer-events-none">
      <header className="w-full max-w-7xl pointer-events-auto">
        
        {/* Nav Glass Container */}
        <div className={cn(
          "flex w-full items-center justify-between rounded-full px-6 py-3 transition-all duration-300",
          "glass-panel shadow-2xl backdrop-blur-2xl",
          scrolled 
            ? "border-white/15 bg-background/85 shadow-black/30" 
            : "border-white/10 bg-background/70"
        )}>
          
          {/* Logo & Brand Identity */}
          <Logo size="md" href="/" />

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-white/[0.03] border border-white/5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200",
                    isActive
                      ? "bg-primary/15 text-primary shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.06]"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right-side Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            
            {status === "authenticated" && session?.user ? (
              <div className="flex items-center space-x-2 ml-1">
                <Link href="/dashboard">
                  <Button className="h-9 px-4 rounded-full gradient-btn text-xs font-bold shadow-md">
                    <LayoutDashboard className="h-3.5 w-3.5 mr-1.5" />
                    Dashboard
                  </Button>
                </Link>

                {(session.user as any)?.role === "ADMIN" && (
                  <Link href="/admin">
                    <Button variant="outline" className="h-9 px-3 rounded-full text-amber-500 border-amber-500/30 hover:bg-amber-500/10 text-xs font-semibold">
                      <ShieldAlert className="h-3.5 w-3.5 mr-1" />
                      Admin
                    </Button>
                  </Link>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  title="Sign out"
                  className="h-9 w-9 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5 ml-1">
                <Link href="/login">
                  <Button variant="ghost" className="h-9 px-4 rounded-full text-xs font-bold text-muted-foreground hover:text-foreground">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="h-9 px-5 rounded-full gradient-btn text-xs font-black shadow-lg shadow-emerald-500/30 hover:shadow-emerald-400/50">
                    Start Free Trial <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              className="h-9 w-9 rounded-full text-foreground hover:bg-muted/50 touch-manipulation cursor-pointer select-none active:scale-90"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown & Backdrop */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto z-40 lg:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="absolute top-20 left-4 right-4 z-50 lg:hidden pointer-events-auto glass-panel rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-top-4 border-white/15">
          <div className="flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-bold transition-colors",
                  pathname === item.href
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <span>{item.name}</span>
                <ChevronRight className="h-4 w-4 opacity-50" />
              </Link>
            ))}
          </div>

          <div className="pt-4 mt-3 border-t border-border/40 space-y-2.5">
            {status === "authenticated" ? (
              <div className="space-y-2">
                <Link href="/dashboard" className="w-full block">
                  <Button className="w-full justify-center rounded-xl gradient-btn font-bold text-xs h-10">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-center rounded-xl text-red-500 hover:text-red-400 hover:bg-red-500/10 font-semibold text-xs h-10"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full justify-center rounded-xl font-bold text-xs h-10">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup" className="w-full">
                  <Button className="w-full justify-center rounded-xl gradient-btn font-bold text-xs h-10 shadow-md">
                    Free Trial
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </>
    )}
  </div>
  );
}
