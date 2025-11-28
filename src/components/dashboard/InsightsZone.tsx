"use client";

import {
  Sparkles,
  AlertCircle,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import type { AIInsights, KeyInsight } from "@/lib/ai/insights-generator";
import type { HealthScoreResult } from "@/lib/analyzers/health-score";

interface InsightsZoneProps {
  aiInsights?: AIInsights | null;
  healthScore?: HealthScoreResult | null;
}

function getInsightConfig(type: string) {
  switch (type) {
    case "money":
      return {
        icon: DollarSign,
        gradient: "from-emerald-500 to-teal-500",
        bg: "bg-gradient-to-br from-emerald-50 to-teal-50/50",
        border: "border-emerald-200/60",
        iconBg: "bg-emerald-100",
        iconColor: "text-emerald-600",
        badge: "bg-emerald-100 text-emerald-700",
      };
    case "problem":
      return {
        icon: AlertTriangle,
        gradient: "from-amber-500 to-orange-500",
        bg: "bg-gradient-to-br from-amber-50 to-orange-50/50",
        border: "border-amber-200/60",
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        badge: "bg-amber-100 text-amber-700",
      };
    case "trend":
      return {
        icon: TrendingUp,
        gradient: "from-blue-500 to-indigo-500",
        bg: "bg-gradient-to-br from-blue-50 to-indigo-50/50",
        border: "border-blue-200/60",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        badge: "bg-blue-100 text-blue-700",
      };
    default:
      return {
        icon: Lightbulb,
        gradient: "from-slate-500 to-gray-500",
        bg: "bg-gradient-to-br from-slate-50 to-gray-50/50",
        border: "border-slate-200/60",
        iconBg: "bg-slate-100",
        iconColor: "text-slate-600",
        badge: "bg-slate-100 text-slate-700",
      };
  }
}

function getHealthConfig(score: number) {
  if (score >= 90)
    return {
      gradient: "from-emerald-500 via-teal-500 to-cyan-500",
      bg: "bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50",
      text: "text-emerald-700",
      label: "Excellent",
      ring: "ring-emerald-500/20",
    };
  if (score >= 75)
    return {
      gradient: "from-green-500 to-emerald-500",
      bg: "bg-gradient-to-br from-green-50 to-emerald-50",
      text: "text-green-700",
      label: "Good",
      ring: "ring-green-500/20",
    };
  if (score >= 60)
    return {
      gradient: "from-amber-500 via-orange-500 to-yellow-500",
      bg: "bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50",
      text: "text-amber-700",
      label: "Fair",
      ring: "ring-amber-500/20",
    };
  return {
    gradient: "from-red-500 via-rose-500 to-pink-500",
    bg: "bg-gradient-to-br from-red-50 via-rose-50 to-pink-50",
    text: "text-red-700",
    label: "Needs Work",
    ring: "ring-red-500/20",
  };
}

export function InsightsZone({ aiInsights, healthScore }: InsightsZoneProps) {
  if (!aiInsights?.keyInsights && !healthScore) {
    return null;
  }

  const score = healthScore?.score ?? 0;
  const health = getHealthConfig(score);

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
    <section className="space-y-5">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            AI-Generated Insights
          </h2>
          <p className="text-sm text-slate-500">
            Smart analysis of your dataset
          </p>
        </div>
      </div>

      {/* 2-column grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Left column - Data Quality Card */}
        {healthScore && (
          <div className="lg:col-span-1">
            <div
              className={`relative h-full overflow-hidden rounded-2xl border ${health.ring} shadow-sm ${health.bg}`}
            >
              {/* Decorative gradient blob */}
              <div
                className={`absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${health.gradient} opacity-20 blur-2xl`}
              />

              {/* Title row */}
              <div className="relative border-b border-current/10 px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${health.gradient} shadow-sm`}
                  >
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <h3 className={`text-sm font-bold ${health.text}`}>
                    Data Quality
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="relative p-5">
                {/* Big score */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-black tracking-tight ${health.text}`}>
                      {score}
                    </span>
                    <span className="text-xl font-bold text-slate-400">/100</span>
                  </div>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${health.text} bg-white/60 shadow-sm`}
                    >
                      {health.label}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-5">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/60 shadow-inner">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${health.gradient} transition-all duration-500`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>

                {/* Issues list */}
                {allIssues.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Issues Found
                    </p>
                    {allIssues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 rounded-lg bg-white/50 p-2.5"
                      >
                        <AlertCircle className={`mt-0.5 h-3.5 w-3.5 flex-shrink-0 ${health.text}`} />
                        <span className="text-xs leading-relaxed text-slate-700">
                          {issue.message}
                        </span>
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
              const config = getInsightConfig(insight.type);
              const Icon = config.icon;

              return (
                <div
                  key={idx}
                  className={`group relative overflow-hidden rounded-xl border ${config.border} ${config.bg} p-5 shadow-sm transition-all hover:shadow-md`}
                >
                  {/* Decorative gradient blob */}
                  <div
                    className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${config.gradient} opacity-10 blur-xl transition-opacity group-hover:opacity-20`}
                  />

                  <div className="relative flex items-start gap-4">
                    {/* Icon badge */}
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${config.iconBg} shadow-sm ring-1 ring-white`}
                    >
                      <Icon className={`h-5 w-5 ${config.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900">
                          {insight.title}
                        </h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${config.badge}`}
                        >
                          {insight.type}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-600">
                        {insight.description}
                      </p>
                      {insight.recommendation && (
                        <div className="mt-3 flex items-start gap-2 rounded-lg bg-white/70 px-3 py-2.5 shadow-sm">
                          <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-500" />
                          <p className="text-xs font-medium leading-relaxed text-slate-700">
                            {insight.recommendation}
                          </p>
                          <ArrowRight className="ml-auto h-4 w-4 flex-shrink-0 text-indigo-400" />
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
