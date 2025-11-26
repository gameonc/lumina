"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { BarChart3, ArrowRightLeft } from "lucide-react";
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
  void _charts;
  void _rows;

  const numericColumns = columnStats.filter(
    (col) => col.inferredType === "numeric"
  );

  return (
    <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm">
            <ArrowRightLeft className="h-4 w-4 text-violet-600" />
          </div>
          <CardTitle className="text-base text-slate-800">
            Compare Metrics
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Metric A
            </label>
            <select
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
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
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Metric B
            </label>
            <select
              className="w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
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

        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <div className="mb-4 rounded-full bg-white p-4 shadow-sm">
            <BarChart3 className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-600">
            Select two metrics to compare
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Full comparison feature coming soon
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
