"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Lightbulb,
  Zap,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Search,
  TrendingUp,
  Loader2
} from "lucide-react";

interface UnifiedSidebarProps {
  riskFlags?: string[];
  prompts?: string[];
  onPromptClick?: (prompt: string) => void;
  onQuickAction?: (action: "generate-charts" | "detect-anomalies" | "analyze-trends") => void;
  isLoading?: boolean;
}

export function UnifiedSidebar({
  riskFlags = [],
  prompts = [],
  onPromptClick,
  onQuickAction,
  isLoading = false,
}: UnifiedSidebarProps) {
  const [flagsExpanded, setFlagsExpanded] = useState(false);

  return (
    <div className="sticky top-24 w-full rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 shadow-sm">
      <div className="space-y-6">

        {/* Section 1: Risk Flags */}
        {riskFlags.length > 0 && (
          <div>
            <button
              onClick={() => setFlagsExpanded(!flagsExpanded)}
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-semibold text-slate-900">
                  Risk Flags
                </span>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                  {riskFlags.length}
                </span>
              </div>
              {flagsExpanded ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {flagsExpanded && (
              <div className="mt-3 space-y-2">
                {riskFlags.map((flag, index) => (
                  <p key={index} className="text-xs text-slate-600 pl-6">
                    • {flag}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        {riskFlags.length > 0 && <div className="border-t border-slate-200" />}

        {/* Section 2: Smart Prompts */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-semibold text-slate-900">
              Smart Prompts
            </span>
          </div>

          <div className="max-h-[180px] space-y-1 overflow-y-auto">
            {prompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => onPromptClick?.(prompt)}
                className="w-full rounded-lg px-3 py-2 text-left text-xs text-slate-600 transition-colors hover:bg-white hover:text-slate-900"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200" />

        {/* Section 3: Quick Actions */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-semibold text-slate-900">
              Quick Actions
            </span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => onQuickAction?.("generate-charts")}
              disabled={isLoading}
              className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-all hover:border-indigo-300 hover:bg-indigo-50 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <BarChart3 className="h-3.5 w-3.5" />
              )}
              Generate Charts
            </button>

            <button
              onClick={() => onQuickAction?.("detect-anomalies")}
              disabled={isLoading}
              className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-all hover:border-amber-300 hover:bg-amber-50 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Search className="h-3.5 w-3.5" />
              )}
              Detect Anomalies
            </button>

            <button
              onClick={() => onQuickAction?.("analyze-trends")}
              disabled={isLoading}
              className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-all hover:border-emerald-300 hover:bg-emerald-50 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5" />
              )}
              Analyze Trends
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
