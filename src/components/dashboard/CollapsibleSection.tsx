"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  count?: number;
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  icon,
  count,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between bg-gradient-to-r from-slate-50/80 to-white px-5 py-4 text-left transition-colors hover:from-slate-100/80"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-900/5">
              {icon}
            </div>
          )}
          <h3 className="font-semibold text-slate-900">{title}</h3>
          {count !== undefined && (
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
              {count}
            </span>
          )}
        </div>
        <div
          className={`flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 transition-all ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </div>
      </button>
      <div
        className={`transition-all duration-300 ${
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div className="border-t border-slate-100 p-5">{children}</div>
      </div>
    </div>
  );
}
