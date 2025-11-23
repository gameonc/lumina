"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFileUpload } from "@/hooks/use-file-upload";
import {
  FileSpreadsheet,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  Sparkles,
  CreditCard,
  LogOut,
  LayoutDashboard,
  Settings,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [credits, setCredits] = useState(5);
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

  useEffect(() => {
    const authStatus = sessionStorage.getItem("lumina-authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    } else {
      router.push("/");
    }
  }, [router]);

  const handleAnalyze = async () => {
    if (!parsedData || !file) return;
    if (credits <= 0) {
      setAnalysisError("No credits remaining. Please upgrade to continue.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headers: parsedData.headers,
          rows: parsedData.rows,
          datasetName: file.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze dataset");
      }

      const { data: results } = await response.json();
      setCredits((prev) => Math.max(0, prev - 1));

      const datasetId = `dataset-${Date.now()}`;
      const analysisData = {
        datasetName: file.name,
        headers: parsedData.headers,
        rows: parsedData.rows,
        healthScore: results.healthScore,
        charts: results.charts,
        insights: [],
        datasetType: results.datasetType,
        rowCount: results.rowCount ?? parsedData.rowCount,
        columnCount: results.columnCount ?? parsedData.columnCount,
      };

      sessionStorage.setItem(`analysis-${datasetId}`, JSON.stringify(analysisData));
      router.push(`/results/${datasetId}`);
    } catch (err) {
      console.error("Analysis error:", err);
      setAnalysisError(err instanceof Error ? err.message : "Failed to analyze data");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("lumina-authenticated");
    router.push("/");
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 font-bold text-xl">
              <div className="bg-slate-900 text-white p-1.5 rounded-lg">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              Lumina
            </div>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <button className="flex items-center gap-2 text-slate-900">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
              <button className="flex items-center gap-2 hover:text-slate-900 transition-colors">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full text-sm">
              <CreditCard className="w-4 h-4 text-slate-500" />
              <span className="font-medium">{credits} credits</span>
            </div>
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=User"
                alt="User"
                className="w-8 h-8 rounded-full bg-slate-200"
              />
              <button
                onClick={handleLogout}
                className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Upload Your Spreadsheet</h1>
          <p className="mt-2 text-slate-500">Drop your Excel or CSV file and watch the magic happen</p>
        </div>

        {!parsedData && (
          <div
            {...getRootProps()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-16 text-center transition-all ${
              isDragActive
                ? "border-emerald-500 bg-emerald-50"
                : "border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Upload className="h-8 w-8 text-slate-500" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              {isDragActive ? "Drop your file here" : "Drag and drop your file"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">or click to browse</p>
            <div className="mt-4 flex justify-center gap-2 text-xs text-slate-400">
              <span className="rounded bg-slate-100 px-2 py-1">.xlsx</span>
              <span className="rounded bg-slate-100 px-2 py-1">.xls</span>
              <span className="rounded bg-slate-100 px-2 py-1">.csv</span>
              <span className="text-slate-400">up to 20MB</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {parsedData && file && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">File Ready</h3>
                <p className="text-sm text-slate-500">{file.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold text-slate-900">{parsedData.rowCount.toLocaleString()}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Rows</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold text-slate-900">{parsedData.columnCount}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Columns</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-2xl font-bold text-slate-900">{parsedData.sheetNames?.length || 1}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Sheets</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-2">Columns Detected</h4>
              <div className="flex flex-wrap gap-2">
                {parsedData.headers.slice(0, 8).map((header) => (
                  <span key={header} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                    {header}
                  </span>
                ))}
                {parsedData.headers.length > 8 && (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500">
                    +{parsedData.headers.length - 8} more
                  </span>
                )}
              </div>
            </div>

            {analysisError && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-600">{analysisError}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 py-3 px-4 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Upload Different File
              </button>
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || credits <= 0}
                className="flex-1 py-3 px-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    <span className="text-xs opacity-75">(1 credit)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {credits <= 1 && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-3">
              <CreditCard className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">
                  {credits === 0 ? "No credits remaining" : "Low on credits"}
                </p>
                <p className="text-sm text-amber-600">Upgrade to Pro for unlimited analyses</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
