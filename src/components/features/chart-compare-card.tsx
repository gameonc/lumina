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
    <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
            <ArrowRightLeft className="h-4 w-4 text-violet-600" />
          </div>
          <CardTitle className="text-slate-800 text-base">Compare Metrics</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Metric A
            </label>
            <select
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all hover:border-slate-300 cursor-pointer"
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
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Metric B
            </label>
            <select
              className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 outline-none transition-all hover:border-slate-300 cursor-pointer"
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

        <div className="h-64 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <div className="p-4 bg-white rounded-full shadow-sm mb-4">
            <BarChart3 className="h-8 w-8 text-slate-300" />
          </div>
          <p className="text-sm font-medium text-slate-600">
            Select two metrics to compare
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Full comparison feature coming soon
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
