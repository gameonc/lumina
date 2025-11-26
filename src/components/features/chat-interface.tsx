"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { CardContent } from "@/components/ui";
import { Send, Loader2, User, Bot, Sparkles } from "lucide-react";
import type { ChartConfig } from "@/types";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  chart?: ChartConfig;
  suggestions?: string[];
  timestamp: Date;
}

interface ChatInterfaceProps {
  headers: string[];
  rows: Record<string, unknown>[];
  onClose?: () => void;
  onNewChart?: (chart: ChartConfig) => void;
}

const CHART_COLORS = [
  "#8b5cf6", // violet
  "#6366f1", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
];

function InlineChart({ chart }: { chart: ChartConfig }) {
  const { type, data, xAxis, yAxis, title } = chart;

  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg bg-slate-50">
        <span className="text-sm text-slate-500">No data to display</span>
      </div>
    );
  }

  const commonProps = {
    data,
    margin: { top: 5, right: 20, left: 10, bottom: 5 },
  };

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {title && (
        <h4 className="mb-3 text-sm font-semibold text-slate-700">{title}</h4>
      )}
      <ResponsiveContainer width="100%" height={200}>
        {type === "line" ? (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={xAxis} tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={yAxis as string}
              stroke={CHART_COLORS[0]}
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        ) : type === "bar" || type === "histogram" ? (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={xAxis} tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip />
            <Bar
              dataKey={type === "histogram" ? "frequency" : (yAxis as string)}
              radius={[4, 4, 0, 0]}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        ) : type === "pie" ? (
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey={xAxis}
              cx="50%"
              cy="50%"
              outerRadius={70}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        ) : type === "scatter" ? (
          <ScatterChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey={xAxis} tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis
              dataKey={yAxis as string}
              tick={{ fontSize: 11 }}
              stroke="#94a3b8"
            />
            <Tooltip />
            <Scatter data={data} fill={CHART_COLORS[0]} />
          </ScatterChart>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-slate-500">
              Unsupported chart type
            </span>
          </div>
        )}
      </ResponsiveContainer>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full shadow-sm ${
          isUser
            ? "bg-gradient-to-br from-violet-500 to-indigo-600 text-white"
            : "border border-slate-200 bg-white text-violet-600"
        }`}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={`max-w-[85%] ${isUser ? "text-right" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? "rounded-tr-none bg-violet-600 text-white"
              : "rounded-tl-none border border-slate-100 bg-white text-slate-700"
          }`}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
          </p>
        </div>

        {/* Inline Chart */}
        {message.chart && <InlineChart chart={message.chart} />}

        {/* Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.suggestions.map((suggestion, i) => (
              <button
                key={i}
                className="rounded-full border border-violet-100 bg-white px-3 py-1.5 text-xs font-medium text-violet-600 shadow-sm transition-all hover:border-violet-200 hover:bg-violet-50"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <span className="mt-1.5 block text-[10px] font-medium text-slate-400">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}

export function ChatInterface({
  headers,
  rows,
  onNewChart,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi! I'm your data assistant. Ask me anything about your dataset - I can analyze trends, create charts, find patterns, and answer questions about your data.",
      suggestions: [
        "Show me a summary",
        "What are the trends?",
        "Create a chart",
        "Find outliers",
      ],
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.content,
          headers,
          rows,
          conversationHistory,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: result.data.message || "I couldn't process that request.",
          chart: result.data.chart,
          suggestions: result.data.suggestions,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        if (result.data.chart && onNewChart) {
          onNewChart(result.data.chart);
        }
      } else {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            result.error || "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        content: "Sorry, I couldn't connect to the server. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleWelcomeSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => sendMessage(), 100);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header info - Removed since it's in the card header now */}

      {/* Messages */}
      <CardContent className="flex-1 space-y-6 overflow-y-auto bg-slate-50/50 p-4">
        {messages.map((message) => (
          <div key={message.id}>
            <MessageBubble message={message} />
            {message.id === "welcome" && message.suggestions && (
              <div className="ml-11 mt-3 flex flex-wrap gap-2">
                {message.suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleWelcomeSuggestionClick(suggestion)}
                    className="rounded-full border border-violet-100 bg-white px-3 py-1.5 text-xs font-medium text-violet-600 shadow-sm transition-colors hover:border-violet-200 hover:bg-violet-50"
                  >
                    <Sparkles className="mr-1 inline-block h-3 w-3 text-violet-500" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm">
              <Bot className="h-4 w-4 text-violet-600" />
            </div>
            <div className="rounded-2xl rounded-tl-none border border-slate-100 bg-white px-4 py-2 shadow-sm">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-violet-500" />
                <span className="text-sm text-slate-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="border-t border-slate-100 bg-white p-4">
        {messages.length <= 1 && (
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setInput("What are the top 3 trends here?");
                setTimeout(() => sendMessage(), 100);
              }}
              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-slate-200 hover:bg-slate-100"
            >
              What are the top 3 trends here?
            </button>
            <button
              onClick={() => {
                setInput("Show me the last 30 days only");
                setTimeout(() => sendMessage(), 100);
              }}
              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-slate-200 hover:bg-slate-100"
            >
              Show me the last 30 days only
            </button>
          </div>
        )}

        <div className="relative flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your data..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-12 text-sm text-slate-700 shadow-sm transition-all placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-violet-500"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white transition-all hover:bg-violet-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-violet-600 disabled:hover:shadow-none"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] font-medium text-slate-400">
          AI can make mistakes. Double check important info.
        </p>
      </div>
    </div>
  );
}
