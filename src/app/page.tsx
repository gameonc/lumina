"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useFileUpload } from "@/hooks/use-file-upload";
import { formatBytes } from "@/lib/utils";
import {
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  BarChart3,
  LayoutDashboard,
  FileText,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Users,
  PieChart,
  ArrowUpRight,
  Activity,
  Upload,
  Loader2,
  AlertCircle,
} from "lucide-react";

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
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    parsedData,
    error,
    file,
  } = useFileUpload({
    onSuccess: (data, uploadedFile) => {
      onSuccess(data, uploadedFile);
    },
    onError: (err) => {
      console.error("File parsing error:", err);
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Upload your spreadsheet
          </h2>
          <p className="text-slate-500 mt-2 text-sm">
            Drop your Excel or CSV file and we&apos;ll transform it into insights
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all ${
            isDragActive
              ? "border-emerald-500 bg-emerald-50"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Upload className="h-7 w-7 text-slate-600" />
          </div>
          <p className="mt-4 font-medium text-slate-900">
            {isDragActive ? "Drop your file here" : "Drop your Excel or CSV here"}
          </p>
          <p className="mt-1 text-sm text-slate-500">Or click to browse</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <span className="rounded bg-slate-100 px-2 py-1">.xlsx</span>
            <span className="rounded bg-slate-100 px-2 py-1">.xls</span>
            <span className="rounded bg-slate-100 px-2 py-1">.csv</span>
            <span className="text-slate-400">up to 20MB</span>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN LANDING PAGE ---
export default function Home() {
  const router = useRouter();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        analysisTime: ((Date.now() - startTime) / 1000).toFixed(1),
      };

      sessionStorage.setItem(
        `analysis-${datasetId}`,
        JSON.stringify(analysisData)
      );
      router.push(`/results/${datasetId}`);
    } catch (err) {
      console.error("Analysis error:", err);
      setIsAnalyzing(false);
      alert("Failed to analyze data. Please try again.");
    }
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
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Analyzing Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto" />
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
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="bg-slate-900 text-white p-1.5 rounded-lg">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            Lumina
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button
              onClick={() =>
                window.scrollTo({ top: 800, behavior: "smooth" })
              }
              className="hover:text-slate-900 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() =>
                window.scrollTo({ top: 2000, behavior: "smooth" })
              }
              className="hover:text-slate-900 transition-colors"
            >
              FAQ
            </button>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-all hover:shadow-lg"
            >
              Get Started
            </button>
          </div>
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-900" />
            ) : (
              <Menu className="w-6 h-6 text-slate-900" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 p-4 space-y-3">
            <button
              onClick={() => {
                window.scrollTo({ top: 800, behavior: "smooth" });
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              Features
            </button>
            <button
              onClick={() => {
                window.scrollTo({ top: 2000, behavior: "smooth" });
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg"
            >
              FAQ
            </button>
            <button
              onClick={() => {
                setIsUploadOpen(true);
                setMobileMenuOpen(false);
              }}
              className="block w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg text-center font-medium"
            >
              Get Started
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="pt-20 pb-16 px-6 text-center max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-teal-500 overflow-hidden"
              />
            ))}
          </div>
          <p className="text-sm font-medium text-slate-500">
            Used by 1,353 happy customers
          </p>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
          Transform your Excel into a <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
            professional data presentation
          </span>
        </h1>

        <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
          Unlock the potential of your Excel data with our AI-powered
          storytelling and presentation generator.
        </p>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-slate-900 rounded-full hover:bg-slate-800 hover:shadow-2xl hover:-translate-y-1"
        >
          Get Started
          <svg
            className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1"
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

        {/* Hero Mockup Visual */}
        <div className="mt-16 relative mx-auto max-w-5xl shadow-2xl rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10"></div>
          <div className="relative bg-slate-900/5 p-1 pb-0 rounded-t-2xl">
            {/* Fake Window Controls */}
            <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-t-xl border-b border-slate-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="mx-auto text-xs font-medium text-slate-400">
                Lumina Dashboard
              </div>
            </div>
            {/* Dashboard Content Mockup */}
            <div className="bg-slate-50 p-6 grid grid-cols-12 gap-6 min-h-[450px]">
              {/* Sidebar - Realistic */}
              <div className="col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex-col hidden md:flex">
                <div className="flex items-center gap-2 font-bold text-slate-800 mb-8 px-2">
                  <div className="w-6 h-6 bg-indigo-600 rounded-md"></div>
                  Lumina
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium">
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-medium">
                    <PieChart className="w-4 h-4" /> Analytics
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-medium">
                    <FileText className="w-4 h-4" /> Reports
                  </div>
                </div>
                <div className="mt-auto">
                  <div className="bg-slate-100 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-white rounded-full border border-slate-200"></div>
                      <div>
                        <div className="w-16 h-2 bg-slate-300 rounded mb-1"></div>
                        <div className="w-10 h-2 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Area */}
              <div className="col-span-12 md:col-span-9 space-y-6">
                {/* Top Stats Cards - Realistic */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Card 1 */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-28">
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        +12.5% <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                        Total Revenue
                      </p>
                      <h4 className="text-xl font-bold text-slate-900">
                        $128,430
                      </h4>
                    </div>
                  </div>
                  {/* Card 2 */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-28">
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        +5.2% <ArrowUpRight className="w-3 h-3" />
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                        Active Users
                      </p>
                      <h4 className="text-xl font-bold text-slate-900">
                        24,593
                      </h4>
                    </div>
                  </div>
                  {/* Card 3 */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between h-28">
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                        <Activity className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                        -2.1% <ArrowUpRight className="w-3 h-3 rotate-90" />
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                        Bounce Rate
                      </p>
                      <h4 className="text-xl font-bold text-slate-900">
                        42.8%
                      </h4>
                    </div>
                  </div>
                </div>

                {/* Main Chart Area - Realistic */}
                <div className="h-64 bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h5 className="font-bold text-slate-800 text-sm">
                        Revenue Overview
                      </h5>
                      <p className="text-xs text-slate-400">
                        Monthly performance vs targets
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-20 h-8 bg-slate-50 rounded-lg border border-slate-100"></div>
                      <div className="w-8 h-8 bg-slate-50 rounded-lg border border-slate-100"></div>
                    </div>
                  </div>

                  {/* The Chart Visualization */}
                  <div className="relative h-40 w-full flex items-end justify-between gap-2 px-2 pb-6 border-b border-slate-100">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                      <div className="w-full h-px bg-slate-50"></div>
                      <div className="w-full h-px bg-slate-50"></div>
                      <div className="w-full h-px bg-slate-50"></div>
                      <div className="w-full h-px bg-slate-50"></div>
                    </div>

                    {/* Y-Axis Labels */}
                    <div className="absolute -left-6 top-0 bottom-6 flex flex-col justify-between text-[10px] text-slate-300 font-medium text-right w-4">
                      <span>100k</span>
                      <span>50k</span>
                      <span>0</span>
                    </div>

                    {/* Bars */}
                    {[35, 55, 45, 70, 65, 85, 60, 75, 90, 65, 50, 80].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="relative group w-full h-full flex items-end"
                        >
                          <div
                            className="w-full bg-indigo-500 rounded-t-sm transition-all group-hover:bg-indigo-600 group-hover:scale-y-105 origin-bottom"
                            style={{ height: `${h}%`, opacity: 0.8 + i / 20 }}
                          ></div>
                          {/* Tooltip on Hover */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                            <div className="bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                              ${(h * 1.4).toFixed(1)}k
                            </div>
                          </div>
                        </div>
                      )
                    )}

                    {/* X-Axis Labels */}
                    <div className="absolute bottom-0 left-2 right-2 flex justify-between text-[10px] text-slate-400 font-medium pt-2">
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

      {/* Feature Section 1 */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center mb-16">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">
            Unlock the power of your data
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Lumina doesn&apos;t just turn spreadsheets into visual reports — it
            acts like an analyst, interpreting your data.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1 bg-slate-50 rounded-2xl p-8 border border-slate-100 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-64 flex items-center justify-center relative">
              <div className="absolute inset-x-8 bottom-0 top-12 flex items-end gap-1">
                {[30, 45, 35, 60, 55, 70, 65, 80, 75, 90].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-purple-500 rounded-t-md opacity-90 hover:opacity-100 transition-all hover:scale-y-110 origin-bottom"
                    style={{ height: `${h}%` }}
                  ></div>
                ))}
              </div>
              {/* Floating Tooltip */}
              <div className="absolute top-1/3 left-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded shadow-lg -translate-x-1/2">
                Revenue: $42,000
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <h3 className="text-3xl font-bold text-slate-900">
              Interactive Charts — Explore, filter, and highlight what matters.
            </h3>
            <p className="text-slate-500 text-lg leading-relaxed">
              Charts in Lumina aren&apos;t static images. You can click, explore,
              and dig deeper into the numbers — making it easier to find
              insights.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />{" "}
                <span>Dynamic filtering</span>
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />{" "}
                <span>Drill-down capabilities</span>
              </li>
              <li className="flex items-center gap-3 text-slate-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />{" "}
                <span>Instant formatting</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Feature Section 2 */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h3 className="text-3xl font-bold text-slate-900">
              Edit in PowerPoint — Make it yours with your tools.
            </h3>
            <p className="text-slate-500 text-lg leading-relaxed">
              Export your report to PowerPoint or your favorite editor. You&apos;re
              free to tweak every slide or drop it straight into your workflow,
              fully editable.
            </p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="text-slate-900 font-bold flex items-center gap-2 hover:gap-3 transition-all"
            >
              Generate Presentation <span className="text-xl">→</span>
            </button>
          </div>
          <div className="flex justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md relative">
              <div className="absolute -top-4 -right-4 bg-orange-500 text-white p-3 rounded-xl shadow-lg">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-4">
                <div className="h-4 w-1/3 bg-slate-100 rounded"></div>
                <div className="h-8 w-3/4 bg-slate-100 rounded"></div>
                <div className="h-32 bg-orange-50 rounded-xl border border-orange-100 flex items-center justify-center">
                  <span className="text-orange-400 font-medium">
                    Editable Chart Area
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-full bg-slate-50 rounded"></div>
                  <div className="h-3 w-5/6 bg-slate-50 rounded"></div>
                </div>
                <div className="pt-4">
                  <button className="w-full py-3 border border-slate-200 rounded-lg text-slate-600 font-medium flex items-center justify-center gap-2 bg-slate-50">
                    <FileText className="w-4 h-4" />
                    Edit in PowerPoint
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-slate-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-slate-200 rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-900 text-lg">
                    {faq.q}
                  </span>
                  {openFaq === i ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="p-6 pt-0 text-slate-600 leading-relaxed animate-in slide-in-from-top-2">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 font-bold text-xl text-white">
              <div className="bg-white text-slate-900 p-1 rounded">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              Lumina
            </div>
            <p className="max-w-xs text-sm">
              Transform your spreadsheets into professional data presentations
              with AI-powered insights.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Menu</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="hover:text-white text-left"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="hover:text-white text-left"
                >
                  Get Started
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Policies</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <button className="hover:text-white text-left">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button className="hover:text-white text-left">
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-slate-800 text-sm text-center md:text-left">
          © 2024 Lumina Data Insights. All rights reserved.
        </div>
      </footer>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </div>
  );
}
