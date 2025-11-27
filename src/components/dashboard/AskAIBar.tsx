"use client";

import { useState, FormEvent } from "react";
import { Send, Sparkles } from "lucide-react";

interface AskAIBarProps {
  onSubmit: (question: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function AskAIBar({
  onSubmit,
  placeholder = "Ask anything about your data...",
  isLoading = false,
}: AskAIBarProps) {
  const [question, setQuestion] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question.trim());
      setQuestion("");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-4xl px-4 py-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            <span className="hidden text-sm font-medium text-indigo-700 sm:inline">
              AI Assistant
            </span>
          </div>
          <div className="relative flex-1">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={placeholder}
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!question.trim() || isLoading}
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
        <p className="mt-2 text-center text-xs text-slate-500">
          Ask questions, generate charts, or explore insights
        </p>
      </div>
    </div>
  );
}
