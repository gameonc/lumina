"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { CheckCircle2, AlertTriangle, Lightbulb, Sparkles } from "lucide-react";
import type { HealthScoreResult } from "@/lib/analyzers/health-score";

interface AISummaryCardProps {
  healthScore: HealthScoreResult | null;
}

export function AISummaryCard({ healthScore }: AISummaryCardProps) {
  if (!healthScore || !healthScore.recommendations || healthScore.recommendations.length === 0) {
    return (
      <Card className="border-slate-200/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-violet-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-slate-900">AI Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <div className="inline-flex p-3 bg-emerald-100 rounded-full mb-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <p className="text-slate-600 font-medium">
              No recommendations available. Your data looks good!
            </p>
          </div>
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
    else {
      opportunities.push(rec);
    }
  });

  return (
    <div>
      <CardHeader className="bg-gradient-to-r from-violet-50 to-indigo-50 border-b border-violet-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg shadow-lg shadow-violet-500/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <CardTitle className="text-slate-900">AI Summary</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* What looks good */}
        {good.length > 0 && (
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/25">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-emerald-900 text-lg">What looks good</h3>
            </div>
            <ul className="space-y-2.5 ml-12">
              {good.map((item, i) => (
                <li key={i} className="text-sm text-emerald-800 flex items-start gap-2.5">
                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* What needs attention */}
        {attention.length > 0 && (
          <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/25">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-amber-900 text-lg">What needs attention</h3>
            </div>
            <ul className="space-y-2.5 ml-12">
              {attention.map((item, i) => (
                <li key={i} className="text-sm text-amber-800 flex items-start gap-2.5">
                  <span className="text-amber-500 font-bold mt-0.5">⚠</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Opportunities */}
        {opportunities.length > 0 && (
          <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 shadow-lg shadow-blue-500/25">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold text-blue-900 text-lg">Opportunities</h3>
            </div>
            <ul className="space-y-2.5 ml-12">
              {opportunities.map((item, i) => (
                <li key={i} className="text-sm text-blue-800 flex items-start gap-2.5">
                  <span className="text-blue-500 font-bold mt-0.5">💡</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer note */}
        <div className="pt-4 border-t border-slate-200">
          <p className="text-xs text-slate-500 text-center">
            Generated from your data analysis
          </p>
        </div>
      </CardContent>
    </div>
  );
}
