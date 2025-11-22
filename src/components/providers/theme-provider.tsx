"use client";

import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: Theme;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light";
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(
  undefined
);

export function ThemeProvider({
  children,
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;

    if (disableTransitionOnChange) {
      root.classList.add("[&_*]:!transition-none");
      window.setTimeout(() => {
        root.classList.remove("[&_*]:!transition-none");
      }, 0);
    }

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";

    const effectiveTheme =
      theme === "system" && enableSystem ? systemTheme : theme;

    if (effectiveTheme === "dark") {
      root.classList.add("dark");
      setResolvedTheme("dark");
    } else {
      root.classList.remove("dark");
      setResolvedTheme("light");
    }

    if (attribute === "class") {
      // Already handled above
    } else {
      root.setAttribute(attribute, effectiveTheme);
    }
  }, [theme, attribute, enableSystem, disableTransitionOnChange, mounted]);

  useEffect(() => {
    if (!enableSystem || !mounted) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        const root = window.document.documentElement;
        if (e.matches) {
          root.classList.add("dark");
          setResolvedTheme("dark");
        } else {
          root.classList.remove("dark");
          setResolvedTheme("light");
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, enableSystem, mounted]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem("theme", newTheme);
      setTheme(newTheme);
    },
    resolvedTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};
