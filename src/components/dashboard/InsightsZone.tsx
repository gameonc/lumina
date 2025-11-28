"use client";

import {
  Sparkles,
  AlertCircle,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import type { AIInsights, KeyInsight } from "@/lib/ai/insights-generator";
import type { HealthScoreResult } from "@/lib/analyzers/health-score";

interface InsightsZoneProps {
  aiInsights?: AIInsights | null;
  healthScore?: HealthScoreResult | null;
}

function getInsightIcon(type: string) {
  switch (type) {
    case "money":
      return DollarSign;
    case "problem":
      return AlertTriangle;
    case "trend":
      return TrendingUp;
    default:
      return Lightbulb;
  }
}

function getInsightBackground(type: string): string {
  switch (type) {
    case "money":
      return "bg-green-50 border-green-200";
    case "problem":
      return "bg-amber-50 border-amber-200";
    case "trend":
      return "bg-blue-50 border-blue-200";
    default:
      return "bg-slate-50 border-slate-200";
  }
}

function getInsightIconColor(type: string): string {
  switch (type) {
    case "money":
      return "text-green-600";
    case "problem":
      return "text-amber-600";
    case "trend":
      return "text-blue-600";
    default:
      return "text-slate-600";
  }
}

function getHealthColor(score: number) {
  if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
  if (score >= 75) return "text-green-600 bg-green-50 border-green-200";
  if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-red-600 bg-red-50 border-red-200";
}

function getHealthLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  return "Poor";
}

function getHealthBarColor(score: number) {
  if (score >= 90) return "bg-emerald-500";
  if (score >= 75) return "bg-green-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

export function InsightsZone({ aiInsights, healthScore }: InsightsZoneProps) {
  if (!aiInsights?.keyInsights && !healthScore) {
    return null;
  }

  const score = healthScore?.score ?? 0;
  const healthLabel = getHealthLabel(score);
  const healthColor = getHealthColor(score);
  const healthBarColor = getHealthBarColor(score);

  // Get all issues from health score
  const allIssues = healthScore?.issues
    ? [
        ...(healthScore.issues.missingData || []),
        ...(healthScore.issues.anomalies || []),
        ...(healthScore.issues.badHeaders || []),
        ...(healthScore.issues.typeIssues || []),
        healthScore.issues.duplication,
      ]
        .filter(
          (issue): issue is NonNullable<typeof issue> =>
            issue !== null && typeof issue === "object" && "message" in issue
        )
        .slice(0, 3)
    : [];

  return (
    <section className="space-y-4">
      {/* Section header */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Executive Summary</h2>
        <p className="text-sm text-slate-500">AI-generated overview of this dataset</p>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column - Data Quality Card (taller) */}
        {healthScore && (
          <div className="lg:col-span-1">
            <div
              className={`flex h-full flex-col rounded-xl border shadow-sm ${healthColor}`}
            >
              {/* Title row */}
              <div className="border-b border-current/20 px-6 py-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <h3 className="text-sm font-semibold">Data Quality</h3>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-6">
                {/* Big score */}
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{score}</span>
                    <span className="text-2xl font-medium">/100</span>
                  </div>
                  <span className="mt-1 inline-block rounded-full bg-white/50 px-3 py-1 text-sm font-semibold">
                    {healthLabel}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-6">
                  <div className="h-3 w-full overflow-hidden rounded-full bg-white/50">
                    <div
                      className={`h-full transition-all ${healthBarColor}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>

                {/* Issues list */}
                {allIssues.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide opacity-75">
                      Issues Found
                    </p>
                    {allIssues.map((issue, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                        <span className="text-xs leading-relaxed">{issue.message}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Right column - Stacked insight cards */}
        {aiInsights?.keyInsights && aiInsights.keyInsights.length > 0 && (
          <div className="space-y-4 lg:col-span-2">
            {aiInsights.keyInsights.slice(0, 4).map((insight: KeyInsight, idx: number) => {
              const Icon = getInsightIcon(insight.type);
              const bgClass = getInsightBackground(insight.type);
              const iconColor = getInsightIconColor(insight.type);

              return (
                <div
                  key={idx}
                  className={`rounded-xl border p-4 shadow-sm ${bgClass}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon badge */}
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/80 ${iconColor}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-slate-900">
                        {insight.title}
                      </h4>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {insight.description}
                      </p>
                      {insight.recommendation && (
                        <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-white/50 px-3 py-2">
                          <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-indigo-600" />
                          <p className="text-xs font-medium text-slate-700">
                            {insight.recommendation}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
