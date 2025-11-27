"use client";

import { Database, Columns, AlertCircle, CheckCircle2, DollarSign, TrendingUp, Target } from "lucide-react";
import type { BusinessMetrics, BusinessMetric } from "@/lib/analyzers/business-metrics";
import type { LucideIcon } from "lucide-react";

interface MetricsRowProps {
  businessMetrics?: BusinessMetrics | null;
  // Fallback technical metrics
  totalRows?: number;
  totalColumns?: number;
  nullValues?: number;
  dataQualityScore?: number;
}

interface MetricDisplay {
  icon: LucideIcon;
  label: string;
  value: string;
  badge?: string;
}

function formatMetricValue(value: string | number, format?: string): string {
  if (typeof value === "string") return value;

  switch (format) {
    case "currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case "percentage":
      return `${value.toFixed(1)}%`;
    case "number":
      return value.toLocaleString();
    default:
      return value.toLocaleString();
  }
}

function getTrendBadge(trend?: "up" | "down" | "stable"): string | undefined {
  switch (trend) {
    case "up":
      return "Trending Up";
    case "down":
      return "Trending Down";
    case "stable":
      return "Stable";
    default:
      return undefined;
  }
}

function getDataQualityBadge(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  return "Needs Review";
}

export function MetricsRow({
  businessMetrics,
  totalRows,
  totalColumns,
  nullValues,
  dataQualityScore,
}: MetricsRowProps) {
  let metricsToDisplay: MetricDisplay[] = [];

  // Show business metrics if available
  if (businessMetrics && businessMetrics.metrics.length > 0) {
    const topMetrics = businessMetrics.metrics.slice(0, 3);

    metricsToDisplay = topMetrics.map((metric: BusinessMetric) => {
      // Determine icon based on metric label/type
      let icon = Target;
      const lowerLabel = metric.label.toLowerCase();

      if (lowerLabel.includes("revenue") || lowerLabel.includes("income") || lowerLabel.includes("sales")) {
        icon = DollarSign;
      } else if (lowerLabel.includes("profit") || lowerLabel.includes("margin")) {
        icon = TrendingUp;
      } else if (lowerLabel.includes("growth") || lowerLabel.includes("rate")) {
        icon = TrendingUp;
      }

      return {
        icon,
        label: metric.label,
        value: formatMetricValue(metric.value, metric.format),
        badge: getTrendBadge(metric.trend),
      };
    });

    // Add data quality as 4th metric if available
    if (dataQualityScore !== undefined) {
      metricsToDisplay.push({
        icon: CheckCircle2,
        label: "Data Quality Score",
        value: `${dataQualityScore}`,
        badge: getDataQualityBadge(dataQualityScore),
      });
    }
  } else {
    // Fallback to technical metrics - show exactly 4 in priority order
    if (totalRows !== undefined) {
      metricsToDisplay.push({
        icon: Database,
        label: "Total Rows",
        value: totalRows.toLocaleString(),
        badge: undefined,
      });
    }

    if (totalColumns !== undefined) {
      metricsToDisplay.push({
        icon: Columns,
        label: "Total Columns",
        value: totalColumns.toString(),
        badge: undefined,
      });
    }

    if (nullValues !== undefined) {
      metricsToDisplay.push({
        icon: AlertCircle,
        label: "Null Values",
        value: nullValues.toLocaleString(),
        badge: nullValues === 0 ? "Clean" : "Review Needed",
      });
    }

    if (dataQualityScore !== undefined) {
      metricsToDisplay.push({
        icon: CheckCircle2,
        label: "Data Quality Score",
        value: `${dataQualityScore}`,
        badge: getDataQualityBadge(dataQualityScore),
      });
    }
  }

  // Ensure we only show exactly 4 metrics max
  const displayMetrics = metricsToDisplay.slice(0, 4);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {displayMetrics.map((metric, index) => {
        const Icon = metric.icon;

        return (
          <div
            key={index}
            className="relative min-h-[120px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
          >
            {/* Badge - TOP RIGHT INSIDE */}
            {metric.badge && (
              <span className="absolute right-3 top-3 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                {metric.badge}
              </span>
            )}

            {/* Icon - small */}
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
              <Icon className="h-4 w-4 text-slate-600" />
            </div>

            {/* Value - LARGE BOLD */}
            <p className="text-2xl font-bold text-slate-900">
              {metric.value}
            </p>

            {/* Label - small muted */}
            <p className="text-sm text-slate-500">{metric.label}</p>
          </div>
        );
      })}
    </div>
  );
}
