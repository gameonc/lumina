"use client";

import { FileText, Layers, Hash, CheckCircle } from "lucide-react";
import type { DatasetSummary } from "@/lib/ai/insights-generator";

interface DatasetSummaryCardProps {
  summary: DatasetSummary | null;
  isLoading?: boolean;
}

function SummarySkeleton() {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-6 w-3/4 bg-white/20 rounded" />
          <div className="h-4 w-full bg-white/10 rounded" />
          <div className="h-4 w-2/3 bg-white/10 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/10 rounded-xl p-3">
            <div className="h-3 w-16 bg-white/20 rounded mb-2" />
            <div className="h-5 w-12 bg-white/30 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

const metricIcons: Record<string, React.ReactNode> = {
  "Total Rows": <Layers className="w-4 h-4" />,
  "Columns": <Hash className="w-4 h-4" />,
  "Numeric Fields": <FileText className="w-4 h-4" />,
  "Data Quality": <CheckCircle className="w-4 h-4" />,
};

export function DatasetSummaryCard({ summary, isLoading }: DatasetSummaryCardProps) {
  if (isLoading) {
    return <SummarySkeleton />;
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium">
              AI Summary
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2 leading-tight">
            {summary.headline}
          </h2>
          <p className="text-indigo-100 text-sm sm:text-base leading-relaxed">
            {summary.description}
          </p>
        </div>
      </div>

      {summary.keyMetrics && summary.keyMetrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          {summary.keyMetrics.map((metric, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-3 hover:bg-white/15 transition-colors"
            >
              <div className="flex items-center gap-1.5 text-indigo-200 text-xs mb-1">
                {metricIcons[metric.label] || <FileText className="w-4 h-4" />}
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
