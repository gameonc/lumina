"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ToastContainer, toast } from "@/components/ui";
import { ChatInterface } from "@/components/features";
import {
  MetricsRow,
  ChartsGrid,
  SidebarPrompts,
  AskAIBar,
  SummaryCard,
  CollapsibleSection,
  ExportSection,
  FileInfoPanel,
} from "@/components/dashboard";
import {
  Loader2,
  AlertCircle,
  ArrowLeft,
  FileSpreadsheet,
  Download,
  Sparkles,
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
    <div className="min-h-screen bg-[#F9FAFB]">
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

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-8 space-y-10">
            {/* Metrics Skeleton */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-xl bg-slate-200"
                />
              ))}
            </div>

            {/* Insights Skeleton */}
            <div className="h-32 animate-pulse rounded-xl bg-slate-200" />

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
      </main>
    </div>
  );
}




function UnifiedSidebar({
  prompts,
  onPromptClick,
  onQuickAction,
  isLoading,
  headers,
  rows,
  onNewChart,
}: {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
  onQuickAction: (action: "generate-charts" | "detect-anomalies" | "analyze-trends") => void;
  isLoading: boolean;
  headers: string[];
  rows: Record<string, unknown>[];
  onNewChart: (chart: ChartConfig) => void;
}) {
  const [activeTab, setActiveTab] = useState<"prompts" | "chat">("prompts");

  return (
    <div className="sticky top-24 space-y-6">
      {/* Tab Switcher */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab("prompts")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "prompts"
                ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Quick Actions
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "chat"
                ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            AI Chat
          </button>
        </div>

        <div className="p-6">
          {activeTab === "prompts" ? (
            <SidebarPrompts
              prompts={prompts}
              insights={undefined}
              onPromptClick={onPromptClick}
              onQuickAction={onQuickAction}
              isLoading={isLoading}
            />
          ) : (
            <div className="h-[600px] -m-6">
              <ChatInterface
                headers={headers}
                rows={rows}
                onNewChart={onNewChart}
              />
            </div>
          )}
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
          insights: aiInsights?.keyInsights || [],
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

  const handleDownloadCharts = async () => {
    toast("Chart download feature coming soon!", "info");
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
      <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] p-6">
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
    businessMetrics,
  } = analysisData;

  const score = healthScore?.score ?? 0;

  // Calculate null values (fallback for technical metrics)
  const nullValues =
    analysisData.columnStats?.reduce(
      (sum, stat) => sum + (stat.nullCount || 0),
      0
    ) || 0;

  // Limit charts to 12 max with prioritization
  const prioritizedCharts = [...charts]
    .sort((a, b) => {
      // Prioritize business-relevant charts
      if (businessMetrics) {
        const aRelevant =
          a.title.toLowerCase().includes("revenue") ||
          a.title.toLowerCase().includes("profit") ||
          a.title.toLowerCase().includes("growth");
        const bRelevant =
          b.title.toLowerCase().includes("revenue") ||
          b.title.toLowerCase().includes("profit") ||
          b.title.toLowerCase().includes("growth");
        if (aRelevant && !bRelevant) return -1;
        if (!aRelevant && bRelevant) return 1;
      }
      return 0;
    })
    .slice(0, 12);

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
    <div className="min-h-screen bg-[#F9FAFB] pb-24">
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

      {/* Header - MINIMAL */}
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
                <div className="flex items-center gap-2">
                  <h1 className="max-w-[200px] truncate font-semibold text-slate-900 sm:max-w-none">
                    {datasetName}
                  </h1>
                  {analysisData.datasetType && (
                    <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium capitalize text-indigo-700">
                      {analysisData.datasetType}
                    </span>
                  )}
                </div>
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
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - 3-PANEL LAYOUT */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* LEFT PANEL - File Info (3 cols) */}
          <aside className="col-span-12 lg:col-span-3">
            <FileInfoPanel
              datasetName={datasetName}
              rowCount={rowCount}
              columnCount={columnCount}
              datasetType={analysisData.datasetType}
              healthScore={healthScore}
            />
          </aside>

          {/* CENTER PANEL - Charts & Summary (6 cols) */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            {/* 1. METRICS ROW */}
            <MetricsRow
              businessMetrics={businessMetrics}
              totalRows={rowCount}
              totalColumns={columnCount}
              nullValues={nullValues}
              dataQualityScore={score}
            />

            {/* 2. SUMMARY SECTION */}
            <SummaryCard insights={aiInsights} />

            {/* 3. CHARTS GRID - Grouped by Category */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Visualizations</h2>
                <span className="text-sm text-slate-500">
                  {prioritizedCharts.length} of {charts.length} charts
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
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                    <BarChart3 className="h-6 w-6 text-slate-400" />
                  </div>
                  <h3 className="mb-1 text-sm font-medium text-slate-700">No charts yet</h3>
                  <p className="text-sm text-slate-500">
                    Use the AI chat to generate visualizations from your data
                  </p>
                </div>
              )}
            </section>

            {/* 4. EXPORT SECTION */}
            <ExportSection
              onExportPPTX={handleDownloadPPTX}
              onExportPDF={handleDownloadPDF}
              onCopyInsights={() => {
                if (insightsText) {
                  navigator.clipboard.writeText(insightsText);
                  toast("Insights copied to clipboard!", "success");
                }
              }}
              onDownloadCharts={handleDownloadCharts}
              isDownloadingPPTX={isDownloadingPPTX}
              isDownloadingPDF={isDownloadingPDF}
              insights={insightsText}
            />
          </div>

          {/* RIGHT PANEL - AI Insights & Prompts (3 cols) */}
          <aside className="col-span-12 lg:col-span-3">
            <UnifiedSidebar
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
