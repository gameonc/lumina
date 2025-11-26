"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { BarChart3 } from "lucide-react";
import type { EnhancedColumnStats } from "@/lib/analyzers/column-profiler";
import type { ChartConfig } from "@/types";

interface ChartCompareCardProps {
  columnStats: EnhancedColumnStats[];
  charts: ChartConfig[];
  rows: Record<string, unknown>[];
}

export function ChartCompareCard({
  columnStats,
  charts: _charts,
  rows: _rows,
}: ChartCompareCardProps) {
  // Note: charts and rows will be used in future implementation
  void _charts;
  void _rows;
  // Get numeric columns for dropdown
  const numericColumns = columnStats.filter(
    (col) => col.inferredType === "numeric"
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compare Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropdowns */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Metric A
            </label>
            <select
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white dark:bg-neutral-800 dark:border-neutral-600 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              defaultValue=""
            >
              <option value="">Select metric...</option>
              {numericColumns.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Metric B
            </label>
            <select
              className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white dark:bg-neutral-800 dark:border-neutral-600 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              defaultValue=""
            >
              <option value="">Select metric...</option>
              {numericColumns.map((col) => (
                <option key={col.name} value={col.name}>
                  {col.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Placeholder Chart Area */}
        <div className="h-64 flex items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="text-center space-y-2">
            <BarChart3 className="h-12 w-12 text-neutral-400 mx-auto" />
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
              Select two metrics to compare
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-500">
              Full comparison feature coming soon
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

