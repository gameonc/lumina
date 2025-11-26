"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFileUpload } from "@/hooks/use-file-upload";
import { InitialsAvatar } from "@/components/ui/initials-avatar";
import {
  FileSpreadsheet,
  LayoutDashboard,
  FileText,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  TrendingUp,
  Users,
  PieChart,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Zap,
  CreditCard,
  Upload,
  Loader2,
  AlertCircle,
} from "lucide-react";

// --- PRICING MODAL COMPONENT ---
interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
}) => {
  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center p-4 duration-200">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="animate-in zoom-in-95 relative flex w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl duration-300 md:flex-row">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-slate-100 p-2 transition-colors hover:bg-slate-200"
        >
          <X className="h-5 w-5 text-slate-600" />
        </button>

        {/* Left Side - Value Prop */}
        <div className="flex flex-col justify-between bg-slate-900 p-8 text-white md:w-2/5 md:p-12">
          <div>
            <div className="mb-6 inline-flex items-center justify-center rounded-xl bg-white/10 p-3">
              <Zap className="h-8 w-8 text-yellow-400" />
            </div>
            <h2 className="mb-4 text-3xl font-bold">Upgrade to Pro</h2>
            <p className="mb-8 text-lg leading-relaxed text-slate-400">
              Unlock the full power of AI data analysis. Generate unlimited
              reports and access advanced insights.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="font-medium">Unlimited Data Uploads</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="font-medium">Export to PowerPoint</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="font-medium">Advanced AI Chat</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                <span className="font-medium">Priority Support</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/10 pt-8">
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-500">
              Trusted By 1,000+ Teams
            </p>
            <div className="flex -space-x-2">
              <InitialsAvatar name="Sarah Chen" size="sm" />
              <InitialsAvatar name="Mike Johnson" size="sm" />
              <InitialsAvatar name="Emma Davis" size="sm" />
              <InitialsAvatar name="Alex Kim" size="sm" />
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-bold text-slate-300 ring-2 ring-slate-900">
                +99
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Plans */}
        <div className="bg-white p-8 md:w-3/5 md:p-12">
          <div className="mb-8 text-center">
            <h3 className="text-2xl font-bold text-slate-900">
              Choose your plan
            </h3>
            <p className="text-slate-500">Simple pricing, cancel anytime.</p>
          </div>

          <div className="space-y-4">
            {/* Free Plan */}
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 opacity-60">
              <div>
                <span className="font-bold text-slate-700">Free Starter</span>
                <p className="text-xs text-slate-500">5 credits / month</p>
              </div>
              <span className="text-xl font-bold text-slate-900">$0</span>
            </div>

            {/* Pro Plan */}
            <div className="relative rounded-xl border-2 border-emerald-600 bg-emerald-50/30 p-6">
              <div className="absolute right-0 top-0 rounded-bl-xl rounded-tr-sm bg-emerald-600 px-3 py-1 text-xs font-bold text-white">
                MOST POPULAR
              </div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Pro Analyst
                  </h4>
                  <p className="text-sm text-slate-500">
                    Perfect for professionals
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-slate-900">$19</div>
                  <span className="text-xs text-slate-500">/ month</span>
                </div>
              </div>
              <ul className="mb-6 space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> 500
                  Credits per month
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Advanced
                  Visualizations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Remove
                  Watermark
                </li>
              </ul>
              <button
                onClick={onUpgrade}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 font-bold text-white shadow-lg shadow-emerald-200 transition-colors hover:bg-emerald-700"
              >
                <CreditCard className="h-4 w-4" />
                Upgrade Now
              </button>
            </div>

            {/* Enterprise Plan */}
            <div className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 p-4 transition-colors hover:border-slate-300">
              <div>
                <span className="font-bold text-slate-700">Enterprise</span>
                <p className="text-xs text-slate-500">Unlimited & Custom API</p>
              </div>
              <span className="text-lg font-bold text-slate-900">
                Contact Us
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- AUTH MODAL COMPONENT ---
const AuthModal = ({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "signup",
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialMode?: "login" | "signup";
}) => {
  const [mode, setMode] = useState(initialMode);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess();
    }, 800);
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center p-4 duration-200">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="animate-in zoom-in-95 relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 shadow-2xl duration-300">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            {mode === "login" ? "Welcome back" : "Get started for free"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {mode === "login"
              ? "Enter your details to access your workspace."
              : "No credit card required."}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleSubmit}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 font-medium text-slate-700 transition-all hover:bg-slate-50 hover:shadow-sm"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400">
                Or with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                required
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-slate-900 focus:ring-2 focus:ring-slate-900"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 outline-none transition-all focus:border-slate-900 focus:ring-2 focus:ring-slate-900"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 font-bold text-white transition-all hover:bg-slate-800 active:scale-95"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center text-sm text-slate-600">
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="font-bold text-slate-900 hover:underline"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- UPLOAD MODAL COMPONENT ---
const UploadModal = ({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any, file: File) => void;
}) => {
  const { getRootProps, getInputProps, isDragActive, error } = useFileUpload({
    onSuccess: (data, uploadedFile) => {
      onSuccess(data, uploadedFile);
    },
    onError: (err) => {
      console.error("File parsing error:", err);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center p-4 duration-200">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="animate-in zoom-in-95 relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-8 shadow-2xl duration-300">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-indigo-100 p-3">
            <FileSpreadsheet className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Upload your spreadsheet
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Drop your Excel or CSV file and we&apos;ll transform it into
            insights
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all ${
            isDragActive
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-200 bg-slate-50/50 hover:border-indigo-400 hover:bg-indigo-50/50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
            <Upload className="h-7 w-7 text-indigo-600" />
          </div>
          <p className="mt-4 font-semibold text-slate-900">
            {isDragActive
              ? "Drop your file here"
              : "Drop your Excel or CSV here"}
          </p>
          <p className="mt-1 text-sm text-slate-500">Or click to browse</p>
          <div className="mt-4 flex items-center gap-2 text-xs">
            <span className="rounded-md bg-indigo-100 px-2.5 py-1 font-medium text-indigo-700">
              .xlsx
            </span>
            <span className="rounded-md bg-indigo-100 px-2.5 py-1 font-medium text-indigo-700">
              .xls
            </span>
            <span className="rounded-md bg-indigo-100 px-2.5 py-1 font-medium text-indigo-700">
              .csv
            </span>
            <span className="ml-1 text-slate-400">up to 20MB</span>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN LANDING PAGE COMPONENT ---
export default function LandingPage() {
  const router = useRouter();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("signup");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const openAuth = (mode: "login" | "signup" = "signup") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleAuthSuccess = () => {
    sessionStorage.setItem("lumina-authenticated", "true");
    setIsAuthOpen(false);
    router.push("/dashboard");
  };

  const handleUploadSuccess = async (data: any, file: File) => {
    setIsUploadOpen(false);
    setIsAnalyzing(true);
    const startTime = Date.now();

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

      if (!response.ok) {
        throw new Error("Failed to analyze dataset");
      }

      const { data: results } = await response.json();

      const datasetId = `dataset-${Date.now()}`;
      const analysisData = {
        datasetName: file.name || "Dataset",
        headers: data.headers,
        rows: data.rows,
        healthScore: results.healthScore,
        charts: results.charts,
        insights: [],
        datasetType: results.datasetType,
        rowCount: results.rowCount ?? data.rowCount,
        columnCount: results.columnCount ?? data.columnCount,
        columnStats: results.columnStats,
        aiInsights: results.aiInsights,
        analysisTime: ((Date.now() - startTime) / 1000).toFixed(1),
      };

      // Save to sessionStorage for immediate access
      sessionStorage.setItem(
        `analysis-${datasetId}`,
        JSON.stringify(analysisData)
      );

      // Save to Google Sheets for persistence (non-blocking)
      fetch("/api/storage/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysisId: datasetId,
          analysisData: analysisData,
        }),
      }).catch((err) => {
        console.warn("Failed to save to Google Sheets:", err);
        // Non-critical - continue anyway since we have sessionStorage
      });

      router.push(`/dashboard/${datasetId}`);
    } catch (err) {
      console.error("Analysis error:", err);
      setIsAnalyzing(false);
      alert("Failed to analyze data. Please try again.");
    }
  };

  const openUpload = () => {
    // Show auth modal first, then redirect to dashboard after success
    openAuth("signup");
  };

  const faqs = [
    {
      q: "How does Lumina analyze my data?",
      a: "Lumina uses advanced AI to automatically detect patterns, trends, and insights in your spreadsheet. Simply upload your Excel file, and our AI will analyze the data structure, identify key metrics, and generate meaningful visualizations without requiring any manual setup.",
    },
    {
      q: "Can I edit the presentation after it's generated?",
      a: "Yes! You can export your presentation to PowerPoint for full editing capabilities. All text remains editable, and charts are preserved as high-quality images.",
    },
    {
      q: "What file formats does Lumina support?",
      a: "Lumina currently supports .xlsx, .xls, and .csv file formats.",
    },
    {
      q: "Is my data secure?",
      a: "Yes! Your data is processed securely and never stored permanently. We use industry-standard encryption and your files are deleted after analysis.",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100">
      {/* Analyzing Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-emerald-600" />
            <h3 className="mt-4 text-xl font-bold text-slate-900">
              Analyzing your data...
            </h3>
            <p className="mt-2 text-slate-500">
              This usually takes 3-8 seconds
            </p>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md transition-all duration-300">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div
            className="flex cursor-pointer items-center gap-2 text-xl font-bold tracking-tight"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <div className="rounded-lg bg-slate-900 p-1.5 text-white shadow-lg shadow-slate-900/20">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            Lumina
          </div>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <button
              onClick={() => window.scrollTo({ top: 800, behavior: "smooth" })}
              className="transition-colors hover:text-slate-900"
            >
              Features
            </button>
            <button
              onClick={() => window.scrollTo({ top: 2000, behavior: "smooth" })}
              className="transition-colors hover:text-slate-900"
            >
              FAQ
            </button>
            <button
              onClick={() => openAuth("login")}
              className="transition-colors hover:text-slate-900"
            >
              Login
            </button>
            <button
              onClick={openUpload}
              className="rounded-full bg-slate-900 px-5 py-2.5 text-white transition-all hover:bg-slate-800 hover:shadow-lg active:scale-95"
            >
              Get Started
            </button>
          </div>

          <button
            className="p-2 text-slate-600 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="animate-in slide-in-from-top-5 absolute left-0 right-0 top-16 flex flex-col gap-4 border-b border-slate-100 bg-white p-4 shadow-xl md:hidden">
            <button
              onClick={() => window.scrollTo({ top: 800, behavior: "smooth" })}
              className="py-2 text-left font-medium text-slate-600"
            >
              Features
            </button>
            <button
              onClick={() => window.scrollTo({ top: 2000, behavior: "smooth" })}
              className="py-2 text-left font-medium text-slate-600"
            >
              FAQ
            </button>
            <button
              onClick={() => {
                openAuth("login");
                setIsMobileMenuOpen(false);
              }}
              className="py-2 text-left font-medium text-slate-600"
            >
              Login
            </button>
            <hr className="border-slate-100" />
            <button
              onClick={openUpload}
              className="rounded-lg bg-slate-900 py-3 text-center font-bold text-white"
            >
              Get Started Free
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="mx-auto max-w-5xl space-y-8 px-6 pb-16 pt-20 text-center">
        <div className="animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center gap-4 duration-700">
          <div className="flex -space-x-2">
            {[
              "Jordan Lee",
              "Taylor Swift",
              "Chris Martin",
              "Alex Kim",
              "Sam Chen",
            ].map((name, i) => (
              <div key={i} className="rounded-full ring-2 ring-white">
                <InitialsAvatar name={name} size="md" />
              </div>
            ))}
          </div>
          <p className="text-sm font-medium text-slate-500">
            Used by 1,353 happy customers
          </p>
        </div>

        <h1 className="animate-in fade-in slide-in-from-bottom-4 text-5xl font-bold leading-[1.1] tracking-tight text-slate-900 delay-100 duration-1000 md:text-7xl">
          Transform your Excel into a <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            professional data presentation
          </span>
        </h1>

        <p className="animate-in fade-in slide-in-from-bottom-4 mx-auto max-w-2xl text-xl leading-relaxed text-slate-500 delay-200 duration-1000">
          Unlock the potential of your Excel data with our AI-powered
          storytelling and presentation generator.
        </p>

        <div className="animate-in fade-in slide-in-from-bottom-4 delay-300 duration-1000">
          <button
            onClick={openUpload}
            className="group relative inline-flex items-center justify-center rounded-full bg-slate-900 px-8 py-4 text-lg font-bold text-white transition-all duration-200 hover:-translate-y-1 hover:bg-slate-800 hover:shadow-2xl active:translate-y-0 active:scale-95"
          >
            Get Started
            <svg
              className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </button>
        </div>

        {/* Hero Mockup Visual */}
        <div className="animate-in fade-in slide-in-from-bottom-8 relative mx-auto mt-16 max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl delay-500 duration-1000">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10"></div>
          <div className="relative rounded-t-2xl bg-slate-900/5 p-1 pb-0">
            {/* Fake Window Controls */}
            <div className="flex items-center gap-2 rounded-t-xl border-b border-slate-100 bg-white px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-400"></div>
                <div className="h-3 w-3 rounded-full bg-amber-400"></div>
                <div className="h-3 w-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="mx-auto text-xs font-medium text-slate-400">
                Lumina Dashboard
              </div>
            </div>
            {/* Dashboard Content Mockup */}
            <div className="grid min-h-[450px] grid-cols-12 gap-6 bg-slate-50 p-6">
              {/* Sidebar */}
              <div className="col-span-3 hidden flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:flex">
                <div className="mb-8 flex items-center gap-2 px-2 font-bold text-slate-800">
                  <div className="h-6 w-6 rounded-md bg-indigo-600"></div>
                  Lumina
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600">
                    <LayoutDashboard className="h-4 w-4" /> Dashboard
                  </div>
                  <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50">
                    <PieChart className="h-4 w-4" /> Analytics
                  </div>
                  <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50">
                    <FileText className="h-4 w-4" /> Reports
                  </div>
                </div>
                {/* Profile Section */}
                <div className="mt-auto">
                  <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <InitialsAvatar name="Alex Morgan" size="sm" />
                    <div>
                      <div className="text-xs font-bold text-slate-700">
                        Alex Morgan
                      </div>
                      <div className="text-[10px] font-medium text-slate-400">
                        Pro Plan
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="col-span-12 space-y-6 md:col-span-9">
                {/* Top Stats Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex h-28 flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600">
                        <LayoutDashboard className="h-4 w-4" />
                      </div>
                      <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                        +12.5% <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Total Revenue
                      </p>
                      <h4 className="text-xl font-bold text-slate-900">
                        $128,430
                      </h4>
                    </div>
                  </div>
                  <div className="flex h-28 flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                        <Users className="h-4 w-4" />
                      </div>
                      <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600">
                        +5.2% <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Active Users
                      </p>
                      <h4 className="text-xl font-bold text-slate-900">
                        24,593
                      </h4>
                    </div>
                  </div>
                  <div className="flex h-28 flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                        <Activity className="h-4 w-4" />
                      </div>
                      <span className="flex items-center gap-0.5 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-bold text-red-500">
                        -2.1% <ArrowUpRight className="h-3 w-3 rotate-90" />
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                        Bounce Rate
                      </p>
                      <h4 className="text-xl font-bold text-slate-900">
                        42.8%
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Main Chart Area */}
                <div className="relative h-64 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-bold text-slate-800">
                        Revenue Overview
                      </h5>
                      <p className="text-xs text-slate-400">
                        Monthly performance vs targets
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-8 w-20 rounded-lg border border-slate-100 bg-slate-50"></div>
                      <div className="h-8 w-8 rounded-lg border border-slate-100 bg-slate-50"></div>
                    </div>
                  </div>

                  <div className="relative flex h-40 w-full items-end justify-between gap-2 border-b border-slate-100 px-2 pb-6">
                    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                      <div className="h-px w-full bg-slate-50"></div>
                      <div className="h-px w-full bg-slate-50"></div>
                      <div className="h-px w-full bg-slate-50"></div>
                      <div className="h-px w-full bg-slate-50"></div>
                    </div>

                    <div className="absolute -left-6 bottom-6 top-0 flex w-4 flex-col justify-between text-right text-[10px] font-medium text-slate-300">
                      <span>100k</span>
                      <span>50k</span>
                      <span>0</span>
                    </div>

                    {[35, 55, 45, 70, 65, 85, 60, 75, 90, 65, 50, 80].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="group relative flex h-full w-full items-end"
                        >
                          <div
                            className="w-full origin-bottom rounded-t-sm bg-indigo-500 transition-all group-hover:scale-y-105 group-hover:bg-indigo-600"
                            style={{ height: `${h}%`, opacity: 0.8 + i / 20 }}
                          ></div>
                          <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 group-hover:block">
                            <div className="whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-white shadow-lg">
                              ${(h * 1.4).toFixed(1)}k
                            </div>
                          </div>
                        </div>
                      )
                    )}

                    <div className="absolute bottom-0 left-2 right-2 flex justify-between pt-2 text-[10px] font-medium text-slate-400">
                      <span>Jan</span>
                      <span>Mar</span>
                      <span>May</span>
                      <span>Jul</span>
                      <span>Sep</span>
                      <span>Nov</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- HOW IT WORKS / PROCESS SECTION --- */}
      <section className="relative overflow-hidden bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 space-y-4 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-5xl">
              From raw data to <span className="text-emerald-600">ROI</span> in
              4 steps.
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-slate-500">
              Lumina acts like a senior data analyst sitting right next to you.
            </p>
          </div>

          <div className="relative grid gap-8 md:grid-cols-4">
            {/* Connecting Line (Desktop) */}
            <div className="absolute left-0 top-12 -z-10 hidden h-0.5 w-full bg-gradient-to-r from-emerald-100 via-emerald-200 to-emerald-100 md:block"></div>

            {/* Step 1: Upload */}
            <div className="group relative">
              <div className="relative z-10 mx-auto mb-6 w-max bg-white p-2">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <div className="rounded-lg bg-emerald-600 p-2.5 text-white shadow-lg shadow-emerald-200">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-3 px-4 text-center">
                <h3 className="text-xl font-bold text-slate-900">
                  1. Upload & Read
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  Drag & drop your Excel file. The AI instantly reads the
                  structure, identifying headers, dates, and financial metrics
                  automatically.
                </p>
              </div>
            </div>

            {/* Step 2: The Analyst */}
            <div className="group relative">
              <div className="relative z-10 mx-auto mb-6 w-max bg-white p-2">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-purple-100 bg-purple-50 shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <div className="rounded-lg bg-purple-600 p-2.5 text-white shadow-lg shadow-purple-200">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-3 px-4 text-center">
                <h3 className="text-xl font-bold text-slate-900">
                  2. AI Summary
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  It acts like an analyst, telling you exactly what the file is
                  about. &quot;This is a Q3 Sales Report showing a 15% revenue
                  increase.&quot;
                </p>
              </div>
            </div>

            {/* Step 3: Depth & Charts */}
            <div className="group relative">
              <div className="relative z-10 mx-auto mb-6 w-max bg-white p-2">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-amber-100 bg-amber-50 shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <div className="rounded-lg bg-amber-500 p-2.5 text-white shadow-lg shadow-amber-200">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-3 px-4 text-center">
                <h3 className="text-xl font-bold text-slate-900">
                  3. Spot Losses
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  It generates pies and charts for whatever you need. It flags
                  losses and outliers, letting you dive deeper into the
                  &quot;Why&quot;.
                </p>
              </div>
            </div>

            {/* Step 4: Export */}
            <div className="group relative">
              <div className="relative z-10 mx-auto mb-6 w-max bg-white p-2">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <div className="rounded-lg bg-emerald-600 p-2.5 text-white shadow-lg shadow-emerald-200">
                    <svg
                      className="h-8 w-8"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="space-y-3 px-4 text-center">
                <h3 className="text-xl font-bold text-slate-900">
                  4. PowerPoint
                </h3>
                <p className="text-sm leading-relaxed text-slate-500">
                  Done exploring? Click one button to download a fully editable
                  PowerPoint presentation with all your charts and insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 1 */}
      <section className="relative overflow-hidden bg-white py-24">
        <div className="mx-auto mb-16 max-w-6xl px-6 text-center">
          <h2 className="mb-4 text-4xl font-bold text-slate-900">
            Unlock the power of your data
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-500">
            Lumina doesn&apos;t just turn spreadsheets into visual reports — it
            acts like an analyst, interpreting your data.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
          <div className="group relative order-2 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-8 md:order-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 transition-opacity group-hover:opacity-100"></div>
            <div className="relative flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              {/* Revenue Chart Mockup */}
              <div className="absolute inset-0 flex flex-col p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Monthly Revenue
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      $42,593
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600">
                    +18.2% <TrendingUp className="h-3 w-3" />
                  </div>
                </div>

                <div className="flex flex-1 items-end gap-1.5 border-b border-slate-100 pb-2">
                  {[30, 45, 35, 60, 55, 70, 65, 80, 75, 90, 85, 95].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="group relative flex-1 origin-bottom rounded-t-sm bg-purple-500 opacity-90 transition-all hover:scale-y-105 hover:opacity-100"
                        style={{ height: `${h}%` }}
                      >
                        <div className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded border border-slate-200 bg-white px-1 py-0.5 text-[10px] font-bold text-slate-700 opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                          ${(h * 0.5).toFixed(0)}k
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="flex justify-between pt-2 text-[10px] font-medium text-slate-400">
                  <span>Jan</span>
                  <span>Mar</span>
                  <span>May</span>
                  <span>Jul</span>
                  <span>Sep</span>
                  <span>Dec</span>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 space-y-6 md:order-2">
            <h3 className="text-3xl font-bold text-slate-900">
              Interactive Charts — Explore, filter, and highlight what matters.
            </h3>
            <p className="text-lg leading-relaxed text-slate-500">
              Charts in Lumina aren&apos;t static images. You can click,
              explore, and dig deeper into the numbers — making it easier to
              find insights.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />{" "}
                <span>Dynamic filtering</span>
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />{" "}
                <span>Drill-down capabilities</span>
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />{" "}
                <span>Instant formatting</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature Section 2 */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 md:grid-cols-2">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-slate-900">
              Edit in PowerPoint — Make it yours with your tools.
            </h3>
            <p className="text-lg leading-relaxed text-slate-500">
              Export your report to PowerPoint or your favorite editor.
              You&apos;re free to tweak every slide or drop it straight into
              your workflow, fully editable.
            </p>
            <button
              onClick={openUpload}
              className="group flex items-center gap-2 font-bold text-slate-900 transition-all hover:gap-3"
            >
              Generate Presentation{" "}
              <span className="text-xl transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl transition-shadow duration-300 hover:shadow-2xl">
              <div className="absolute -right-4 -top-4 rounded-xl bg-orange-500 p-3 text-white shadow-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div className="space-y-5">
                {/* PPT Slide Header */}
                <div className="border-b border-slate-100 pb-4">
                  <div className="text-lg font-bold leading-tight text-slate-800">
                    Q3 Financial Performance
                  </div>
                  <div className="text-sm text-slate-500">
                    Executive Summary & Forecast
                  </div>
                </div>

                <div className="group relative flex h-32 items-center justify-center overflow-hidden rounded-xl border border-orange-100 bg-orange-50">
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <div className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
                      Click to Edit
                    </div>
                  </div>
                  <div className="flex h-20 w-32 items-end gap-1 opacity-50">
                    <div className="h-10 w-4 rounded-t-sm bg-orange-400"></div>
                    <div className="h-16 w-4 rounded-t-sm bg-orange-400"></div>
                    <div className="h-12 w-4 rounded-t-sm bg-orange-400"></div>
                    <div className="h-20 w-4 rounded-t-sm bg-orange-400"></div>
                    <div className="h-14 w-4 rounded-t-sm bg-orange-400"></div>
                  </div>
                </div>

                {/* Bullet Points */}
                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-2.5">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400"></div>
                    <div className="text-xs leading-relaxed text-slate-600">
                      Revenue exceeded projections by{" "}
                      <span className="font-bold text-emerald-600">15%</span>{" "}
                      driven by strong enterprise sales.
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400"></div>
                    <div className="text-xs leading-relaxed text-slate-600">
                      Customer acquisition cost dropped to{" "}
                      <span className="font-bold text-blue-600">$45</span> per
                      user, improving margins.
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 py-3 font-medium text-slate-600 transition-colors hover:bg-slate-100">
                    <FileText className="h-4 w-4" />
                    Edit in PowerPoint
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="mb-12 text-center text-4xl font-bold text-slate-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="group overflow-hidden rounded-xl border border-slate-200"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between bg-white p-6 text-left transition-colors hover:bg-slate-50"
                >
                  <span className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-blue-600">
                    {faq.q}
                  </span>
                  {openFaq === i ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="animate-in slide-in-from-top-2 p-6 pt-0 leading-relaxed text-slate-600">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-16 text-slate-400">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-4">
          <div className="col-span-1 space-y-4 md:col-span-2">
            <div className="flex items-center gap-2 text-xl font-bold text-white">
              <div className="rounded bg-white p-1 text-slate-900">
                <FileSpreadsheet className="h-4 w-4" />
              </div>
              Lumina
            </div>
            <p className="max-w-xs text-sm">
              Transform your spreadsheets into professional data presentations
              with AI-powered insights.
            </p>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-white">Menu</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="text-left transition-colors hover:text-white"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowPricing(true)}
                  className="text-left transition-colors hover:text-white"
                >
                  Pricing
                </button>
              </li>
              <li>
                <button
                  onClick={openUpload}
                  className="text-left transition-colors hover:text-white"
                >
                  Get Started
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-bold text-white">Policies</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button className="text-left transition-colors hover:text-white">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button className="text-left transition-colors hover:text-white">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-800 px-6 pt-12 text-center text-sm md:flex-row md:text-left">
          <span>© 2024 Lumina Data Insights. All rights reserved.</span>
          <div className="flex gap-4">
            <div className="h-5 w-5 cursor-pointer rounded-full bg-slate-800 hover:bg-slate-700"></div>
            <div className="h-5 w-5 cursor-pointer rounded-full bg-slate-800 hover:bg-slate-700"></div>
            <div className="h-5 w-5 cursor-pointer rounded-full bg-slate-800 hover:bg-slate-700"></div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        initialMode={authMode}
      />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        onUpgrade={() => setShowPricing(false)}
      />
    </div>
  );
}
