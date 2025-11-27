import OpenAI from "openai";
import type { EnhancedColumnStats } from "@/lib/analyzers/column-profiler";
import type { ChartSuggestion } from "@/types";
import {
  analyzeFinanceHealth,
  formatPercentage,
  type FinanceData,
  type FinanceHealthReport,
} from "@/lib/finance/benchmarks";

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
  type: "money" | "problem" | "trend";
  severity?: "good" | "neutral" | "warning";
  metric?: string;
  recommendation?: string;
  // Legacy support
  impact?: "high" | "medium" | "low";
}

export interface DatasetSummary {
  headline: string;
  description: string;
  keyMetrics: Array<{
    label: string;
    value: string | number;
    trend?: "up" | "down" | "stable";
    percentChange?: number;
  }>;
  dataQuality: "excellent" | "good" | "fair" | "poor";
}

export interface Anomaly {
  column: string;
  type: "outlier" | "missing" | "unusual_pattern" | "data_quality";
  severity: "low" | "medium" | "high";
  description: string;
  affectedRows?: number;
  specificValues?: (number | string)[];
}

export interface AIInsights {
  summary: DatasetSummary;
  keyInsights: KeyInsight[];
  anomalies: Anomaly[];
  chartSuggestions: ChartSuggestion[];
  financeHealth?: FinanceHealthReport;  // Added for finance mode
}

/**
 * Calculate statistical thresholds for outlier detection
 */
function calculateStatisticalContext(columnStats: EnhancedColumnStats[]) {
  return columnStats
    .map((col) => {
      if (col.type === "number" && col.mean && col.standardDeviation) {
        const stdDev = col.standardDeviation;
        const mean = col.mean;
        return {
          name: col.name,
          outlierThreshold: mean + 3 * stdDev,
          zScoreRange: `±3σ from mean (${(mean - 3 * stdDev).toFixed(2)} to ${(mean + 3 * stdDev).toFixed(2)})`,
          coefficientOfVariation: ((stdDev / mean) * 100).toFixed(1) + "%",
        };
      }
      return null;
    })
    .filter(Boolean);
}

/**
 * Detect correlations between numeric columns
 */
function detectCorrelations(
  rows: Record<string, unknown>[],
  columnStats: EnhancedColumnStats[]
): Array<{ col1: string; col2: string; correlation: number }> {
  const numericCols = columnStats.filter((c) => c.type === "number");
  const correlations: Array<{
    col1: string;
    col2: string;
    correlation: number;
  }> = [];

  for (let i = 0; i < numericCols.length; i++) {
    for (let j = i + 1; j < numericCols.length; j++) {
      const col1 = numericCols[i].name;
      const col2 = numericCols[j].name;

      // Extract numeric values
      const values1 = rows.map((r) => Number(r[col1])).filter((v) => !isNaN(v));
      const values2 = rows.map((r) => Number(r[col2])).filter((v) => !isNaN(v));

      if (values1.length > 2 && values2.length > 2) {
        const correlation = calculatePearsonCorrelation(values1, values2);
        if (Math.abs(correlation) > 0.5) {
          correlations.push({ col1, col2, correlation });
        }
      }
    }
  }

  return correlations.sort(
    (a, b) => Math.abs(b.correlation) - Math.abs(a.correlation)
  );
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculatePearsonCorrelation(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length);
  if (n === 0) return 0;

  const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
  const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
  const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt(
    (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
  );

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Extract finance data from rows for health analysis
 */
function extractFinanceDataFromRows(
  headers: string[],
  rows: Record<string, unknown>[]
): FinanceData {
  const lowerHeaders = headers.map((h) => h.toLowerCase());

  // Find revenue/income columns
  const revenueKeywords = ["revenue", "income", "sales", "earnings"];
  const revenueIdx = lowerHeaders.findIndex((h) =>
    revenueKeywords.some((k) => h.includes(k))
  );

  // Find expense/cost columns
  const expenseKeywords = ["expense", "cost", "spend", "expenditure"];
  const expenseIdx = lowerHeaders.findIndex((h) =>
    expenseKeywords.some((k) => h.includes(k))
  );

  let totalRevenue = 0;
  let totalExpenses = 0;

  if (revenueIdx !== -1) {
    totalRevenue = rows.reduce(
      (sum, row) => sum + (Number(row[headers[revenueIdx]]) || 0),
      0
    );
  }

  if (expenseIdx !== -1) {
    totalExpenses = rows.reduce(
      (sum, row) => sum + (Number(row[headers[expenseIdx]]) || 0),
      0
    );
  }

  // If no explicit revenue/expense columns, try to infer from all numeric columns
  // Look for common patterns like "amount" column with "type" column (income vs expense)
  if (totalRevenue === 0 && totalExpenses === 0) {
    const amountIdx = lowerHeaders.findIndex(
      (h) => h.includes("amount") || h.includes("value") || h.includes("total")
    );
    const typeIdx = lowerHeaders.findIndex(
      (h) => h.includes("type") || h.includes("category")
    );

    if (amountIdx !== -1 && typeIdx !== -1) {
      rows.forEach((row) => {
        const amount = Number(row[headers[amountIdx]]) || 0;
        const type = String(row[headers[typeIdx]] || "").toLowerCase();

        if (
          type.includes("income") ||
          type.includes("revenue") ||
          type.includes("sale")
        ) {
          totalRevenue += amount;
        } else if (
          type.includes("expense") ||
          type.includes("cost") ||
          type.includes("payment")
        ) {
          totalExpenses += amount;
        }
      });
    }
  }

  return {
    totalRevenue: totalRevenue > 0 ? totalRevenue : undefined,
    totalExpenses: totalExpenses > 0 ? totalExpenses : undefined,
    periodCount: rows.length,
  };
}

/**
 * Generate finance-specific system prompt with benchmarks
 */
function getFinanceSystemPrompt(healthReport: FinanceHealthReport): string {
  return `You are a finance-savvy business advisor analyzing someone's financial data. You have EXPERT KNOWLEDGE of industry benchmarks that ChatGPT doesn't have.

CRITICAL: You know these industry standards:
- Healthy expense ratio: Under 60% of revenue
- Good profit margin: 15-20%
- Strong revenue growth: 10%+ annually
- Expense growth: Should stay under 5% unless tied to growth

YOU ALREADY ANALYZED THIS DATA. Here's what you found:
- Overall Financial Health: Grade ${healthReport.overallGrade} (${healthReport.overallScore}/100)
- Summary: ${healthReport.gradeDescription}
${healthReport.metrics.map((m) => `- ${m.name}: ${formatPercentage(m.value)} (${m.status}) - ${m.insight}`).join("\n")}
${healthReport.redFlags.length > 0 ? `\nRED FLAGS:\n${healthReport.redFlags.map((f) => `- ⚠️ ${f}`).join("\n")}` : ""}
${healthReport.positives.length > 0 ? `\nSTRENGTHS:\n${healthReport.positives.map((p) => `- ✅ ${p}`).join("\n")}` : ""}

YOUR JOB: Take this analysis and explain it in plain English. Focus on:
1. The GRADE and what it means for their business
2. Compare their numbers to industry benchmarks (this is your edge over ChatGPT!)
3. Any red flags that need attention
4. Specific action items

CRITICAL RULES:
- ALWAYS mention the letter grade (A/B/C/D/F) prominently
- ALWAYS compare to benchmarks: "Your X is Y%, healthy businesses typically stay under Z%"
- Be specific with dollars and percentages
- Use plain English - no jargon
- Focus on ACTIONABLE advice

Return your response as valid JSON with this exact structure:
{
  "summary": {
    "headline": "Grade [X]: [One punchy sentence about their financial health]",
    "description": "What the grade means + one key benchmark comparison",
    "keyMetrics": [
      {
        "label": "Health Grade",
        "value": "${healthReport.overallGrade}",
        "trend": "up|down|stable"
      },
      {
        "label": "Simple Label",
        "value": "123" or 123,
        "percentChange": 15.5
      }
    ],
    "dataQuality": "excellent|good|fair|poor"
  },
  "keyInsights": [
    {
      "title": "Short headline (max 50 chars)",
      "description": "Compare to benchmark + what it means for them",
      "type": "money|problem|trend",
      "severity": "good|neutral|warning",
      "metric": "The key number",
      "recommendation": "One specific thing they should do"
    }
  ],
  "anomalies": [...],
  "chartSuggestions": [...]
}

EXAMPLE OUTPUT:
Bad: "Your expenses are $45,000"
Good: "Your expenses are 68% of revenue - that's above the healthy threshold of 60%. Most profitable businesses keep this under 60%."`;
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
  // Calculate statistical context
  const statisticalContext = calculateStatisticalContext(columnStats);
  const correlations = detectCorrelations(rows, columnStats);

  // Prepare enhanced data summary for the AI
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
        stdDev: col.standardDeviation?.toFixed(2),
      }),
      ...(col.topCategories && {
        topCategories: col.topCategories.slice(0, 5),
      }),
      ...(col.outliers && {
        outlierCount: col.outliers.count,
        outlierMethod: col.outliers.method,
      }),
      dataQuality: col.quality,
    })),
    sampleData: rows.slice(0, 10),
    statisticalContext,
    correlations: correlations.slice(0, 3),
  };

  // FINANCE MODE: Use specialized analysis with industry benchmarks
  let financeHealthReport: FinanceHealthReport | undefined;
  if (datasetType.toLowerCase() === "finance") {
    const financeData = extractFinanceDataFromRows(headers, rows);
    if (financeData.totalRevenue || financeData.totalExpenses) {
      financeHealthReport = analyzeFinanceHealth(financeData);
    }
  }

  // Select appropriate system prompt based on dataset type
  const systemPrompt = financeHealthReport
    ? getFinanceSystemPrompt(financeHealthReport)
    : `You are a friendly business advisor explaining spreadsheet data to someone who is NOT a data scientist. Your job is to find the most important takeaways and explain them like you're talking to a friend over coffee.

CRITICAL RULES:
- Write like you're explaining to an 8th grader - NO jargon
- NEVER use: correlation, coefficient, standard deviation, r=, σ, z-score, distribution, variance, median, imputation, cardinality
- DO use: "goes up together", "unusual values", "missing info", "average", "total", "biggest", "smallest"
- Focus on MONEY, PROBLEMS, and TRENDS - what matters to a business owner
- Use specific dollar amounts and percentages when you see them
- Keep explanations short and punchy (1-2 sentences max)

Return your response as valid JSON with this exact structure:
{
  "summary": {
    "headline": "One punchy sentence about the most important thing (max 60 chars)",
    "description": "What does this data tell us? Explain like talking to a friend (2 short sentences)",
    "keyMetrics": [
      {
        "label": "Simple Label",
        "value": "123" or 123,
        "trend": "up|down|stable" (optional),
        "percentChange": 15.5 (optional)
      }
    ],
    "dataQuality": "excellent|good|fair|poor"
  },
  "keyInsights": [
    {
      "title": "Short headline like a news story (max 50 chars)",
      "description": "Plain English explanation - what does this MEAN for the business?",
      "type": "money|problem|trend",
      "severity": "good|neutral|warning",
      "metric": "The key number (like '$45,000' or '15%')",
      "recommendation": "One simple thing they could do about it"
    }
  ],
  "anomalies": [
    {
      "column": "Column name",
      "type": "outlier|missing|unusual_pattern|data_quality",
      "severity": "low|medium|high",
      "description": "Plain English - what's wrong and why it matters",
      "affectedRows": number
    }
  ],
  "chartSuggestions": [
    {
      "title": "Simple chart title",
      "description": "What you'll see in this chart",
      "chartType": "line|bar|pie|scatter|histogram",
      "xField": "column_name",
      "yField": "column_name",
      "rationale": "Why this chart is helpful",
      "priority": 1-5
    }
  ]
}

INSIGHT TYPES:
- "money" = Anything about revenue, costs, spending, profits, totals
- "problem" = Missing data, unusual values, things that need attention
- "trend" = Things going up/down, patterns, changes over time

EXAMPLE TRANSFORMATIONS:
BAD: "Strong positive correlation (r=0.82) between Marketing and Revenue"
GOOD: "Marketing is paying off - when you spend more, sales go up too"

BAD: "15 outliers detected exceeding 3σ threshold"
GOOD: "15 unusual values that look different from the rest - worth checking"

BAD: "Coefficient of variation indicates high volatility"
GOOD: "Your numbers jump around a lot month-to-month"

Provide exactly 3 insights. Make them feel like helpful advice, not a statistics report.`;

  const userMessage = `Here's a spreadsheet with ${rows.length.toLocaleString()} rows and ${headers.length} columns.

What's in it:
${JSON.stringify(dataSummary.columns.map(c => ({
  name: c.name,
  type: c.type,
  unique: c.uniqueValues,
  missing: c.nullCount,
  ...(c.type === 'number' ? { min: c.min, max: c.max, avg: c.mean } : {}),
  ...(c.topCategories ? { common: c.topCategories.slice(0, 3) } : {})
})), null, 2)}

${correlations.length > 0 ? `\nThings that move together:\n${correlations.map(c => `- ${c.col1} and ${c.col2}`).join('\n')}` : ''}

First few rows:
${JSON.stringify(dataSummary.sampleData.slice(0, 5), null, 2)}

Tell me the 3 most important things a business owner should know about this data. Focus on:
1. Anything about MONEY (totals, biggest/smallest, where money goes)
2. Any PROBLEMS (missing info, weird values, things that need attention)
3. Any TRENDS (things going up or down, patterns)

Keep it simple and helpful!`;

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4, // Lower temperature for more analytical consistency
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const result = JSON.parse(content) as AIInsights;

    // Ensure we have 3-4 insights
    if (result.keyInsights.length > 4) {
      result.keyInsights = result.keyInsights.slice(0, 4);
    }

    // Ensure chart suggestions are present
    if (!result.chartSuggestions || result.chartSuggestions.length === 0) {
      result.chartSuggestions = generateDefaultChartSuggestions(columnStats);
    }

    // Attach finance health report if available (this is what makes Lumina different!)
    if (financeHealthReport) {
      result.financeHealth = financeHealthReport;
    }

    return result;
  } catch (error) {
    console.error("Failed to generate AI insights:", error);
    // Return fallback insights based on column stats
    return generateFallbackInsights(columnStats, rows, datasetType);
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

  // Calculate basic statistics for the chart data
  const yValues = data.map((d) => Number(d[yKey])).filter((v) => !isNaN(v));
  const stats = {
    min: Math.min(...yValues),
    max: Math.max(...yValues),
    avg: yValues.reduce((a, b) => a + b, 0) / yValues.length,
    trend:
      yValues[yValues.length - 1] > yValues[0] ? "increasing" : "decreasing",
  };

  try {
    const response = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a data visualization expert. Explain charts with specific statistics and actionable insights. Focus on: (1) the main trend or pattern, (2) specific numbers/ranges, (3) what it means for decision-making. Be concise (2-3 sentences) and quantitative.",
        },
        {
          role: "user",
          content: `Explain this ${chartType} chart titled "${chartTitle}".
X-axis: ${xKey}
Y-axis: ${yKey}
Statistics: Min=${stats.min.toFixed(2)}, Max=${stats.max.toFixed(2)}, Avg=${stats.avg.toFixed(2)}, Trend=${stats.trend}
Data points: ${JSON.stringify(sampleData)}

Provide a specific, data-driven explanation with numbers.`,
        },
      ],
      temperature: 0.5,
      max_tokens: 200,
    });

    return (
      response.choices[0]?.message?.content ||
      `This ${chartType} chart shows ${yKey} across ${xKey}, ranging from ${stats.min.toFixed(2)} to ${stats.max.toFixed(2)} with an average of ${stats.avg.toFixed(2)}.`
    );
  } catch (error) {
    console.error("Failed to generate chart explanation:", error);
    return `This ${chartType} chart shows ${yKey} across ${xKey}, ranging from ${stats.min.toFixed(2)} to ${stats.max.toFixed(2)} with an average of ${stats.avg.toFixed(2)}.`;
  }
}

/**
 * Generate default chart suggestions based on column types
 */
function generateDefaultChartSuggestions(
  columnStats: EnhancedColumnStats[]
): ChartSuggestion[] {
  const suggestions: ChartSuggestion[] = [];
  const numericCols = columnStats.filter((c) => c.type === "number");
  const categoryCols = columnStats.filter(
    (c) => c.type === "string" && c.uniqueValues < 20
  );
  const dateCols = columnStats.filter((c) => c.inferredType === "date");

  // Trend over time (if date column exists)
  if (dateCols.length > 0 && numericCols.length > 0) {
    suggestions.push({
      title: `${numericCols[0].name} Over Time`,
      description: `Track changes in ${numericCols[0].name} across time periods`,
      chartType: "line",
      xField: dateCols[0].name,
      yField: numericCols[0].name,
      rationale:
        "Time series analysis reveals trends, seasonality, and temporal patterns",
      priority: 5,
    });
  }

  // Category comparison (if category and numeric columns exist)
  if (categoryCols.length > 0 && numericCols.length > 0) {
    suggestions.push({
      title: `${numericCols[0].name} by ${categoryCols[0].name}`,
      description: `Compare ${numericCols[0].name} across different ${categoryCols[0].name}`,
      chartType: "bar",
      xField: categoryCols[0].name,
      yField: numericCols[0].name,
      rationale: "Category comparison identifies top performers and outliers",
      priority: 4,
    });
  }

  // Distribution analysis
  if (numericCols.length > 0) {
    suggestions.push({
      title: `Distribution of ${numericCols[0].name}`,
      description: `Analyze the frequency distribution and identify outliers`,
      chartType: "histogram",
      xField: numericCols[0].name,
      rationale:
        "Distribution analysis reveals data skewness, outliers, and central tendencies",
      priority: 3,
    });
  }

  return suggestions;
}

/**
 * Fallback insights when AI is unavailable - uses plain English!
 */
function generateFallbackInsights(
  columnStats: EnhancedColumnStats[],
  rows: Record<string, unknown>[],
  _datasetType: string
): AIInsights {
  const rowCount = rows.length;
  const numericColumns = columnStats.filter((c) => c.type === "number");
  const textColumns = columnStats.filter((c) => c.type === "string");
  const highMissingCols = columnStats.filter(
    (c) => (c.nullCount / rowCount) * 100 > 10
  );

  // Calculate data quality score
  const avgCompleteness =
    columnStats.reduce((sum, col) => sum + col.quality.completeness, 0) /
    columnStats.length;
  const dataQuality: "excellent" | "good" | "fair" | "poor" =
    avgCompleteness > 0.95
      ? "excellent"
      : avgCompleteness > 0.85
        ? "good"
        : avgCompleteness > 0.7
          ? "fair"
          : "poor";

  const insights: KeyInsight[] = [];

  // Insight 1: Quick overview in plain English
  const qualityMsg = dataQuality === "excellent" || dataQuality === "good"
    ? "Your data looks clean and complete!"
    : "Some info is missing - might want to check that.";

  insights.push({
    title: `${rowCount.toLocaleString()} rows of data`,
    description: `You have ${numericColumns.length} number columns (good for totals and averages) and ${textColumns.length} text columns (good for grouping). ${qualityMsg}`,
    type: "trend",
    severity: "neutral",
    metric: `${rowCount.toLocaleString()} rows`,
    recommendation: "Start by looking at your totals and biggest values.",
  });

  // Insight 2: Money/Numbers insight
  if (numericColumns.length > 0) {
    const col = numericColumns[0];
    const total = rows.reduce((sum, row) => sum + (Number(row[col.name]) || 0), 0);
    const avg = col.mean || total / rowCount;
    const hasUnusualValues = col.outliers && col.outliers.count > 0;

    insights.push({
      title: hasUnusualValues
        ? `${col.outliers!.count} unusual values in ${col.name}`
        : `${col.name} ranges from ${col.min} to ${col.max}`,
      description: hasUnusualValues
        ? `Most ${col.name} values are around ${avg.toFixed(0)}, but ${col.outliers!.count} look really different. Might be worth double-checking those.`
        : `The average ${col.name} is ${avg.toFixed(0)}. Your smallest is ${col.min} and largest is ${col.max}.`,
      type: hasUnusualValues ? "problem" : "money",
      severity: hasUnusualValues ? "warning" : "neutral",
      metric: `Avg: ${avg.toFixed(0)}`,
      recommendation: hasUnusualValues
        ? "Take a look at those unusual numbers - they might be typos or really important."
        : "Check if these numbers match what you expected.",
    });
  }

  // Insight 3: Problems or good news
  const correlations = detectCorrelations(rows, columnStats);
  if (correlations.length > 0) {
    const corr = correlations[0];
    const relationship = corr.correlation > 0
      ? "go up together"
      : "move opposite - when one goes up, the other goes down";

    insights.push({
      title: `${corr.col1} and ${corr.col2} are connected`,
      description: `These two things ${relationship}. This is useful to know when you're planning.`,
      type: "trend",
      severity: "good",
      recommendation: "Use this connection to make predictions or find patterns.",
    });
  } else if (highMissingCols.length > 0) {
    const col = highMissingCols[0];
    const pct = ((col.nullCount / rowCount) * 100).toFixed(0);
    insights.push({
      title: `${col.name} is missing ${pct}% of info`,
      description: `${col.nullCount.toLocaleString()} rows don't have ${col.name} filled in. This might cause problems if you need that info.`,
      type: "problem",
      severity: Number(pct) > 30 ? "warning" : "neutral",
      metric: `${pct}% missing`,
      recommendation: "Try to fill in the missing info, or just skip that column for now.",
    });
  } else {
    insights.push({
      title: "Your data looks complete!",
      description: "Almost everything is filled in, which is great. You can trust the numbers you're seeing.",
      type: "trend",
      severity: "good",
      recommendation: "You're good to go - your data is in great shape.",
    });
  }

  // Anomalies in plain English
  const anomalies: Anomaly[] = [];

  highMissingCols.forEach((col) => {
    const pct = ((col.nullCount / rowCount) * 100).toFixed(0);
    anomalies.push({
      column: col.name,
      type: "missing" as const,
      severity: Number(pct) > 30 ? "high" : "medium",
      description: `${pct}% of ${col.name} is blank (${col.nullCount.toLocaleString()} rows)`,
      affectedRows: col.nullCount,
    });
  });

  // Outlier anomalies in plain English
  columnStats.forEach((col) => {
    if (col.outliers && col.outliers.count > 0) {
      anomalies.push({
        column: col.name,
        type: "outlier" as const,
        severity: col.outliers.count > rowCount * 0.05 ? "high" : "low",
        description: `${col.outliers.count} values look unusual - they're much bigger or smaller than the rest`,
        affectedRows: col.outliers.count,
        specificValues: col.outliers.values.slice(0, 5),
      });
    }
  });

  // Chart suggestions
  const chartSuggestions = generateDefaultChartSuggestions(columnStats);

  return {
    summary: {
      headline: `${rowCount.toLocaleString()} rows ready to explore`,
      description: `You have ${numericColumns.length} number columns and ${textColumns.length} categories. ${dataQuality === "excellent" || dataQuality === "good" ? "Your data looks clean!" : "Some info might be missing."}`,
      keyMetrics: [
        { label: "Total Rows", value: rowCount.toLocaleString() },
        { label: "Columns", value: columnStats.length },
        { label: "Numbers", value: numericColumns.length },
        { label: "Categories", value: textColumns.length },
      ],
      dataQuality,
    },
    keyInsights: insights,
    anomalies,
    chartSuggestions,
  };
}
