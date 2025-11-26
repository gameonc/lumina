"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ChartGrid, ChatInterface } from "@/components/features";
import {
  Loader2,
  AlertCircle,
  Sparkles,
  BarChart3,
  FileSpreadsheet,
  Download,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import type { ChartConfig } from "@/types";
import type { HealthScoreResult } from "@/lib/analyzers/health-score";
import type { EnhancedColumnStats } from "@/lib/analyzers/column-profiler";

interface AnalysisData {
  datasetName: string;
  headers: string[];
  rows: Record<string, unknown>[];
  healthScore: HealthScoreResult | null;
  charts: ChartConfig[];
  insights: string[];
  datasetType: string | null;
  rowCount: number;
  columnCount: number;
  columnStats?: EnhancedColumnStats[];
}

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const datasetId = params.id as string;

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [charts, setCharts] = useState<ChartConfig[]>([]);
  const [isDownloadingPPTX, setIsDownloadingPPTX] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = sessionStorage.getItem(`analysis-${datasetId}`);
        if (storedData) {
          const parsed = JSON.parse(storedData);
          parsed.charts = Array.isArray(parsed.charts) ? parsed.charts : [];
          setAnalysisData(parsed);
          setCharts(parsed.charts);
          setIsLoading(false);
          return;
        }
        setError("No analysis data found.");
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load:", err);
        setError("Failed to load analysis.");
        setIsLoading(false);
      }
    };
    loadData();
  }, [datasetId]);

  const handleNewChart = useCallback((newChart: ChartConfig) => {
    setCharts((prev) => {
      const updated = [...prev, newChart];
      if (analysisData) {
        const updatedData = { ...analysisData, charts: updated };
        sessionStorage.setItem(`analysis-${datasetId}`, JSON.stringify(updatedData));
        setAnalysisData(updatedData);
      }
      return updated;
    });
  }, [analysisData, datasetId]);

  const handleDownloadPPTX = async () => {
    if (!analysisData) return;
    setIsDownloadingPPTX(true);
    try {
      const response = await fetch("/api/reports/pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetName: analysisData.datasetName,
          healthScore: analysisData.healthScore,
          charts,
          insights: analysisData.insights || [],
          datasetType: analysisData.datasetType || "general",
          rowCount: analysisData.rowCount,
          columnCount: analysisData.columnCount,
        }),
      });
      if (!response.ok) throw new Error("Failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${analysisData.datasetName.replace(/\s+/g, "_")}_Report.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      alert("Failed to download. Try again.");
    } finally {
      setIsDownloadingPPTX(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-violet-600" />
          <p className="mt-4 text-slate-600">Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">{error}</h2>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-500"
            >
              Upload New File
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { datasetName, headers, rows, healthScore, rowCount, columnCount } = analysisData;
  const score = healthScore?.score ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/")}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <FileSpreadsheet className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-none">
                  {datasetName}
                </h1>
                <p className="text-xs text-slate-500">{rowCount} rows · {columnCount} columns</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownloadPPTX}
            disabled={isDownloadingPPTX}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg font-medium hover:bg-violet-500 disabled:opacity-50 transition-all"
          >
            {isDownloadingPPTX ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Download PowerPoint</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

          {/* Left Column */}
          <div className="space-y-6">
            {/* Health Score Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Data Quality</h2>
                <div className={`text-2xl font-bold ${score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                  {score}/100
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all ${score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${score}%` }}
                />
              </div>

              {/* Recommendations */}
              {healthScore?.recommendations && healthScore.recommendations.length > 0 && (
                <div className="space-y-2">
                  {healthScore.recommendations.slice(0, 3).map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      {rec.toLowerCase().includes('good') || rec.toLowerCase().includes('complete') ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                      )}
                      <span className="text-slate-600">{rec}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Charts Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-violet-600" />
                <h2 className="text-lg font-semibold text-slate-900">Charts</h2>
                {charts.length > 0 && (
                  <span className="text-sm text-slate-500">({charts.length})</span>
                )}
              </div>

              {charts.length > 0 ? (
                <ChartGrid charts={charts} />
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center">
                  <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 mb-1">No charts yet</p>
                  <p className="text-sm text-slate-400">Use the AI chat to generate charts from your data</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Chat */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card className="shadow-lg border-slate-200 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="w-5 h-5" />
                  Ask AI About Your Data
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[500px]">
                <ChatInterface
                  headers={headers}
                  rows={rows}
                  onNewChart={handleNewChart}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
