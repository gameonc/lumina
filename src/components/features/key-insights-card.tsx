"use client";

import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Info,
  Sparkles,
} from "lucide-react";
import type { KeyInsight } from "@/lib/ai/insights-generator";

interface KeyInsightsCardProps {
  insights: KeyInsight[];
  isLoading?: boolean;
}

function InsightIcon({ type }: { type: KeyInsight["type"] }) {
  switch (type) {
    case "trend":
    case "opportunity":
      return <TrendingUp className="h-5 w-5" />;
    case "risk":
    case "anomaly":
      return <AlertTriangle className="h-5 w-5" />;
    case "correlation":
      return <TrendingDown className="h-5 w-5" />;
    default:
      return <Info className="h-5 w-5" />;
  }
}

function getInsightStyles(type: KeyInsight["type"]) {
  switch (type) {
    case "trend":
    case "opportunity":
      return {
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        icon: "bg-emerald-100 text-emerald-600",
        title: "text-emerald-900",
        metric: "text-emerald-600",
      };
    case "risk":
      return {
        bg: "bg-red-50",
        border: "border-red-100",
        icon: "bg-red-100 text-red-600",
        title: "text-red-900",
        metric: "text-red-600",
      };
    case "anomaly":
      return {
        bg: "bg-amber-50",
        border: "border-amber-100",
        icon: "bg-amber-100 text-amber-600",
        title: "text-amber-900",
        metric: "text-amber-600",
      };
    case "correlation":
      return {
        bg: "bg-blue-50",
        border: "border-blue-100",
        icon: "bg-blue-100 text-blue-600",
        title: "text-blue-900",
        metric: "text-blue-600",
      };
    default:
      return {
        bg: "bg-slate-50",
        border: "border-slate-100",
        icon: "bg-slate-100 text-slate-600",
        title: "text-slate-900",
        metric: "text-slate-600",
      };
  }
}

function InsightSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-full rounded bg-slate-100" />
          <div className="h-3 w-2/3 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

export function KeyInsightsCard({ insights, isLoading }: KeyInsightsCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-lg bg-indigo-100 p-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Key Insights</h2>
        </div>
        <div className="space-y-3">
          <InsightSkeleton />
          <InsightSkeleton />
          <InsightSkeleton />
        </div>
      </div>
    );
  }

  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-indigo-100 p-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Key Insights</h2>
        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
          AI Generated
        </span>
      </div>

      <div className="space-y-3">
        {insights.slice(0, 3).map((insight, index) => {
          const styles = getInsightStyles(insight.type);
          return (
            <div
              key={index}
              className={`rounded-xl p-4 ${styles.bg} border ${styles.border} transition-all hover:shadow-sm`}
            >
              <div className="flex items-start gap-3">
                <div className={`rounded-lg p-2 ${styles.icon} shrink-0`}>
                  <InsightIcon type={insight.type} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={`font-semibold ${styles.title}`}>
                      {insight.title}
                    </h3>
                    {insight.metric && (
                      <span className={`text-sm font-bold ${styles.metric}`}>
                        {insight.metric}
                      </span>
                    )}
                    {insight.impact && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${styles.icon}`}
                      >
                        {insight.impact} impact
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {insight.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
