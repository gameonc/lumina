"use client";

import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  isLoading?: boolean;
  explanation?: string;
}

export function ChartCard({
  title,
  icon: Icon,
  children,
  isLoading = false,
  explanation,
}: ChartCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
        </div>
        <div className="h-[280px] animate-pulse rounded-lg bg-slate-100" />
      </div>
    );
  }

  return (
    <div className="group rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-900">{title}</h3>
        </div>
      </div>
      <div className="p-6">
        <div className="h-[280px]">{children}</div>
        {explanation && (
          <div className="mt-4 rounded-lg bg-indigo-50/50 p-3">
            <p className="text-sm leading-relaxed text-slate-600">
              {explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function ChartCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="h-5 w-5 animate-pulse rounded bg-slate-200" />
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="h-[280px] animate-pulse rounded-lg bg-slate-100" />
    </div>
  );
}
