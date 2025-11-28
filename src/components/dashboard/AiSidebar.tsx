"use client";

import { useState } from "react";
import {
  Sparkles,
  AlertTriangle,
  Loader2,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  Bot,
} from "lucide-react";
import { ChatInterface } from "@/components/features";
import type { ChartConfig } from "@/types";

interface AiSidebarProps {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
  onQuickAction: (
    action: "generate-charts" | "detect-anomalies" | "analyze-trends"
  ) => void;
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
    <div className="sticky top-24 space-y-5">
      {/* Main card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
        {/* Tab switcher - Premium style */}
        <div className="relative flex border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          {/* Sliding indicator */}
          <div
            className={`absolute bottom-0 h-0.5 w-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ${
              activeTab === "chat" ? "translate-x-full" : "translate-x-0"
            }`}
          />

          <button
            onClick={() => setActiveTab("prompts")}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
              activeTab === "prompts"
                ? "text-indigo-700"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Quick Actions
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3.5 text-sm font-semibold transition-colors ${
              activeTab === "chat"
                ? "text-indigo-700"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            AI Chat
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {activeTab === "prompts" ? (
            <div className="space-y-6">
              {/* AI Co-Pilot Section */}
              <div>
                <div className="mb-4 flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      AI Co-Pilot
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Click a prompt to analyze
                    </p>
                  </div>
                </div>

                {/* Smart prompt buttons - Refined */}
                <div className="space-y-2">
                  {prompts.map((prompt, index) => (
                    <button
                      key={index}
                      onClick={() => onPromptClick(prompt)}
                      className="group flex w-full items-center gap-3 rounded-xl border border-slate-200/60 bg-white px-4 py-3 text-left text-sm transition-all hover:border-indigo-200 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 hover:shadow-sm"
                    >
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-indigo-100">
                        <Sparkles className="h-3.5 w-3.5 text-slate-400 transition-colors group-hover:text-indigo-600" />
                      </div>
                      <span className="flex-1 font-medium text-slate-700 group-hover:text-slate-900">
                        {prompt}
                      </span>
                      <ChevronRight className="h-4 w-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-indigo-500" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    Quick Actions
                  </span>
                </div>
              </div>

              {/* Quick Actions Section - Premium buttons */}
              <div className="space-y-2.5">
                {/* Generate Charts - Primary CTA */}
                <button
                  onClick={() => onQuickAction("generate-charts")}
                  disabled={isLoading}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 p-[1px] shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="flex items-center gap-3 rounded-[11px] bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 px-4 py-3.5">
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-white" />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                        <Sparkles className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div className="flex-1 text-left">
                      <div className="font-semibold text-white">
                        Generate Charts
                      </div>
                      <div className="text-xs text-indigo-200">
                        Create 3 AI visualizations
                      </div>
                    </div>
                  </div>
                </button>

                {/* Detect Anomalies */}
                <button
                  onClick={() => onQuickAction("detect-anomalies")}
                  disabled={isLoading}
                  className="group flex w-full items-center gap-3 rounded-xl border border-slate-200/60 bg-white px-4 py-3 shadow-sm transition-all hover:border-amber-200 hover:bg-amber-50/50 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 transition-colors group-hover:bg-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-slate-900">
                      Detect Anomalies
                    </div>
                    <div className="text-xs text-slate-500">
                      Find unusual patterns
                    </div>
                  </div>
                </button>

                {/* Analyze Trends */}
                <button
                  onClick={() => onQuickAction("analyze-trends")}
                  disabled={isLoading}
                  className="group flex w-full items-center gap-3 rounded-xl border border-slate-200/60 bg-white px-4 py-3 shadow-sm transition-all hover:border-blue-200 hover:bg-blue-50/50 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 transition-colors group-hover:bg-blue-200">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-slate-900">
                      Analyze Trends
                    </div>
                    <div className="text-xs text-slate-500">
                      Discover key insights
                    </div>
                  </div>
                </button>
              </div>

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-center justify-center gap-2 rounded-lg bg-indigo-50 px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                  <span className="text-sm font-medium text-indigo-700">
                    AI is thinking...
                  </span>
                </div>
              )}
            </div>
          ) : (
            // Chat interface
            <div className="-m-5 h-[600px]">
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
