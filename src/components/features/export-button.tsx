"use client";

import { useState } from "react";
import { Download, FileText, Loader2, Printer } from "lucide-react";
import type { ChartConfig, Insight } from "@/types";
import type { HealthScoreResult } from "@/lib/analyzers/health-score";

interface ExportButtonProps {
  datasetName: string;
  healthScore: HealthScoreResult | null;
  charts: ChartConfig[];
  insights: Insight[];
  disabled?: boolean;
}

export function ExportButton({
  datasetName,
  healthScore,
  charts,
  insights,
  disabled = false,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = async (mode: "download" | "print") => {
    if (!healthScore && charts.length === 0 && insights.length === 0) {
      alert("No data to export. Please analyze your dataset first.");
      return;
    }

    setIsExporting(true);
    setShowMenu(false);

    try {
      const response = await fetch("/api/reports/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          datasetName: datasetName || "Dataset Report",
          healthScore,
          charts,
          insights: insights.map((i) => ({
            type: i.type,
            title: i.title,
            description: i.description,
          })),
          options: {
            includeCharts: true,
            includeHealthScore: true,
            includeInsights: true,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate report");
      }

      const html = await response.text();

      if (mode === "print") {
        // Open in new window and trigger print
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.onload = () => {
            printWindow.print();
          };
        }
      } else {
        // Download as HTML file
        const blob = new Blob([html], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${datasetName || "report"}-${new Date().toISOString().split("T")[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export report. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled || isExporting}
        className="flex items-center gap-2 rounded-lg bg-secondary-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-secondary-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Export Report
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      {showMenu && !isExporting && (
        <div className="absolute right-0 z-10 mt-2 w-48 rounded-lg border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          <button
            onClick={() => handleExport("download")}
            className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <FileText className="h-4 w-4" />
            Download HTML
          </button>
          <button
            onClick={() => handleExport("print")}
            className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </button>
        </div>
      )}

      {/* Click outside to close */}
      {showMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
}
