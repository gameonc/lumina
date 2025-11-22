"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFileUpload } from "@/hooks/use-file-upload";
import { Card } from "@/components/ui/card";
import { Modal, ModalHeader, ModalTitle, ModalClose } from "@/components/ui/modal";
import { formatBytes } from "@/lib/utils";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Eye,
  Sparkles,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { 
  DataTable, 
  ChartGrid, 
  HealthScoreCard 
} from "@/components/features";
import type { EnhancedColumnStats } from "@/types";
import type { ChartConfig } from "@/types";
import type { HealthScoreResult } from "@/lib/analyzers/health-score";

interface AnalysisResults {
  columnStats: EnhancedColumnStats[];
  charts: ChartConfig[];
  healthScore: HealthScoreResult;
  datasetType: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    parsedData,
    error,
    file,
    reset,
  } = useFileUpload({
    onSuccess: (data) => {
      console.log("File parsed successfully:", data);
    },
    onError: (err) => {
      console.error("File parsing error:", err);
    },
  });

  const handleAnalyze = async () => {
    if (!parsedData) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const [profileRes, healthRes, chartsRes, classifyRes] = await Promise.all([
        fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            headers: parsedData.headers,
            rows: parsedData.rows,
          }),
        }),
        fetch("/api/health", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            headers: parsedData.headers,
            rows: parsedData.rows,
          }),
        }),
        fetch("/api/charts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            headers: parsedData.headers,
            rows: parsedData.rows,
          }),
        }),
        fetch("/api/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            headers: parsedData.headers,
            rows: parsedData.rows.slice(0, 5),
          }),
        }),
      ]);

      if (!profileRes.ok || !healthRes.ok || !chartsRes.ok || !classifyRes.ok) {
        throw new Error("One or more analysis APIs failed");
      }

      const profileData = await profileRes.json();
      const healthData = await healthRes.json();
      const chartsData = await chartsRes.json();
      const classifyData = await classifyRes.json();

      setAnalysisResults({
        columnStats: profileData.data,
        charts: chartsData.data,
        healthScore: healthData.data,
        datasetType: classifyData.data.type,
      });
    } catch (err) {
      console.error("Analysis error:", err);
      setAnalysisError(
        err instanceof Error ? err.message : "Failed to analyze data"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    reset();
    setAnalysisResults(null);
    setAnalysisError(null);
  };

  const handleViewFullAnalysis = () => {
    if (!analysisResults || !parsedData || !file) return;

    const datasetId = `dataset-${Date.now()}`;
    const analysisData = {
      datasetName: file.name,
      headers: parsedData.headers,
      rows: parsedData.rows,
      healthScore: analysisResults.healthScore,
      charts: analysisResults.charts,
      insights: [],
      datasetType: analysisResults.datasetType,
      rowCount: parsedData.rowCount,
      columnCount: parsedData.columnCount,
    };

    sessionStorage.setItem(`analysis-${datasetId}`, JSON.stringify(analysisData));
    router.push(`/analysis/${datasetId}`);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Upload Data
        </h1>
        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
          Import your CSV or Excel files to get AI-powered insights
        </p>
      </div>

      {/* Upload Zone */}
      <Card className="p-8">
        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors ${
            isDragActive
              ? "border-primary-500 bg-primary-50 dark:bg-primary-950/30"
              : "border-neutral-300 hover:border-primary-400 dark:border-neutral-700"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
            <Upload className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">
            {isDragActive ? "Drop your file here" : "Drag and drop your file"}
          </h3>
          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            or click to browse
          </p>
          <p className="mt-4 text-xs text-neutral-500">
            CSV, XLSX, XLS (max 50MB)
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-6 flex items-center gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-950/30">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </Card>

      {/* File Info Card */}
      {parsedData && file && !analysisResults && (
        <Card className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold">File Ready</h3>
            </div>
            <button
              onClick={handleReset}
              className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            >
              Upload different file
            </button>
          </div>

          {/* File Info */}
          <div className="flex items-center gap-4 rounded-lg bg-neutral-50 p-4 dark:bg-neutral-800">
            <FileSpreadsheet className="h-10 w-10 text-primary-600" />
            <div>
              <p className="font-medium text-neutral-900 dark:text-white">
                {file.name}
              </p>
              <p className="text-sm text-neutral-500">
                {formatBytes(file.size)} | {parsedData.fileType.toUpperCase()}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
              <p className="text-2xl font-bold text-primary-600">
                {parsedData.rowCount.toLocaleString()}
              </p>
              <p className="text-sm text-neutral-500">Rows</p>
            </div>
            <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
              <p className="text-2xl font-bold text-primary-600">
                {parsedData.columnCount}
              </p>
              <p className="text-sm text-neutral-500">Columns</p>
            </div>
            <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
              <p className="text-2xl font-bold text-primary-600">
                {parsedData.sheetNames?.length || 1}
              </p>
              <p className="text-sm text-neutral-500">Sheets</p>
            </div>
          </div>

          {/* Columns */}
          <div>
            <h4 className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Columns
            </h4>
            <div className="flex flex-wrap gap-2">
              {parsedData.headers.slice(0, 10).map((header) => (
                <span
                  key={header}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                >
                  {header}
                </span>
              ))}
              {parsedData.headers.length > 10 && (
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-sm text-neutral-500 dark:bg-neutral-800">
                  +{parsedData.headers.length - 10} more
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setPreviewOpen(true)}
              className="btn-secondary flex flex-1 items-center justify-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview Data
            </button>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="btn-primary flex flex-1 items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Analyze with AI
                </>
              )}
            </button>
          </div>

          {/* Analysis Error */}
          {analysisError && (
            <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 dark:bg-red-950/30">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {analysisError}
              </p>
            </div>
          )}
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResults && (
        <div className="space-y-6">
          {/* Success Banner */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 dark:from-green-950/30 dark:to-emerald-950/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    Analysis Complete!
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Dataset classified as: <span className="font-medium capitalize">{analysisResults.datasetType}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleViewFullAnalysis}
                  className="btn-primary flex items-center gap-2"
                >
                  View Full Analysis
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={handleReset}
                  className="btn-outline text-sm"
                >
                  Analyze new file
                </button>
              </div>
            </div>
          </Card>

          {/* Health Score */}
          <HealthScoreCard 
            healthData={analysisResults.healthScore} 
            isLoading={isAnalyzing}
          />

          {/* Charts */}
          <ChartGrid 
            charts={analysisResults.charts} 
            isLoading={isAnalyzing}
          />

          {/* Data Preview */}
          {parsedData && (
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Raw Data</h3>
                <button
                  onClick={() => setPreviewOpen(true)}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  View full table
                </button>
              </div>
              <DataTable data={parsedData} pageSize={5} />
            </Card>
          )}
        </div>
      )}

      {/* Data Preview Modal */}
      {parsedData && (
        <Modal
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
          className="max-w-5xl"
        >
          <ModalHeader>
            <ModalTitle>Data Preview</ModalTitle>
            <ModalClose onClick={() => setPreviewOpen(false)} />
          </ModalHeader>
          <DataTable data={parsedData} pageSize={15} />
        </Modal>
      )}
    </div>
  );
}
