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
  columnStats?: EnhancedColumnStats[]; // Optional for backward compatibility
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
        // Try sessionStorage first (faster)
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

        // Try Google Sheets (for persistence across sessions)
        const response = await fetch(`/api/storage/load?id=${datasetId}`);
        if (response.ok) {
          const { data } = await response.json();
          if (data) {
            // Reconstruct analysis data from stored record
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
            // Cache in sessionStorage for faster access
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
      
      // Update sessionStorage with new chart
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
      <div className="flex min-h-[400px] items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-500" />
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Loading analysis...
          </p>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="h-12 w-12 text-neutral-400" />
            <h2 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">
              {error || "No Data Available"}
            </h2>
            <p className="mt-2 text-center text-neutral-600 dark:text-neutral-400">
              Upload a dataset to see analysis results here.
            </p>
            <button
              onClick={() => router.push("/")}
              className="btn-primary mt-6"
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
    columnStats = [], // Default to empty array if not available
  } = analysisData;

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
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
            <AISummaryCard healthScore={healthScore} />

            {/* Key Metrics Strip */}
            {columnStats && columnStats.length > 0 && (
              <KeyMetricsStrip columnStats={columnStats} rows={rows} />
            )}

            {/* Charts Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  Auto-Generated Charts
                </h2>
                <select className="text-sm px-3 py-1.5 border border-neutral-300 rounded-lg bg-white dark:bg-neutral-800 dark:border-neutral-600 dark:text-white">
                  <option>Dataset view: All</option>
                </select>
              </div>
              {charts.length > 0 ? (
                <ChartGrid charts={charts.slice(0, 5)} />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-neutral-500">No charts generated for this dataset.</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Chart Compare Panel (Optional) */}
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
            <Card>
              <CardHeader>
                <CardTitle>Ask your data</CardTitle>
              </CardHeader>
              <CardContent>
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
