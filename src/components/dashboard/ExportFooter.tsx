import React from 'react';
import { Download, FileText, Copy, ImageDown } from 'lucide-react';

interface ExportFooterProps {
  onExportPPTX: () => void;
  onExportPDF: () => void;
  onCopyInsights: () => void;
  onDownloadCharts: () => void;
  isExporting: boolean;
}

export const ExportFooter: React.FC<ExportFooterProps> = ({
  onExportPPTX,
  onExportPDF,
  onCopyInsights,
  onDownloadCharts,
  isExporting,
}) => {
  return (
    <div className="fixed bottom-0 left-0 w-full z-40 backdrop-blur-lg bg-white/80 rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.08)] border-t border-slate-200/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-center gap-3">
          {/* Primary PowerPoint Button */}
          <button
            onClick={onExportPPTX}
            disabled={isExporting}
            className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl px-5 py-2.5 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>PowerPoint</span>
          </button>

          {/* PDF Button */}
          <button
            onClick={onExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-5 py-2.5 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileText className="w-4 h-4" />
            <span>PDF</span>
          </button>

          {/* Copy Insights Button */}
          <button
            onClick={onCopyInsights}
            disabled={isExporting}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-5 py-2.5 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Insights</span>
          </button>

          {/* Download Charts Button */}
          <button
            onClick={onDownloadCharts}
            disabled={isExporting}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-5 py-2.5 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ImageDown className="w-4 h-4" />
            <span>Charts</span>
          </button>
        </div>
      </div>
    </div>
  );
};
