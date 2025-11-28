"use client";

import { useState } from "react";
import { Sparkles, Zap, AlertTriangle, Loader2, MessageSquare } from "lucide-react";
import { ChatInterface } from "@/components/features";
import type { ChartConfig } from "@/types";

interface AiSidebarProps {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
  onQuickAction: (action: "generate-charts" | "detect-anomalies" | "analyze-trends") => void;
  isLoading: boolean;
  headers: string[];
  rows: Record<string, unknown>[];
  onNewChart: (chart: ChartConfig) => void;
}

export function AiSidebar({
  prompts,
  onPromptClick,
  onQuickAction,
  isLoading,
  headers,
  rows,
  onNewChart,
}: AiSidebarProps) {
  const [activeTab, setActiveTab] = useState<"prompts" | "chat">("prompts");

  return (
    <div className="sticky top-24 space-y-6">
      {/* Tab switcher card */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("prompts")}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "prompts"
                ? "border-b-2 border-indigo-600 bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Quick Actions
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "chat"
                ? "border-b-2 border-indigo-600 bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "prompts" ? (
            <div className="space-y-6">
              {/* AI Co-Pilot Section */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-900">AI Co-Pilot</h3>
                </div>
                <p className="mb-4 text-xs text-slate-500">
                  Click a prompt to analyze this dataset.
                </p>

                {/* Smart prompt buttons */}
                <div className="space-y-2">
                  {prompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => onPromptClick(prompt)}
                      className="group w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-sm text-slate-700 transition-all hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700"
                    >
                      <div className="flex items-start gap-2">
                        <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500 opacity-0 transition-opacity group-hover:opacity-100" />
                        <span className="leading-snug">{prompt}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions Section */}
              <div className="border-t border-slate-200 pt-6">
                <div className="mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-sm font-semibold text-slate-900">Quick Actions</h3>
                  {isLoading && (
                    <Loader2 className="ml-auto h-4 w-4 animate-spin text-indigo-600" />
                  )}
                </div>

                {/* Action buttons with icons */}
                <div className="space-y-2">
                  <button
                    onClick={() => onQuickAction("generate-charts")}
                    disabled={isLoading}
                    className="flex w-full items-center gap-3 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-medium">Generate Charts</div>
                      <div className="text-xs text-indigo-200">
                        Create 3 visualizations
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => onQuickAction("detect-anomalies")}
                    disabled={isLoading}
                    className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">Detect Anomalies</div>
                      <div className="text-xs text-slate-500">Find unusual patterns</div>
                    </div>
                  </button>

                  <button
                    onClick={() => onQuickAction("analyze-trends")}
                    disabled={isLoading}
                    className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Zap className="h-4 w-4 text-blue-600" />
                    <div className="flex-1 text-left">
                      <div className="font-medium">Analyze Trends</div>
                      <div className="text-xs text-slate-500">Discover key insights</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Chat interface
            <div className="h-[600px] -m-6">
              <ChatInterface
                headers={headers}
                rows={rows}
                onNewChart={onNewChart}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
