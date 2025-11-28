"use client";

import { Download, FileText, Copy, Loader2 } from "lucide-react";

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
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Title */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">Export & Share</h3>
        <p className="mt-1 text-xs text-slate-500">
          All exports include your latest charts and AI insights.
        </p>
      </div>

      {/* Export buttons row */}
      <div className="flex flex-wrap gap-3">
        {/* PowerPoint - Primary */}
        <button
          onClick={onExportPPTX}
          disabled={isDownloadingPPTX}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
        >
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
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDownloadingPDF ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            <span>PDF</span>
          </button>
        )}

        {/* Copy Insights */}
        {onCopyInsights && (
          <button
            onClick={onCopyInsights}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95"
          >
            <Copy className="h-4 w-4" />
            <span>Copy Insights</span>
          </button>
        )}
      </div>
    </div>
  );
}
