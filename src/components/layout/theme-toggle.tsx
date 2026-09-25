"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" aria-label="Toggle theme">
        <span className="opacity-0">T</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-10 w-10 rounded-full bg-card/50 border border-border/50 hover:bg-muted/80 backdrop-blur-sm transition-all duration-300 shadow-sm"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-400 hover:text-amber-300 transition-all rotate-0 scale-100 drop-shadow-sm" />
      ) : (
        <Moon className="h-4 w-4 text-violet-600 hover:text-violet-700 transition-all rotate-0 scale-100 drop-shadow-sm" />
      )}
    </Button>
  );
}
