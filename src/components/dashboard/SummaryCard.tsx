"use client";

import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import type { AIInsights } from "@/lib/ai/insights-generator";

interface SummaryCardProps {
  insights?: AIInsights | null;
}

export function SummaryCard({ insights }: SummaryCardProps) {
  if (!insights || !insights.keyInsights || insights.keyInsights.length === 0) {
    return null;
  }

  const topInsights = insights.keyInsights.slice(0, 5);
  const risks = insights.keyInsights.filter(i => i.type === "problem" || i.severity === "warning");
  const trends = insights.keyInsights.filter(i => i.type === "trend");

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-slate-900">Executive Summary</h2>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Key Insights Grid */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {topInsights.map((insight, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-4"
            >
              <div
                className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${
                  insight.type === "money"
                    ? "bg-emerald-100 text-emerald-600"
                    : insight.type === "problem"
                    ? "bg-red-100 text-red-600"
                    : "bg-indigo-100 text-indigo-600"
                }`}
              >
                {insight.type === "money" ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : insight.type === "problem" ? (
                  <AlertTriangle className="h-3.5 w-3.5" />
                ) : (
                  <Lightbulb className="h-3.5 w-3.5" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{insight.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {insight.description}
                </p>
                {insight.recommendation && (
                  <p className="mt-2 text-xs font-medium text-indigo-600">
                    💡 {insight.recommendation}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Risks Section */}
        {risks.length > 0 && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h3 className="text-sm font-semibold text-amber-900">Risk Flags</h3>
            </div>
            <ul className="space-y-2">
              {risks.slice(0, 3).map((risk, idx) => (
                <li key={idx} className="text-xs text-amber-800">
                  • {risk.title}: {risk.description}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Trends Section */}
        {trends.length > 0 && (
          <div className="rounded-lg border border-indigo-200 bg-indigo-50/50 p-4">
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-indigo-900">Key Trends</h3>
            </div>
            <ul className="space-y-2">
              {trends.slice(0, 3).map((trend, idx) => (
                <li key={idx} className="text-xs text-indigo-800">
                  • {trend.title}: {trend.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

