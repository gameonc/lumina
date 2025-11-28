"use client";

import { BarChart3, AlertTriangle, TrendingUp } from "lucide-react";

interface VisualizationActionBarProps {
  onAction: (action: "generate-charts" | "detect-anomalies" | "analyze-trends") => void;
  isLoading: boolean;
}

export function VisualizationActionBar({
  onAction,
  isLoading,
}: VisualizationActionBarProps) {
  const actions = [
    {
      id: "generate-charts" as const,
      label: "Generate Charts",
      icon: BarChart3,
      color: "indigo",
    },
    {
      id: "detect-anomalies" as const,
      label: "Detect Anomalies",
      icon: AlertTriangle,
      color: "amber",
    },
    {
      id: "analyze-trends" as const,
      label: "Analyze Trends",
      icon: TrendingUp,
      color: "emerald",
    },
  ];

  return (
    <div className="flex items-center justify-center gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        const colorClasses = {
          indigo: "border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300",
          amber: "border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300",
          emerald: "border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300",
        }[action.color];

        return (
          <button
            key={action.id}
            onClick={() => onAction(action.id)}
            disabled={isLoading}
            className={`inline-flex items-center gap-2 rounded-xl border-2 bg-white px-4 py-2.5 text-sm font-medium shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${colorClasses}`}
          >
            <Icon className="h-4 w-4" />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}
