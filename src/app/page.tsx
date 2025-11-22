"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFileUpload } from "@/hooks/use-file-upload";
import { Card } from "@/components/ui/card";
import { formatBytes } from "@/lib/utils";
import {
  Upload,
  FileSpreadsheet,
  AlertCircle,
  Loader2,
  BarChart3,
  Sparkles,
  Presentation,
  FileText,
  Shield,
  Star,
  ChevronDown,
  Check,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    parsedData,
    error,
    file,
  } = useFileUpload({
    onSuccess: (data, uploadedFile) => {
      console.log("File parsed successfully:", data);
      handleAnalyze(data, uploadedFile);
    },
    onError: (err) => {
      console.error("File parsing error:", err);
    },
  });

  const handleAnalyze = async (data?: any, uploadedFile?: File) => {
    const dataToAnalyze = data || parsedData;
    const currentFile = uploadedFile || file;
    if (!dataToAnalyze) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    const startTime = Date.now();

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headers: dataToAnalyze.headers,
          rows: dataToAnalyze.rows,
          datasetName: currentFile?.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze dataset");
      }

      const { data: results } = await response.json();

      const datasetId = `dataset-${Date.now()}`;
      const analysisData = {
        datasetName: currentFile?.name || "Dataset",
        headers: dataToAnalyze.headers,
        rows: dataToAnalyze.rows,
        healthScore: results.healthScore,
        charts: results.charts,
        insights: [],
        datasetType: results.datasetType,
        rowCount: results.rowCount ?? dataToAnalyze.rowCount,
        columnCount: results.columnCount ?? dataToAnalyze.columnCount,
        analysisTime: ((Date.now() - startTime) / 1000).toFixed(1),
      };

      sessionStorage.setItem(`analysis-${datasetId}`, JSON.stringify(analysisData));
      router.push(`/results/${datasetId}`);
    } catch (err) {
      console.error("Analysis error:", err);
      setAnalysisError(
        err instanceof Error ? err.message : "Failed to analyze data"
      );
    }
    finally {
      setIsAnalyzing(false);
    }
  };

  const faqs = [
    {
      q: "What file types are supported?",
      a: "We support Excel files (.xlsx, .xls) and CSV files. Simply drag and drop or click to upload.",
    },
    {
      q: "How does the AI analysis work?",
      a: "Our AI automatically detects your data types, identifies patterns, and generates relevant charts and insights based on your specific dataset.",
    },
    {
      q: "Is my data secure?",
      a: "Yes! Your data is processed securely and never stored permanently. We use industry-standard encryption and your files are deleted after analysis.",
    },
    {
      q: "Can I export my results?",
      a: "Absolutely! You can export your analysis as a professional PDF report with all charts and insights included.",
    },
  ];

  const features = [
    {
      icon: BarChart3,
      title: "Auto-Generated Charts",
      desc: "AI picks the best charts for your data. No design skills needed.",
    },
    {
      icon: Sparkles,
      title: "AI Writes the Story",
      desc: "Get insights that explain what your data means. Not just numbers.",
    },
    {
      icon: Presentation,
      title: "PowerPoint Ready",
      desc: "Download a presentation-ready deck. Title slide, charts, insights included.",
    },
    {
      icon: FileText,
      title: "PDF Export Too",
      desc: "Prefer a document? Export as PDF with one click.",
    },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Navigation */}
      <nav className="border-b border-neutral-100 dark:border-neutral-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-neutral-900 dark:text-white">
              DataInsights
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
              Login
            </button>
            <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-4 pt-16 pb-12">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white md:text-5xl">
            Excel to PowerPoint
            <span className="text-primary-600"> in 3 seconds </span>
        </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
            Upload your spreadsheet. AI generates charts, writes insights, and creates a presentation-ready deck. Just download.
          </p>

          {/* Social Proof */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-primary-400 to-primary-600 dark:border-neutral-900"
                />
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
                <span className="ml-1 text-sm font-medium text-neutral-900 dark:text-white">
                  4.9
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Loved by 2,500+ users
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Upload Card */}
      <section className="px-4 pb-16">
        <div className="mx-auto max-w-2xl">
          <Card className="overflow-hidden border-2 border-dashed border-neutral-200 bg-neutral-50/50 dark:border-neutral-700 dark:bg-neutral-900/50">
            <div
              {...getRootProps()}
              className={`flex cursor-pointer flex-col items-center justify-center p-12 transition-all ${
                isDragActive
                  ? "border-primary-500 bg-primary-50 dark:bg-primary-950/30"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-800/50"
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                <Upload className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">
                {isDragActive ? "Drop your file here" : "Drop your Excel or CSV here"}
              </h3>
              <p className="mt-2 text-sm text-neutral-500">
                Or click to browse your files
              </p>
              <div className="mt-4 flex items-center gap-2 text-xs text-neutral-400">
                <span className="rounded bg-neutral-200 px-2 py-1 dark:bg-neutral-700">.xlsx</span>
                <span className="rounded bg-neutral-200 px-2 py-1 dark:bg-neutral-700">.xls</span>
                <span className="rounded bg-neutral-200 px-2 py-1 dark:bg-neutral-700">.csv</span>
                <span className="text-neutral-400">up to 20MB</span>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="border-t border-neutral-200 bg-red-50 px-6 py-4 dark:border-neutral-700 dark:bg-red-950/30">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              </div>
            )}

            {/* Analysis Error */}
            {analysisError && (
              <div className="border-t border-neutral-200 bg-red-50 px-6 py-4 dark:border-neutral-700 dark:bg-red-950/30">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {analysisError}
                  </p>
                </div>
              </div>
            )}

            {/* Analyzing State */}
            {isAnalyzing && (
              <div className="border-t border-neutral-200 bg-primary-50 px-6 py-6 dark:border-neutral-700 dark:bg-primary-950/30">
                <div className="flex items-center gap-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
                  <div>
                    <p className="font-medium text-primary-900 dark:text-primary-100">
                      Analyzing your data...
                    </p>
                    <p className="text-sm text-primary-700 dark:text-primary-300">
                      This usually takes 3-8 seconds
                    </p>
                  </div>
                </div>
                {parsedData && file && (
                  <div className="mt-4 flex items-center gap-3 rounded-lg border border-primary-200 bg-white p-3 dark:border-primary-800 dark:bg-neutral-900">
                    <FileSpreadsheet className="h-8 w-8 text-primary-600" />
                    <div>
                      <p className="font-medium text-neutral-900 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {formatBytes(file.size)} | {parsedData.rowCount.toLocaleString()} rows | {parsedData.columnCount} columns
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Trust Signals */}
          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-neutral-500">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>Secure & Private</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              <span>No signup required</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-neutral-100 bg-neutral-50 px-4 py-16 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">
            Everything you need to understand your data
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-neutral-600 dark:text-neutral-400">
            No formulas. No pivot tables. Just upload and get insights.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, i) => (
              <div
                key={i}
                className="rounded-xl border border-neutral-200 bg-white p-6 dark:border-neutral-700 dark:bg-neutral-800"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30">
                  <feature.icon className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="mt-4 font-semibold text-neutral-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t border-neutral-100 px-4 py-16 dark:border-neutral-800">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-2xl font-bold text-neutral-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-lg border border-neutral-200 dark:border-neutral-700"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-medium text-neutral-900 dark:text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-neutral-500 transition-transform ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="border-t border-neutral-200 px-5 py-4 dark:border-neutral-700">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      {faq.a}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-100 px-4 py-8 dark:border-neutral-800">
        <div className="mx-auto max-w-5xl text-center text-sm text-neutral-500">
          <p>Built with AI. Your data stays private.</p>
      </div>
      </footer>
    </main>
  );
}
