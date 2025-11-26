/**
 * Chat Handler - Process natural language questions about data
 * 
 * Current Work:
 * - Worker: Auto/Cursor
 * - Task: Backend logic for "Chat With Your Data"
 * - Status: in_progress
 * - Last Updated: 2025-11-22
 */

import OpenAI from "openai";
import type { EnhancedColumnStats } from "@/lib/analyzers/column-profiler";
import type { ChartConfig } from "@/types";
import { generateChartData, type ChartRecommendation } from "@/lib/charts/recommender";

// Lazy-initialize OpenAI client to avoid build-time errors
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
}

export type ChatMessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
  chart?: ChartConfig;
  timestamp?: number;
}

export interface ChatContext {
  datasetId?: string;
  headers: string[];
  rows: Record<string, unknown>[];
  columnStats?: EnhancedColumnStats[];
  conversationHistory?: ChatMessage[];
}

export type ChatResponseType = "text" | "chart" | "both";

export interface ChatResponse {
  type: ChatResponseType;
  message: string;
  chart?: ChartConfig;
  suggestions?: string[];
}

/**
 * Process a chat message and generate response
 */
export async function processChatMessage(
  userMessage: string,
  context: ChatContext
): Promise<ChatResponse> {
  const { headers } = context;

  // Analyze the user's intent
  const intent = await analyzeIntent(userMessage, headers);

  // Generate response based on intent
  if (intent.requiresChart) {
    return await generateChartResponse(userMessage, intent, context);
  } else if (intent.requiresAnalysis) {
    return await generateAnalysisResponse(userMessage, context);
  } else {
    return await generateTextResponse(userMessage, context);
  }
}

/**
 * Analyze user intent to determine response type
 */
async function analyzeIntent(
  message: string,
  headers: string[]
): Promise<{
  requiresChart: boolean;
  requiresAnalysis: boolean;
  chartType?: string;
  columns?: string[];
  analysisType?: string;
}> {
  const systemPrompt = `You are a data analysis intent classifier. Analyze the user's question and determine:
1. Does it require a chart? (visualize, show, plot, graph, compare visually)
2. Does it require analysis? (correlate, trend, pattern, insight, why, explain)
3. What chart type if needed? (line, bar, pie, scatter)
4. Which columns are mentioned?

Return JSON format:
{
  "requiresChart": boolean,
  "requiresAnalysis": boolean,
  "chartType": "line|bar|pie|scatter|none",
  "columns": ["column1", "column2"],
  "analysisType": "summary|correlation|trend|anomaly|none"
}`;

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `User Question: "${message}"
Available Columns: ${headers.join(", ")}

Classify this question.`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 300,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return {
      requiresChart: false,
      requiresAnalysis: false,
    };
  }

  return JSON.parse(content);
}

/**
 * Generate a response with a chart
 */
async function generateChartResponse(
  userMessage: string,
  _intent: any,
  context: ChatContext
): Promise<ChatResponse> {
  const { headers, rows } = context;

  // Use OpenAI to generate chart specification
  const systemPrompt = `You are a data visualization expert. Based on the user's question, create a chart specification.

Return JSON format:
{
  "chartType": "line|bar|pie|scatter|histogram",
  "xAxis": "column_name",
  "yAxis": "column_name",
  "title": "Chart Title",
  "description": "What this chart shows",
  "explanation": "Brief explanation of the chart"
}`;

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `User Question: "${userMessage}"
Available Columns: ${headers.join(", ")}
Sample Data: ${JSON.stringify(rows.slice(0, 5), null, 2)}

Create a chart specification for this question.`,
      },
    ],
    response_format: { type: "json_object" },
    temperature: 0.5,
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    return {
      type: "text",
      message: "I couldn't generate a chart for that question. Could you rephrase it?",
    };
  }

  const chartSpec = JSON.parse(content);

  // Create chart recommendation
  const recommendation: ChartRecommendation = {
    chartType: chartSpec.chartType,
    title: chartSpec.title,
    description: chartSpec.description,
    xAxis: chartSpec.xAxis,
    yAxis: chartSpec.yAxis,
    columns: [chartSpec.xAxis, chartSpec.yAxis].filter(Boolean),
    priority: 5,
    reasoning: chartSpec.explanation,
  };

  // Generate chart data
  const chart = generateChartData(recommendation, rows);

  // Generate suggestions
  const suggestions = generateSuggestions(headers, "chart");

  return {
    type: "both",
    message: chartSpec.explanation,
    chart: chart ?? undefined,
    suggestions,
  };
}

/**
 * Generate an analysis response
 */
async function generateAnalysisResponse(
  userMessage: string,
  context: ChatContext
): Promise<ChatResponse> {
  const { headers, rows } = context;

  const systemPrompt = `You are a data analyst. Answer the user's question about their dataset with clear, actionable insights.
Keep responses concise (2-3 paragraphs max).`;

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Dataset Columns: ${headers.join(", ")}
Total Rows: ${rows.length}
Sample Data: ${JSON.stringify(rows.slice(0, 10), null, 2)}

User Question: "${userMessage}"

Provide a clear, data-driven answer.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  const message =
    response.choices[0]?.message?.content ||
    "I couldn't analyze that. Could you rephrase your question?";

  const suggestions = generateSuggestions(headers, "analysis");

  return {
    type: "text",
    message,
    suggestions,
  };
}

/**
 * Generate a simple text response
 */
async function generateTextResponse(
  userMessage: string,
  context: ChatContext
): Promise<ChatResponse> {
  const { headers, rows, conversationHistory = [] } = context;

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `You are a helpful data assistant. You help users understand their data.
Available columns: ${headers.join(", ")}
Dataset has ${rows.length} rows.

Be concise and helpful.`,
    },
  ];

  // Add conversation history (last 5 messages)
  conversationHistory.slice(-5).forEach((msg) => {
    messages.push({
      role: msg.role === "user" ? "user" : "assistant",
      content: msg.content,
    });
  });

  // Add current message
  messages.push({
    role: "user",
    content: userMessage,
  });

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages,
    temperature: 0.7,
    max_tokens: 300,
  });

  const message =
    response.choices[0]?.message?.content ||
    "I'm not sure how to help with that. Could you ask about your data?";

  const suggestions = generateSuggestions(headers, "general");

  return {
    type: "text",
    message,
    suggestions,
  };
}

/**
 * Generate follow-up question suggestions
 */
function generateSuggestions(
  headers: string[],
  context: "chart" | "analysis" | "general"
): string[] {
  const suggestions: string[] = [];

  if (context === "chart") {
    suggestions.push(
      `Show me trends over time`,
      `Compare ${headers[0]} across categories`,
      `What are the outliers?`
    );
  } else if (context === "analysis") {
    suggestions.push(
      `What's the correlation between columns?`,
      `Summarize the key findings`,
      `Are there any anomalies?`
    );
  } else {
    if (headers.length > 0) {
      suggestions.push(
        `Tell me about ${headers[0]}`,
        `Show me a chart`,
        `What patterns do you see?`
      );
    }
  }

  return suggestions.slice(0, 3);
}

/**
 * Format chart for chat response
 */
export function formatChartForChat(chart: ChartConfig): string {
  return `[Chart: ${chart.title}]\nType: ${chart.type}\nShowing: ${chart.xAxis} vs ${chart.yAxis}`;
}

