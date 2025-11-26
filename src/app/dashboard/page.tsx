"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFileUpload } from "@/hooks/use-file-upload";
import { InitialsAvatar } from "@/components/ui/initials-avatar";
import {
  FileSpreadsheet,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  Sparkles,
  LogOut,
  X,
  Star,
  Lightbulb,
} from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userName, setUserName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("");
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
    const storedName = sessionStorage.getItem("lumina-user-name");
    const storedEmail = sessionStorage.getItem("lumina-user-email");

    if (authStatus === "true") {
      setIsAuthenticated(true);
      if (storedName) setUserName(storedName);
      if (storedEmail) setUserEmail(storedEmail);
    } else {
      router.push("/");
    }
  }, [router]);

  const handleAnalyze = async () => {
    if (!parsedData || !file) {
      setAnalysisError("Please upload a file first.");
      return;
    }

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
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const result = await response.json();
      const { data: results } = result;

      if (!results) {
        throw new Error("No data in response");
      }

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
        columnStats: results.columnStats,
      };

      sessionStorage.setItem(`analysis-${datasetId}`, JSON.stringify(analysisData));
      router.push(`/dashboard/${datasetId}`);
    } catch (err) {
      console.error("Analysis error:", err);
      setAnalysisError(err instanceof Error ? err.message : "Failed to analyze data.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("lumina-authenticated");
    sessionStorage.removeItem("lumina-user-name");
    sessionStorage.removeItem("lumina-user-email");
    router.push("/");
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 flex flex-col">
      {/* Clean Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div
            className="flex items-center gap-2.5 font-bold text-xl cursor-pointer"
            onClick={() => router.push("/")}
          >
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-violet-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Lumina
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm font-medium">
              <Star className="w-4 h-4" />
              <span>{credits} credits</span>
            </div>
            <div className="flex items-center gap-3">
              <InitialsAvatar name={userName} email={userEmail} size="md" />
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Centered Upload */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          {/* Title */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-full text-violet-700 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              AI-Powered Analysis
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
              Upload Your Spreadsheet
            </h1>
            <p className="text-slate-500 text-lg">
              Drop your file and watch the magic happen
            </p>
          </div>

          {/* Upload Dropzone */}
          {!parsedData && (
            <div
              {...getRootProps()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 sm:p-16 text-center transition-all ${
                isDragActive
                  ? "border-violet-500 bg-violet-50 scale-[1.02]"
                  : "border-slate-300 bg-white hover:border-violet-400 hover:bg-violet-50/30 hover:shadow-lg"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex justify-center mb-6">
                <div
                  className={`flex h-20 w-20 items-center justify-center rounded-2xl transition-all ${
                    isDragActive
                      ? "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 scale-110"
                      : "bg-gradient-to-br from-slate-100 to-slate-200"
                  }`}
                >
                  <Upload
                    className={`h-10 w-10 transition-colors ${
                      isDragActive ? "text-white" : "text-slate-500"
                    }`}
                  />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                {isDragActive ? "Drop your file here" : "Drag and drop your file"}
              </h3>
              <p className="text-slate-500 mb-6">or click to browse from your computer</p>
              <div className="flex justify-center gap-2 text-xs">
                {[".xlsx", ".xls", ".csv"].map((ext) => (
                  <span
                    key={ext}
                    className="rounded-lg bg-violet-100 text-violet-700 px-3 py-1.5 font-medium"
                  >
                    {ext}
                  </span>
                ))}
                <span className="text-slate-400 py-1.5 ml-1">up to 20MB</span>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mt-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* File Preview Card */}
          {parsedData && file && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/25">
                  <CheckCircle className="h-7 w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 text-lg">File Ready</h3>
                  <p className="text-sm text-slate-500 truncate">{file.name}</p>
                </div>
                <button
                  onClick={reset}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Rows", value: parsedData.rowCount.toLocaleString() },
                  { label: "Columns", value: parsedData.columnCount },
                  { label: "Sheets", value: parsedData.sheetNames?.length || 1 },
                ].map((stat, i) => (
                  <div key={i} className="rounded-xl bg-slate-50 p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Columns Preview */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">Columns Detected</h4>
                <div className="flex flex-wrap gap-2">
                  {parsedData.headers.slice(0, 6).map((header) => (
                    <span
                      key={header}
                      className="rounded-full bg-violet-100 text-violet-700 px-3 py-1 text-sm font-medium"
                    >
                      {header}
                    </span>
                  ))}
                  {parsedData.headers.length > 6 && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-500">
                      +{parsedData.headers.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              {/* Analysis Error */}
              {analysisError && (
                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm text-red-600">{analysisError}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={reset}
                  className="flex-1 py-3.5 px-4 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Change File
                </button>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || credits <= 0}
                  className="flex-[2] py-3.5 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Analyze with AI
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Pro Tip */}
          <div className="mt-8 flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="p-1.5 bg-amber-100 rounded-lg flex-shrink-0">
              <Lightbulb className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-700">Pro tip:</span> Include headers in your
              first row and keep your data clean for the best analysis results.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
