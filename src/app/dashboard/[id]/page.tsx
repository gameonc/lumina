"use client";

import { useState, useEffect } from "react";
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
  ExportButton,
} from "@/components/features";
import {
  Loader2,
  AlertCircle,
  Activity,
  Database,
  Columns3,
  AlertTriangle,
} from "lucide-react";
import type { ChartConfig, Insight } from "@/types";
import type { HealthScoreResult } from "@/lib/analyzers/health-score";

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
}

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Poor";
  return "Critical";
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-green-600 dark:text-green-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const datasetId = params.id as string;

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [charts, setCharts] = useState<ChartConfig[]>([]);

  useEffect(() => {
    const loadData = () => {
      try {
        const storedData = sessionStorage.getItem(`analysis-${datasetId}`);
        if (storedData) {
          const parsed = JSON.parse(storedData);
          setAnalysisData(parsed);
          setCharts(Array.isArray(parsed.charts) ? parsed.charts : []);
          setIsLoading(false);
          return;
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

  const handleNewChart = (newChart: ChartConfig) => {
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
    insights,
    datasetType,
    rowCount,
    columnCount,
  } = analysisData;

  // Ensure insights are arrays (charts now managed by state)
  const validInsights = Array.isArray(insights) ? insights : [];

  const missingDataPercent = healthScore
    ? (100 - healthScore.breakdown.completeness).toFixed(1)
    : "0.0";

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6">
      {/* Top Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {datasetName}
          </h1>
          {datasetType && (
            <p className="mt-1 text-sm text-neutral-500">
              Dataset type: <span className="font-medium capitalize">{datasetType}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {healthScore && (
            <ExportButton
              datasetName={datasetName}
              healthScore={healthScore}
              charts={charts}
              insights={validInsights}
            />
          )}
          <button
            onClick={() => router.push("/")}
            className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            Upload new file
          </button>
        </div>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Health Score Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                <Activity className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Health Score
                </p>
                <p className={`text-2xl font-bold ${getScoreColor(healthScore?.score || 0)}`}>
                  {healthScore?.score || 0}
                  <span className="text-sm font-normal text-neutral-400">/100</span>
                </p>
                <p className="text-xs text-neutral-500">
                  {getScoreLabel(healthScore?.score || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rows Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Database className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Rows
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {rowCount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Columns Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Columns3 className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Columns
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {columnCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Missing Data Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Missing Data
                </p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-white">
                  {missingDataPercent}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Row: Insights (Left) + Charts (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: AI Insights Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {healthScore && healthScore.recommendations.length > 0 ? (
                <div className="space-y-4">
                  {healthScore.recommendations.slice(0, 5).map((rec, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/30"
                    >
                      <h4 className="font-medium text-blue-900 dark:text-blue-100">
                        Insight #{i + 1}
                      </h4>
                      <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                        {rec}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="rounded-full bg-blue-200 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Suggested Action
                        </span>
                        <span className="text-xs text-blue-600 dark:text-blue-400">
                          Priority: Medium
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-sm text-neutral-500 py-8">
                  No insights available yet. Your data looks good!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Charts Grid */}
        <div>
          <ChartGrid charts={charts.slice(0, 10)} />
        </div>
      </div>

      {/* Bottom: Chat Section */}
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Ask a question about this data</CardTitle>
          </CardHeader>
          <CardContent>
            <ChatInterface 
              headers={headers} 
              rows={rows} 
              onNewChart={handleNewChart}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

