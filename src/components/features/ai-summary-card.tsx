"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import type { HealthScoreResult } from "@/lib/analyzers/health-score";

interface AISummaryCardProps {
  healthScore: HealthScoreResult | null;
}

export function AISummaryCard({ healthScore }: AISummaryCardProps) {
  if (!healthScore || !healthScore.recommendations || healthScore.recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500 text-center py-4">
            No recommendations available. Your data looks good!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Categorize recommendations
  const good: string[] = [];
  const attention: string[] = [];
  const opportunities: string[] = [];

  healthScore.recommendations.forEach((rec) => {
    const lowerRec = rec.toLowerCase();
    
    // Check for positive keywords
    if (
      lowerRec.includes("excellent") ||
      lowerRec.includes("good") ||
      lowerRec.includes("complete") ||
      lowerRec.includes("consistent") ||
      lowerRec.includes("no issues") ||
      lowerRec.includes("ready")
    ) {
      good.push(rec);
    }
    // Check for warning keywords
    else if (
      lowerRec.includes("missing") ||
      lowerRec.includes("outlier") ||
      lowerRec.includes("inconsistent") ||
      lowerRec.includes("warning") ||
      lowerRec.includes("error") ||
      lowerRec.includes("problem") ||
      lowerRec.includes("issue") ||
      lowerRec.includes("duplicate") ||
      lowerRec.includes("improve") ||
      lowerRec.includes("needs")
    ) {
      attention.push(rec);
    }
    // Everything else goes to opportunities
    else {
      opportunities.push(rec);
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* What looks good */}
        {good.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">What looks good</h3>
            </div>
            <ul className="space-y-2 ml-10">
              {good.map((item, i) => (
                <li key={i} className="text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                  <span className="text-emerald-500 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What needs attention */}
        {attention.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">What needs attention</h3>
            </div>
            <ul className="space-y-2 ml-10">
              {attention.map((item, i) => (
                <li key={i} className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Opportunities */}
        {opportunities.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">Opportunities</h3>
            </div>
            <ul className="space-y-2 ml-10">
              {opportunities.map((item, i) => (
                <li key={i} className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer note */}
        <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
          <p className="text-xs text-neutral-500 text-center">
            Generated from your data analysis
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

