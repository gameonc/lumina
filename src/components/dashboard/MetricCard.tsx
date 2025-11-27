"use client";

import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconColor?: string;
  iconBgColor?: string;
}

export function MetricCard({
  icon: Icon,
  label,
  value,
  trend,
  iconColor = "text-indigo-600",
  iconBgColor = "bg-indigo-50",
}: MetricCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg ${iconBgColor} p-2.5`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-semibold text-slate-900">{value}</p>
            {trend && (
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {trend.value}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
