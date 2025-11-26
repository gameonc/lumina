"use client";

import Link from "next/link";
import { FileText } from "lucide-react";

export function SimpleHeader() {
  return (
    <header className="border-b border-neutral-200 bg-white px-6 py-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-neutral-900 dark:text-white">
            AI Data Insights
          </span>
        </Link>
        <span className="text-sm text-neutral-400">History (Coming Soon)</span>
      </div>
    </header>
  );
}
