"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { Bell, Moon, Search, Sun } from "lucide-react";

export function Header() {
  const { setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6 dark:border-neutral-800 dark:bg-neutral-900">
      {/* Search */}
      <div className="max-w-md flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            placeholder="Search datasets, analyses..."
            className="h-10 w-full rounded-lg border border-neutral-200 bg-neutral-50 pl-10 pr-4 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:focus:bg-neutral-800"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          aria-label="Toggle theme"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary-500" />
        </button>

        {/* User menu */}
        <div className="ml-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300">
          JD
        </div>
      </div>
    </header>
  );
}
