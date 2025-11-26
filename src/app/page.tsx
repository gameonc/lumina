"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFileUpload } from "@/hooks/use-file-upload";
import {
  FileSpreadsheet,
  Upload,
  Loader2,
  Sparkles,
  BarChart3,
  FileDown,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { getRootProps, getInputProps, isDragActive, error } = useFileUpload({
    onSuccess: async (data, file) => {
      setIsAnalyzing(true);

      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            headers: data.headers,
            rows: data.rows,
            datasetName: file.name,
          }),
        });

        if (!response.ok) throw new Error("Failed to analyze");

        const { data: results } = await response.json();
        const datasetId = `dataset-${Date.now()}`;

        const analysisData = {
          datasetName: file.name,
          headers: data.headers,
          rows: data.rows,
          healthScore: results.healthScore,
          charts: results.charts,
          insights: [],
          datasetType: results.datasetType,
          rowCount: results.rowCount ?? data.rows.length,
          columnCount: results.columnCount ?? data.headers.length,
          columnStats: results.columnStats,
        };

        sessionStorage.setItem(`analysis-${datasetId}`, JSON.stringify(analysisData));
        router.push(`/dashboard/${datasetId}`);
      } catch (err) {
        console.error("Analysis error:", err);
        setIsAnalyzing(false);
        alert("Failed to analyze. Please try again.");
      }
    },
    onError: (err) => console.error("Upload error:", err),
  });

  // Analyzing overlay
  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-violet-400 rounded-full blur-xl opacity-20 animate-pulse" />
            <Loader2 className="h-16 w-16 animate-spin text-violet-600 mx-auto relative" />
          </div>
          <h2 className="mt-8 text-2xl font-bold text-slate-900">Analyzing your data...</h2>
          <p className="mt-2 text-slate-500">AI is finding insights in your spreadsheet</p>
          <div className="mt-6 flex justify-center gap-2">
            <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
      {/* Simple Nav */}
      <nav className="px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="bg-violet-600 text-white p-1.5 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-slate-900">Lumina</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-6 pt-12 pb-24">
        <div className="max-w-3xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            Turn your spreadsheet into
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600"> insights</span>
          </h1>

          <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
            Drop your Excel or CSV file. Get AI-powered analysis, charts, and a downloadable PowerPoint in seconds.
          </p>

          {/* Upload Zone */}
          <div className="mt-10">
            <div
              {...getRootProps()}
              className={`
                relative p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all
                ${isDragActive
                  ? "border-violet-500 bg-violet-50"
                  : "border-slate-200 hover:border-violet-300 hover:bg-violet-50/50"
                }
              `}
            >
              <input {...getInputProps()} />

              <div className="flex flex-col items-center">
                <div className={`
                  p-4 rounded-2xl transition-all
                  ${isDragActive ? "bg-violet-100" : "bg-slate-100"}
                `}>
                  <Upload className={`w-8 h-8 ${isDragActive ? "text-violet-600" : "text-slate-500"}`} />
                </div>

                <p className="mt-4 text-lg font-medium text-slate-900">
                  {isDragActive ? "Drop it here!" : "Drop your spreadsheet here"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  or click to browse
                </p>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                  <span className="px-2 py-1 bg-slate-100 rounded">.xlsx</span>
                  <span className="px-2 py-1 bg-slate-100 rounded">.csv</span>
                  <span>up to 20MB</span>
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* What you get */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="font-semibold text-slate-900">AI Insights</h3>
              <p className="mt-1 text-sm text-slate-500">Automatic analysis of your data patterns</p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-slate-900">Auto Charts</h3>
              <p className="mt-1 text-sm text-slate-500">Beautiful visualizations generated instantly</p>
            </div>

            <div className="p-6 rounded-xl bg-white border border-slate-100 shadow-sm">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <FileDown className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-900">PowerPoint Export</h3>
              <p className="mt-1 text-sm text-slate-500">Download editable presentations</p>
            </div>
          </div>

          {/* Speed badge */}
          <div className="mt-12 inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm">
            <Zap className="w-4 h-4 text-yellow-400" />
            Analysis takes 3-5 seconds
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="px-6 py-8 border-t border-slate-100">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-slate-400">
          <span>© 2024 Lumina</span>
          <span>Transform spreadsheets into insights</span>
        </div>
      </footer>
    </div>
  );
}
