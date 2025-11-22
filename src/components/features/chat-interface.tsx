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
import { Card, CardContent } from "@/components/ui";
import {
  Send,
  Loader2,
  User,
  Bot,
  Sparkles,
  MessageSquare,
} from "lucide-react";
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
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

function InlineChart({ chart }: { chart: ChartConfig }) {
  const { type, data, xAxis, yAxis, title } = chart;

  if (!data || data.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
        <span className="text-sm text-neutral-500">No data to display</span>
      </div>
    );
  }

  const commonProps = {
    data,
    margin: { top: 5, right: 20, left: 10, bottom: 5 },
  };

  return (
    <div className="mt-3 rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-800">
      {title && (
        <h4 className="mb-3 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {title}
        </h4>
      )}
      <ResponsiveContainer width="100%" height={200}>
        {type === "line" ? (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xAxis} tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xAxis} tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
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
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xAxis} tick={{ fontSize: 11 }} stroke="#9ca3af" />
            <YAxis
              dataKey={yAxis as string}
              tick={{ fontSize: 11 }}
              stroke="#9ca3af"
            />
            <Tooltip />
            <Scatter data={data} fill={CHART_COLORS[0]} />
          </ScatterChart>
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-sm text-neutral-500">
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
        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
          isUser
            ? "bg-primary-100 dark:bg-primary-900/30"
            : "bg-secondary-100 dark:bg-secondary-900/30"
        }`}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary-600" />
        ) : (
          <Bot className="h-4 w-4 text-secondary-600" />
        )}
      </div>
      <div className={`max-w-[80%] ${isUser ? "text-right" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-2 ${
            isUser
              ? "bg-primary-500 text-white"
              : "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Inline Chart */}
        {message.chart && <InlineChart chart={message.chart} />}

        {/* Suggestions */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {message.suggestions.map((suggestion, i) => (
              <button
                key={i}
                className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <span className="mt-1 block text-xs text-neutral-400">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}

export function ChatInterface({ headers, rows, onNewChart }: ChatInterfaceProps) {
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
      // Get conversation history (last 10 messages)
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

        // If a chart was generated, notify parent to add it to main charts grid
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

  // Handle clicking on suggestions in the welcome message
  const handleWelcomeSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => sendMessage(), 100);
  };

  return (
    <Card className="flex h-[600px] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-neutral-200 p-4 dark:border-neutral-700">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-white">
            Chat with Your Data
          </h3>
          <p className="text-xs text-neutral-500">
            {rows.length.toLocaleString()} rows | {headers.length} columns
          </p>
        </div>
      </div>

      {/* Messages */}
      <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id}>
            <MessageBubble message={message} />
            {/* Make welcome suggestions clickable */}
            {message.id === "welcome" && message.suggestions && (
              <div className="mt-3 ml-11 flex flex-wrap gap-2">
                {message.suggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => handleWelcomeSuggestionClick(suggestion)}
                    className="rounded-full bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50"
                  >
                    <Sparkles className="mr-1 inline-block h-3 w-3" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-secondary-100 dark:bg-secondary-900/30">
              <Bot className="h-4 w-4 text-secondary-600" />
            </div>
            <div className="rounded-2xl bg-neutral-100 px-4 py-2 dark:bg-neutral-800">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                <span className="text-sm text-neutral-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="border-t border-neutral-200 p-4 dark:border-neutral-700">
        {/* Quick Questions */}
        {messages.length <= 1 && (
          <div className="mb-3 flex flex-wrap gap-2">
            <button
              onClick={() => {
                setInput("What are the top 3 trends here?");
                setTimeout(() => sendMessage(), 100);
              }}
              className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              What are the top 3 trends here?
            </button>
            <button
              onClick={() => {
                setInput("Show me the last 30 days only");
                setTimeout(() => sendMessage(), 100);
              }}
              className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              Show me the last 30 days only
            </button>
            <button
              onClick={() => {
                setInput("What looks unusual in this data?");
                setTimeout(() => sendMessage(), 100);
              }}
              className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs text-neutral-700 transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
              What looks unusual in this data?
            </button>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your data..."
            className="flex-1 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500 text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-neutral-400">
          Try: "Show trends over time" or "Compare categories"
        </p>
      </div>
    </Card>
  );
}
