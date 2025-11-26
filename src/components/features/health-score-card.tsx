"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Progress,
} from "@/components/ui";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Database,
  FileWarning,
  Repeat,
  Info,
} from "lucide-react";
import type { HealthScoreResult } from "@/lib/analyzers/health-score";

interface HealthScoreCardProps {
  healthData: HealthScoreResult | null;
  isLoading?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

function getScoreGradient(score: number): string {
  if (score >= 80) return "from-green-500 to-emerald-400";
  if (score >= 60) return "from-yellow-500 to-amber-400";
  if (score >= 40) return "from-orange-500 to-amber-500";
  return "from-red-500 to-rose-400";
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Poor";
  return "Critical";
}

function getSeverityIcon(severity: "low" | "medium" | "high") {
  switch (severity) {
    case "low":
      return <Info className="h-4 w-4 text-blue-500" />;
    case "medium":
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case "high":
      return <XCircle className="h-4 w-4 text-red-500" />;
  }
}

function getSeverityColor(severity: "low" | "medium" | "high"): string {
  switch (severity) {
    case "low":
      return "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800";
    case "medium":
      return "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800";
    case "high":
      return "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800";
  }
}

interface MetricProps {
  label: string;
  value: number;
  icon: React.ReactNode;
}

function Metric({ label, value, icon }: MetricProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">
            {label}
          </span>
          <span className={`text-sm font-medium ${getScoreColor(value)}`}>
            {value}%
          </span>
        </div>
        <Progress value={value} className="mt-1 h-1.5" />
      </div>
    </div>
  );
}

function HealthScoreSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-5 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-center">
          <div className="h-32 w-32 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 animate-pulse rounded bg-neutral-100 dark:bg-neutral-800"
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function HealthScoreCard({
  healthData,
  isLoading = false,
}: HealthScoreCardProps) {
  if (isLoading) {
    return <HealthScoreSkeleton />;
  }

  if (!healthData) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Activity className="h-12 w-12 text-neutral-300 dark:text-neutral-600" />
          <p className="mt-4 text-neutral-500 dark:text-neutral-400">
            No health data available
          </p>
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            Upload data to calculate health score
          </p>
        </CardContent>
      </Card>
    );
  }

  const { score, breakdown, issues, recommendations } = healthData;
  const hasIssues =
    issues.missingData.length > 0 ||
    issues.anomalies.length > 0 ||
    issues.badHeaders.length > 0 ||
    issues.typeIssues.length > 0 ||
    issues.duplication !== null;

  return (
    <div className="space-y-6">
      {/* Main Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary-500" />
            Dataset Health Score
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Circle */}
          <div className="flex flex-col items-center">
            <div
              className={`relative flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br ${getScoreGradient(
                score
              )} shadow-lg`}
            >
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white dark:bg-neutral-900">
                <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                  {score}
                </span>
                <span className="text-xs text-neutral-500">out of 100</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {score >= 70 ? (
                <CheckCircle className={`h-5 w-5 ${getScoreColor(score)}`} />
              ) : (
                <AlertTriangle className={`h-5 w-5 ${getScoreColor(score)}`} />
              )}
              <span className={`font-medium ${getScoreColor(score)}`}>
                {getScoreLabel(score)}
              </span>
            </div>
          </div>

          {/* Breakdown Metrics */}
          <div className="space-y-4">
            <h4 className="font-medium text-neutral-900 dark:text-white">
              Score Breakdown
            </h4>
            <Metric
              label="Completeness"
              value={breakdown.completeness}
              icon={<Database className="h-4 w-4 text-blue-500" />}
            />
            <Metric
              label="Uniqueness"
              value={breakdown.uniqueness}
              icon={<Repeat className="h-4 w-4 text-purple-500" />}
            />
            <Metric
              label="Consistency"
              value={breakdown.consistency}
              icon={<TrendingUp className="h-4 w-4 text-green-500" />}
            />
            <Metric
              label="Header Quality"
              value={breakdown.headerQuality}
              icon={<FileWarning className="h-4 w-4 text-orange-500" />}
            />
            <Metric
              label="Anomaly Score"
              value={breakdown.anomalyScore}
              icon={<AlertTriangle className="h-4 w-4 text-red-500" />}
            />
          </div>
        </CardContent>
      </Card>

      {/* Issues Card */}
      {hasIssues && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Detected Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {issues.missingData.map((issue, i) => (
              <div
                key={`missing-${i}`}
                className={`rounded-lg border p-3 ${getSeverityColor(issue.severity)}`}
              >
                <div className="flex items-start gap-2">
                  {getSeverityIcon(issue.severity)}
                  <div>
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {issue.message}
                    </p>
                    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                      Columns: {issue.affectedColumns.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {issues.anomalies.map((issue, i) => (
              <div
                key={`anomaly-${i}`}
                className={`rounded-lg border p-3 ${getSeverityColor(issue.severity)}`}
              >
                <div className="flex items-start gap-2">
                  {getSeverityIcon(issue.severity)}
                  <div>
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {issue.message}
                    </p>
                    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                      Columns: {issue.affectedColumns.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {issues.badHeaders.map((issue, i) => (
              <div
                key={`header-${i}`}
                className={`rounded-lg border p-3 ${getSeverityColor(issue.severity)}`}
              >
                <div className="flex items-start gap-2">
                  {getSeverityIcon(issue.severity)}
                  <div>
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {issue.message}
                    </p>
                    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                      Examples: {issue.examples.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {issues.typeIssues.map((issue, i) => (
              <div
                key={`type-${i}`}
                className={`rounded-lg border p-3 ${getSeverityColor(issue.severity)}`}
              >
                <div className="flex items-start gap-2">
                  {getSeverityIcon(issue.severity)}
                  <div>
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {issue.message}
                    </p>
                    <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                      Columns: {issue.affectedColumns.join(", ")}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {issues.duplication && (
              <div
                className={`rounded-lg border p-3 ${getSeverityColor(
                  issues.duplication.severity
                )}`}
              >
                <div className="flex items-start gap-2">
                  {getSeverityIcon(issues.duplication.severity)}
                  <div>
                    <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                      {issues.duplication.message}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommendations Card */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recommendations.map((rec, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400"
                >
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary-500" />
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
