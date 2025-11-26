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
  CreditCard,
  LogOut,
  LayoutDashboard,
  Settings,
  X,
  Zap,
  CheckCircle2,
  Clock,
  TrendingUp,
  FileText,
  HelpCircle,
  BarChart3,
  Download,
  RefreshCw,
  ChevronRight,
  Star,
  Database,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart as RechartsLine,
  Line,
} from "recharts";

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e"];

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

        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 md:p-12 text-white md:w-2/5 flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-xl mb-6 ring-1 ring-yellow-400/30">
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
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-3">Trusted By 1,000+ Teams</p>
            <div className="flex -space-x-2">
              <InitialsAvatar name="Sarah Chen" size="sm" />
              <InitialsAvatar name="Mike Johnson" size="sm" />
              <InitialsAvatar name="Emma Davis" size="sm" />
              <InitialsAvatar name="Alex Kim" size="sm" />
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 ring-2 ring-slate-900">+99</div>
            </div>
          </div>
        </div>

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
            <div className="border-2 border-violet-500 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-6 relative shadow-lg shadow-violet-500/10">
              <div className="absolute -top-3 right-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">MOST POPULAR</div>
              <div className="flex justify-between items-center mb-4">
                <div><h4 className="font-bold text-lg text-slate-900">Pro Analyst</h4><p className="text-sm text-slate-500">Perfect for professionals</p></div>
                <div className="text-right"><div className="text-3xl font-bold text-slate-900">$19</div><span className="text-xs text-slate-500">/ month</span></div>
              </div>
              <ul className="space-y-2 mb-6 text-sm text-slate-600">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-600" /> 500 Credits per month</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-600" /> Advanced Visualizations</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-600" /> Remove Watermark</li>
              </ul>
              <button onClick={onClose} className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30">
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
  const [userName, setUserName] = useState<string>("User");
  const [userEmail, setUserEmail] = useState<string>("");
  const [credits, setCredits] = useState(5);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [activeTab, setActiveTab] = useState<"dashboard" | "datasets" | "settings">("dashboard");
  const [savedDatasets, setSavedDatasets] = useState<any[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isExporting, setIsExporting] = useState<"pptx" | "pdf" | null>(null);

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
      };

      setAnalysisResults({
        ...analysisData,
        datasetId,
      });

      sessionStorage.setItem(`analysis-${datasetId}`, JSON.stringify(analysisData));
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

  const loadSavedDatasets = async () => {
    setLoadingDatasets(true);
    try {
      const response = await fetch("/api/storage/list?sortBy=createdAt&sortOrder=desc");
      if (response.ok) {
        const { data } = await response.json();
        setSavedDatasets(data || []);
      }
    } catch (error) {
      console.error("Failed to load datasets:", error);
    } finally {
      setLoadingDatasets(false);
    }
  };

  const handleDeleteDataset = async (id: string) => {
    if (!confirm("Are you sure you want to delete this analysis?")) return;
    try {
      const response = await fetch(`/api/storage/delete?id=${id}`, { method: "DELETE" });
      if (response.ok) {
        setSavedDatasets((prev) => prev.filter((d) => d.id !== id));
        sessionStorage.removeItem(`analysis-${id}`);
      }
    } catch (error) {
      console.error("Failed to delete dataset:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "datasets") {
      loadSavedDatasets();
    }
  }, [activeTab]);

  const handleExport = async (type: "pptx" | "pdf") => {
    if (!analysisResults) return;
    setIsExporting(type);

    try {
      const endpoint = type === "pptx" ? "/api/reports/pptx" : "/api/reports/export";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetName: analysisResults.datasetName,
          healthScore: analysisResults.healthScore,
          charts: analysisResults.charts,
          insights: analysisResults.insights || [],
          datasetType: analysisResults.datasetType,
          rowCount: analysisResults.rowCount,
          columnCount: analysisResults.columnCount,
        }),
      });

      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${analysisResults.datasetName.replace(/\s+/g, "_")}_Report.${type}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Export error:", error);
      alert(`Failed to export ${type.toUpperCase()}. Please try again.`);
    } finally {
      setIsExporting(null);
    }
  };

  const handleNewAnalysis = () => {
    setAnalysisResults(null);
    reset();
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
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5 font-bold text-xl group cursor-pointer" onClick={() => setActiveTab("dashboard")}>
              <div className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/30 transition-shadow">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <span className="bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Lumina</span>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              {[
                { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                { id: "datasets", label: "My Datasets", icon: Database },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-violet-500/10 to-indigo-500/10 text-violet-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPricing(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400/10 to-orange-400/10 text-amber-700 rounded-full text-sm font-medium hover:from-amber-400/20 hover:to-orange-400/20 transition-all"
            >
              <Star className="w-4 h-4" />
              <span>{credits} credits</span>
            </button>
            <div className="flex items-center gap-3">
              <InitialsAvatar name={userName} email={userEmail} size="md" />
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-slate-900">{userName}</p>
                <p className="text-xs text-slate-500">Free Plan</p>
              </div>
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

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 pb-32 w-full">
        {activeTab === "dashboard" ? (
          analysisResults ? (
            <>
              {/* Analysis Complete Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/30">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Analysis Complete</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{analysisResults.datasetName}</h1>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => router.push(`/dashboard/${analysisResults.datasetId}`)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Interactive Dashboard
                  </button>
                  <button
                    onClick={handleNewAnalysis}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">New</span>
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Rows", value: analysisResults.rowCount?.toLocaleString(), icon: Database, gradient: "from-blue-500 to-indigo-600" },
                  { label: "Columns", value: analysisResults.columnCount, icon: BarChart3, gradient: "from-violet-500 to-purple-600" },
                  { label: "Health Score", value: `${analysisResults.healthScore?.score || "N/A"}%`, icon: CheckCircle2, gradient: "from-emerald-500 to-teal-600" },
                  { label: "Charts", value: analysisResults.charts?.length || 0, icon: TrendingUp, gradient: "from-amber-500 to-orange-600" },
                ].map((stat, i) => (
                  <div key={i} className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl blur-xl -z-10" style={{ background: `linear-gradient(135deg, var(--tw-gradient-stops))` }} />
                    <div className="bg-white rounded-2xl border border-slate-200/50 p-5 hover:border-slate-300 hover:shadow-lg transition-all">
                      <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${stat.gradient} mb-3`}>
                        <stat.icon className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Insights Card */}
              <div className="bg-gradient-to-br from-violet-500/5 via-indigo-500/5 to-purple-500/5 rounded-2xl border border-violet-200/50 p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg shadow-lg shadow-violet-500/20">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg">AI Insights</h3>
                </div>
                <div className="space-y-3 text-slate-700">
                  <p>
                    This appears to be a <span className="font-semibold text-violet-600 bg-violet-100 px-2 py-0.5 rounded">{analysisResults.datasetType || "general"}</span> dataset
                    with {analysisResults.columnCount} columns and {analysisResults.rowCount?.toLocaleString()} rows of data.
                  </p>
                  {analysisResults.healthScore?.score >= 80 && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-emerald-800">Your data quality is excellent! The dataset is well-structured and ready for analysis.</span>
                    </div>
                  )}
                  {analysisResults.healthScore?.score < 80 && analysisResults.healthScore?.score >= 50 && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <span className="text-amber-800">Data quality is moderate. Consider cleaning up some missing values or inconsistencies.</span>
                    </div>
                  )}
                  {analysisResults.charts?.length > 0 && (
                    <p className="text-slate-600">
                      We generated <span className="font-semibold text-violet-600">{analysisResults.charts.length} chart{analysisResults.charts.length > 1 ? "s" : ""}</span> based on your data patterns.
                    </p>
                  )}
                </div>
              </div>

              {/* Charts Grid */}
              {analysisResults.charts && analysisResults.charts.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-violet-600" />
                      Generated Charts
                    </h3>
                    <button
                      onClick={() => router.push(`/dashboard/${analysisResults.datasetId}`)}
                      className="text-sm text-violet-600 hover:text-violet-700 font-medium flex items-center gap-1"
                    >
                      View all <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {analysisResults.charts.slice(0, 4).map((chart: any, index: number) => (
                      <div key={index} className="bg-white rounded-2xl border border-slate-200/50 p-6 hover:shadow-lg hover:border-slate-300 transition-all">
                        <h4 className="font-semibold text-slate-900 mb-4">{chart.title || `Chart ${index + 1}`}</h4>
                        <div className="h-64">
                          {chart.type === "bar" && chart.data && (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={chart.data.slice(0, 10)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="value" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                                <defs>
                                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                  </linearGradient>
                                </defs>
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                          {chart.type === "pie" && chart.data && (
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPie>
                                <Pie
                                  data={chart.data.slice(0, 6)}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {chart.data.slice(0, 6).map((_: any, i: number) => (
                                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </RechartsPie>
                            </ResponsiveContainer>
                          )}
                          {chart.type === "line" && chart.data && (
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsLine data={chart.data.slice(0, 20)}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Line type="monotone" dataKey="value" stroke="url(#lineGradient)" strokeWidth={3} dot={{ fill: "#8b5cf6" }} />
                                <defs>
                                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#8b5cf6" />
                                    <stop offset="100%" stopColor="#6366f1" />
                                  </linearGradient>
                                </defs>
                              </RechartsLine>
                            </ResponsiveContainer>
                          )}
                          {(!chart.data || !["bar", "pie", "line"].includes(chart.type)) && (
                            <div className="h-full flex items-center justify-center text-slate-400">
                              <div className="text-center">
                                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">{chart.type} chart</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Dashboard CTA */}
              <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAzMHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
                <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Ready for deeper insights?</h3>
                    <p className="text-violet-100 max-w-lg">
                      Open the interactive dashboard to explore your data, build custom charts, and chat with AI.
                    </p>
                  </div>
                  <button
                    onClick={() => router.push(`/dashboard/${analysisResults.datasetId}`)}
                    className="px-6 py-3 bg-white text-violet-600 rounded-xl font-bold hover:bg-violet-50 transition-colors flex items-center gap-2 shrink-0 shadow-lg"
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    Open Dashboard
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Upload View Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-full text-violet-700 text-sm font-medium mb-4">
                  <Sparkles className="w-4 h-4" />
                  AI-Powered Analysis
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">Upload Your Spreadsheet</h1>
                <p className="text-slate-500 text-lg max-w-xl mx-auto">Drop your Excel or CSV file and watch the magic happen</p>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {!parsedData && (
                    <div
                      {...getRootProps()}
                      className={`cursor-pointer rounded-2xl border-2 border-dashed p-12 sm:p-16 text-center transition-all ${
                        isDragActive
                          ? "border-violet-500 bg-violet-50"
                          : "border-slate-300 bg-white hover:border-violet-400 hover:bg-violet-50/30"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <div className="flex justify-center mb-6">
                        <div className={`flex h-20 w-20 items-center justify-center rounded-2xl transition-all ${
                          isDragActive 
                            ? "bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30" 
                            : "bg-gradient-to-br from-slate-100 to-slate-200"
                        }`}>
                          <Upload className={`h-10 w-10 ${isDragActive ? "text-white" : "text-slate-500"}`} />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        {isDragActive ? "Drop your file here" : "Drag and drop your file"}
                      </h3>
                      <p className="text-slate-500 mb-6">or click to browse from your computer</p>
                      <div className="flex justify-center gap-2 text-xs">
                        {[".xlsx", ".xls", ".csv"].map((ext) => (
                          <span key={ext} className="rounded-lg bg-slate-100 px-3 py-1.5 font-medium text-slate-600">{ext}</span>
                        ))}
                        <span className="text-slate-400 py-1.5">up to 20MB</span>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  {parsedData && file && (
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/25">
                          <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 text-lg">File Ready</h3>
                          <p className="text-sm text-slate-500">{file.name}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: "Rows", value: parsedData.rowCount.toLocaleString(), gradient: "from-blue-500 to-indigo-600" },
                          { label: "Columns", value: parsedData.columnCount, gradient: "from-violet-500 to-purple-600" },
                          { label: "Sheets", value: parsedData.sheetNames?.length || 1, gradient: "from-amber-500 to-orange-600" },
                        ].map((stat, i) => (
                          <div key={i} className="rounded-xl bg-slate-50 p-4 text-center">
                            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                            <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
                          </div>
                        ))}
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-slate-700 mb-3">Columns Detected</h4>
                        <div className="flex flex-wrap gap-2">
                          {parsedData.headers.slice(0, 8).map((header) => (
                            <span key={header} className="rounded-full bg-violet-100 text-violet-700 px-3 py-1 text-sm font-medium">
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
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
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
                          className="relative flex-1 py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 hover:scale-[1.02] active:scale-[0.98]"
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
                    <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                          <Zap className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-amber-800">
                            {credits === 0 ? "No credits remaining" : "Low on credits"}
                          </p>
                          <button
                            onClick={() => setShowPricing(true)}
                            className="text-sm text-amber-600 hover:text-amber-700 font-medium underline"
                          >
                            Upgrade to Pro for unlimited analyses
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <div className="p-1.5 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg">
                        <BarChart3 className="w-4 h-4 text-white" />
                      </div>
                      Quick Stats
                    </h3>
                    <div className="space-y-4">
                      {[
                        { icon: FileText, label: "Reports Generated", value: "0" },
                        { icon: TrendingUp, label: "Charts Created", value: "0" },
                        { icon: Clock, label: "Time Saved", value: "0 hrs" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-slate-600">
                            <item.icon className="w-4 h-4" />
                            <span className="text-sm">{item.label}</span>
                          </div>
                          <span className="font-bold text-slate-900">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-violet-50 via-indigo-50 to-purple-50 rounded-2xl border border-violet-200/50 p-6">
                    <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <div className="p-1.5 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg">
                        <HelpCircle className="w-4 h-4 text-white" />
                      </div>
                      Pro Tips
                    </h3>
                    <ul className="space-y-3 text-sm text-slate-600">
                      {[
                        "Include headers in your first row for better analysis",
                        "Clean data produces more accurate insights",
                        "Date columns enable trend analysis",
                      ].map((tip, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-violet-600 mt-0.5 shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-2xl" />
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-3">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        <h3 className="font-semibold">Go Pro</h3>
                      </div>
                      <p className="text-sm text-slate-400 mb-4">
                        Unlock unlimited analyses and advanced features.
                      </p>
                      <button
                        onClick={() => setShowPricing(true)}
                        className="w-full py-2.5 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-100 transition-colors"
                      >
                        View Plans
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )
        ) : activeTab === "datasets" ? (
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">My Datasets</h1>
                <p className="mt-2 text-slate-500">View and manage your saved analyses</p>
              </div>
              <button
                onClick={loadSavedDatasets}
                disabled={loadingDatasets}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium transition-colors shadow-sm"
              >
                <RefreshCw className={`w-4 h-4 ${loadingDatasets ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {loadingDatasets ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
              </div>
            ) : savedDatasets.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
                <div className="inline-flex p-4 bg-slate-100 rounded-2xl mb-6">
                  <FileSpreadsheet className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">No datasets yet</h3>
                <p className="text-slate-500 mb-8 max-w-sm mx-auto">Upload your first spreadsheet to start generating AI-powered insights</p>
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-medium hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/25"
                >
                  Upload Dataset
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {savedDatasets.map((dataset) => (
                  <div
                    key={dataset.id}
                    className="bg-white rounded-xl border border-slate-200 p-6 hover:border-violet-300 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/20">
                          <FileSpreadsheet className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 text-lg group-hover:text-violet-600 transition-colors">{dataset.datasetName}</h3>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {dataset.rowCount?.toLocaleString()} rows • {dataset.columnCount} columns • {new Date(dataset.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {dataset.healthScore !== null && (
                          <div className="text-center px-4">
                            <p className={`text-xl font-bold ${dataset.healthScore >= 80 ? "text-emerald-600" : dataset.healthScore >= 50 ? "text-amber-600" : "text-red-600"}`}>
                              {Math.round(dataset.healthScore)}%
                            </p>
                            <p className="text-xs text-slate-500">Health</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => router.push(`/dashboard/${dataset.id}`)}
                            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-medium hover:from-violet-500 hover:to-indigo-500 transition-all shadow-md shadow-violet-500/20"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteDataset(dataset.id)}
                            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Settings</h1>

            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-sm overflow-hidden">
              <div className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Account</h3>
                <div className="flex items-center gap-4">
                  <InitialsAvatar name={userName} email={userEmail} size="xl" />
                  <div>
                    <p className="font-medium text-slate-900 text-lg">{userName}</p>
                    <p className="text-sm text-slate-500">{userEmail || "Free Plan"}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Subscription</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">Free Starter</p>
                    <p className="text-sm text-slate-500">{credits} credits remaining</p>
                  </div>
                  <button
                    onClick={() => setShowPricing(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg font-medium hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg shadow-violet-500/25"
                  >
                    Upgrade
                  </button>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Email Notifications</p>
                      <p className="text-sm text-slate-500">Receive updates about your reports</p>
                    </div>
                    <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-pointer hover:bg-slate-300 transition-colors">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <button
                  onClick={handleLogout}
                  className="w-full py-3 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Export Bar */}
      {analysisResults && activeTab === "dashboard" && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 shadow-2xl z-50">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-slate-600">
              <div className="p-2 bg-violet-100 rounded-lg">
                <FileText className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <span className="font-medium text-slate-900">{analysisResults.datasetName}</span>
                <span className="text-slate-400 mx-2">•</span>
                <span className="text-sm text-slate-500">
                  {analysisResults.rowCount?.toLocaleString()} rows, {analysisResults.columnCount} columns
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => handleExport("pdf")}
                disabled={isExporting === "pdf"}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isExporting === "pdf" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                PDF
              </button>
              <button
                onClick={() => handleExport("pptx")}
                disabled={isExporting === "pptx"}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-violet-500/30"
              >
                {isExporting === "pptx" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                PowerPoint
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2.5 font-bold text-lg text-white">
              <div className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white p-1.5 rounded-lg">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              Lumina
            </div>
            <nav className="flex items-center gap-6 text-sm">
              <button onClick={() => router.push("/")} className="hover:text-white transition-colors">Home</button>
              <button onClick={() => setShowPricing(true)} className="hover:text-white transition-colors">Pricing</button>
              <button className="hover:text-white transition-colors">Privacy Policy</button>
              <button className="hover:text-white transition-colors">Terms of Service</button>
            </nav>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm">
            © 2024 Lumina Data Insights. All rights reserved.
          </div>
        </div>
      </footer>

      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} />
    </div>
  );
}
