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
import {
  generateChartData,
  type ChartRecommendation,
} from "@/lib/charts/recommender";

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
 * Calculate basic statistics for a numeric column
 */
function calculateColumnStats(
  rows: Record<string, unknown>[],
  columnName: string
): {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
} | null {
  const values = rows
    .map((row) => Number(row[columnName]))
    .filter((v) => !isNaN(v));

  if (values.length === 0) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;

  const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    mean,
    median: sorted[Math.floor(sorted.length / 2)],
    stdDev,
  };
}

/**
 * Detect outliers in a numeric column
 * Used by analysis responses for detecting anomalies
 */
function _detectOutliers(
  rows: Record<string, unknown>[],
  columnName: string
): Array<{ row: number; value: number }> {
  const stats = calculateColumnStats(rows, columnName);
  if (!stats) return [];

  const outlierThreshold = 3; // 3 standard deviations
  const lowerBound = stats.mean - outlierThreshold * stats.stdDev;
  const upperBound = stats.mean + outlierThreshold * stats.stdDev;

  const outliers: Array<{ row: number; value: number }> = [];

  rows.forEach((row, index) => {
    const value = Number(row[columnName]);
    if (!isNaN(value) && (value < lowerBound || value > upperBound)) {
      outliers.push({ row: index + 1, value });
    }
  });

  return outliers;
}

// Export for potential future use
export const detectOutliers = _detectOutliers;

/**
 * Calculate correlation between two numeric columns
 */
function calculateCorrelation(
  rows: Record<string, unknown>[],
  col1: string,
  col2: string
): number | null {
  const values1 = rows.map((r) => Number(r[col1])).filter((v) => !isNaN(v));
  const values2 = rows.map((r) => Number(r[col2])).filter((v) => !isNaN(v));

  if (values1.length !== values2.length || values1.length < 2) return null;

  const n = values1.length;
  const sumX = values1.reduce((a, b) => a + b, 0);
  const sumY = values2.reduce((a, b) => a + b, 0);
  const sumXY = values1.reduce((sum, xi, i) => sum + xi * values2[i], 0);
  const sumX2 = values1.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = values2.reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );

  return denominator === 0 ? null : numerator / denominator;
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
2. Does it require analysis? (correlate, trend, pattern, insight, why, explain, anomaly, outlier)
3. What chart type if needed? (line, bar, pie, scatter)
4. Which columns are mentioned?

Return JSON format:
{
  "requiresChart": boolean,
  "requiresAnalysis": boolean,
  "chartType": "line|bar|pie|scatter|none",
  "columns": ["column1", "column2"],
  "analysisType": "summary|correlation|trend|anomaly|distribution|none"
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
  _intent: { chartType?: string; columns?: string[] },
  context: ChatContext
): Promise<ChatResponse> {
  const { headers, rows, columnStats } = context;

  // Build statistical context for chart generation
  const statsContext = columnStats
    ? columnStats.map((col) => ({
        name: col.name,
        type: col.type,
        uniqueValues: col.uniqueValues,
        ...(col.type === "number" && {
          min: col.min,
          max: col.max,
          mean: col.mean,
          median: col.median,
        }),
      }))
    : [];

  // Use OpenAI to generate chart specification
  const systemPrompt = `You are a data visualization expert and analyst. Based on the user's question, create a chart specification and provide analytical context.

Return JSON format:
{
  "chartType": "line|bar|pie|scatter|histogram",
  "xAxis": "column_name",
  "yAxis": "column_name",
  "title": "Chart Title",
  "description": "What this chart shows",
  "explanation": "Analytical explanation (2-3 sentences) with specific insights about what patterns or trends this chart will reveal"
}`;

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `User Question: "${userMessage}"
Available Columns: ${headers.join(", ")}
Column Statistics: ${JSON.stringify(statsContext, null, 2)}
Sample Data: ${JSON.stringify(rows.slice(0, 5), null, 2)}

Create a chart specification that will provide analytical insights for this question.`,
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
      message:
        "I couldn't generate a chart for that question. Could you rephrase it or specify which columns to visualize?",
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

  // Generate contextual suggestions
  const suggestions = generateContextualSuggestions(
    headers,
    "chart",
    chartSpec.xAxis,
    chartSpec.yAxis,
    columnStats
  );

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
  const { headers, rows, columnStats } = context;

  // Prepare analytical context
  const analyticalContext = {
    totalRows: rows.length,
    columns: columnStats
      ? columnStats.map((col) => ({
          name: col.name,
          type: col.type,
          uniqueValues: col.uniqueValues,
          nullCount: col.nullCount,
          ...(col.type === "number" && {
            min: col.min,
            max: col.max,
            mean: col.mean?.toFixed(2),
            median: col.median,
            stdDev: col.standardDeviation?.toFixed(2),
          }),
          ...(col.outliers && { outlierCount: col.outliers.count }),
        }))
      : headers.map((h) => ({ name: h, type: "unknown" })),
  };

  // Detect correlations for relevant columns
  const numericCols = columnStats
    ? columnStats.filter((c) => c.type === "number").map((c) => c.name)
    : [];

  let correlationInfo = "";
  if (numericCols.length >= 2) {
    const corr = calculateCorrelation(rows, numericCols[0], numericCols[1]);
    if (corr !== null) {
      correlationInfo = `\nCorrelation between ${numericCols[0]} and ${numericCols[1]}: r=${corr.toFixed(3)}`;
    }
  }

  const systemPrompt = `You are a professional data analyst. Answer the user's question with specific, data-driven insights.

ANALYSIS GUIDELINES:
- Reference specific column names and values from the data
- Provide statistical context (mean, median, outliers, ranges)
- Compare categories or time periods when relevant
- Quantify findings with specific numbers and percentages
- Explain findings in business terms, not just technical jargon
- Include actionable insights when possible

Keep responses clear and focused (2-4 paragraphs). Be specific with numbers.`;

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Dataset Overview:
Total Rows: ${rows.length.toLocaleString()}
Columns: ${JSON.stringify(analyticalContext.columns, null, 2)}${correlationInfo}

Sample Data (first 10 rows):
${JSON.stringify(rows.slice(0, 10), null, 2)}

User Question: "${userMessage}"

Provide a data-driven answer with specific statistics and actionable insights.`,
      },
    ],
    temperature: 0.6,
    max_tokens: 600,
  });

  const message =
    response.choices[0]?.message?.content ||
    "I couldn't analyze that. Could you rephrase your question?";

  // Generate contextual suggestions
  const analysisType = detectAnalysisType(userMessage);
  const suggestions = generateContextualSuggestions(
    headers,
    analysisType,
    undefined,
    undefined,
    columnStats
  );

  return {
    type: "text",
    message,
    suggestions,
  };
}

/**
 * Detect the type of analysis from the message
 */
function detectAnalysisType(
  message: string
): "trend" | "correlation" | "anomaly" | "general" {
  const lowerMsg = message.toLowerCase();
  if (
    lowerMsg.includes("trend") ||
    lowerMsg.includes("over time") ||
    lowerMsg.includes("change")
  ) {
    return "trend";
  }
  if (
    lowerMsg.includes("correlat") ||
    lowerMsg.includes("relationship") ||
    lowerMsg.includes("relate")
  ) {
    return "correlation";
  }
  if (
    lowerMsg.includes("outlier") ||
    lowerMsg.includes("anomal") ||
    lowerMsg.includes("unusual")
  ) {
    return "anomaly";
  }
  return "general";
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
      content: `You are a helpful data analyst assistant. You help users understand their data through conversation.

Available columns: ${headers.join(", ")}
Dataset has ${rows.length.toLocaleString()} rows.

When discussing data:
- Reference specific columns by name
- Provide context about what analysis is possible
- Suggest specific analytical approaches
- Be conversational but professional

Keep responses concise (2-3 paragraphs).`,
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
    max_tokens: 400,
  });

  const message =
    response.choices[0]?.message?.content ||
    "I'm not sure how to help with that. Could you ask about your data?";

  const suggestions = generateContextualSuggestions(headers, "general");

  return {
    type: "text",
    message,
    suggestions,
  };
}

/**
 * Generate contextual follow-up question suggestions
 */
function generateContextualSuggestions(
  headers: string[],
  context: "chart" | "trend" | "correlation" | "anomaly" | "general",
  xColumn?: string,
  yColumn?: string,
  columnStats?: EnhancedColumnStats[]
): string[] {
  const suggestions: string[] = [];

  const numericCols = columnStats
    ? columnStats.filter((c) => c.type === "number").map((c) => c.name)
    : [];
  const categoryCols = columnStats
    ? columnStats
        .filter((c) => c.type === "string" && c.uniqueValues < 20)
        .map((c) => c.name)
    : [];
  const dateCols = columnStats
    ? columnStats.filter((c) => c.inferredType === "date").map((c) => c.name)
    : [];

  if (context === "chart") {
    if (categoryCols.length > 0 && xColumn) {
      suggestions.push(`Which ${categoryCols[0]} categories drive this trend?`);
    }
    if (numericCols.length > 0) {
      suggestions.push(`Are there any outliers in ${numericCols[0]}?`);
    }
    if (yColumn) {
      suggestions.push(`What's the average ${yColumn} by category?`);
    }
  } else if (context === "trend") {
    if (dateCols.length > 0 && numericCols.length > 0) {
      suggestions.push(`Show me ${numericCols[0]} over time`);
    }
    if (categoryCols.length > 0) {
      suggestions.push(`Compare trends across ${categoryCols[0]}`);
    }
    suggestions.push("What's driving this trend?");
  } else if (context === "correlation") {
    if (numericCols.length >= 2) {
      suggestions.push(
        `Show scatter plot of ${numericCols[0]} vs ${numericCols[1]}`
      );
      suggestions.push(
        `What's the correlation between ${numericCols[0]} and ${numericCols[1]}?`
      );
    }
    suggestions.push("Which variables are most related?");
  } else if (context === "anomaly") {
    if (numericCols.length > 0) {
      suggestions.push(`List specific outliers in ${numericCols[0]}`);
      suggestions.push(`What caused these anomalies?`);
    }
    suggestions.push("Show me the distribution");
  } else {
    // general context
    if (headers.length > 0) {
      if (numericCols.length > 0) {
        suggestions.push(`What's the distribution of ${numericCols[0]}?`);
      }
      if (categoryCols.length > 0 && numericCols.length > 0) {
        suggestions.push(`Compare ${numericCols[0]} by ${categoryCols[0]}`);
      }
      suggestions.push("What are the key insights in this data?");
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
