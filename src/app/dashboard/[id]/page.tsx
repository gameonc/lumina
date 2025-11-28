"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ToastContainer, toast } from "@/components/ui";
import { ChatInterface } from "@/components/features";
import {
  ChartsGrid,
  AskAIBar,
  CollapsibleSection,
  DatasetHeader,
  InsightsZone,
  AiSidebar,
  ExportCard,
} from "@/components/dashboard";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  FileSpreadsheet,
  Download,
  X,
  MessageSquare,
  PieChartIcon,
  BarChart3,
  Activity,
  TrendingUp,
} from "lucide-react";
import type { ChartConfig } from "@/types";
import type { HealthScoreResult } from "@/lib/analyzers/health-score";
import type { EnhancedColumnStats } from "@/lib/analyzers/column-profiler";
import type { AIInsights } from "@/lib/ai/insights-generator";
import type { BusinessMetrics } from "@/lib/analyzers/business-metrics";

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
  businessMetrics?: BusinessMetrics | null;
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/80">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-gradient-to-br from-slate-200 to-slate-100" />
            <div>
              <div className="mb-1.5 h-5 w-44 animate-pulse rounded-lg bg-slate-200" />
              <div className="h-3 w-28 animate-pulse rounded-md bg-slate-100" />
            </div>
          </div>
          <div className="h-10 w-32 animate-pulse rounded-xl bg-gradient-to-r from-indigo-200 to-purple-200" />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Dataset Header Skeleton */}
            <div className="h-28 animate-pulse rounded-2xl bg-gradient-to-br from-slate-100 to-white ring-1 ring-slate-200/60" />

            {/* Insights Skeleton */}
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="h-64 animate-pulse rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 ring-1 ring-emerald-200/60" />
              <div className="space-y-4 lg:col-span-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-24 animate-pulse rounded-xl bg-gradient-to-br from-slate-50 to-white ring-1 ring-slate-200/60"
                  />
                ))}
              </div>
            </div>

            {/* Charts Skeleton */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-[340px] animate-pulse rounded-2xl bg-gradient-to-br from-slate-100 to-white ring-1 ring-slate-200/60"
                />
              ))}
            </div>
          </div>

          {/* Sidebar Skeleton */}
          <div className="hidden lg:col-span-4 lg:block">
            <div className="h-[500px] animate-pulse rounded-2xl bg-gradient-to-br from-slate-100 to-white ring-1 ring-slate-200/60" />
          </div>
        </div>
      </main>
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
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isQuickActionLoading, setIsQuickActionLoading] = useState(false);

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

  const handleDownloadPDF = async () => {
    if (!analysisData) return;
    setIsDownloadingPDF(true);
    try {
      const response = await fetch("/api/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetName: analysisData.datasetName,
          healthScore: analysisData.healthScore,
          charts: charts.slice(0, 12),
          insights: analysisData.aiInsights?.keyInsights || [],
          datasetType: analysisData.datasetType || "general",
        }),
      });
      if (!response.ok) throw new Error("Failed");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${analysisData.datasetName.replace(/\s+/g, "_")}_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast("PDF downloaded successfully!", "success");
    } catch {
      toast("Failed to download PDF", "error");
    } finally {
      setIsDownloadingPDF(false);
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

  const handleQuickAction = useCallback(
    async (action: "generate-charts" | "detect-anomalies" | "analyze-trends") => {
      if (!analysisData || isQuickActionLoading) return;

      const prompts = {
        "generate-charts": "Generate 3 different charts that best visualize and explain this dataset",
        "detect-anomalies": "Find all anomalies, outliers, and unusual patterns in this data. Create a chart if relevant.",
        "analyze-trends": "What are the top 3 trends in this data? Create a chart showing the most important trend.",
      };

      const actionNames = {
        "generate-charts": "Generating charts",
        "detect-anomalies": "Detecting anomalies",
        "analyze-trends": "Analyzing trends",
      };

      setIsQuickActionLoading(true);
      toast(`${actionNames[action]}...`, "info");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: prompts[action],
            headers: analysisData.headers,
            rows: analysisData.rows,
            conversationHistory: [],
          }),
        });

        const result = await response.json();

        if (result.success && result.data) {
          if (result.data.chart) {
            handleNewChart(result.data.chart);
          }
          toast(result.data.message?.slice(0, 100) || "Action completed!", "success");
        } else {
          toast(result.error || "Something went wrong", "error");
        }
      } catch (err) {
        console.error("Quick action error:", err);
        toast("Failed to perform action. Please try again.", "error");
      } finally {
        setIsQuickActionLoading(false);
      }
    },
    [analysisData, isQuickActionLoading, handleNewChart]
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !analysisData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50/80 p-6">
        <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-8 shadow-xl ring-1 ring-slate-900/5">
          {/* Decorative gradient blob */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-red-100/50 to-rose-100/50 blur-3xl" />
          
          <div className="relative">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-500 shadow-lg shadow-red-500/20">
              <AlertCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-2 text-xl font-bold tracking-tight text-slate-900">
              Analysis Not Found
            </h2>
            <p className="mb-6 text-slate-500">
              {error || "We couldn't find this analysis. It may have expired."}
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98]"
            >
              {/* Shine effect */}
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <span className="relative">Upload New File</span>
            </button>
          </div>
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

  // Limit charts to 12 max
  const prioritizedCharts = charts.slice(0, 12);

  // Group charts by type
  const groupedCharts = {
    distribution: prioritizedCharts.filter(
      (c) => c.type === "pie" || c.type === "histogram"
    ),
    trends: prioritizedCharts.filter(
      (c) => c.type === "line" || c.type === "area"
    ),
    comparisons: prioritizedCharts.filter((c) => c.type === "bar"),
    relationships: prioritizedCharts.filter((c) => c.type === "scatter"),
  };

  // Smart prompts for the AI chat
  const smartPrompts = [
    "Break this data down for me",
    "Find anomalies or unusual patterns",
    "Show me risk flags in this data",
    "Give me 5 key insights",
    "Generate 3 charts that explain this dataset",
    "What are the top trends?",
    "Compare the most important metrics",
  ];

  // Format insights for copy
  const insightsText = aiInsights?.keyInsights
    ?.map((i) => `${i.title}: ${i.description}`)
    .join("\n\n") || "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/80 pb-24">
      <ToastContainer />

      {/* Mobile Chat Modal - Premium Style */}
      {isChatOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
            onClick={() => setIsChatOpen(false)}
          />
          <div className="absolute inset-3 top-10 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5">
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20">
                  <MessageSquare className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white">AI Assistant</span>
                  <p className="text-xs text-indigo-200">Ask anything about your data</p>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
              >
                <X className="h-4 w-4 text-white" />
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

      {/* Header - Premium Style */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 transition-all hover:bg-slate-200 active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                <FileSpreadsheet className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="max-w-[180px] truncate font-bold tracking-tight text-slate-900 sm:max-w-none">
                  {datasetName}
                </h1>
                <p className="text-xs text-slate-500">
                  Dataset Dashboard
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Mobile Chat Button */}
            <button
              onClick={() => setIsChatOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 transition-all hover:bg-indigo-200 active:scale-95 lg:hidden"
            >
              <MessageSquare className="h-4 w-4" />
            </button>

          <button
            onClick={handleDownloadPPTX}
            disabled={isDownloadingPPTX}
              className="group relative flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-50"
          >
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            {isDownloadingPPTX ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Download className="h-4 w-4" />
            )}
              <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>
      </header>

      {/* Main Content - 2-COLUMN LAYOUT */}
      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT COLUMN - Main Content */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* 1. DATASET HEADER */}
            <DatasetHeader
              fileName={datasetName}
              datasetType={analysisData.datasetType}
              rowCount={rowCount}
              columnCount={columnCount}
              nullValues={nullValues}
              dataQualityScore={score}
            />

            {/* 2. INSIGHTS ZONE */}
            <InsightsZone
              aiInsights={aiInsights}
              healthScore={healthScore}
            />

            {/* 3. VISUALIZATIONS SECTION */}
            <section className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">Visualizations</h2>
                  <p className="text-sm text-slate-500">Interactive charts from your data</p>
                </div>
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                  {prioritizedCharts.length} charts
                </span>
              </div>

              {groupedCharts.distribution.length > 0 && (
                <CollapsibleSection
                  title={`Distributions (${groupedCharts.distribution.length})`}
                  defaultOpen={true}
                  icon={<PieChartIcon className="h-4 w-4 text-indigo-600" />}
                >
                  <ChartsGrid charts={groupedCharts.distribution} />
                </CollapsibleSection>
              )}

              {groupedCharts.trends.length > 0 && (
                <CollapsibleSection
                  title={`Trends (${groupedCharts.trends.length})`}
                  defaultOpen={true}
                  icon={<TrendingUp className="h-4 w-4 text-indigo-600" />}
                >
                  <ChartsGrid charts={groupedCharts.trends} />
                </CollapsibleSection>
              )}

              {groupedCharts.comparisons.length > 0 && (
                <CollapsibleSection
                  title={`Comparisons (${groupedCharts.comparisons.length})`}
                  defaultOpen={true}
                  icon={<BarChart3 className="h-4 w-4 text-indigo-600" />}
                >
                  <ChartsGrid charts={groupedCharts.comparisons} />
                </CollapsibleSection>
              )}

              {groupedCharts.relationships.length > 0 && (
                <CollapsibleSection
                  title={`Relationships (${groupedCharts.relationships.length})`}
                  defaultOpen={true}
                  icon={<Activity className="h-4 w-4 text-indigo-600" />}
                >
                  <ChartsGrid charts={groupedCharts.relationships} />
                </CollapsibleSection>
              )}

              {prioritizedCharts.length === 0 && (
                <div className="relative overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white p-12 text-center">
                  {/* Decorative blob */}
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-indigo-100/40 to-purple-100/40 blur-3xl" />
                  <div className="relative">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                      <BarChart3 className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="mb-2 font-bold text-slate-900">No charts yet</h3>
                    <p className="text-sm text-slate-500">
                      Use the AI chat to generate visualizations from your data
                    </p>
              </div>
                </div>
              )}
            </section>

            {/* 4. EXPORT CARD */}
            <ExportCard
              onExportPPTX={handleDownloadPPTX}
              onExportPDF={handleDownloadPDF}
              onCopyInsights={() => {
                if (insightsText) {
                  navigator.clipboard.writeText(insightsText);
                  toast("Insights copied to clipboard!", "success");
                }
              }}
              isDownloadingPPTX={isDownloadingPPTX}
              isDownloadingPDF={isDownloadingPDF}
            />
          </div>

          {/* RIGHT COLUMN - AI Rail */}
          <aside className="col-span-12 lg:col-span-4">
            <AiSidebar
              prompts={smartPrompts}
              onPromptClick={handlePromptClick}
              onQuickAction={handleQuickAction}
              isLoading={isQuickActionLoading}
                  headers={headers}
                  rows={rows}
                  onNewChart={handleNewChart}
                />
          </aside>
        </div>
      </main>

      {/* Sticky Ask AI Bar */}
      <AskAIBar onSubmit={handleAskAI} />

      {/* Mobile Floating Chat Button - Premium */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl shadow-indigo-500/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/40 active:scale-95 lg:hidden"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    </div>
  );
}
