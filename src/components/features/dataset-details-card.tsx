"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  FileText,
  Calendar,
  Database,
  Columns3,
  Activity,
  Download,
  RefreshCw,
  Info,
} from "lucide-react";
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
  if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-100";
  if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-100";
  if (score >= 40) return "text-orange-600 bg-orange-50 border-orange-100";
  return "text-red-600 bg-red-50 border-red-100";
}

export function DatasetDetailsCard({
  datasetName,
  rowCount,
  columnCount,
  datasetType: _datasetType,
  healthScore,
  uploadDate,
}: DatasetDetailsCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm">
            <Info className="h-4 w-4 text-violet-600" />
          </div>
          <CardTitle className="text-base text-slate-800">
            Dataset Details
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <div className="space-y-4">
          <div className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50">
            <div className="rounded-lg border border-slate-100 bg-white p-2 shadow-sm group-hover:border-slate-200 group-hover:shadow">
              <FileText className="h-4 w-4 text-slate-400 transition-colors group-hover:text-violet-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="mb-0.5 text-xs font-medium text-slate-400">
                File Name
              </p>
              <p
                className="truncate text-sm font-semibold text-slate-700"
                title={datasetName}
              >
                {datasetName}
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50">
            <div className="rounded-lg border border-slate-100 bg-white p-2 shadow-sm group-hover:border-slate-200 group-hover:shadow">
              <Calendar className="h-4 w-4 text-slate-400 transition-colors group-hover:text-violet-500" />
            </div>
            <div>
              <p className="mb-0.5 text-xs font-medium text-slate-400">
                Upload Date
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {uploadDate ? formatDate(uploadDate) : "Just now"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50">
              <div className="rounded-lg border border-slate-100 bg-white p-2 shadow-sm group-hover:border-slate-200 group-hover:shadow">
                <Database className="h-4 w-4 text-slate-400 transition-colors group-hover:text-violet-500" />
              </div>
              <div>
                <p className="mb-0.5 text-xs font-medium text-slate-400">
                  Rows
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  {rowCount.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="group flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50">
              <div className="rounded-lg border border-slate-100 bg-white p-2 shadow-sm group-hover:border-slate-200 group-hover:shadow">
                <Columns3 className="h-4 w-4 text-slate-400 transition-colors group-hover:text-violet-500" />
              </div>
              <div>
                <p className="mb-0.5 text-xs font-medium text-slate-400">
                  Columns
                </p>
                <p className="text-sm font-semibold text-slate-700">
                  {columnCount}
                </p>
              </div>
            </div>
          </div>

          {healthScore && (
            <div className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500">
                    Health Score
                  </span>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getScoreColor(healthScore.score)}`}
                >
                  {healthScore.score}/100
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    healthScore.score >= 80
                      ? "bg-emerald-500"
                      : healthScore.score >= 60
                        ? "bg-amber-500"
                        : healthScore.score >= 40
                          ? "bg-orange-500"
                          : "bg-red-500"
                  }`}
                  style={{ width: `${healthScore.score}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 border-t border-slate-100 pt-4">
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900">
            <Download className="h-4 w-4" />
            Download Original
          </button>
          <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-4 py-2.5 text-sm font-medium text-violet-600 transition-all hover:bg-violet-100">
            <RefreshCw className="h-4 w-4" />
            Re-run Analysis
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
