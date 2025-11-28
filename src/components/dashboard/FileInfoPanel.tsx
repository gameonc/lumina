"use client";

import {
  FileSpreadsheet,
  Database,
  Columns,
  AlertCircle,
  Calendar,
  HardDrive,
} from "lucide-react";
import type { HealthScoreResult } from "@/lib/analyzers/health-score";

interface FileInfoPanelProps {
  datasetName: string;
  rowCount: number;
  columnCount: number;
  datasetType: string | null;
  healthScore: HealthScoreResult | null;
  uploadedAt?: string;
  fileSize?: number;
}

export function FileInfoPanel({
  datasetName,
  rowCount,
  columnCount,
  datasetType,
  healthScore,
  uploadedAt,
  fileSize,
}: FileInfoPanelProps) {
  const score = healthScore?.score ?? 0;
  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-50";
    if (score >= 75) return "text-amber-600 bg-amber-50";
    if (score >= 60) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getHealthLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Review";
  };

  return (
    <div className="space-y-6">
      {/* File Info Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-3">
          <div className="rounded-lg bg-indigo-100 p-2">
            <FileSpreadsheet className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">
              {datasetName}
            </h3>
            {datasetType && (
              <span className="mt-1 inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium capitalize text-indigo-700">
                {datasetType}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-4">
          <div className="flex items-center gap-3 text-sm">
            <Database className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">{rowCount.toLocaleString()} rows</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Columns className="h-4 w-4 text-slate-400" />
            <span className="text-slate-600">{columnCount} columns</span>
          </div>
          {fileSize && (
            <div className="flex items-center gap-3 text-sm">
              <HardDrive className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">
                {(fileSize / 1024).toFixed(1)} KB
              </span>
            </div>
          )}
          {uploadedAt && (
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">{uploadedAt}</span>
            </div>
          )}
        </div>
      </div>

      {/* Health Score Card */}
      {healthScore && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Data Quality</h3>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getHealthColor(
                score
              )}`}
            >
              {getHealthLabel(score)}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Health Score</span>
              <span className="font-semibold text-slate-900">{score}/100</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className={`h-full transition-all ${
                  score >= 90
                    ? "bg-emerald-500"
                    : score >= 75
                    ? "bg-amber-500"
                    : score >= 60
                    ? "bg-orange-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
            {healthScore.issues && (
              <div className="mt-3 space-y-1">
                {[
                  ...(healthScore.issues.missingData || []),
                  ...(healthScore.issues.anomalies || []),
                  ...(healthScore.issues.badHeaders || []),
                  ...(healthScore.issues.typeIssues || []),
                  healthScore.issues.duplication,
                ]
                  .filter((issue): issue is NonNullable<typeof issue> => 
                    issue !== null && typeof issue === 'object' && 'message' in issue
                  )
                  .slice(0, 3)
                  .map((issue, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                      <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-amber-500" />
                      <span>{issue.message}</span>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

