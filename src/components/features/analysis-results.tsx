"use client";

import { cn } from "@/utils/cn";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import type { Insight } from "@/types";

interface AnalysisResultsProps {
  insights: Insight[];
  summary?: string;
  isLoading?: boolean;
  className?: string;
}

const insightIcons = {
  finding: BarChart3,
  recommendation: Lightbulb,
  warning: AlertTriangle,
  opportunity: TrendingUp,
};

const insightColors = {
  finding: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    icon: "text-blue-600",
    border: "border-blue-200 dark:border-blue-800",
  },
  recommendation: {
    bg: "bg-violet-50 dark:bg-violet-950/30",
    icon: "text-violet-600",
    border: "border-violet-200 dark:border-violet-800",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    icon: "text-amber-600",
    border: "border-amber-200 dark:border-amber-800",
  },
  opportunity: {
    bg: "bg-green-50 dark:bg-green-950/30",
    icon: "text-green-600",
    border: "border-green-200 dark:border-green-800",
  },
};

export function AnalysisResults({
  insights,
  summary,
  isLoading,
  className,
}: AnalysisResultsProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Analyzing your data with AI...
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            This may take a few moments
          </p>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
            <BarChart3 className="h-8 w-8 text-neutral-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">
            No Analysis Yet
          </h3>
          <p className="mt-2 max-w-sm text-center text-sm text-neutral-600 dark:text-neutral-400">
            Upload a dataset and run analysis to see AI-generated insights here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const confidencePercentage = (confidence: number) =>
    Math.round(confidence * 100);

  return (
    <div className={cn("space-y-6", className)}>
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Analysis Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-600 dark:text-neutral-400">{summary}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary-600">
              {insights.length}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Total Insights
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">
              {insights.filter((i) => i.type === "finding").length}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Findings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {insights.filter((i) => i.type === "opportunity").length}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Opportunities
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">
              {insights.filter((i) => i.type === "warning").length}
            </p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Warnings
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {insights.map((insight) => {
          const Icon = insightIcons[insight.type];
          const colors = insightColors[insight.type];

          return (
            <Card key={insight.id} className={cn("border", colors.border)}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                      colors.bg
                    )}
                  >
                    <Icon className={cn("h-5 w-5", colors.icon)} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-neutral-900 dark:text-white">
                        {insight.title}
                      </h4>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                          colors.bg,
                          colors.icon
                        )}
                      >
                        {insight.type}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                      {insight.description}
                    </p>
                    {insight.relatedColumns &&
                      insight.relatedColumns.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {insight.relatedColumns.map((col) => (
                            <span
                              key={col}
                              className="rounded bg-neutral-100 px-2 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
                            >
                              {col}
                            </span>
                          ))}
                        </div>
                      )}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-neutral-100 dark:bg-neutral-800">
                        <div
                          className="h-1.5 rounded-full bg-primary-500"
                          style={{
                            width: `${confidencePercentage(insight.confidence)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-neutral-500">
                        {confidencePercentage(insight.confidence)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
