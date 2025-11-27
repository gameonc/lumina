"use client";

import { useState } from "react";
import { Lightbulb, ChevronRight, X } from "lucide-react";

interface KeyInsight {
  title: string;
  description: string;
  type: "positive" | "negative" | "neutral";
}

interface KeyInsightsSectionProps {
  insights?: KeyInsight[];
}

export function KeyInsightsSection({ insights }: KeyInsightsSectionProps) {
  const [selectedInsight, setSelectedInsight] = useState<KeyInsight | null>(null);

  if (!insights || insights.length === 0) return null;

  return (
    <>
      {/* Main Section */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
            <Lightbulb className="h-4 w-4 text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Key Insights</h2>
        </div>

        <div className="space-y-3">
          {insights.slice(0, 4).map((insight, index) => (
            <button
              key={index}
              onClick={() => setSelectedInsight(insight)}
              className="group flex w-full items-center justify-between rounded-lg p-3 text-left transition-all hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${
                  insight.type === "positive" ? "bg-emerald-500" :
                  insight.type === "negative" ? "bg-red-500" : "bg-slate-400"
                }`} />
                <span className="text-sm text-slate-700 line-clamp-1">
                  {insight.title}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
            </button>
          ))}
        </div>
      </section>

      {/* Modal for full insight */}
      {selectedInsight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setSelectedInsight(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setSelectedInsight(null)}
              className="absolute right-4 top-4 rounded-lg p-1 hover:bg-slate-100"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>

            <div className="mb-4 flex items-center gap-3">
              <span className={`h-3 w-3 rounded-full ${
                selectedInsight.type === "positive" ? "bg-emerald-500" :
                selectedInsight.type === "negative" ? "bg-red-500" : "bg-slate-400"
              }`} />
              <h3 className="text-lg font-semibold text-slate-900">
                {selectedInsight.title}
              </h3>
            </div>

            <p className="text-slate-600 leading-relaxed">
              {selectedInsight.description}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
