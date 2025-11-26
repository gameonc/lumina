"use client";

import { FileText, Layers, Hash, CheckCircle } from "lucide-react";
import type { DatasetSummary } from "@/lib/ai/insights-generator";

interface DatasetSummaryCardProps {
  summary: DatasetSummary | null;
  isLoading?: boolean;
}

function SummarySkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-6 w-3/4 rounded bg-white/20" />
          <div className="h-4 w-full rounded bg-white/10" />
          <div className="h-4 w-2/3 rounded bg-white/10" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-white/10 p-3">
            <div className="mb-2 h-3 w-16 rounded bg-white/20" />
            <div className="h-5 w-12 rounded bg-white/30" />
          </div>
        ))}
      </div>
    </div>
  );
}

const metricIcons: Record<string, React.ReactNode> = {
  "Total Rows": <Layers className="h-4 w-4" />,
  Columns: <Hash className="h-4 w-4" />,
  "Numeric Fields": <FileText className="h-4 w-4" />,
  "Data Quality": <CheckCircle className="h-4 w-4" />,
};

export function DatasetSummaryCard({
  summary,
  isLoading,
}: DatasetSummaryCardProps) {
  if (isLoading) {
    return <SummarySkeleton />;
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 text-white shadow-lg shadow-indigo-500/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
              AI Summary
            </span>
          </div>
          <h2 className="mb-2 text-xl font-bold leading-tight sm:text-2xl">
            {summary.headline}
          </h2>
          <p className="text-sm leading-relaxed text-indigo-100 sm:text-base">
            {summary.description}
          </p>
        </div>
      </div>

      {summary.keyMetrics && summary.keyMetrics.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summary.keyMetrics.map((metric, index) => (
            <div
              key={index}
              className="rounded-xl bg-white/10 p-3 backdrop-blur-sm transition-colors hover:bg-white/15"
            >
              <div className="mb-1 flex items-center gap-1.5 text-xs text-indigo-200">
                {metricIcons[metric.label] || <FileText className="h-4 w-4" />}
                <span>{metric.label}</span>
              </div>
              <p className="text-lg font-bold">{metric.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
