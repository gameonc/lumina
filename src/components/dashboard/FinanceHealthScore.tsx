"use client";

import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
} from "lucide-react";
import type { FinanceHealthReport } from "@/lib/finance/benchmarks";

interface FinanceHealthScoreProps {
  healthReport: FinanceHealthReport;
}

const gradeConfig = {
  A: {
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    borderColor: "border-emerald-200",
    ringColor: "ring-emerald-400",
    description: "Excellent",
  },
  B: {
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
    ringColor: "ring-blue-400",
    description: "Good",
  },
  C: {
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    borderColor: "border-amber-200",
    ringColor: "ring-amber-400",
    description: "Fair",
  },
  D: {
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-200",
    ringColor: "ring-orange-400",
    description: "Needs Work",
  },
  F: {
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-200",
    ringColor: "ring-red-400",
    description: "Critical",
  },
};

export function FinanceHealthScore({ healthReport }: FinanceHealthScoreProps) {
  const config = gradeConfig[healthReport.overallGrade];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-6 flex items-center gap-2">
        <div className="rounded-lg bg-indigo-50 p-2">
          <Target className="h-5 w-5 text-indigo-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">
          Financial Health Score
        </h2>
        <span className="ml-auto rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          Finance Mode
        </span>
      </div>

      {/* Grade Display */}
      <div className="mb-6 flex items-center gap-6">
        <div
          className={`flex h-24 w-24 items-center justify-center rounded-full ${config.bgColor} ring-4 ${config.ringColor} ring-offset-2`}
        >
          <span className={`text-5xl font-bold ${config.color}`}>
            {healthReport.overallGrade}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`text-xl font-semibold ${config.color}`}>
              {config.description}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-sm text-slate-600">
              Score: {healthReport.overallScore}/100
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {healthReport.gradeDescription}
          </p>
        </div>
      </div>

      {/* Metrics Breakdown */}
      {healthReport.metrics.length > 0 && (
        <div className="mb-6 space-y-3">
          <h3 className="text-sm font-medium text-slate-700">Key Metrics</h3>
          <div className="grid gap-3">
            {healthReport.metrics.map((metric, index) => {
              const statusConfig = {
                excellent: {
                  icon: CheckCircle,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                good: {
                  icon: TrendingUp,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                },
                warning: {
                  icon: AlertTriangle,
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                },
                critical: {
                  icon: TrendingDown,
                  color: "text-red-600",
                  bg: "bg-red-50",
                },
              }[metric.status];

              const Icon = statusConfig.icon;

              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 rounded-lg p-3 ${statusConfig.bg}`}
                >
                  <Icon className={`h-5 w-5 shrink-0 ${statusConfig.color}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-800">
                        {metric.name}
                      </span>
                      <span className={`font-semibold ${statusConfig.color}`}>
                        {Math.round(metric.value * 100)}%
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-slate-600">
                      {metric.insight}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Benchmark: {metric.benchmark}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Red Flags */}
      {healthReport.redFlags.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-red-700">
            <AlertTriangle className="h-4 w-4" />
            Needs Attention
          </h3>
          <ul className="space-y-1.5">
            {healthReport.redFlags.map((flag, index) => (
              <li
                key={index}
                className="flex items-start gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                <span className="mt-0.5">!</span>
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Positives */}
      {healthReport.positives.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-emerald-700">
            <CheckCircle className="h-4 w-4" />
            What's Working
          </h3>
          <ul className="space-y-1.5">
            {healthReport.positives.map((positive, index) => (
              <li
                key={index}
                className="flex items-start gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              >
                <span className="mt-0.5">+</span>
                {positive}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Items */}
      {healthReport.actionItems.length > 0 && (
        <div>
          <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
            <Target className="h-4 w-4" />
            Recommended Actions
          </h3>
          <ul className="space-y-1.5">
            {healthReport.actionItems.map((action, index) => (
              <li
                key={index}
                className="flex items-start gap-2 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                <span className="mt-0.5 font-bold text-indigo-600">
                  {index + 1}.
                </span>
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
