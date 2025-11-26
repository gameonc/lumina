import OpenAI from "openai";
import type { EnhancedColumnStats } from "@/lib/analyzers/column-profiler";

// Lazy-initialize OpenAI client
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

export interface KeyInsight {
  title: string;
  description: string;
  type: "positive" | "negative" | "neutral" | "warning";
  metric?: string;
  change?: string;
}

export interface DatasetSummary {
  headline: string;
  description: string;
  keyMetrics: { label: string; value: string }[];
}

export interface Anomaly {
  column: string;
  type: "outlier" | "missing" | "unusual_pattern" | "data_quality";
  severity: "low" | "medium" | "high";
  description: string;
  affectedRows?: number;
}

export interface AIInsights {
  summary: DatasetSummary;
  keyInsights: KeyInsight[];
  anomalies: Anomaly[];
}

/**
 * Generate AI-powered insights for a dataset
 */
export async function generateDatasetInsights(
  headers: string[],
  rows: Record<string, unknown>[],
  columnStats: EnhancedColumnStats[],
  datasetType: string
): Promise<AIInsights> {
  // Prepare a summary of the data for the AI
  const dataSummary = {
    totalRows: rows.length,
    totalColumns: headers.length,
    columns: columnStats.map((col) => ({
      name: col.name,
      type: col.type,
      uniqueValues: col.uniqueValues,
      nullCount: col.nullCount,
      nullPercentage: ((col.nullCount / rows.length) * 100).toFixed(1),
      ...(col.type === "number" && {
        min: col.min,
        max: col.max,
        mean: col.mean?.toFixed(2),
        median: col.median,
      }),
      ...(col.topCategories && { topCategories: col.topCategories.slice(0, 5) }),
    })),
    sampleData: rows.slice(0, 10),
  };

  const systemPrompt = `You are a senior data analyst. Analyze the dataset and provide actionable insights.
Return your response as valid JSON with this exact structure:
{
  "summary": {
    "headline": "One sentence headline about what this data shows (max 80 chars)",
    "description": "2-3 sentence description of the dataset and its purpose",
    "keyMetrics": [
      { "label": "Metric Name", "value": "Metric Value" }
    ]
  },
  "keyInsights": [
    {
      "title": "Short insight title (max 50 chars)",
      "description": "1-2 sentence explanation of the insight",
      "type": "positive|negative|neutral|warning",
      "metric": "Optional: the key number/stat",
      "change": "Optional: percentage or trend indicator"
    }
  ],
  "anomalies": [
    {
      "column": "Column name",
      "type": "outlier|missing|unusual_pattern|data_quality",
      "severity": "low|medium|high",
      "description": "Brief description of the anomaly",
      "affectedRows": number
    }
  ]
}

Guidelines:
- Provide exactly 3 key insights (most impactful findings)
- Focus on actionable, business-relevant insights
- For positive insights, highlight growth, improvements, or strong performance
- For negative insights, highlight concerns, declines, or issues
- For warnings, highlight data quality issues or potential problems
- Detect anomalies: outliers, high missing data, unusual patterns
- Be specific with numbers and percentages
- Keep language clear and professional`;

  const userMessage = `Dataset Type: ${datasetType}
Total Rows: ${rows.length}
Total Columns: ${headers.length}

Column Statistics:
${JSON.stringify(dataSummary.columns, null, 2)}

Sample Data (first 10 rows):
${JSON.stringify(dataSummary.sampleData, null, 2)}

Analyze this dataset and provide:
1. A summary with headline and 3-4 key metrics
2. Exactly 3 key insights (most important findings)
3. Any detected anomalies or data quality issues`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const result = JSON.parse(content) as AIInsights;

    // Ensure we have exactly 3 insights
    if (result.keyInsights.length > 3) {
      result.keyInsights = result.keyInsights.slice(0, 3);
    }

    return result;
  } catch (error) {
    console.error("Failed to generate AI insights:", error);
    // Return fallback insights based on column stats
    return generateFallbackInsights(columnStats, rows.length, datasetType);
  }
}

/**
 * Generate chart explanation using AI
 */
export async function generateChartExplanation(
  chartType: string,
  chartTitle: string,
  data: Record<string, unknown>[],
  xKey: string,
  yKey: string
): Promise<string> {
  const sampleData = data.slice(0, 15);

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a data visualization expert. Explain charts in 1-2 clear, insightful sentences. Focus on the main trend or pattern, and what it means for the viewer. Be concise and avoid technical jargon.",
        },
        {
          role: "user",
          content: `Explain this ${chartType} chart titled "${chartTitle}".
X-axis: ${xKey}
Y-axis: ${yKey}
Data points: ${JSON.stringify(sampleData)}

What's the key takeaway from this visualization?`,
        },
      ],
      temperature: 0.5,
      max_tokens: 150,
    });

    return response.choices[0]?.message?.content || "This chart visualizes the relationship between the selected data points.";
  } catch (error) {
    console.error("Failed to generate chart explanation:", error);
    return `This ${chartType} chart shows ${yKey} across different ${xKey} values.`;
  }
}

/**
 * Fallback insights when AI is unavailable
 */
function generateFallbackInsights(
  columnStats: EnhancedColumnStats[],
  rowCount: number,
  datasetType: string
): AIInsights {
  const numericColumns = columnStats.filter((c) => c.type === "number");
  const textColumns = columnStats.filter((c) => c.type === "string");
  const highMissingCols = columnStats.filter(
    (c) => (c.nullCount / rowCount) * 100 > 10
  );

  const insights: KeyInsight[] = [];

  // Insight 1: Data overview
  insights.push({
    title: `${rowCount.toLocaleString()} records analyzed`,
    description: `Your ${datasetType} dataset contains ${columnStats.length} columns with ${numericColumns.length} numeric and ${textColumns.length} text fields.`,
    type: "neutral",
    metric: rowCount.toLocaleString(),
  });

  // Insight 2: Numeric analysis
  if (numericColumns.length > 0) {
    const col = numericColumns[0];
    insights.push({
      title: `${col.name} ranges from ${col.min} to ${col.max}`,
      description: `The ${col.name} column shows values between ${col.min} and ${col.max}, with an average of ${col.mean?.toFixed(2)}.`,
      type: "neutral",
      metric: col.mean?.toFixed(2),
    });
  }

  // Insight 3: Data quality
  if (highMissingCols.length > 0) {
    const col = highMissingCols[0];
    const pct = ((col.nullCount / rowCount) * 100).toFixed(1);
    insights.push({
      title: `${col.name} has ${pct}% missing data`,
      description: `Consider addressing missing values in ${col.name} to improve data quality.`,
      type: "warning",
      metric: `${pct}%`,
    });
  } else {
    insights.push({
      title: "Data completeness looks good",
      description: "Most columns have low or no missing values, indicating good data quality.",
      type: "positive",
    });
  }

  // Anomalies
  const anomalies: Anomaly[] = highMissingCols.map((col) => ({
    column: col.name,
    type: "missing" as const,
    severity: (col.nullCount / rowCount) * 100 > 30 ? "high" : "medium",
    description: `${((col.nullCount / rowCount) * 100).toFixed(1)}% of values are missing`,
    affectedRows: col.nullCount,
  }));

  return {
    summary: {
      headline: `${datasetType.charAt(0).toUpperCase() + datasetType.slice(1)} dataset with ${rowCount.toLocaleString()} records`,
      description: `This dataset contains ${columnStats.length} columns including ${numericColumns.length} numeric fields for analysis. ${highMissingCols.length > 0 ? "Some columns have missing data that may need attention." : "Data quality appears good overall."}`,
      keyMetrics: [
        { label: "Total Rows", value: rowCount.toLocaleString() },
        { label: "Columns", value: columnStats.length.toString() },
        { label: "Numeric Fields", value: numericColumns.length.toString() },
        { label: "Data Quality", value: highMissingCols.length === 0 ? "Good" : "Needs Review" },
      ],
    },
    keyInsights: insights,
    anomalies,
  };
}
