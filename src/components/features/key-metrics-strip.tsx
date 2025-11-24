"use client";

import { Card, CardContent } from "@/components/ui";
import { Sparkline } from "./sparkline";
import type { EnhancedColumnStats } from "@/lib/analyzers/column-profiler";

interface KeyMetricsStripProps {
  columnStats: EnhancedColumnStats[];
  rows: Record<string, unknown>[];
}

export function KeyMetricsStrip({ columnStats, rows }: KeyMetricsStripProps) {
  // Filter for numeric columns
  const numericColumns = columnStats.filter(
    (col) => col.inferredType === "numeric" && col.mean !== undefined
  );

  if (numericColumns.length === 0) {
    return null;
  }

  // Select top 3-4 metrics by priority (prefer columns with higher mean/sum values)
  const sortedMetrics = numericColumns
    .map((col) => {
      // Calculate a priority score based on the column's importance
      const mean = col.mean || 0;
      const max = typeof col.max === "number" ? col.max : 0;
      const min = typeof col.min === "number" ? col.min : 0;
      
      // Priority: higher mean, larger range, more complete data
      const priority = Math.abs(mean) * col.quality.completeness * (max - min);
      
      return { col, priority };
    })
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4);

  // Generate sparkline data for each metric
  const metrics = sortedMetrics.map(({ col }) => {
    // Get last 7-13 data points for sparkline
    const sampleSize = Math.min(13, rows.length);
    const startIndex = Math.max(0, rows.length - sampleSize);
    const sparklineData = rows
      .slice(startIndex)
      .map((row) => {
        const value = row[col.name];
        return typeof value === "number" ? value : 0;
      })
      .filter((v) => !isNaN(v));

    // Calculate display value (sum, average, or max depending on context)
    const allValues = rows
      .map((row) => {
        const value = row[col.name];
        return typeof value === "number" ? value : null;
      })
      .filter((v): v is number => v !== null && !isNaN(v));

    let displayValue: number;
    let displayLabel: string;

    if (allValues.length === 0) {
      displayValue = 0;
      displayLabel = "No data";
    } else if (allValues.every((v) => v >= 0)) {
      // All positive - show sum
      displayValue = allValues.reduce((a, b) => a + b, 0);
      displayLabel = "Total";
    } else {
      // Mixed or negative - show average
      displayValue = allValues.reduce((a, b) => a + b, 0) / allValues.length;
      displayLabel = "Average";
    }

    // Format number appropriately
    const formattedValue = formatNumber(displayValue);

    return {
      name: col.name,
      value: displayValue,
      formattedValue,
      label: displayLabel,
      sparklineData,
    };
  });

  if (metrics.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {metrics.map((metric) => (
        <Card key={metric.name}>
          <CardContent className="p-4">
            <div className="space-y-2">
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                {metric.label}
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                {metric.formattedValue}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {metric.name}
              </p>
              {metric.sparklineData.length > 1 && (
                <div className="h-12 w-full mt-2">
                  <Sparkline data={metric.sparklineData} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function formatNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  if (Math.abs(value) < 1 && Math.abs(value) > 0) {
    return value.toFixed(2);
  }
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
}

