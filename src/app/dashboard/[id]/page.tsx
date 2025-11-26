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
  TrendingUp,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      {/* Status Banner */}
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[65%_35%]">
          {/* Left Column (65%) */}
          <div className="space-y-6">
            {/* AI Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200/50 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
              <AISummaryCard healthScore={healthScore} />
            </div>

            {/* Key Metrics Strip */}
            {columnStats && columnStats.length > 0 && (
              <KeyMetricsStrip columnStats={columnStats} rows={rows} />
            )}

            {/* Charts Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg shadow-lg shadow-violet-500/20">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Auto-Generated Charts
                  </h2>
                </div>
                <select className="text-sm px-4 py-2 border border-slate-200 rounded-xl bg-white hover:border-violet-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-colors cursor-pointer shadow-sm">
                  <option>Dataset view: All</option>
                </select>
              </div>
              {charts.length > 0 ? (
                <ChartGrid charts={charts.slice(0, 5)} />
              ) : (
                <Card className="border-2 border-dashed border-slate-200 hover:border-violet-300 transition-colors">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="p-4 bg-slate-100 rounded-2xl mb-4">
                      <TrendingUp className="h-10 w-10 text-slate-400" />
                    </div>
                    <p className="text-slate-500 font-medium mb-2">No charts generated for this dataset.</p>
                    <p className="text-sm text-slate-400 text-center max-w-sm">
                      Try asking the AI chat to create custom charts based on your data patterns.
                    </p>
                  </CardContent>
                </Card>
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

          {/* Right Column (35%) */}
          <div className="space-y-6">
            {/* Chat Interface */}
            <Card className="border-slate-200/50 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-violet-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <CardTitle className="text-slate-900">Ask your data</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <ChatInterface
                  headers={headers}
                  rows={rows}
                  onNewChart={handleNewChart}
                />
              </CardContent>
            </Card>

            {/* Dataset Details Card */}
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
