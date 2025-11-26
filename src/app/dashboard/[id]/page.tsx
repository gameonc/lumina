"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, ToastContainer, toast } from "@/components/ui";
import { ChartGrid, ChatInterface } from "@/components/features";
import {
  Loader2,
  AlertCircle,
  Sparkles,
  BarChart3,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  MessageSquare,
  X,
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

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
            <div>
              <div className="h-5 w-40 bg-slate-200 rounded animate-pulse mb-1" />
              <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="h-10 w-36 bg-slate-200 rounded-lg animate-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          <div className="space-y-6">
            {/* Health Score Skeleton */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <div className="flex justify-between mb-4">
                <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
                <div className="h-8 w-16 bg-slate-200 rounded animate-pulse" />
              </div>
              <div className="h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">
                <div className="h-full w-3/4 bg-slate-200 rounded-full animate-pulse" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 flex-1 bg-slate-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Charts Skeleton */}
            <div className="space-y-4">
              <div className="h-6 w-24 bg-slate-200 rounded animate-pulse" />
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 h-72">
                    <div className="h-5 w-32 bg-slate-200 rounded animate-pulse mb-4" />
                    <div className="h-full bg-slate-100 rounded-xl animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Skeleton */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="h-14 bg-gradient-to-r from-indigo-600 to-indigo-700" />
              <div className="h-[500px] p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : ""}`}>
                    <div className={`h-16 rounded-2xl animate-pulse ${i % 2 === 0 ? "w-2/3 bg-indigo-100" : "w-3/4 bg-slate-100"}`} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
  const [isChatOpen, setIsChatOpen] = useState(false);

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
    toast("New chart added! 📊", "success");
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
      toast("PowerPoint downloaded successfully! 🎉", "success");
    } catch {
      toast("Failed to download. Try again.", "error");
    } finally {
      setIsDownloadingPPTX(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Analysis Not Found</h2>
            <p className="text-slate-500 text-center mb-6">
              {error || "We couldn't find this analysis. It may have expired."}
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl font-medium hover:from-indigo-500 hover:to-indigo-600 transition-all shadow-lg shadow-indigo-500/25"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <ToastContainer />

      {/* Mobile Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsChatOpen(false)} />
          <div className="absolute inset-4 top-12 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 fade-in duration-200">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                <span className="font-semibold">Ask AI About Your Data</span>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatInterface
                headers={headers}
                rows={rows}
                onNewChart={handleNewChart}
              />
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="font-semibold text-slate-900 truncate max-w-[200px] sm:max-w-none">
                  {datasetName}
                </h1>
                <p className="text-xs text-slate-500">{rowCount.toLocaleString()} rows · {columnCount} columns</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Chat Button */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-2 bg-indigo-100 text-indigo-700 rounded-lg font-medium"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">AI Chat</span>
            </button>

            <button
              onClick={handleDownloadPPTX}
              disabled={isDownloadingPPTX}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg font-medium hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 transition-all shadow-lg shadow-indigo-500/20"
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
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${score >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : score >= 60 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-red-400 to-red-500'}`}
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
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-900">Charts</h2>
                {charts.length > 0 && (
                  <span className="text-sm text-slate-500">({charts.length})</span>
                )}
              </div>

              {charts.length > 0 ? (
                <ChartGrid charts={charts} />
              ) : (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">No charts yet</h3>
                  <p className="text-slate-500 mb-4 max-w-sm mx-auto">
                    Use the AI chat to generate charts from your data. Try asking:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["Show me a bar chart", "Create a pie chart", "Visualize trends"].map((q) => (
                      <span key={q} className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
                        "{q}"
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Chat (Desktop Only) */}
          <div className="hidden lg:block lg:sticky lg:top-24 h-fit">
            <Card className="shadow-lg border-slate-200 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white py-4">
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

      {/* Mobile Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform z-40"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    </div>
  );
}
