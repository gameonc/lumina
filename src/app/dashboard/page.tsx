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
  X,
  Zap,
  CheckCircle2,
} from "lucide-react";

// --- PRICING MODAL COMPONENT ---
const PricingModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col md:flex-row">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors z-10">
          <X className="w-5 h-5 text-slate-600" />
        </button>

        {/* Left Side */}
        <div className="bg-slate-900 p-8 md:p-12 text-white md:w-2/5 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-xl mb-6">
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Upgrade to Pro</h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              Unlock unlimited AI-powered data analysis and professional reports.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /><span className="font-medium">Unlimited Data Uploads</span></div>
              <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /><span className="font-medium">Export to PowerPoint</span></div>
              <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /><span className="font-medium">Advanced AI Chat</span></div>
              <div className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /><span className="font-medium">Priority Support</span></div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-2">Trusted By</p>
            <div className="flex gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah&backgroundColor=b6e3f4" alt="User" className="w-8 h-8 rounded-full" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Mike&backgroundColor=c0aede" alt="User" className="w-8 h-8 rounded-full" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Emma&backgroundColor=ffd5dc" alt="User" className="w-8 h-8 rounded-full" />
            </div>
          </div>
        </div>

        {/* Right Side - Plans */}
        <div className="p-8 md:p-12 md:w-3/5 bg-white">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-slate-900">Choose your plan</h3>
            <p className="text-slate-500">Simple pricing, cancel anytime.</p>
          </div>
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-xl p-4 opacity-60 flex items-center justify-between">
              <div><span className="font-bold text-slate-700">Free Starter</span><p className="text-xs text-slate-500">5 credits / month</p></div>
              <span className="text-xl font-bold text-slate-900">$0</span>
            </div>
            <div className="border-2 border-blue-600 bg-blue-50/30 rounded-xl p-6 relative">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-sm">MOST POPULAR</div>
              <div className="flex justify-between items-center mb-4">
                <div><h4 className="font-bold text-lg text-slate-900">Pro Analyst</h4><p className="text-sm text-slate-500">Perfect for professionals</p></div>
                <div className="text-right"><div className="text-3xl font-bold text-slate-900">$19</div><span className="text-xs text-slate-500">/ month</span></div>
              </div>
              <ul className="space-y-2 mb-6 text-sm text-slate-600">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> 500 Credits per month</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Advanced Visualizations</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-600" /> Remove Watermark</li>
              </ul>
              <button onClick={onClose} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
                <CreditCard className="w-4 h-4" /> Upgrade Now
              </button>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors flex items-center justify-between cursor-pointer">
              <div><span className="font-bold text-slate-700">Enterprise</span><p className="text-xs text-slate-500">Unlimited & Custom API</p></div>
              <span className="text-lg font-bold text-slate-900">Contact Us</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [credits, setCredits] = useState(5);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showPricing, setShowPricing] = useState(false);

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
    <div className="min-h-screen bg-slate-50 flex flex-col">
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

      <main className="max-w-4xl mx-auto px-6 py-12 flex-1">
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
                className="relative flex-1 py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98]"
              >
                {!isAnalyzing && (
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 animate-pulse opacity-50 blur-sm -z-10"></span>
                )}
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
                <button
                  onClick={() => setShowPricing(true)}
                  className="text-sm text-amber-600 hover:text-amber-700 underline"
                >
                  Upgrade to Pro for unlimited analyses
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2 font-bold text-lg text-white">
              <div className="bg-white text-slate-900 p-1 rounded">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              Lumina
            </div>
            <nav className="flex items-center gap-6 text-sm">
              <button onClick={() => router.push("/")} className="hover:text-white transition-colors">
                Home
              </button>
              <button onClick={() => setShowPricing(true)} className="hover:text-white transition-colors">
                Pricing
              </button>
              <button className="hover:text-white transition-colors">
                Privacy Policy
              </button>
              <button className="hover:text-white transition-colors">
                Terms of Service
              </button>
            </nav>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm">
            © 2024 Lumina Data Insights. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Pricing Modal */}
      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
    </div>
  );
}
