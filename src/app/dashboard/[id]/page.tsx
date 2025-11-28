"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ToastContainer, toast } from "@/components/ui";
import {
  ChartsGrid,
  DatasetHeader,
  AISummaryCard,
  VisualizationActionBar,
  SmartPromptChips,
  FloatingAIChat,
  ExportFooter,
} from "@/components/dashboard";
import {
  AlertCircle,
  ArrowLeft,
  FileSpreadsheet,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import * as htmlToImage from "html-to-image";
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
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-5 w-40 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="space-y-10">
          {/* Header Skeleton */}
          <div className="h-32 animate-pulse rounded-3xl bg-white shadow-sm" />

          {/* AI Summary Skeleton */}
          <div className="h-80 animate-pulse rounded-3xl bg-white shadow-sm" />

          {/* Action Bar Skeleton */}
          <div className="flex justify-center gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 w-32 animate-pulse rounded-xl bg-slate-200" />
            ))}
          </div>

          {/* Charts Skeleton */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-white shadow-sm" />
            ))}
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
  const [isQuickActionLoading, setIsQuickActionLoading] = useState(false);
  const [isDownloadingCharts, setIsDownloadingCharts] = useState(false);

  const chartsGridRef = useRef<HTMLDivElement>(null);
  const visualizationsRef = useRef<HTMLElement>(null);

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
          sessionStorage.setItem(`analysis-${datasetId}`, JSON.stringify(updatedData));
          setAnalysisData(updatedData);
        }
        return updated;
      });
      toast("New chart added!", "success");
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
      toast("PowerPoint downloaded!", "success");
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
      toast("PDF downloaded!", "success");
    } catch {
      toast("Failed to download PDF", "error");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  const handleCopyInsights = () => {
    const insightsText = analysisData?.aiInsights?.keyInsights
      ?.map((i) => `${i.title}: ${i.description}`)
      .join("\n\n") || "";
    if (insightsText) {
      navigator.clipboard.writeText(insightsText);
      toast("Insights copied!", "success");
    }
  };

  const handleDownloadCharts = async () => {
    if (!chartsGridRef.current || charts.length === 0) {
      toast("No charts to download", "info");
      return;
    }

    setIsDownloadingCharts(true);
    toast("Preparing charts for download...", "info");

    try {
      const dataUrl = await htmlToImage.toPng(chartsGridRef.current, {
        quality: 1,
        backgroundColor: "#FAFAFA",
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `${analysisData?.datasetName.replace(/\s+/g, "_") || "charts"}_visualizations.png`;
      link.href = dataUrl;
      link.click();

      toast("Charts downloaded!", "success");
    } catch (err) {
      console.error("Failed to download charts:", err);
      toast("Failed to download charts", "error");
    } finally {
      setIsDownloadingCharts(false);
    }
  };

  const handleScrollToVisualizations = () => {
    visualizationsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePromptClick = useCallback(
    async (prompt: string) => {
      if (!analysisData || isQuickActionLoading) return;

      setIsQuickActionLoading(true);
      toast("Processing...", "info");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: prompt,
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
          toast(result.data.message?.slice(0, 80) || "Done!", "success");
        } else {
          toast(result.error || "Something went wrong", "error");
        }
      } catch (err) {
        console.error("Prompt error:", err);
        toast("Failed. Please try again.", "error");
      } finally {
        setIsQuickActionLoading(false);
      }
    },
    [analysisData, isQuickActionLoading, handleNewChart]
  );

  const handleQuickAction = useCallback(
    async (action: "generate-charts" | "detect-anomalies" | "analyze-trends") => {
      const prompts = {
        "generate-charts": "Generate 3 different charts that best visualize this dataset",
        "detect-anomalies": "Find all anomalies and unusual patterns in this data",
        "analyze-trends": "What are the top 3 trends in this data?",
      };
      await handlePromptClick(prompts[action]);
    },
    [handlePromptClick]
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !analysisData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-sm">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="mb-2 text-2xl font-semibold text-slate-900">
            Analysis Not Found
          </h2>
          <p className="mb-8 text-slate-500">
            {error || "We couldn't find this analysis. It may have expired."}
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-2xl bg-slate-900 px-6 py-4 font-semibold text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
          >
            Upload New File
          </button>
        </div>
      </div>
    );
  }

  const { datasetName, headers, rows, healthScore, rowCount, columnCount, aiInsights } = analysisData;
  const score = healthScore?.score ?? 0;
  const nullValues = analysisData.columnStats?.reduce((sum, stat) => sum + (stat.nullCount || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-28">
      <ToastContainer />

      {/* MINIMAL HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 transition-all hover:bg-slate-200 active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4 text-slate-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
                <FileSpreadsheet className="h-5 w-5 text-white" />
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

          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-200 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Analyze Again</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT - SINGLE CENTERED COLUMN */}
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="space-y-10">
          {/* 1. DATASET HEADER */}
          <DatasetHeader
            fileName={datasetName}
            datasetType={analysisData.datasetType}
            rowCount={rowCount}
            columnCount={columnCount}
            nullValues={nullValues}
            dataQualityScore={score}
          />

          {/* 2. AI SUMMARY CARD - Consolidated insights */}
          <AISummaryCard
            healthScore={healthScore}
            aiInsights={aiInsights}
            onViewFullAnalysis={handleScrollToVisualizations}
          />

          {/* 3. VISUALIZATIONS SECTION */}
          <section ref={visualizationsRef} className="space-y-6 scroll-mt-20">
            {/* Section Header */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-slate-900">Visualizations</h2>
              <p className="mt-1 text-slate-500">Interactive charts from your data</p>
            </div>

            {/* Quick Action Bar */}
            <VisualizationActionBar
              onAction={handleQuickAction}
              isLoading={isQuickActionLoading}
            />

            {/* Smart Prompt Chips - Horizontal Scroll */}
            <SmartPromptChips onPromptClick={handlePromptClick} />

            {/* Charts Grid */}
            {charts.length > 0 ? (
              <div ref={chartsGridRef}>
                <ChartsGrid charts={charts.slice(0, 12)} />
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  <BarChart3 className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">No charts yet</h3>
                <p className="text-slate-500">
                  Click "Generate Charts" above or use the AI chat to create visualizations
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* FLOATING AI CHAT BUTTON */}
      <FloatingAIChat
        headers={headers}
        rows={rows}
        onNewChart={handleNewChart}
      />

      {/* STICKY EXPORT FOOTER */}
      <ExportFooter
        onExportPPTX={handleDownloadPPTX}
        onExportPDF={handleDownloadPDF}
        onCopyInsights={handleCopyInsights}
        onDownloadCharts={handleDownloadCharts}
        isExporting={isDownloadingPPTX || isDownloadingPDF || isDownloadingCharts}
      />
    </div>
  );
}
