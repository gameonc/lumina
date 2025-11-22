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
  HealthScoreCard,
  ChatInterface,
  ExportButton,
} from "@/components/features";
import {
  ArrowLeft,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
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

export default function AnalysisDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const datasetId = params.id as string;

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "chat">("overview");

  useEffect(() => {
    // Try to load from sessionStorage (passed from upload page)
    const loadData = () => {
      try {
        const storedData = sessionStorage.getItem(`analysis-${datasetId}`);
        if (storedData) {
          const parsed = JSON.parse(storedData);
          setAnalysisData(parsed);
          setIsLoading(false);
          return;
        }

        // If no stored data, show placeholder
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

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
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
      <div className="mx-auto max-w-2xl py-12">
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
              onClick={() => router.push("/upload")}
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
    charts,
    insights,
    datasetType,
    rowCount,
    columnCount,
  } = analysisData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-2 flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="h-8 w-8 text-primary-500" />
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {datasetName}
              </h1>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span>{rowCount.toLocaleString()} rows</span>
                <span>|</span>
                <span>{columnCount} columns</span>
                {datasetType && (
                  <>
                    <span>|</span>
                    <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
                      {datasetType}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <ExportButton
          datasetName={datasetName}
          healthScore={healthScore}
          charts={charts}
          insights={insights}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-700">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "overview"
              ? "border-b-2 border-primary-500 text-primary-600"
              : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "chat"
              ? "border-b-2 border-primary-500 text-primary-600"
              : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          }`}
        >
          Chat with Data
        </button>
      </div>

      {/* Content */}
      {activeTab === "overview" ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Health Score - Left Column */}
          <div className="lg:col-span-1">
            <HealthScoreCard healthData={healthScore} />
          </div>

          {/* Charts - Right Column */}
          <div className="lg:col-span-2">
            <ChartGrid charts={charts} />
          </div>

          {/* Insights - Full Width */}
          {insights.length > 0 && (
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Key Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {insights.map((insight) => (
                      <div
                        key={insight.id}
                        className={`rounded-lg border p-4 ${
                          insight.type === "warning"
                            ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/30"
                            : insight.type === "recommendation"
                            ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30"
                            : "border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800"
                        }`}
                      >
                        <h4 className="font-medium text-neutral-900 dark:text-white">
                          {insight.title}
                        </h4>
                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                          {insight.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      ) : (
        <ChatInterface headers={headers} rows={rows} />
      )}
    </div>
  );
}
