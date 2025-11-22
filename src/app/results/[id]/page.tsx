"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui";
import { Download, FileText, BarChart3, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import Link from "next/link";
import type { ChartConfig } from "@/types";
import type { HealthScoreResult } from "@/lib/analyzers/health-score";

interface AnalysisData {
  datasetName: string;
  headers: string[];
  rows: Record<string, unknown>[];
  healthScore: HealthScoreResult | null;
  charts: ChartConfig[];
  insights: any[];
  datasetType: string;
  rowCount: number;
  columnCount: number;
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const datasetId = params.id as string;

  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExportingPPT, setIsExportingPPT] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  useEffect(() => {
    const loadData = () => {
      try {
        const storedData = sessionStorage.getItem(`analysis-${datasetId}`);
        if (storedData) {
          const parsed = JSON.parse(storedData);
          setAnalysisData(parsed);
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load analysis data:", err);
        setIsLoading(false);
      }
    };

    loadData();
  }, [datasetId]);

  const handleDownloadPowerPoint = async () => {
    if (!analysisData) return;

    setIsExportingPPT(true);
    try {
      const response = await fetch("/api/reports/pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetName: analysisData.datasetName,
          charts: analysisData.charts,
          healthScore: analysisData.healthScore,
          datasetType: analysisData.datasetType,
          rowCount: analysisData.rowCount,
          columnCount: analysisData.columnCount,
        }),
      });

      if (!response.ok) {
        throw new Error("PowerPoint generation failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${analysisData.datasetName.replace(/\s+/g, "_")}_analysis.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PowerPoint export error:", error);
      alert("Failed to generate PowerPoint. Please try again.");
    } finally {
      setIsExportingPPT(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!analysisData) return;

    setIsExportingPDF(true);
    try {
      const response = await fetch("/api/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetName: analysisData.datasetName,
          healthScore: analysisData.healthScore,
          charts: analysisData.charts,
          insights: analysisData.insights || [],
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${analysisData.datasetName.replace(/\s+/g, "_")}_report.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        throw new Error("PDF export failed");
      }
    } catch (error) {
      console.error("PDF export error:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary-500" />
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Loading analysis...
          </p>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <AlertCircle className="h-12 w-12 text-neutral-400" />
            <h2 className="mt-4 text-lg font-semibold">No Analysis Found</h2>
            <p className="mt-2 text-center text-sm text-neutral-600">
              Please upload a file first to generate analysis.
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

  const validCharts = Array.isArray(analysisData.charts) ? analysisData.charts : [];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 py-12">
      <div className="mx-auto max-w-4xl space-y-8 px-4">
        {/* Success Header */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <svg 
                className="h-8 w-8 text-green-600 dark:text-green-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">
            Your presentation is ready!
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Analysis completed in 3 seconds • {validCharts.length} chart{validCharts.length !== 1 ? 's' : ''} generated
          </p>
        </div>

        {/* Download Buttons - Primary Actions */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* PowerPoint Download - PRIMARY */}
          <button
            onClick={handleDownloadPowerPoint}
            disabled={isExportingPPT}
            className="group relative flex items-center justify-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6 text-white shadow-lg transition-all hover:from-primary-700 hover:to-primary-800 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="relative flex items-center gap-3">
              {isExportingPPT ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <div className="text-left">
                    <div className="text-lg font-semibold">Generating...</div>
                    <div className="text-sm opacity-90">Creating PowerPoint</div>
                  </div>
                </>
              ) : (
                <>
                  <FileText className="h-6 w-6" />
                  <div className="text-left">
                    <div className="text-lg font-semibold">Download PowerPoint</div>
                    <div className="text-sm opacity-90">8 professional slides</div>
                  </div>
                </>
              )}
            </div>
          </button>

          {/* PDF Download - SECONDARY */}
          <button
            onClick={handleDownloadPDF}
            disabled={isExportingPDF}
            className="flex items-center justify-center gap-3 rounded-xl border-2 border-neutral-300 bg-white px-8 py-6 text-neutral-700 transition-all hover:border-neutral-400 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
          >
            {isExportingPDF ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <div className="text-left">
                  <div className="text-lg font-semibold">Generating...</div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">Creating PDF</div>
                </div>
              </>
            ) : (
              <>
                <Download className="h-6 w-6" />
                <div className="text-left">
                  <div className="text-lg font-semibold">Download PDF</div>
                  <div className="text-sm text-neutral-500 dark:text-neutral-400">Printable report</div>
                </div>
              </>
            )}
          </button>
        </div>

        {/* Chart Previews */}
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-neutral-900 dark:text-white">
              Preview ({validCharts.length} charts)
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {validCharts.slice(0, 5).map((chart, i) => (
                <div
                  key={i}
                  className="group relative flex aspect-square flex-col items-center justify-center rounded-lg border-2 border-neutral-200 bg-gradient-to-br from-neutral-50 to-neutral-100 p-4 transition-all hover:border-primary-300 hover:shadow-md dark:border-neutral-700 dark:from-neutral-800 dark:to-neutral-900"
                >
                  <BarChart3 className="h-8 w-8 text-neutral-400 transition-colors group-hover:text-primary-500" />
                  <p className="mt-2 text-center text-xs text-neutral-600 dark:text-neutral-400">
                    {chart.type.charAt(0).toUpperCase() + chart.type.slice(1)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upsell to Dashboard - Subtle */}
        <Card className="border-2 border-primary-200 bg-gradient-to-br from-primary-50 via-blue-50 to-white dark:border-primary-800 dark:from-primary-950/30 dark:via-blue-950/30 dark:to-neutral-900">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1">
                <h3 className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
                  <span className="text-xl">🚀</span>
                  Need more than just slides?
                </h3>
                <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                  View interactive dashboard, chat with your data, and explore insights in depth
                </p>
              </div>
              <Link
                href={`/dashboard/${datasetId}`}
                className="group flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-white transition-all hover:bg-primary-700 hover:gap-3"
              >
                View Dashboard
                <ArrowRight className="h-4 w-4 transition-all" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Upload New File */}
        <div className="text-center">
          <button
            onClick={() => router.push("/")}
            className="text-sm text-neutral-500 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            ← Analyze another file
          </button>
        </div>
      </div>
    </div>
  );
}
