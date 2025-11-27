"use client";

import { Sparkles, AlertTriangle, TrendingUp, Target } from "lucide-react";
import type { KeyInsight } from "@/lib/ai/insights-generator";

interface SidebarPromptsProps {
  prompts: string[];
  insights?: KeyInsight[];
  onPromptClick?: (prompt: string) => void;
}

export function SidebarPrompts({
  prompts,
  insights,
  onPromptClick,
}: SidebarPromptsProps) {
  const riskFlags = insights?.filter(
    (i) => i.type === "anomaly" || i.type === "risk"
  );

  return (
    <div className="space-y-6">
      {/* Smart Prompts Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-900">Smart Prompts</h3>
        </div>
        <div className="space-y-2">
          {prompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onPromptClick?.(prompt)}
              className="group w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-sm text-slate-700 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="leading-snug">{prompt}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Risk Flags Section */}
      {riskFlags && riskFlags.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold text-red-900">Risk Flags</h3>
            <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
              {riskFlags.length}
            </span>
          </div>
          <div className="space-y-2">
            {riskFlags.slice(0, 3).map((insight, index) => (
              <div
                key={index}
                className="rounded-lg border border-red-200 bg-white p-3"
              >
                <div className="mb-1 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <p className="text-sm font-semibold text-red-900">
                    {insight.title}
                  </p>
                </div>
                <p className="text-xs leading-relaxed text-slate-600">
                  {insight.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats Section */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-900">Quick Actions</h3>
        </div>
        <div className="space-y-2">
          <button
            onClick={() =>
              onPromptClick?.("Generate 3 charts that explain this dataset")
            }
            className="flex w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all hover:bg-indigo-50 hover:text-indigo-700"
          >
            <Target className="h-4 w-4" />
            <span>Auto-generate charts</span>
          </button>
          <button
            onClick={() => onPromptClick?.("Find anomalies or unusual patterns")}
            className="flex w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all hover:bg-indigo-50 hover:text-indigo-700"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Detect anomalies</span>
          </button>
          <button
            onClick={() => onPromptClick?.("What are the top trends?")}
            className="flex w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition-all hover:bg-indigo-50 hover:text-indigo-700"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Analyze trends</span>
          </button>
        </div>
      </div>
    </div>
  );
}
