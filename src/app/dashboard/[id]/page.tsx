"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ToastContainer,
  toast,
} from "@/components/ui";
import {
  ChartGrid,
  ChatInterface,
  KeyInsightsCard,
  DatasetSummaryCard,
  AnomalyBadges,
} from "@/components/features";
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
import type { AIInsights } from "@/lib/ai/insights-generator";

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
  aiInsights?: AIInsights | null;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-slate-200" />
            <div>
              <div className="mb-1 h-5 w-40 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
          <div className="h-10 w-36 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {/* Health Score Skeleton */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex justify-between">
                <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
                <div className="h-8 w-16 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-3/4 animate-pulse rounded-full bg-slate-200" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-pulse rounded bg-slate-200" />
                    <div className="h-4 flex-1 animate-pulse rounded bg-slate-100" />
                  </div>
                ))}
              </div>
            </div>

            {/* Charts Skeleton */}
            <div className="space-y-4">
              <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-72 rounded-2xl border border-slate-200 bg-white p-6"
                  >
                    <div className="mb-4 h-5 w-32 animate-pulse rounded bg-slate-200" />
                    <div className="h-full animate-pulse rounded-xl bg-slate-100" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chat Skeleton */}
          <div className="hidden lg:block">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="h-14 bg-gradient-to-r from-indigo-600 to-indigo-700" />
              <div className="h-[500px] space-y-4 p-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex ${i % 2 === 0 ? "justify-end" : ""}`}
                  >
                    <div
                      className={`h-16 animate-pulse rounded-2xl ${i % 2 === 0 ? "w-2/3 bg-indigo-100" : "w-3/4 bg-slate-100"}`}
                    />
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

  const handleNewChart = useCallback(
    (newChart: ChartConfig) => {
      setCharts((prev) => {
        const updated = [...prev, newChart];
        if (analysisData) {
          const updatedData = { ...analysisData, charts: updated };
          sessionStorage.setItem(
            `analysis-${datasetId}`,
            JSON.stringify(updatedData)
          );
          setAnalysisData(updatedData);
        }
        return updated;
      });
      toast("New chart added! 📊", "success");
    },
    [analysisData, datasetId]
  );

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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">
              Analysis Not Found
            </h2>
            <p className="mb-6 text-center text-slate-500">
              {error || "We couldn't find this analysis. It may have expired."}
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-3 font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:to-indigo-600"
            >
              Upload New File
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const {
    datasetName,
    headers,
    rows,
    healthScore,
    rowCount,
    columnCount,
    aiInsights,
  } = analysisData;
  const score = healthScore?.score ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <ToastContainer />

      {/* Mobile Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsChatOpen(false)}
          />
          <div className="animate-in zoom-in-95 fade-in absolute inset-4 top-12 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl duration-200">
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <span className="font-semibold">Ask AI About Your Data</span>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="rounded-lg p-1 transition-colors hover:bg-white/20"
              >
                <X className="h-5 w-5" />
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
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-lg p-2 transition-colors hover:bg-slate-100"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-100 p-2">
                <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="max-w-[200px] truncate font-semibold text-slate-900 sm:max-w-none">
                  {datasetName}
                </h1>
                <p className="text-xs text-slate-500">
                  {rowCount.toLocaleString()} rows · {columnCount} columns
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Chat Button */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex items-center gap-2 rounded-lg bg-indigo-100 px-3 py-2 font-medium text-indigo-700 lg:hidden"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">AI Chat</span>
            </button>

            <button
              onClick={handleDownloadPPTX}
              disabled={isDownloadingPPTX}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2 font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50"
            >
              {isDownloadingPPTX ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Download PowerPoint</span>
              <span className="sm:hidden">Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Dataset Summary - AI Generated */}
            {aiInsights?.summary && (
              <DatasetSummaryCard summary={aiInsights.summary} />
            )}

            {/* Key Insights - 3 AI Generated Insights */}
            {aiInsights?.keyInsights && aiInsights.keyInsights.length > 0 && (
              <KeyInsightsCard insights={aiInsights.keyInsights} />
            )}

            {/* Health Score Summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Data Quality
                </h2>
                <div
                  className={`text-2xl font-bold ${score >= 80 ? "text-emerald-600" : score >= 60 ? "text-amber-600" : "text-red-600"}`}
                >
                  {score}/100
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${score >= 80 ? "bg-gradient-to-r from-emerald-400 to-emerald-500" : score >= 60 ? "bg-gradient-to-r from-amber-400 to-amber-500" : "bg-gradient-to-r from-red-400 to-red-500"}`}
                  style={{ width: `${score}%` }}
                />
              </div>

              {/* Recommendations */}
              {healthScore?.recommendations &&
                healthScore.recommendations.length > 0 && (
                  <div className="space-y-2">
                    {healthScore.recommendations.slice(0, 3).map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        {rec.toLowerCase().includes("good") ||
                        rec.toLowerCase().includes("complete") ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        ) : (
                          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                        )}
                        <span className="text-slate-600">{rec}</span>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            {/* Anomaly Badges */}
            {aiInsights?.anomalies && aiInsights.anomalies.length > 0 && (
              <AnomalyBadges anomalies={aiInsights.anomalies} />
            )}

            {/* Charts Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-900">Charts</h2>
                {charts.length > 0 && (
                  <span className="text-sm text-slate-500">
                    ({charts.length})
                  </span>
                )}
              </div>

              {charts.length > 0 ? (
                <ChartGrid charts={charts} />
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100">
                    <BarChart3 className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h3 className="mb-2 font-semibold text-slate-900">
                    No charts yet
                  </h3>
                  <p className="mx-auto mb-4 max-w-sm text-slate-500">
                    Use the AI chat to generate charts from your data. Try
                    asking:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      "Show me a bar chart",
                      "Create a pie chart",
                      "Visualize trends",
                    ].map((q) => (
                      <span
                        key={q}
                        className="rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700"
                      >
                        "{q}"
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Chat (Desktop Only) */}
          <div className="hidden h-fit lg:sticky lg:top-24 lg:block">
            <Card className="overflow-hidden border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 py-4 text-white">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-5 w-5" />
                  Ask AI About Your Data
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[500px] p-0">
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
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-110 active:scale-95 lg:hidden"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    </div>
  );
}
