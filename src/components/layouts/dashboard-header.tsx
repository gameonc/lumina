"use client";

import Link from "next/link";
import { FileText, User, Menu } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-neutral-900 dark:text-white">
            Lumina
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <button
            className="text-sm font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
            title="Coming soon"
          >
            My Datasets
          </button>
          
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

