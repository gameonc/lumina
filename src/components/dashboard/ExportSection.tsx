"use client";

import { Download, FileText, Copy, Image, Loader2 } from "lucide-react";
import { toast } from "@/components/ui";

interface ExportSectionProps {
  onExportPPTX: () => void;
  onExportPDF?: () => void;
  onCopyInsights?: () => void;
  onDownloadCharts?: () => void;
  isDownloadingPPTX: boolean;
  isDownloadingPDF?: boolean;
  insights?: string | null;
}

export function ExportSection({
  onExportPPTX,
  onExportPDF,
  onCopyInsights,
  onDownloadCharts,
  isDownloadingPPTX,
  isDownloadingPDF = false,
  insights,
}: ExportSectionProps) {
  const handleCopyInsights = () => {
    if (!insights) {
      toast("No insights available to copy", "error");
      return;
    }
    navigator.clipboard.writeText(insights);
    toast("Insights copied to clipboard!", "success");
  };

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Export Options</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onExportPPTX}
          disabled={isDownloadingPPTX}
          className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
        >
          {isDownloadingPPTX ? (
            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
          ) : (
            <Download className="h-4 w-4 text-indigo-600" />
          )}
          <span className="text-xs">PowerPoint</span>
        </button>

        {onExportPDF && (
          <button
            onClick={onExportPDF}
            disabled={isDownloadingPDF}
            className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
          >
            {isDownloadingPDF ? (
              <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
            ) : (
              <FileText className="h-4 w-4 text-indigo-600" />
            )}
            <span className="text-xs">PDF</span>
          </button>
        )}

        {onCopyInsights && (
          <button
            onClick={handleCopyInsights}
            className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Copy className="h-4 w-4 text-indigo-600" />
            <span className="text-xs">Copy Insights</span>
          </button>
        )}

        {onDownloadCharts && (
          <button
            onClick={onDownloadCharts}
            className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Image className="h-4 w-4 text-indigo-600" />
            <span className="text-xs">Download Charts</span>
          </button>
        )}
      </div>
    </section>
  );
}

