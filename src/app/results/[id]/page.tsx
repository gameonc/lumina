"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  CheckCircle2,
  Download,
  LayoutDashboard,
  FileText,
  ArrowRight,
  Loader2,
  BarChart3
} from 'lucide-react';

interface AnalysisData {
  datasetName: string;
  headers: string[];
  rows: Record<string, unknown>[];
  healthScore: any;
  charts: any[];
  insights: any[];
  datasetType: string;
  rowCount: number;
  columnCount: number;
}

export default function ResultsPage() {
  const router = useRouter();
  const params = useParams();
  const datasetId = params.id as string;

  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPPT, setDownloadingPPT] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);

  useEffect(() => {
    const storedData = sessionStorage.getItem(`analysis-${datasetId}`);
    if (!storedData) {
      router.push('/');
      return;
    }
    setData(JSON.parse(storedData));
    setLoading(false);
  }, [datasetId, router]);

  const handleDownload = async (type: 'pptx' | 'pdf') => {
    if (!data) return;
    const isPPT = type === 'pptx';
    isPPT ? setDownloadingPPT(true) : setDownloadingPDF(true);

    try {
      const endpoint = isPPT ? '/api/reports/pptx' : '/api/reports/export';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetName: data.datasetName,
          healthScore: data.healthScore,
          charts: data.charts,
          insights: data.insights || [],
          datasetType: data.datasetType,
          rowCount: data.rowCount,
          columnCount: data.columnCount,
        }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${data.datasetName.replace(/\s+/g, '_')}_Report.${isPPT ? 'pptx' : 'pdf'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      console.error(error);
      alert(`Failed to download ${type.toUpperCase()}. Please try again.`);
    } finally {
      isPPT ? setDownloadingPPT(false) : setDownloadingPDF(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const validCharts = Array.isArray(data.charts) ? data.charts : [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-12 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 text-emerald-600 rounded-full mb-4 ring-8 ring-emerald-50">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900">Analysis Complete</h1>
          <p className="text-lg text-slate-500">
            We&apos;ve successfully analyzed <span className="font-semibold text-slate-900">{data.datasetName}</span>.
            <br /> Your report is ready for export.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-500">
            <span>{data.rowCount?.toLocaleString()} rows</span>
            <span>•</span>
            <span>{data.columnCount} columns</span>
            <span>•</span>
            <span>{validCharts.length} charts generated</span>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">

          {/* Main Action: Download PPT */}
          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center hover:border-blue-200 transition-all group">
            <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">PowerPoint Presentation</h3>
            <p className="text-slate-500 mb-8 max-w-xs">Editable slides with native charts, insights, and executive summary.</p>
            <button
              onClick={() => handleDownload('pptx')}
              disabled={downloadingPPT}
              className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20 active:scale-95 disabled:opacity-70"
            >
              {downloadingPPT ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              Download .PPTX
            </button>
          </div>

          {/* Secondary Action: Dashboard */}
          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center hover:border-blue-200 transition-all group">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Interactive Dashboard</h3>
            <p className="text-slate-500 mb-8 max-w-xs">Deep dive into your data, build custom charts, and chat with AI.</p>
            <button
              onClick={() => router.push(`/dashboard/${datasetId}`)}
              className="w-full py-3.5 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              View Dashboard
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PDF Download Option */}
        <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
          <div className="bg-white p-6 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <Download className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900">PDF Report</h4>
                <p className="text-sm text-slate-500">Printable document with all insights</p>
              </div>
            </div>
            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloadingPDF}
              className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all flex items-center gap-2 disabled:opacity-70"
            >
              {downloadingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download PDF
            </button>
          </div>
        </div>

        {/* Preview Section */}
        {validCharts.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="flex items-center justify-between mb-6 px-2">
              <h3 className="font-bold text-slate-500 uppercase tracking-wider text-sm">Preview generated charts</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {validCharts.slice(0, 4).map((chart: any, i: number) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-slate-200 h-40 flex flex-col items-center justify-center group hover:border-blue-200 transition-colors">
                  <BarChart3 className="w-10 h-10 text-slate-300 group-hover:text-blue-400 transition-colors mb-3" />
                  <div className="text-xs font-medium text-slate-600 text-center truncate w-full px-2">
                    {chart.title || `${chart.type?.charAt(0).toUpperCase()}${chart.type?.slice(1)} Chart`}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    {chart.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back to Upload */}
        <div className="text-center mt-12">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            ← Analyze another file
          </button>
        </div>

      </div>
    </div>
  );
}
