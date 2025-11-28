"use client";

import { Database, Columns, AlertCircle, CheckCircle2, DollarSign, TrendingUp, TrendingDown, Target, Minus } from "lucide-react";
import type { BusinessMetrics, BusinessMetric } from "@/lib/analyzers/business-metrics";
import type { LucideIcon } from "lucide-react";

interface MetricsRowProps {
  businessMetrics?: BusinessMetrics | null;
  // Fallback technical metrics
  totalRows?: number;
  totalColumns?: number;
  nullValues?: number;
  dataQualityScore?: number;
  isLoading?: boolean;
}

interface MetricDisplay {
  icon: LucideIcon;
  label: string;
  value: string;
  badge?: string;
  badgeColor?: "green" | "red" | "yellow" | "blue";
  trend?: "up" | "down" | "stable";
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

function getTrendBadge(trend?: "up" | "down" | "stable"): { text: string; color: "green" | "red" | "yellow" } | undefined {
  switch (trend) {
    case "up":
      return { text: "Trending Up", color: "green" };
    case "down":
      return { text: "Trending Down", color: "red" };
    case "stable":
      return { text: "Stable", color: "yellow" };
    default:
      return undefined;
  }
}

function getDataQualityBadge(score: number): { text: string; color: "green" | "yellow" | "red" } {
  if (score >= 90) return { text: "Excellent", color: "green" };
  if (score >= 75) return { text: "Good", color: "green" };
  if (score >= 60) return { text: "Fair", color: "yellow" };
  return { text: "Needs Review", color: "red" };
}

function getBadgeClasses(color: "green" | "red" | "yellow" | "blue"): string {
  switch (color) {
    case "green":
      return "bg-emerald-100 text-emerald-700";
    case "red":
      return "bg-red-100 text-red-700";
    case "yellow":
      return "bg-amber-100 text-amber-700";
    case "blue":
      return "bg-blue-100 text-blue-700";
  }
}

function getTrendIcon(trend?: "up" | "down" | "stable") {
  switch (trend) {
    case "up":
      return TrendingUp;
    case "down":
      return TrendingDown;
    case "stable":
      return Minus;
    default:
      return null;
  }
}

// Loading skeleton for metrics
function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="relative min-h-[120px] animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="mb-2 h-8 w-8 rounded-lg bg-slate-200" />
          <div className="mb-2 h-8 w-24 rounded bg-slate-200" />
          <div className="h-4 w-20 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

export function MetricsRow({
  businessMetrics,
  totalRows,
  totalColumns,
  nullValues,
  dataQualityScore,
  isLoading = false,
}: MetricsRowProps) {
  if (isLoading) {
    return <MetricsSkeleton />;
  }

  let metricsToDisplay: MetricDisplay[] = [];

  // Show business metrics if available
  if (businessMetrics && businessMetrics.metrics.length > 0) {
    const topMetrics = businessMetrics.metrics.slice(0, 3);

    metricsToDisplay = topMetrics.map((metric: BusinessMetric) => {
      // Determine icon based on metric label/type
      let icon: LucideIcon = Target;
      const lowerLabel = metric.label.toLowerCase();

      if (lowerLabel.includes("revenue") || lowerLabel.includes("income") || lowerLabel.includes("sales")) {
        icon = DollarSign;
      } else if (lowerLabel.includes("profit") || lowerLabel.includes("margin")) {
        icon = TrendingUp;
      } else if (lowerLabel.includes("growth") || lowerLabel.includes("rate")) {
        icon = TrendingUp;
      }

      const trendBadge = getTrendBadge(metric.trend);

      return {
        icon,
        label: metric.label,
        value: formatMetricValue(metric.value, metric.format),
        badge: trendBadge?.text,
        badgeColor: trendBadge?.color,
        trend: metric.trend,
      };
    });

    // Add data quality as 4th metric if available
    if (dataQualityScore !== undefined) {
      const qualityBadge = getDataQualityBadge(dataQualityScore);
      metricsToDisplay.push({
        icon: CheckCircle2,
        label: "Data Quality Score",
        value: `${dataQualityScore}`,
        badge: qualityBadge.text,
        badgeColor: qualityBadge.color,
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
        badgeColor: nullValues === 0 ? "green" : "yellow",
      });
    }

    if (dataQualityScore !== undefined) {
      const qualityBadge = getDataQualityBadge(dataQualityScore);
      metricsToDisplay.push({
        icon: CheckCircle2,
        label: "Data Quality Score",
        value: `${dataQualityScore}`,
        badge: qualityBadge.text,
        badgeColor: qualityBadge.color,
      });
    }
  }

  // Ensure we only show exactly 4 metrics max
  const displayMetrics = metricsToDisplay.slice(0, 4);

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {displayMetrics.map((metric, index) => {
        const Icon = metric.icon;
        const TrendIcon = getTrendIcon(metric.trend);

        return (
          <div
            key={index}
            className="relative min-h-[120px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            style={{
              animationDelay: `${index * 100}ms`,
              animation: "fadeInUp 0.4s ease-out forwards",
            }}
          >
            {/* Badge - TOP RIGHT INSIDE */}
            {metric.badge && (
              <span className={`absolute right-3 top-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getBadgeClasses(metric.badgeColor || "green")}`}>
                {TrendIcon && <TrendIcon className="h-3 w-3" />}
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

      {/* CSS animation keyframes */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
