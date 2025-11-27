"use client";

import { Database, Columns, AlertCircle, CheckCircle2 } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { DataQualityBadge } from "./DataQualityBadge";

interface MetricsRowProps {
  totalRows: number;
  totalColumns: number;
  nullValues: number;
  dataQualityScore: number;
}

export function MetricsRow({
  totalRows,
  totalColumns,
  nullValues,
  dataQualityScore,
}: MetricsRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={Database}
        label="Total Rows"
        value={totalRows.toLocaleString()}
        iconColor="text-indigo-600"
        iconBgColor="bg-indigo-50"
      />
      <MetricCard
        icon={Columns}
        label="Total Columns"
        value={totalColumns}
        iconColor="text-violet-600"
        iconBgColor="bg-violet-50"
      />
      <MetricCard
        icon={AlertCircle}
        label="Null Values"
        value={nullValues.toLocaleString()}
        iconColor="text-amber-600"
        iconBgColor="bg-amber-50"
      />
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-emerald-50 p-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500">Data Quality</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold text-slate-900">
                {dataQualityScore}
              </p>
              <DataQualityBadge score={dataQualityScore} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
