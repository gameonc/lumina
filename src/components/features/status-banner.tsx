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

  return (
    <div className="w-full bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-200 dark:from-emerald-950/20 dark:to-teal-950/20 dark:border-emerald-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: Status Message */}
          <div className="flex items-center gap-3 flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">
                Analysis complete for <span className="font-bold">{datasetName}</span>
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                {rowCount.toLocaleString()} rows · {columnCount} columns · Health: {score}/100 ({label})
              </p>
            </div>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={onDownloadPPTX}
              disabled={isDownloadingPPTX || isDownloadingPDF}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed text-sm"
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
              className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed text-sm dark:bg-slate-800 dark:hover:bg-slate-700"
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

