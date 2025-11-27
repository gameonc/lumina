"use client";

import { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { KeyInsight } from "@/lib/ai/insights-generator";

interface AIInsightsCardProps {
  insights: KeyInsight[];
}

function getInsightTypeConfig(type: KeyInsight["type"]) {
  switch (type) {
    // New business-friendly types
    case "money":
      return {
        badge: "Money",
        badgeColor: "bg-emerald-100 text-emerald-700",
        icon: DollarSign,
        iconColor: "text-emerald-600",
        iconBg: "bg-emerald-50",
      };
    case "problem":
      return {
        badge: "Needs Attention",
        badgeColor: "bg-amber-100 text-amber-700",
        icon: AlertTriangle,
        iconColor: "text-amber-600",
        iconBg: "bg-amber-50",
      };
    case "trend":
      return {
        badge: "Trend",
        badgeColor: "bg-blue-100 text-blue-700",
        icon: TrendingUp,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-50",
      };
    default:
      return {
        badge: "Insight",
        badgeColor: "bg-slate-100 text-slate-700",
        icon: Sparkles,
        iconColor: "text-slate-600",
        iconBg: "bg-slate-50",
      };
  }
}

function getSeverityConfig(severity?: string) {
  switch (severity) {
    case "good":
      return {
        badge: "Good news",
        badgeColor: "bg-emerald-100 text-emerald-700",
        icon: CheckCircle,
      };
    case "warning":
      return {
        badge: "Heads up",
        badgeColor: "bg-red-100 text-red-700",
        icon: AlertTriangle,
      };
    case "neutral":
    default:
      return null; // Don't show badge for neutral
  }
}

function truncateText(text: string, maxLength: number = 120): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

export function AIInsightsCard({ insights }: AIInsightsCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!insights || insights.length === 0) {
    return null;
  }

  const insightsToShow = isExpanded ? insights : insights.slice(0, 2);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-indigo-50 p-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Key Insights</h2>
        </div>
        <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          {insights.length} {insights.length === 1 ? "insight" : "insights"}
        </span>
      </div>

      <div className="space-y-3">
        {insightsToShow.map((insight, index) => {
          const config = getInsightTypeConfig(insight.type);
          const severityConfig = getSeverityConfig(insight.severity);
          const Icon = config.icon;

          return (
            <div
              key={index}
              className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm"
            >
              <div className={`rounded-lg ${config.iconBg} p-2 shrink-0`}>
                <Icon className={`h-4 w-4 ${config.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-1.5">
                  <h3 className="font-semibold text-slate-900 text-sm truncate">
                    {insight.title}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.badgeColor} flex-shrink-0`}
                  >
                    {config.badge}
                  </span>
                  {severityConfig && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${severityConfig.badgeColor} flex-shrink-0`}
                    >
                      {severityConfig.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  {truncateText(insight.description)}
                </p>
                {insight.metric && (
                  <p className="mt-1 text-sm font-semibold text-indigo-600">
                    {insight.metric}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {insights.length > 2 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show {insights.length - 2} More Insights
            </>
          )}
        </button>
      )}
    </div>
  );
}
