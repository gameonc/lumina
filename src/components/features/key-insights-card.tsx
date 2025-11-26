"use client";

import { TrendingUp, TrendingDown, AlertTriangle, Info, Sparkles } from "lucide-react";
import type { KeyInsight } from "@/lib/ai/insights-generator";

interface KeyInsightsCardProps {
  insights: KeyInsight[];
  isLoading?: boolean;
}

function InsightIcon({ type }: { type: KeyInsight["type"] }) {
  switch (type) {
    case "positive":
      return <TrendingUp className="w-5 h-5" />;
    case "negative":
      return <TrendingDown className="w-5 h-5" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5" />;
    default:
      return <Info className="w-5 h-5" />;
  }
}

function getInsightStyles(type: KeyInsight["type"]) {
  switch (type) {
    case "positive":
      return {
        bg: "bg-emerald-50",
        border: "border-emerald-100",
        icon: "bg-emerald-100 text-emerald-600",
        title: "text-emerald-900",
        metric: "text-emerald-600",
      };
    case "negative":
      return {
        bg: "bg-red-50",
        border: "border-red-100",
        icon: "bg-red-100 text-red-600",
        title: "text-red-900",
        metric: "text-red-600",
      };
    case "warning":
      return {
        bg: "bg-amber-50",
        border: "border-amber-100",
        icon: "bg-amber-100 text-amber-600",
        title: "text-amber-900",
        metric: "text-amber-600",
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
    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-slate-200 rounded" />
          <div className="h-3 w-full bg-slate-100 rounded" />
          <div className="h-3 w-2/3 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
}

export function KeyInsightsCard({ insights, isLoading }: KeyInsightsCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-indigo-600" />
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
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Sparkles className="w-5 h-5 text-indigo-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Key Insights</h2>
        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
          AI Generated
        </span>
      </div>

      <div className="space-y-3">
        {insights.slice(0, 3).map((insight, index) => {
          const styles = getInsightStyles(insight.type);
          return (
            <div
              key={index}
              className={`p-4 rounded-xl ${styles.bg} border ${styles.border} transition-all hover:shadow-sm`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${styles.icon} shrink-0`}>
                  <InsightIcon type={insight.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-semibold ${styles.title}`}>
                      {insight.title}
                    </h3>
                    {insight.metric && (
                      <span className={`text-sm font-bold ${styles.metric}`}>
                        {insight.metric}
                      </span>
                    )}
                    {insight.change && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${styles.icon}`}>
                        {insight.change}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
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
