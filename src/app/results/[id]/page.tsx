"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  CheckCircle2,
  Download,
  FileText,
  ArrowRight,
  Loader2,
  Activity,
  Database,
  Columns3,
  AlertTriangle,
} from 'lucide-react';
import { ChartGrid } from '@/components/features';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import type { ChartConfig } from '@/types';
import type { HealthScoreResult } from '@/lib/analyzers/health-score';

interface AnalysisData {
  datasetName: string;
  headers: string[];
  rows: Record<string, unknown>[];
  healthScore: HealthScoreResult | null;
  charts: ChartConfig[];
  insights: any[];
  datasetType: string;
  rowCount: number;
  columnCount: number;
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Poor";
  return "Critical";
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-yellow-600";
  if (score >= 40) return "text-orange-600";
  return "text-red-600";
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
    
    // Redirect to dashboard for backward compatibility
    router.replace(`/dashboard/${datasetId}`);
    return;
    
    // Deprecated: The code below is kept for reference but won't execute
    const parsed = JSON.parse(storedData);
    // Ensure charts and insights are arrays
    parsed.charts = Array.isArray(parsed.charts) ? parsed.charts : [];
    parsed.insights = Array.isArray(parsed.insights) ? parsed.insights : [];
    setData(parsed);
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
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto animate-pulse">
          {/* Skeleton: Hero */}
          <div className="text-center mb-8 space-y-4">
            <div className="h-8 w-40 bg-slate-200 rounded-full mx-auto" />
            <div className="h-12 w-64 bg-slate-200 rounded-lg mx-auto" />
          </div>
          {/* Skeleton: Stats */}
          <div className="flex justify-center gap-3 mb-8 flex-wrap">
            <div className="h-10 w-24 bg-slate-200 rounded-full" />
            <div className="h-10 w-24 bg-slate-200 rounded-full" />
            <div className="h-10 w-24 bg-slate-200 rounded-full" />
          </div>
          {/* Skeleton: Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-10 justify-center">
            <div className="h-12 w-44 bg-slate-200 rounded-xl mx-auto sm:mx-0" />
            <div className="h-12 w-36 bg-slate-200 rounded-xl mx-auto sm:mx-0" />
            <div className="h-12 w-40 bg-slate-200 rounded-xl mx-auto sm:mx-0" />
          </div>
          {/* Skeleton: Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-slate-200 rounded-lg" />
                  <div className="space-y-2 flex-1">
                    <div className="h-3 w-16 bg-slate-200 rounded" />
                    <div className="h-6 w-12 bg-slate-200 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Skeleton: Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 md:p-6">
                <div className="h-5 w-32 bg-slate-200 rounded mb-4" />
                <div className="h-48 md:h-64 bg-slate-100 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const validCharts = Array.isArray(data.charts) ? data.charts : [];
  const missingDataPercent = data.healthScore?.breakdown?.completeness !== undefined
    ? (100 - data.healthScore.breakdown.completeness).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 sm:py-12">
        {/* Hero Section with Filename & Success Badge */}
        <div className="text-center mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm font-semibold shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Analysis Complete
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-slate-900 leading-tight break-words tracking-tight">
            {data.datasetName}
          </h1>
        </div>

        {/* Stats Bar - Pill-shaped Container */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8 flex-wrap">
          <div className="px-3 py-1.5 sm:px-5 sm:py-2 bg-slate-100 hover:bg-slate-200/80 rounded-full text-xs sm:text-sm font-medium text-slate-700 transition-colors duration-200">
            <span className="font-bold text-slate-900">{data.rowCount?.toLocaleString()}</span> rows
          </div>
          <div className="px-3 py-1.5 sm:px-5 sm:py-2 bg-slate-100 hover:bg-slate-200/80 rounded-full text-xs sm:text-sm font-medium text-slate-700 transition-colors duration-200">
            <span className="font-bold text-slate-900">{data.columnCount}</span> columns
          </div>
          {validCharts.length > 0 && (
            <div className="px-3 py-1.5 sm:px-5 sm:py-2 bg-slate-100 hover:bg-slate-200/80 rounded-full text-xs sm:text-sm font-medium text-slate-700 transition-colors duration-200">
              <span className="font-bold text-slate-900">{validCharts.length}</span> charts
            </div>
          )}
        </div>

        {/* Export Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 justify-center items-stretch sm:items-center">
          <button
            onClick={() => handleDownload('pptx')}
            disabled={downloadingPPT}
            className="flex items-center justify-center gap-2 px-5 py-3 sm:px-6 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-orange-200/50 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base"
          >
            {downloadingPPT ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <FileText className="w-4 h-4 sm:w-5 sm:h-5" />}
            Download PowerPoint
          </button>
          <button
            onClick={() => handleDownload('pdf')}
            disabled={downloadingPDF}
            className="flex items-center justify-center gap-2 px-5 py-3 sm:px-6 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-slate-900/20 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base"
          >
            {downloadingPDF ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <Download className="w-4 h-4 sm:w-5 sm:h-5" />}
            Download PDF
          </button>
          <button
            onClick={() => router.push(`/dashboard/${datasetId}`)}
            className="flex items-center justify-center gap-2 px-5 py-3 sm:px-6 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-bold hover:bg-slate-50 hover:border-slate-300 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm sm:text-base"
          >
            View Dashboard
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Summary Cards Row */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-6 sm:mb-8">
          {/* Health Score Card */}
          {data.healthScore && (
            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary-100 flex-shrink-0">
                    <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-500">Health Score</p>
                    <p className={`text-lg sm:text-2xl font-bold ${getScoreColor(data.healthScore.score)}`}>
                      {data.healthScore.score}
                      <span className="text-xs sm:text-sm font-normal text-slate-400">/100</span>
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">{getScoreLabel(data.healthScore.score)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rows Card */}
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-blue-100 flex-shrink-0">
                  <Database className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-slate-500">Rows</p>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900 truncate">
                    {data.rowCount.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Columns Card */}
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-purple-100 flex-shrink-0">
                  <Columns3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-slate-500">Columns</p>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900">
                    {data.columnCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Missing Data Card */}
          {data.healthScore && (
            <Card>
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-orange-100 flex-shrink-0">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-slate-500">Missing Data</p>
                    <p className="text-lg sm:text-2xl font-bold text-slate-900">
                      {missingDataPercent}%
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">Impacts quality</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* AI Insights Section */}
        {data.healthScore && data.healthScore.recommendations && data.healthScore.recommendations.length > 0 && (
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">AI Analysis & Insights</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-3 sm:space-y-4">
                {data.healthScore.recommendations.slice(0, 5).map((rec: string, i: number) => (
                  <div
                    key={i}
                    className="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4 hover:bg-blue-100/60 hover:border-blue-300 transition-colors duration-200"
                  >
                    <h4 className="font-medium text-blue-900 mb-1 text-sm sm:text-base">
                      Insight #{i + 1}
                    </h4>
                    <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts Section - ACTUAL CHARTS */}
        {validCharts.length > 0 ? (
          <div className="mb-6 sm:mb-8">
            <ChartGrid charts={validCharts} />
          </div>
        ) : (
          <Card className="mb-6 sm:mb-8">
            <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
              <p className="text-slate-500 text-sm sm:text-base">No charts generated for this dataset.</p>
            </CardContent>
          </Card>
        )}

        {/* Back to Upload */}
        <div className="text-center mt-8 sm:mt-12 pb-4 sm:pb-0">
          <button
            onClick={() => router.push('/')}
            className="text-xs sm:text-sm text-slate-500 hover:text-slate-900 transition-colors duration-200 px-4 py-2 hover:bg-slate-100 rounded-lg"
          >
            ← Analyze another file
          </button>
        </div>

      </div>
    </div>
  );
}
