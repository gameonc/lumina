"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";
import { useAppStore } from "@/stores";
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  {
    title: "Overview",
    href: "/overview",
    icon: LayoutDashboard,
  },
  {
    title: "Upload Data",
    href: "/upload",
    icon: Upload,
  },
  {
    title: "Analysis",
    href: "/analysis",
    icon: BarChart3,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useAppStore();

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-neutral-200 bg-white transition-all duration-300 dark:border-neutral-800 dark:bg-neutral-900",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4 dark:border-neutral-800">
        {sidebarOpen && (
          <Link href="/overview" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold text-neutral-900 dark:text-white">
              DataInsights
            </span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      {sidebarOpen && (
        <div className="border-t border-neutral-200 p-4 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-medium text-primary-700 dark:bg-primary-900 dark:text-primary-300">
              JD
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900 dark:text-white">
                John Doe
              </p>
              <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                john@example.com
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
