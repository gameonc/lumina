"use client";

import { Download, FileText, Copy, Loader2, Share2 } from "lucide-react";

interface ExportCardProps {
  onExportPPTX: () => void;
  onExportPDF?: () => void;
  onCopyInsights?: () => void;
  isDownloadingPPTX: boolean;
  isDownloadingPDF?: boolean;
}

export function ExportCard({
  onExportPPTX,
  onExportPDF,
  onCopyInsights,
  isDownloadingPPTX,
  isDownloadingPDF = false,
}: ExportCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white via-white to-slate-50/50 p-6 shadow-sm">
      {/* Decorative gradient blob */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-100/50 to-purple-100/50 blur-3xl" />

      <div className="relative">
        {/* Title */}
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
            <Share2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Export & Share</h3>
            <p className="text-xs text-slate-500">
              All exports include charts and AI insights
            </p>
          </div>
        </div>

        {/* Export buttons row */}
        <div className="flex flex-wrap gap-3">
          {/* PowerPoint - Primary */}
          <button
            onClick={onExportPPTX}
            disabled={isDownloadingPPTX}
            className="group relative flex flex-1 items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {/* Shine effect */}
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

            {isDownloadingPPTX ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            <span>PowerPoint</span>
          </button>

          {/* PDF */}
          {onExportPDF && (
            <button
              onClick={onExportPDF}
              disabled={isDownloadingPDF}
              className="flex flex-1 items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDownloadingPDF ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 text-slate-500" />
              )}
              <span>PDF</span>
            </button>
          )}

          {/* Copy Insights */}
          {onCopyInsights && (
            <button
              onClick={onCopyInsights}
              className="flex flex-1 items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-md active:scale-[0.98]"
            >
              <Copy className="h-4 w-4 text-slate-500" />
              <span>Copy Insights</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
