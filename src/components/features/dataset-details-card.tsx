"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { FileText, Calendar, Database, Columns3, Activity, Download, RefreshCw } from "lucide-react";
import type { HealthScoreResult } from "@/lib/analyzers/health-score";

interface DatasetDetailsCardProps {
  datasetName: string;
  rowCount: number;
  columnCount: number;
  datasetType: string | null;
  healthScore: HealthScoreResult | null;
  uploadDate?: Date;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (score >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

export function DatasetDetailsCard({
  datasetName,
  rowCount,
  columnCount,
  datasetType,
  healthScore,
  uploadDate,
}: DatasetDetailsCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dataset Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Name */}
        <div className="flex items-start gap-3">
          <FileText className="h-5 w-5 text-neutral-400 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">File Name</p>
            <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
              {datasetName}
            </p>
          </div>
        </div>

        {/* Upload Date */}
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-neutral-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Upload Date</p>
            <p className="text-sm font-medium text-neutral-900 dark:text-white">
              {uploadDate ? formatDate(uploadDate) : "Just now"}
            </p>
          </div>
        </div>

        {/* Rows / Columns */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Database className="h-5 w-5 text-neutral-400 mt-0.5" />
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Rows</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {rowCount.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Columns3 className="h-5 w-5 text-neutral-400 mt-0.5" />
            <div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Columns</p>
              <p className="text-sm font-medium text-neutral-900 dark:text-white">
                {columnCount}
              </p>
            </div>
          </div>
        </div>

        {/* Dataset Type */}
        {datasetType && (
          <div className="flex items-start gap-3">
            <Activity className="h-5 w-5 text-neutral-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Dataset Type</p>
              <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium dark:bg-blue-900/30 dark:text-blue-300">
                {datasetType.charAt(0).toUpperCase() + datasetType.slice(1)}
              </span>
            </div>
          </div>
        )}

        {/* Health Score */}
        {healthScore && (
          <div className="flex items-start gap-3">
            <Activity className="h-5 w-5 text-neutral-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">Health Score</p>
              <p className={`text-lg font-bold ${getScoreColor(healthScore.score)}`}>
                {healthScore.score}/100
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700 space-y-2">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
            <Download className="h-4 w-4" />
            Download original file
          </button>
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors">
            <RefreshCw className="h-4 w-4" />
            Re-run analysis
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

