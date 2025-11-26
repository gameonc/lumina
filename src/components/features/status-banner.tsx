"use client";

import { CheckCircle2, FileText, Download, Loader2 } from "lucide-react";
import type { HealthScoreResult } from "@/lib/analyzers/health-score";

interface StatusBannerProps {
  datasetName: string;
  rowCount: number;
  columnCount: number;
  healthScore: HealthScoreResult | null;
  onDownloadPPTX: () => void;
  onDownloadPDF: () => void;
  isDownloadingPPTX?: boolean;
  isDownloadingPDF?: boolean;
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Poor";
  return "Critical";
}

function getScoreColor(score: number): string {
  if (score >= 90) return "text-emerald-600";
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-amber-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
}

export function StatusBanner({
  datasetName,
  rowCount,
  columnCount,
  healthScore,
  onDownloadPPTX,
  onDownloadPDF,
  isDownloadingPPTX = false,
  isDownloadingPDF = false,
}: StatusBannerProps) {
  const score = healthScore?.score || 0;
  const label = getScoreLabel(score);
  const scoreColor = getScoreColor(score);

  return (
    <div className="w-full border-b border-emerald-200/50 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 shadow-sm">
      <div className="mx-auto max-w-7xl px-6 py-5">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          {/* Left: Status Message */}
          <div className="flex flex-1 items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/30 ring-2 ring-white/50">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-1 text-sm font-semibold text-emerald-900">
                Analysis complete for{" "}
                <span className="font-bold">{datasetName}</span>
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-emerald-700">
                <span className="font-medium">
                  {rowCount.toLocaleString()} rows
                </span>
                <span className="text-emerald-400">·</span>
                <span className="font-medium">{columnCount} columns</span>
                <span className="text-emerald-400">·</span>
                <span className="font-medium">
                  Health:{" "}
                  <span className={`font-bold ${scoreColor}`}>{score}/100</span>{" "}
                  ({label})
                </span>
              </div>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex w-full flex-col items-stretch gap-2.5 sm:w-auto sm:flex-row sm:items-center">
            <button
              onClick={onDownloadPPTX}
              disabled={isDownloadingPPTX || isDownloadingPDF}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/30 transition-all hover:from-orange-600 hover:to-red-600 hover:shadow-orange-500/40 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDownloadingPPTX ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Download PowerPoint</span>
              <span className="sm:hidden">PPTX</span>
            </button>
            <button
              onClick={onDownloadPDF}
              disabled={isDownloadingPPTX || isDownloadingPDF}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-700 to-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-500/30 transition-all hover:from-slate-600 hover:to-slate-800 hover:shadow-slate-500/40 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isDownloadingPDF ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
