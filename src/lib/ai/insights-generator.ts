import OpenAI from "openai";
import type { EnhancedColumnStats } from "@/lib/analyzers/column-profiler";
import type { ChartSuggestion } from "@/types";

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
  type: "trend" | "anomaly" | "correlation" | "risk" | "opportunity";
  impact: "high" | "medium" | "low";
  metric?: string;
  recommendation?: string;
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

  const systemPrompt = `You are a senior data analyst with expertise in statistical analysis, pattern recognition, and business intelligence. Your role is to analyze datasets like a professional analyst would - identifying trends, correlations, anomalies, and actionable insights.

ANALYSIS APPROACH:
- Look for statistical patterns: trends, seasonality, distributions
- Identify correlations between columns (provided in the data)
- Detect anomalies using statistical thresholds (e.g., 3 standard deviations from mean)
- Provide actionable recommendations, not just observations
- Quantify findings with specific numbers and percentages
- Think about business implications of the data

Return your response as valid JSON with this exact structure:
{
  "summary": {
    "headline": "Compelling one-liner about the key finding (max 80 chars)",
    "description": "2-3 sentences about what this data tells us and why it matters",
    "keyMetrics": [
      {
        "label": "Metric Name",
        "value": "123" or 123,
        "trend": "up|down|stable" (optional),
        "percentChange": 15.5 (optional)
      }
    ],
    "dataQuality": "excellent|good|fair|poor"
  },
  "keyInsights": [
    {
      "title": "Clear, specific insight title (max 60 chars)",
      "description": "Detailed explanation with specific numbers and context (2-3 sentences)",
      "type": "trend|anomaly|correlation|risk|opportunity",
      "impact": "high|medium|low",
      "metric": "Specific number or statistic",
      "recommendation": "Actionable next step based on this insight"
    }
  ],
  "anomalies": [
    {
      "column": "Column name",
      "type": "outlier|missing|unusual_pattern|data_quality",
      "severity": "low|medium|high",
      "description": "Specific description with thresholds (e.g., '15 values exceed 3σ from mean')",
      "affectedRows": number,
      "specificValues": ["example values"] (optional, for outliers)
    }
  ],
  "chartSuggestions": [
    {
      "title": "Chart title",
      "description": "What this chart will reveal",
      "chartType": "line|bar|pie|scatter|histogram",
      "xField": "column_name",
      "yField": "column_name" (optional for histograms/distributions),
      "rationale": "Why this visualization is valuable for analysis",
      "priority": 1-5 (5 being highest)
    }
  ]
}

GUIDELINES:
- Provide exactly 3-4 key insights (most impactful findings)
- Focus on actionable, business-relevant insights
- For trends: Calculate actual direction and magnitude (e.g., "15% increase")
- For anomalies: Reference statistical thresholds (e.g., "3 standard deviations from mean")
- For correlations: State the correlation coefficient (e.g., "r=0.85, strong positive correlation")
- Be specific with numbers, percentages, and ranges
- Provide at least 2-3 chart suggestions that would aid analysis
- Prioritize insights by business impact (high/medium/low)
- Keep language clear, professional, and action-oriented`;

  const userMessage = `Dataset Type: ${datasetType}
Total Rows: ${rows.length.toLocaleString()}
Total Columns: ${headers.length}

Column Statistics (with statistical context):
${JSON.stringify(dataSummary.columns, null, 2)}

Detected Correlations:
${correlations.length > 0 ? JSON.stringify(correlations, null, 2) : "No strong correlations detected (|r| > 0.5)"}

Statistical Thresholds:
${statisticalContext.length > 0 ? JSON.stringify(statisticalContext, null, 2) : "No numeric columns for threshold analysis"}

Sample Data (first 10 rows):
${JSON.stringify(dataSummary.sampleData, null, 2)}

Analyze this dataset as a professional data analyst would:
1. Provide a compelling summary with 3-5 key metrics
2. Identify 3-4 key insights with specific statistics and actionable recommendations
3. Detect anomalies with specific thresholds and affected values
4. Suggest 2-3 charts that would provide the most analytical value`;

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
 * Fallback insights when AI is unavailable
 */
function generateFallbackInsights(
  columnStats: EnhancedColumnStats[],
  rows: Record<string, unknown>[],
  datasetType: string
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

  // Insight 1: Data overview
  insights.push({
    title: `${rowCount.toLocaleString()} records across ${columnStats.length} dimensions`,
    description: `Your ${datasetType} dataset contains ${numericColumns.length} numeric fields for quantitative analysis and ${textColumns.length} categorical fields. ${dataQuality === "excellent" || dataQuality === "good" ? "Data quality is strong with minimal missing values." : "Some data quality issues detected that may affect analysis."}`,
    type: "trend",
    impact: "medium",
    metric: `${rowCount.toLocaleString()} rows`,
    recommendation:
      "Begin with exploratory data analysis to understand distributions and relationships.",
  });

  // Insight 2: Numeric analysis
  if (numericColumns.length > 0) {
    const col = numericColumns[0];
    const range = (col.max as number) - (col.min as number);
    const cv =
      col.standardDeviation && col.mean
        ? ((col.standardDeviation / col.mean) * 100).toFixed(1)
        : "N/A";

    insights.push({
      title: `${col.name}: Range of ${range.toFixed(2)} with ${cv}% variability`,
      description: `${col.name} spans from ${col.min} to ${col.max} with a mean of ${col.mean?.toFixed(2)}. ${col.outliers ? `Detected ${col.outliers.count} outliers using ${col.outliers.method} method.` : "Distribution appears normal without significant outliers."}`,
      type: col.outliers && col.outliers.count > 0 ? "anomaly" : "trend",
      impact:
        col.outliers && col.outliers.count > rowCount * 0.05
          ? "high"
          : "medium",
      metric: col.mean?.toFixed(2),
      recommendation: col.outliers
        ? "Investigate outliers to determine if they represent errors or legitimate extreme values."
        : "Consider time-based analysis to identify trends.",
    });
  }

  // Insight 3: Correlations or data quality
  const correlations = detectCorrelations(rows, columnStats);
  if (correlations.length > 0) {
    const corr = correlations[0];
    insights.push({
      title: `Strong ${corr.correlation > 0 ? "positive" : "negative"} correlation detected`,
      description: `${corr.col1} and ${corr.col2} show a ${Math.abs(corr.correlation) > 0.7 ? "strong" : "moderate"} correlation (r=${corr.correlation.toFixed(2)}). This suggests ${corr.correlation > 0 ? "they tend to increase together" : "an inverse relationship"}.`,
      type: "correlation",
      impact: "high",
      metric: `r=${corr.correlation.toFixed(2)}`,
      recommendation:
        "Explore this relationship further with scatter plots and consider it in predictive models.",
    });
  } else if (highMissingCols.length > 0) {
    const col = highMissingCols[0];
    const pct = ((col.nullCount / rowCount) * 100).toFixed(1);
    insights.push({
      title: `${col.name} missing ${pct}% of values`,
      description: `${col.nullCount.toLocaleString()} of ${rowCount.toLocaleString()} records lack ${col.name} data. This level of missingness may require imputation or could indicate data collection issues.`,
      type: "risk",
      impact: Number(pct) > 30 ? "high" : "medium",
      metric: `${pct}%`,
      recommendation:
        "Consider imputation strategies (mean/median for numeric, mode for categorical) or exclude this column if not critical.",
    });
  } else {
    insights.push({
      title: "High data completeness across all fields",
      description: `All columns maintain >90% completeness, indicating robust data collection processes. This provides a solid foundation for reliable analysis and modeling.`,
      type: "opportunity",
      impact: "medium",
      recommendation:
        "Proceed with confidence to advanced analytics including predictive modeling.",
    });
  }

  // Anomalies
  const anomalies: Anomaly[] = [];

  highMissingCols.forEach((col) => {
    anomalies.push({
      column: col.name,
      type: "missing" as const,
      severity: (col.nullCount / rowCount) * 100 > 30 ? "high" : "medium",
      description: `${((col.nullCount / rowCount) * 100).toFixed(1)}% missing values (${col.nullCount.toLocaleString()} rows affected)`,
      affectedRows: col.nullCount,
    });
  });

  // Add outlier anomalies
  columnStats.forEach((col) => {
    if (col.outliers && col.outliers.count > 0) {
      anomalies.push({
        column: col.name,
        type: "outlier" as const,
        severity: col.outliers.count > rowCount * 0.05 ? "high" : "low",
        description: `${col.outliers.count} outliers detected using ${col.outliers.method} method (>${((col.outliers.count / rowCount) * 100).toFixed(2)}% of data)`,
        affectedRows: col.outliers.count,
        specificValues: col.outliers.values.slice(0, 5),
      });
    }
  });

  // Generate chart suggestions
  const chartSuggestions = generateDefaultChartSuggestions(columnStats);

  return {
    summary: {
      headline: `${datasetType.charAt(0).toUpperCase() + datasetType.slice(1)}: ${rowCount.toLocaleString()} records ready for analysis`,
      description: `This dataset contains ${columnStats.length} variables including ${numericColumns.length} quantitative measures. ${dataQuality === "excellent" || dataQuality === "good" ? "Data quality is strong, enabling reliable analysis." : "Some data quality considerations exist."} ${correlations.length > 0 ? `Key relationships detected between ${correlations.length} variable pairs.` : ""}`,
      keyMetrics: [
        { label: "Total Records", value: rowCount.toLocaleString() },
        { label: "Variables", value: columnStats.length },
        { label: "Numeric Fields", value: numericColumns.length },
        { label: "Data Quality", value: dataQuality },
        {
          label: "Completeness",
          value: `${(avgCompleteness * 100).toFixed(1)}%`,
        },
      ],
      dataQuality,
    },
    keyInsights: insights,
    anomalies,
    chartSuggestions,
  };
}
