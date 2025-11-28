"use client";

import {
  FileSpreadsheet,
  Database,
  Columns,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface DatasetHeaderProps {
  fileName: string;
  datasetType?: string | null;
  rowCount: number;
  columnCount: number;
  nullValues: number;
  dataQualityScore: number;
}

function getQualityConfig(score: number) {
  if (score >= 90)
    return {
      text: "Excellent",
      gradient: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50",
      text_color: "text-emerald-700",
      ring: "ring-emerald-500/20",
    };
  if (score >= 75)
    return {
      text: "Good",
      gradient: "from-green-500 to-emerald-500",
      bg: "bg-green-50",
      text_color: "text-green-700",
      ring: "ring-green-500/20",
    };
  if (score >= 60)
    return {
      text: "Fair",
      gradient: "from-amber-500 to-orange-500",
      bg: "bg-amber-50",
      text_color: "text-amber-700",
      ring: "ring-amber-500/20",
    };
  return {
    text: "Needs Work",
    gradient: "from-red-500 to-rose-500",
    bg: "bg-red-50",
    text_color: "text-red-700",
    ring: "ring-red-500/20",
  };
}

export function DatasetHeader({
  fileName,
  datasetType,
  rowCount,
  columnCount,
  nullValues,
  dataQualityScore,
}: DatasetHeaderProps) {
  const quality = getQualityConfig(dataQualityScore);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white via-white to-slate-50/80 shadow-sm">
      {/* Subtle gradient orb in background */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-100/40 to-purple-100/40 blur-3xl" />
      <div className="absolute -left-10 bottom-0 h-32 w-32 rounded-full bg-gradient-to-br from-blue-100/30 to-cyan-100/30 blur-2xl" />

      <div className="relative p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Left side - File info */}
          <div className="flex items-start gap-4">
            {/* Gradient icon container */}
            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/25">
                <FileSpreadsheet className="h-7 w-7 text-white" />
              </div>
              {/* Sparkle badge */}
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm ring-2 ring-white">
                <Sparkles className="h-3 w-3 text-indigo-600" />
              </div>
            </div>

            {/* File details */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {fileName}
                </h1>
                {datasetType && (
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-1 text-xs font-semibold capitalize text-indigo-700 ring-1 ring-inset ring-indigo-600/10">
                    {datasetType}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-slate-500">
                Analyzed with AI • Ready for insights
              </p>
            </div>
          </div>

          {/* Right side - Stats cluster */}
          <div className="flex flex-wrap gap-3">
            {/* Rows */}
            <div className="group relative flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-md">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                <Database className="h-4.5 w-4.5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Rows
                </p>
                <p className="text-lg font-bold tabular-nums text-slate-900">
                  {rowCount.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Columns */}
            <div className="group relative flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-md">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                <Columns className="h-4.5 w-4.5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Columns
                </p>
                <p className="text-lg font-bold tabular-nums text-slate-900">
                  {columnCount}
                </p>
              </div>
            </div>

            {/* Null Values */}
            <div className="group relative flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-900/5 transition-all hover:shadow-md">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                <AlertCircle className="h-4.5 w-4.5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Missing
                </p>
                <p className="text-lg font-bold tabular-nums text-slate-900">
                  {nullValues.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Quality Score - Special styling */}
            <div
              className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 shadow-sm ring-1 transition-all hover:shadow-md ${quality.bg} ${quality.ring}`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${quality.gradient} shadow-sm`}
              >
                <CheckCircle2 className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Quality
                </p>
                <div className="flex items-baseline gap-1.5">
                  <p className={`text-lg font-bold tabular-nums ${quality.text_color}`}>
                    {dataQualityScore}
                  </p>
                  <span className="text-xs font-medium text-slate-400">/100</span>
                  <span
                    className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${quality.bg} ${quality.text_color}`}
                  >
                    {quality.text}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
