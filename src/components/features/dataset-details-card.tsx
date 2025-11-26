"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { FileText, Calendar, Database, Columns3, Activity, Download, RefreshCw, Info } from "lucide-react";
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
    <Card className="bg-white border border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
            <Info className="h-4 w-4 text-violet-600" />
          </div>
          <CardTitle className="text-slate-800 text-base">Dataset Details</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="space-y-4">
          <div className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm group-hover:border-slate-200 group-hover:shadow">
              <FileText className="h-4 w-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-400 mb-0.5">File Name</p>
              <p className="text-sm font-semibold text-slate-700 truncate" title={datasetName}>
                {datasetName}
              </p>
            </div>
          </div>

          <div className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm group-hover:border-slate-200 group-hover:shadow">
              <Calendar className="h-4 w-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 mb-0.5">Upload Date</p>
              <p className="text-sm font-semibold text-slate-700">
                {uploadDate ? formatDate(uploadDate) : "Just now"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm group-hover:border-slate-200 group-hover:shadow">
                <Database className="h-4 w-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 mb-0.5">Rows</p>
                <p className="text-sm font-semibold text-slate-700">{rowCount.toLocaleString()}</p>
              </div>
            </div>
            <div className="group flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className="p-2 bg-white border border-slate-100 rounded-lg shadow-sm group-hover:border-slate-200 group-hover:shadow">
                <Columns3 className="h-4 w-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 mb-0.5">Columns</p>
                <p className="text-sm font-semibold text-slate-700">{columnCount}</p>
              </div>
            </div>
          </div>

          {healthScore && (
            <div className="p-4 rounded-xl border bg-white shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-400" />
                  <span className="text-xs font-medium text-slate-500">Health Score</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getScoreColor(healthScore.score)}`}>
                  {healthScore.score}/100
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    healthScore.score >= 80 ? "bg-emerald-500" : 
                    healthScore.score >= 60 ? "bg-amber-500" : 
                    healthScore.score >= 40 ? "bg-orange-500" : "bg-red-500"
                  }`}
                  style={{ width: `${healthScore.score}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 rounded-xl transition-all shadow-sm">
            <Download className="h-4 w-4" />
            Download Original
          </button>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-100 rounded-xl transition-all">
            <RefreshCw className="h-4 w-4" />
            Re-run Analysis
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
