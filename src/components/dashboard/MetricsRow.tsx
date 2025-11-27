"use client";

import { useState } from "react";
import { Database, Columns, AlertCircle, CheckCircle2, TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { DataQualityBadge } from "./DataQualityBadge";
import type { BusinessMetrics } from "@/lib/analyzers/business-metrics";

interface MetricsRowProps {
  businessMetrics?: BusinessMetrics | null;
  // Fallback technical metrics
  totalRows?: number;
  totalColumns?: number;
  nullValues?: number;
  dataQualityScore?: number;
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

export function MetricsRow({
  businessMetrics,
  totalRows,
  totalColumns,
  nullValues,
  dataQualityScore,
}: MetricsRowProps) {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  
  // Show business metrics if available, otherwise fall back to technical metrics
  if (businessMetrics && businessMetrics.metrics.length > 0) {
    const metricsToShow = businessMetrics.metrics.slice(0, 4);
    const hasTechnicalMetrics = totalRows !== undefined || totalColumns !== undefined || nullValues !== undefined || dataQualityScore !== undefined;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metricsToShow.map((metric, index) => {
            const TrendIcon = getTrendIcon(metric.trend);
            const iconColor = metric.trend === "up" 
              ? "text-emerald-600" 
              : metric.trend === "down" 
              ? "text-red-600" 
              : "text-slate-600";
            
            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      {metric.label}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-semibold text-slate-900">
                        {formatMetricValue(metric.value, metric.format)}
                      </p>
                      {TrendIcon && (
                        <TrendIcon className={`h-4 w-4 ${iconColor}`} />
                      )}
                    </div>
                    {metric.description && (
                      <p className="mt-1 text-xs text-slate-500">
                        {metric.description}
                      </p>
                    )}
                  </div>
                  {metric.icon && (
                    <div className="text-2xl">{metric.icon}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Expandable Technical Details Section */}
        {hasTechnicalMetrics && (
          <div className="rounded-xl border border-slate-200 bg-white">
            <button
              onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
              className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-slate-50"
            >
              <span className="text-sm font-medium text-slate-700">
                Technical Details
              </span>
              {showTechnicalDetails ? (
                <ChevronUp className="h-4 w-4 text-slate-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-500" />
              )}
            </button>
            {showTechnicalDetails && (
              <div className="border-t border-slate-200 p-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {totalRows !== undefined && (
                    <MetricCard
                      icon={Database}
                      label="Total Rows"
                      value={totalRows.toLocaleString()}
                      iconColor="text-indigo-600"
                      iconBgColor="bg-indigo-50"
                    />
                  )}
                  {totalColumns !== undefined && (
                    <MetricCard
                      icon={Columns}
                      label="Total Columns"
                      value={totalColumns.toString()}
                      iconColor="text-violet-600"
                      iconBgColor="bg-violet-50"
                    />
                  )}
                  {nullValues !== undefined && (
                    <MetricCard
                      icon={AlertCircle}
                      label="Null Values"
                      value={nullValues.toLocaleString()}
                      iconColor="text-amber-600"
                      iconBgColor="bg-amber-50"
                    />
                  )}
                  {dataQualityScore !== undefined && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-emerald-50 p-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-medium text-slate-500">Data Quality</p>
                          <div className="flex items-center gap-1">
                            <p className="text-lg font-semibold text-slate-900">
                              {dataQualityScore}
                            </p>
                            <DataQualityBadge score={dataQualityScore} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Fallback to technical metrics
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {totalRows !== undefined && (
        <MetricCard
          icon={Database}
          label="Total Rows"
          value={totalRows.toLocaleString()}
          iconColor="text-indigo-600"
          iconBgColor="bg-indigo-50"
        />
      )}
      {totalColumns !== undefined && (
        <MetricCard
          icon={Columns}
          label="Total Columns"
          value={totalColumns.toString()}
          iconColor="text-violet-600"
          iconBgColor="bg-violet-50"
        />
      )}
      {nullValues !== undefined && (
        <MetricCard
          icon={AlertCircle}
          label="Null Values"
          value={nullValues.toLocaleString()}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-50"
        />
      )}
      {dataQualityScore !== undefined && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500">Data Quality</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-semibold text-slate-900">
                  {dataQualityScore}
                </p>
                <DataQualityBadge score={dataQualityScore} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
