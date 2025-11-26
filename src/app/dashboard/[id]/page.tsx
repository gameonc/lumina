"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  ChartGrid,
  ChatInterface,
  StatusBanner,
  AISummaryCard,
  KeyMetricsStrip,
  DatasetDetailsCard,
  ChartCompareCard,
} from "@/components/features";
import {
  Loader2,
  AlertCircle,
  Sparkles,
  BarChart3,
} from "lucide-react";
import type { ChartConfig, Insight } from "@/types";
import type { HealthScoreResult } from "@/lib/analyzers/health-score";
import type { EnhancedColumnStats } from "@/lib/analyzers/column-profiler";

interface AnalysisData {
  datasetName: string;
  headers: string[];
  rows: Record<string, unknown>[];
  healthScore: HealthScoreResult | null;
  charts: ChartConfig[];
  insights: Insight[];
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
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const storedData = sessionStorage.getItem(`analysis-${datasetId}`);
        if (storedData) {
          const parsed = JSON.parse(storedData);
          parsed.charts = Array.isArray(parsed.charts) ? parsed.charts : [];
          parsed.insights = Array.isArray(parsed.insights) ? parsed.insights : [];
          setAnalysisData(parsed);
          setCharts(parsed.charts);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`/api/storage/load?id=${datasetId}`);
        if (response.ok) {
          const { data } = await response.json();
          if (data) {
            const parsed = {
              datasetName: data.datasetName,
              headers: data.fullData?.headers || [],
              rows: data.fullData?.rows || [],
              healthScore: data.fullData?.healthScore || null,
              charts: data.charts || [],
              insights: data.fullData?.insights || [],
              datasetType: data.datasetType,
              rowCount: data.rowCount,
              columnCount: data.columnCount,
              columnStats: data.columnStats || [],
            };
            sessionStorage.setItem(`analysis-${datasetId}`, JSON.stringify(parsed));
            setAnalysisData(parsed);
            setCharts(parsed.charts);
            setIsLoading(false);
            return;
          }
        }

        setError("No analysis data found. Please upload a dataset first.");
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load analysis data:", err);
        setError("Failed to load analysis data.");
        setIsLoading(false);
      }
    };

    loadData();
  }, [datasetId]);

  const handleNewChart = useCallback((newChart: ChartConfig) => {
    setCharts((prevCharts) => {
      const updatedCharts = [...prevCharts, newChart];
      
      if (analysisData) {
        const updatedData = { ...analysisData, charts: updatedCharts };
        sessionStorage.setItem(`analysis-${datasetId}`, JSON.stringify(updatedData));
        setAnalysisData(updatedData);
      }
      
      return updatedCharts;
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
          charts: charts,
          insights: analysisData.insights || [],
          datasetType: analysisData.datasetType || "general",
          rowCount: analysisData.rowCount,
          columnCount: analysisData.columnCount,
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${analysisData.datasetName.replace(/\s+/g, "_")}_Report.pptx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(error);
      alert("Failed to download PowerPoint. Please try again.");
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
          charts: charts,
          insights: analysisData.insights || [],
          datasetType: analysisData.datasetType || "general",
          rowCount: analysisData.rowCount,
          columnCount: analysisData.columnCount,
        }),
      });

      if (!response.ok) throw new Error("Generation failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${analysisData.datasetName.replace(/\s+/g, "_")}_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error(error);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setIsDownloadingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-violet-600" />
          <p className="mt-4 text-slate-600 font-medium">Loading your analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center py-12">
            <div className="p-3 bg-red-100 rounded-full mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {error || "No Data Available"}
            </h2>
            <p className="text-center text-slate-600 mb-6">
              Upload a dataset to see analysis results here.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/25"
            >
              Go to Upload
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
    datasetType,
    rowCount,
    columnCount,
    columnStats = [],
  } = analysisData;

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Status Banner */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <StatusBanner
          datasetName={datasetName}
          rowCount={rowCount}
          columnCount={columnCount}
          healthScore={healthScore}
          onDownloadPPTX={handleDownloadPPTX}
          onDownloadPDF={handleDownloadPDF}
          isDownloadingPPTX={isDownloadingPPTX}
          isDownloadingPDF={isDownloadingPDF}
        />
      </div>

      {/* Main Content - INCREASED WIDTH to 1600px */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Grid Layout - Enforce 2 columns on large screens */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-8 items-start">
          
          {/* Left Column (Main Analysis) */}
          <div className="space-y-8 min-w-0"> {/* min-w-0 prevents chart overflow */}
            
            {/* AI Summary - Full width of left column */}
            <div className="bg-white rounded-2xl border border-slate-200 p-1 shadow-sm">
               <AISummaryCard healthScore={healthScore} />
            </div>

            {/* Key Metrics Strip */}
            {columnStats && columnStats.length > 0 && (
              <KeyMetricsStrip columnStats={columnStats} rows={rows} />
            )}

            {/* Charts Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-violet-600" />
                  Visual Analysis
                </h2>
              </div>
              
              {/* Charts Grid */}
              {charts.length > 0 ? (
                <ChartGrid charts={charts} />
              ) : (
                <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
                  <p className="text-slate-500">No charts generated automatically.</p>
                </div>
              )}
            </div>

            {/* Chart Compare Panel */}
            {columnStats && columnStats.length > 0 && (
              <ChartCompareCard
                columnStats={columnStats}
                charts={charts}
                rows={rows}
              />
            )}
          </div>

          {/* Right Column (Sidebar) - Sticky on Desktop */}
          <div className="space-y-6 xl:sticky xl:top-24 h-fit">
            
            {/* Chat Interface */}
            <Card className="border-slate-200 shadow-lg shadow-violet-500/5 overflow-hidden flex flex-col h-[600px]">
              <CardHeader className="bg-white border-b border-slate-100 pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-800">
                  <Sparkles className="w-5 h-5 text-violet-600" />
                  Data Analyst AI
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 p-0 bg-slate-50/50">
                <ChatInterface
                  headers={headers}
                  rows={rows}
                  onNewChart={handleNewChart}
                />
              </CardContent>
            </Card>

            {/* Dataset Details */}
            <DatasetDetailsCard
              datasetName={datasetName}
              rowCount={rowCount}
              columnCount={columnCount}
              datasetType={datasetType}
              healthScore={healthScore}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
