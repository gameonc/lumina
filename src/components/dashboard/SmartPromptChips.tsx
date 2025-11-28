"use client";

interface SmartPromptChipsProps {
  onPromptClick: (prompt: string) => void;
}

const SMART_PROMPTS = [
  "Break this down",
  "Find anomalies",
  "Show risk flags",
  "Give me 5 insights",
  "Generate 3 charts",
  "Top trends",
];

export function SmartPromptChips({ onPromptClick }: SmartPromptChipsProps) {
  return (
    <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
      {SMART_PROMPTS.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onPromptClick(prompt)}
          className="flex-shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition-all hover:scale-[1.02] hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-700 active:scale-[0.98]"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
