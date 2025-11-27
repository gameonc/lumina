"use client";

import { Sparkles, AlertTriangle, Zap, Loader2 } from "lucide-react";
import type { KeyInsight } from "@/lib/ai/insights-generator";

interface SidebarPromptsProps {
  prompts: string[];
  insights?: KeyInsight[];
  onPromptClick: (prompt: string) => void;
  onQuickAction?: (action: 'generate-charts' | 'detect-anomalies' | 'analyze-trends') => void;
  isLoading?: boolean;
}

export function SidebarPrompts({
  prompts,
  insights,
  onPromptClick,
  onQuickAction,
  isLoading = false,
}: SidebarPromptsProps) {
  const riskFlags = insights?.filter(
    (i) => i.type === "problem" && i.severity === "warning"
  );

  const handleQuickAction = (action: 'generate-charts' | 'detect-anomalies' | 'analyze-trends') => {
    if (onQuickAction) {
      onQuickAction(action);
    } else {
      // Fallback to prompt click
      const prompts = {
        'generate-charts': "Generate 3 charts that explain this dataset",
        'detect-anomalies': "Find anomalies or unusual patterns",
        'analyze-trends': "What are the top trends?"
      };
      onPromptClick(prompts[action]);
    }
  };

  return (
    <div className="sticky top-24 rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Risk Flags Section */}
      {riskFlags && riskFlags.length > 0 && (
        <>
          <div className="border-l-4 border-red-500 py-4 px-5">
            <div className="mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <h3 className="font-semibold text-slate-900">Risk Flags</h3>
              <span className="ml-auto rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                {riskFlags.length}
              </span>
            </div>
            <p className="mb-3 text-xs text-slate-500">
              Critical issues detected in your dataset
            </p>
            <div className="space-y-2">
              {riskFlags.slice(0, 3).map((insight, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-red-200 bg-red-50/50 p-3"
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
                  {insight.impact && (
                    <p className="mt-1 text-xs font-medium text-red-700">
                      Impact: {insight.impact}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-200" />
        </>
      )}

      {/* Smart Prompts Section */}
      <div className="py-4 px-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-900">Smart Prompts</h3>
        </div>
        <p className="mb-3 text-xs text-slate-500">
          Click to ask AI about your data
        </p>
        <div className="space-y-2">
          {prompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => onPromptClick(prompt)}
              className="group w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-sm text-slate-700 transition-all hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-700"
            >
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500 opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="leading-snug">{prompt}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200" />

      {/* Quick Actions Section */}
      <div className="py-4 px-5">
        <div className="mb-3 flex items-center gap-2">
          <Zap className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-slate-900">Quick Actions</h3>
          {isLoading && (
            <Loader2 className="ml-auto h-4 w-4 animate-spin text-indigo-600" />
          )}
        </div>
        <p className="mb-3 text-xs text-slate-500">
          Generate insights and visualizations instantly
        </p>
        <div className="space-y-2">
          <button
            onClick={() => handleQuickAction('generate-charts')}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>{isLoading ? "Working..." : "Generate Charts"}</span>
          </button>
          <button
            onClick={() => handleQuickAction('detect-anomalies')}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Detect Anomalies</span>
          </button>
          <button
            onClick={() => handleQuickAction('analyze-trends')}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Zap className="h-4 w-4" />
            <span>Analyze Trends</span>
          </button>
        </div>
      </div>
    </div>
  );
}
