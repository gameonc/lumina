"use client";

import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import type { Anomaly } from "@/lib/ai/insights-generator";

interface AnomalyBadgesProps {
  anomalies: Anomaly[];
  maxDisplay?: number;
}

function getSeverityStyles(severity: Anomaly["severity"]) {
  switch (severity) {
    case "high":
      return {
        bg: "bg-red-50",
        border: "border-red-200",
        text: "text-red-700",
        icon: "text-red-500",
        badge: "bg-red-100 text-red-700",
      };
    case "medium":
      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        text: "text-amber-700",
        icon: "text-amber-500",
        badge: "bg-amber-100 text-amber-700",
      };
    default:
      return {
        bg: "bg-slate-50",
        border: "border-slate-200",
        text: "text-slate-700",
        icon: "text-slate-500",
        badge: "bg-slate-100 text-slate-700",
      };
  }
}

function getTypeIcon(type: Anomaly["type"]) {
  switch (type) {
    case "outlier":
    case "unusual_pattern":
      return <AlertTriangle className="h-4 w-4" />;
    case "missing":
    case "data_quality":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
}

function getTypeLabel(type: Anomaly["type"]) {
  switch (type) {
    case "outlier":
      return "Outlier";
    case "missing":
      return "Missing Data";
    case "unusual_pattern":
      return "Unusual Pattern";
    case "data_quality":
      return "Data Quality";
    default:
      return "Issue";
  }
}

export function AnomalyBadges({
  anomalies,
  maxDisplay = 5,
}: AnomalyBadgesProps) {
  if (!anomalies || anomalies.length === 0) {
    return null;
  }

  const displayedAnomalies = anomalies.slice(0, maxDisplay);
  const remainingCount = anomalies.length - maxDisplay;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-amber-100 p-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Data Alerts</h2>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
          {anomalies.length} found
        </span>
      </div>

      <div className="space-y-2">
        {displayedAnomalies.map((anomaly, index) => {
          const styles = getSeverityStyles(anomaly.severity);
          return (
            <div
              key={index}
              className={`flex items-start gap-3 rounded-xl p-3 ${styles.bg} border ${styles.border}`}
            >
              <div className={`mt-0.5 ${styles.icon}`}>
                {getTypeIcon(anomaly.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-sm font-medium ${styles.text}`}>
                    {anomaly.column}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${styles.badge}`}
                  >
                    {getTypeLabel(anomaly.type)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs capitalize ${styles.badge}`}
                  >
                    {anomaly.severity}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  {anomaly.description}
                  {anomaly.affectedRows && (
                    <span className="text-slate-500">
                      {" "}
                      ({anomaly.affectedRows.toLocaleString()} rows affected)
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}

        {remainingCount > 0 && (
          <p className="py-2 text-center text-sm text-slate-500">
            +{remainingCount} more {remainingCount === 1 ? "alert" : "alerts"}
          </p>
        )}
      </div>
    </div>
  );
}
