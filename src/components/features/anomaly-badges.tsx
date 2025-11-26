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
      return <AlertTriangle className="w-4 h-4" />;
    case "missing":
    case "data_quality":
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Info className="w-4 h-4" />;
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

export function AnomalyBadges({ anomalies, maxDisplay = 5 }: AnomalyBadgesProps) {
  if (!anomalies || anomalies.length === 0) {
    return null;
  }

  const displayedAnomalies = anomalies.slice(0, maxDisplay);
  const remainingCount = anomalies.length - maxDisplay;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-amber-100 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Data Alerts</h2>
        <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
          {anomalies.length} found
        </span>
      </div>

      <div className="space-y-2">
        {displayedAnomalies.map((anomaly, index) => {
          const styles = getSeverityStyles(anomaly.severity);
          return (
            <div
              key={index}
              className={`flex items-start gap-3 p-3 rounded-xl ${styles.bg} border ${styles.border}`}
            >
              <div className={`mt-0.5 ${styles.icon}`}>
                {getTypeIcon(anomaly.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-sm font-medium ${styles.text}`}>
                    {anomaly.column}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${styles.badge}`}>
                    {getTypeLabel(anomaly.type)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${styles.badge}`}>
                    {anomaly.severity}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {anomaly.description}
                  {anomaly.affectedRows && (
                    <span className="text-slate-500">
                      {" "}({anomaly.affectedRows.toLocaleString()} rows affected)
                    </span>
                  )}
                </p>
              </div>
            </div>
          );
        })}

        {remainingCount > 0 && (
          <p className="text-sm text-slate-500 text-center py-2">
            +{remainingCount} more {remainingCount === 1 ? "alert" : "alerts"}
          </p>
        )}
      </div>
    </div>
  );
}
