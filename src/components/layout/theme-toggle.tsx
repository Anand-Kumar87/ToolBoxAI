"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = mounted ? (theme || resolvedTheme || "dark") : "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-card/60 border border-border/50 hover:bg-muted/80 backdrop-blur-sm transition-all duration-200 shadow-sm touch-manipulation cursor-pointer select-none active:scale-90"
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {currentTheme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-400 hover:text-amber-300 transition-transform rotate-0 scale-100 drop-shadow-sm" />
      ) : (
        <Moon className="h-4 w-4 text-violet-600 hover:text-violet-700 transition-transform rotate-0 scale-100 drop-shadow-sm" />
      )}
    </Button>
  );
}
