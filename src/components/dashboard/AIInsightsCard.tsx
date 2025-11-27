"use client";

import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  Target,
  Link2,
} from "lucide-react";
import type { KeyInsight } from "@/lib/ai/insights-generator";

interface AIInsightsCardProps {
  insights: KeyInsight[];
}

function getInsightTypeConfig(type: KeyInsight["type"]) {
  switch (type) {
    case "trend":
      return {
        badge: "Trend",
        badgeColor: "bg-emerald-100 text-emerald-700",
        icon: TrendingUp,
        iconColor: "text-emerald-600",
        iconBg: "bg-emerald-50",
      };
    case "anomaly":
      return {
        badge: "Anomaly",
        badgeColor: "bg-red-100 text-red-700",
        icon: AlertCircle,
        iconColor: "text-red-600",
        iconBg: "bg-red-50",
      };
    case "opportunity":
      return {
        badge: "Opportunity",
        badgeColor: "bg-blue-100 text-blue-700",
        icon: Target,
        iconColor: "text-blue-600",
        iconBg: "bg-blue-50",
      };
    case "risk":
      return {
        badge: "Risk",
        badgeColor: "bg-amber-100 text-amber-700",
        icon: AlertTriangle,
        iconColor: "text-amber-600",
        iconBg: "bg-amber-50",
      };
    case "correlation":
      return {
        badge: "Correlation",
        badgeColor: "bg-purple-100 text-purple-700",
        icon: Link2,
        iconColor: "text-purple-600",
        iconBg: "bg-purple-50",
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

function getImpactBadgeColor(impact?: string) {
  switch (impact?.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-700";
    case "medium":
      return "bg-amber-100 text-amber-700";
    case "low":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export function AIInsightsCard({ insights }: AIInsightsCardProps) {
  if (!insights || insights.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center gap-2">
        <div className="rounded-lg bg-indigo-50 p-2">
          <Sparkles className="h-5 w-5 text-indigo-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">AI Summary</h2>
        <span className="ml-auto rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          AI Generated
        </span>
      </div>

      <div className="space-y-4">
        {insights.slice(0, 5).map((insight, index) => {
          const config = getInsightTypeConfig(insight.type);
          const Icon = config.icon;

          return (
            <div
              key={index}
              className="flex items-start gap-4 rounded-lg border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-slate-200 hover:bg-white hover:shadow-sm"
            >
              <div className={`rounded-lg ${config.iconBg} p-2.5 shrink-0`}>
                <Icon className={`h-5 w-5 ${config.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {insight.title}
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.badgeColor}`}
                  >
                    {config.badge}
                  </span>
                  {insight.impact && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${getImpactBadgeColor(insight.impact)}`}
                    >
                      {insight.impact} Impact
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-slate-600">
                  {insight.description}
                </p>
                {insight.metric && (
                  <p className="mt-2 text-sm font-semibold text-indigo-600">
                    {insight.metric}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
