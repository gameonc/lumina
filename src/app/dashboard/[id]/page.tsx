"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ToastContainer, toast } from "@/components/ui";
import { ChatInterface } from "@/components/features";
import {
  MetricsRow,
  AIInsightsCard,
  ChartsGrid,
  SidebarPrompts,
  AskAIBar,
} from "@/components/dashboard";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  FileSpreadsheet,
  Download,
  FileDown,
  Sparkles,
  X,
  MessageSquare,
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
    <div className="min-h-screen bg-slate-50">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
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

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 space-y-8 lg:col-span-8">
            {/* Metrics Skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl bg-slate-200"
                />
              ))}
            </div>

            {/* AI Insights Skeleton */}
            <div className="h-64 animate-pulse rounded-xl bg-slate-200" />

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-xl bg-slate-200"
                />
              ))}
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="hidden lg:col-span-4 lg:block">
            <div className="h-96 animate-pulse rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DatasetPage() {
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
        console.log("[Dashboard] Loading data for:", datasetId);
        console.log("[Dashboard] Raw stored data exists:", !!storedData);

        if (storedData) {
          const parsed = JSON.parse(storedData);
          console.log("[Dashboard] Parsed data keys:", Object.keys(parsed));
          console.log("[Dashboard] Charts in storage:", parsed.charts?.length || 0);
          console.log("[Dashboard] Charts array:", parsed.charts);

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
      toast("New chart added successfully!", "success");
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
      toast("PowerPoint downloaded successfully!", "success");
    } catch {
      toast("Failed to download PowerPoint", "error");
    } finally {
      setIsDownloadingPPTX(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    const textarea = document.querySelector(
      'textarea[placeholder*="Ask"]'
    ) as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = prompt;
      textarea.focus();
    }
  };

  const handleAskAI = (question: string) => {
    // This will be handled by opening the chat interface
    setIsChatOpen(true);
    setTimeout(() => {
      const textarea = document.querySelector(
        'textarea[placeholder*="Ask"]'
      ) as HTMLTextAreaElement;
      if (textarea) {
        textarea.value = question;
        textarea.focus();
      }
    }, 100);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !analysisData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-slate-900">
            Analysis Not Found
          </h2>
          <p className="mb-6 text-slate-500">
            {error || "We couldn't find this analysis. It may have expired."}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            Upload New File
          </button>
        </div>
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

  // Calculate null values
  const nullValues =
    analysisData.columnStats?.reduce(
      (sum, stat) => sum + (stat.nullCount || 0),
      0
    ) || 0;

  // Smart prompts for the AI chat
  const smartPrompts = [
    "What are the top spending trends?",
    "Find anomalies or unusual patterns",
    "Show me risk flags in this data",
    "Which days had the highest total spend?",
    "Generate 3 charts that explain this dataset",
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <ToastContainer />

      {/* Mobile Chat Modal */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsChatOpen(false)}
          />
          <div className="absolute inset-4 top-12 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
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

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="rounded-lg p-2 transition-colors hover:bg-slate-100"
              aria-label="Go back"
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
            >
              <MessageSquare className="h-4 w-4" />
            </button>

            <button
              onClick={handleDownloadPPTX}
              disabled={isDownloadingPPTX}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {isDownloadingPPTX ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              <span className="hidden sm:inline">Download PowerPoint</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Content - 8 columns */}
          <div className="col-span-12 space-y-8 lg:col-span-8">
            {/* Row 1: Metrics */}
            <MetricsRow
              totalRows={rowCount}
              totalColumns={columnCount}
              nullValues={nullValues}
              dataQualityScore={score}
            />

            {/* Row 2: AI Insights */}
            {aiInsights?.keyInsights && aiInsights.keyInsights.length > 0 && (
              <AIInsightsCard insights={aiInsights.keyInsights} />
            )}

            {/* Row 3: Charts Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Visualizations
                </h2>
                {charts.length > 0 && (
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                    {charts.length} {charts.length === 1 ? "chart" : "charts"}
                  </span>
                )}
              </div>
              <ChartsGrid charts={charts} />
            </div>

            {/* Row 4: Actions Bar */}
            <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <button
                onClick={handleDownloadPPTX}
                disabled={isDownloadingPPTX}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                {isDownloadingPPTX ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileDown className="h-4 w-4" />
                )}
                Export PDF
              </button>
              <button
                onClick={handleDownloadPPTX}
                disabled={isDownloadingPPTX}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Export PowerPoint
              </button>
            </div>
          </div>

          {/* Right Sidebar - 4 columns */}
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-24">
              <SidebarPrompts
                prompts={smartPrompts}
                insights={aiInsights?.keyInsights}
                onPromptClick={handlePromptClick}
              />
            </div>
          </aside>
        </div>
      </main>

      {/* Sticky Ask AI Bar */}
      <AskAIBar onSubmit={handleAskAI} />

      {/* Mobile Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg transition-transform hover:scale-110 active:scale-95 lg:hidden"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    </div>
  );
}
