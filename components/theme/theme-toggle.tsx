"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const storageKey = "ansla-theme";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(storageKey, theme);
}

export function ThemeToggle({
  className,
  compact = false
}: {
  className?: string;
  compact?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const rootTheme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(rootTheme);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={mounted ? `Aktifkan mode ${theme === "dark" ? "light" : "dark"}` : "Toggle theme"}
      className={cn(
        "inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border/80 bg-[hsl(var(--card)/0.88)] px-4 text-sm font-medium text-foreground shadow-soft transition hover:bg-[hsl(var(--accent)/0.85)]",
        compact && "w-10 px-0",
        className
      )}
    >
      {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className={cn("hidden sm:inline", compact && "hidden")}>
        {mounted ? (theme === "dark" ? "Mode Terang" : "Mode Gelap") : "Tema"}
      </span>
    </button>
  );
}
