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
  Calendar,
  TrendingUp,
  Database,
  Layers,
  Hash,
  Activity,
  Zap,
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
            {/* Hero Skeleton */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="mb-4 h-8 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="mb-6 h-4 w-1/2 animate-pulse rounded bg-slate-100" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="rounded-xl bg-slate-50 p-4">
                    <div className="mb-2 h-3 w-16 animate-pulse rounded bg-slate-200" />
                    <div className="h-6 w-12 animate-pulse rounded bg-slate-200" />
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

  // Smart prompts for the AI chat
  const smartPrompts = [
    "What are the top spending trends?",
    "Find anomalies or unusual patterns",
    "Show me risk flags in this data",
    "Which days had the highest total spend?",
    "Generate 3 charts that explain this dataset",
  ];

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
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-lg p-2 transition-colors hover:bg-slate-100"
              aria-label="Go back to dashboard"
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
              className="flex items-center gap-2 rounded-lg bg-indigo-100 px-3 py-2 font-medium text-indigo-700 transition-colors hover:bg-indigo-200 lg:hidden"
              aria-label="Open AI chat"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">AI Chat</span>
            </button>

            <button
              onClick={handleDownloadPPTX}
              disabled={isDownloadingPPTX}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-700 px-4 py-2 font-medium text-white shadow-lg shadow-indigo-500/20 transition-all hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50"
              aria-label="Download PowerPoint report"
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
            {/* 1. TOP HERO SECTION */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/30 p-6 shadow-sm">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                {/* Left Side - Dataset Info */}
                <div className="flex-1">
                  <h2 className="mb-2 text-2xl font-semibold text-slate-900">
                    {aiInsights?.summary?.headline || datasetName}
                  </h2>
                  <p className="mb-3 text-sm leading-relaxed text-slate-600">
                    {aiInsights?.summary?.description ||
                      `Analysis of ${rowCount.toLocaleString()} records across ${columnCount} columns.`}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Uploaded {new Date().toLocaleDateString()}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1.5">
                      <Database className="h-3.5 w-3.5" />
                      <span>
                        {(rowCount * columnCount).toLocaleString()} cells
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side - Quick Summary */}
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <div
                    className={`rounded-full px-3 py-1.5 text-sm font-medium ${
                      score >= 80
                        ? "bg-emerald-100 text-emerald-700"
                        : score >= 60
                          ? "bg-amber-100 text-amber-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    Quality:{" "}
                    {score >= 80
                      ? "Excellent"
                      : score >= 60
                        ? "Good"
                        : "Needs Review"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Activity className="h-4 w-4" />
                    <span>{score}/100 Health Score</span>
                  </div>
                </div>
              </div>

              {/* 2. METRICS ROW - Stats Cards */}
              {aiInsights?.summary?.keyMetrics &&
                aiInsights.summary.keyMetrics.length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {aiInsights.summary.keyMetrics.map((metric, index) => {
                      const icons = {
                        "Total Rows": <Layers className="h-4 w-4" />,
                        Columns: <Hash className="h-4 w-4" />,
                        "Numeric Fields": <TrendingUp className="h-4 w-4" />,
                        "Data Quality": <CheckCircle2 className="h-4 w-4" />,
                      };
                      const Icon = icons[
                        metric.label as keyof typeof icons
                      ] || <Zap className="h-4 w-4" />;

                      return (
                        <div
                          key={index}
                          className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-indigo-300 hover:shadow-sm"
                        >
                          <div className="mb-2 flex items-center gap-2">
                            <div className="rounded-lg bg-indigo-100 p-1.5 text-indigo-600">
                              {Icon}
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-slate-900">
                            {metric.value}
                          </div>
                          <div className="text-xs text-slate-500">
                            {metric.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
            </div>

            {/* 3. KEY INSIGHTS & DATA ALERTS */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Key Insights */}
              {aiInsights?.keyInsights && aiInsights.keyInsights.length > 0 && (
                <KeyInsightsCard insights={aiInsights.keyInsights} />
              )}

              {/* Data Alerts */}
              {aiInsights?.anomalies && aiInsights.anomalies.length > 0 && (
                <AnomalyBadges anomalies={aiInsights.anomalies} />
              )}
            </div>

            {/* Data Quality Summary */}
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

            {/* 4. CHARTS SECTION */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-900">Charts</h2>
                {charts.length > 0 && (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                    {charts.length}
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
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">
                    Generate charts from your data
                  </h3>
                  <p className="mx-auto mb-6 max-w-md text-sm text-slate-500">
                    Use the AI chat to create visualizations. Try these quick
                    actions:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {[
                      "Bar chart by day",
                      "Trend over time",
                      "Amount distribution",
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => {
                          setIsChatOpen(true);
                        }}
                        className="rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 5. RIGHT-SIDE AI PANEL (Desktop) */}
          <div className="hidden h-fit lg:sticky lg:top-24 lg:block">
            <Card className="overflow-hidden border-slate-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-700 py-4 text-white">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-5 w-5" />
                  Ask AI About Your Data
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Smart Prompts */}
                <div className="border-b border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-xs font-medium text-slate-600">
                    SMART PROMPTS
                  </p>
                  <div className="space-y-2">
                    {smartPrompts.map((prompt, index) => (
                      <button
                        key={index}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-sm text-slate-700 transition-all hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                        onClick={() => {
                          // This will be handled by the chat interface
                          const textarea = document.querySelector(
                            'textarea[placeholder*="Ask"]'
                          ) as HTMLTextAreaElement;
                          if (textarea) {
                            textarea.value = prompt;
                            textarea.focus();
                          }
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" />
                          <span className="leading-snug">{prompt}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Interface */}
                <div className="h-[500px]">
                  <ChatInterface
                    headers={headers}
                    rows={rows}
                    onNewChart={handleNewChart}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-transform hover:scale-110 active:scale-95 lg:hidden"
        aria-label="Open AI chat"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    </div>
  );
}
