"use client";

import {
  FileSpreadsheet,
  Database,
  Columns,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

interface DatasetHeaderProps {
  fileName: string;
  datasetType?: string | null;
  rowCount: number;
  columnCount: number;
  nullValues: number;
  dataQualityScore: number;
}

function getQualityBadge(score: number): { text: string; color: string } {
  if (score >= 90) return { text: "Excellent", color: "bg-emerald-100 text-emerald-700" };
  if (score >= 75) return { text: "Good", color: "bg-green-100 text-green-700" };
  if (score >= 60) return { text: "Fair", color: "bg-amber-100 text-amber-700" };
  return { text: "Poor", color: "bg-red-100 text-red-700" };
}

export function DatasetHeader({
  fileName,
  datasetType,
  rowCount,
  columnCount,
  nullValues,
  dataQualityScore,
}: DatasetHeaderProps) {
  const qualityBadge = getQualityBadge(dataQualityScore);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left side - File info */}
        <div className="flex items-start gap-4">
          {/* Icon avatar */}
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100">
            <FileSpreadsheet className="h-6 w-6 text-indigo-600" />
          </div>

          {/* File details */}
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-slate-900">{fileName}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              {datasetType && (
                <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium capitalize text-indigo-700">
                  {datasetType}
                </span>
              )}
              <span className="text-sm text-slate-600">
                {rowCount.toLocaleString()} rows • {columnCount} columns
              </span>
            </div>
          </div>
        </div>

        {/* Right side - Stats cluster */}
        <div className="flex flex-wrap gap-4">
          {/* Total Rows stat pill */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <Database className="h-4 w-4 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500">Rows</p>
              <p className="text-sm font-semibold text-slate-900">
                {rowCount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Columns stat pill */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <Columns className="h-4 w-4 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500">Columns</p>
              <p className="text-sm font-semibold text-slate-900">{columnCount}</p>
            </div>
          </div>

          {/* Null Values stat pill */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <AlertCircle className="h-4 w-4 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500">Null Values</p>
              <p className="text-sm font-semibold text-slate-900">
                {nullValues.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Data Quality stat pill with colored badge */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <CheckCircle2 className="h-4 w-4 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500">Quality Score</p>
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">
                  {dataQualityScore}/100
                </p>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${qualityBadge.color}`}
                >
                  {qualityBadge.text}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
