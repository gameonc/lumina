/**
 * Column Statistics Table Component
 *
 * Current Work:
 * - Worker: Auto/Cursor
 * - Task: Display column profiling results in interactive table
 * - Status: in_progress
 */

"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import type { EnhancedColumnStats } from "@/lib/analyzers/column-profiler";
import {
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface ColumnStatsTableProps {
  columnStats: EnhancedColumnStats[];
}

export function ColumnStatsTable({ columnStats }: ColumnStatsTableProps) {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Column Analysis</h3>
        <p className="text-muted-foreground text-sm">
          Detailed statistics and quality metrics for each column
        </p>
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr className="border-b">
              <th className="px-4 py-3 text-left font-medium">Column Name</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Quality</th>
              <th className="px-4 py-3 text-right font-medium">
                Unique Values
              </th>
              <th className="px-4 py-3 text-right font-medium">Missing</th>
              <th className="px-4 py-3 text-right font-medium">Outliers</th>
              <th className="px-4 py-3 text-left font-medium">Stats</th>
            </tr>
          </thead>
          <tbody>
            {columnStats.map((col) => (
              <tr
                key={col.name}
                className="hover:bg-muted/50 border-b last:border-0"
              >
                <td className="px-4 py-3 font-medium">{col.name}</td>
                <td className="px-4 py-3">
                  <TypeBadge type={col.inferredType} />
                </td>
                <td className="px-4 py-3">
                  <QualityIndicator quality={col.quality} />
                </td>
                <td className="px-4 py-3 text-right">
                  {col.uniqueValues.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <MissingDataBadge nullCount={col.nullCount} />
                </td>
                <td className="px-4 py-3 text-right">
                  <OutliersBadge outliers={col.outliers} />
                </td>
                <td className="px-4 py-3">
                  <StatsTooltip stats={col} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {columnStats.length === 0 && (
        <div className="text-muted-foreground py-8 text-center text-sm">
          No column statistics available
        </div>
      )}
    </Card>
  );
}

function TypeBadge({ type }: { type: string }) {
  const typeColors: Record<string, string> = {
    numeric: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    date: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    category:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    text: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    boolean: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
    mixed: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
  };

  return (
    <Badge variant="default" className={typeColors[type] || typeColors.mixed}>
      {type}
    </Badge>
  );
}

function QualityIndicator({
  quality,
}: {
  quality: { completeness: number; consistency: number; uniqueness: number };
}) {
  const avgQuality =
    (quality.completeness + quality.consistency + quality.uniqueness) / 3;

  let icon;
  let color;
  let label;

  if (avgQuality >= 0.9) {
    icon = <CheckCircle2 className="h-4 w-4 text-green-600" />;
    color = "text-green-600";
    label = "Excellent";
  } else if (avgQuality >= 0.7) {
    icon = <CheckCircle2 className="h-4 w-4 text-blue-600" />;
    color = "text-blue-600";
    label = "Good";
  } else if (avgQuality >= 0.5) {
    icon = <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    color = "text-yellow-600";
    label = "Fair";
  } else {
    icon = <AlertCircle className="h-4 w-4 text-red-600" />;
    color = "text-red-600";
    label = "Poor";
  }

  return (
    <Tooltip
      content={
        <div className="space-y-1 text-xs">
          <div>Completeness: {(quality.completeness * 100).toFixed(1)}%</div>
          <div>Consistency: {(quality.consistency * 100).toFixed(1)}%</div>
          <div>Uniqueness: {(quality.uniqueness * 100).toFixed(1)}%</div>
        </div>
      }
    >
      <div className="flex items-center gap-2">
        {icon}
        <span className={`text-sm ${color}`}>{label}</span>
      </div>
    </Tooltip>
  );
}

function MissingDataBadge({ nullCount }: { nullCount: number }) {
  if (nullCount === 0) {
    return <span className="text-muted-foreground text-sm">0</span>;
  }

  const variant =
    nullCount > 100 ? "error" : nullCount > 10 ? "warning" : "default";

  return (
    <Badge variant={variant} className="text-xs">
      {nullCount.toLocaleString()}
    </Badge>
  );
}

function OutliersBadge({
  outliers,
}: {
  outliers?: { count: number; values: (number | string)[]; method: string };
}) {
  if (!outliers || outliers.count === 0) {
    return <span className="text-muted-foreground text-sm">0</span>;
  }

  return (
    <Tooltip
      content={
        <div className="space-y-1 text-xs">
          <div className="font-semibold">Outliers ({outliers.method})</div>
          <div>Count: {outliers.count}</div>
          {outliers.values.length > 0 && (
            <div className="max-w-xs">
              Examples: {outliers.values.slice(0, 3).join(", ")}
              {outliers.values.length > 3 && "..."}
            </div>
          )}
        </div>
      }
    >
      <Badge
        variant="warning"
        className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
      >
        {outliers.count}
      </Badge>
    </Tooltip>
  );
}

function StatsTooltip({ stats }: { stats: EnhancedColumnStats }) {
  const hasStats = stats.mean !== undefined || stats.min !== undefined;

  if (!hasStats) {
    return <span className="text-muted-foreground text-sm">-</span>;
  }

  return (
    <Tooltip
      content={
        <div className="space-y-1 text-xs">
          {stats.min !== undefined && <div>Min: {stats.min}</div>}
          {stats.max !== undefined && <div>Max: {stats.max}</div>}
          {stats.mean !== undefined && <div>Mean: {stats.mean.toFixed(2)}</div>}
          {stats.median !== undefined && <div>Median: {stats.median}</div>}
          {stats.mode !== undefined && <div>Mode: {stats.mode}</div>}
          {stats.standardDeviation !== undefined && (
            <div>Std Dev: {stats.standardDeviation.toFixed(2)}</div>
          )}
          {stats.topCategories && stats.topCategories.length > 0 && (
            <div className="mt-2 border-t pt-1">
              <div className="font-semibold">Top Categories:</div>
              {stats.topCategories.slice(0, 3).map((cat) => (
                <div key={String(cat.value)}>
                  {cat.value}: {cat.percentage.toFixed(1)}%
                </div>
              ))}
            </div>
          )}
        </div>
      }
    >
      <button className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
        <TrendingUp className="h-4 w-4" />
        View
      </button>
    </Tooltip>
  );
}
