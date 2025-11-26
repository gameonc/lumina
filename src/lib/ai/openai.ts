import OpenAI from "openai";

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

export interface AnalysisPrompt {
  type: "summary" | "correlation" | "trend" | "anomaly" | "custom";
  data: Record<string, unknown>[];
  columns: string[];
  userPrompt?: string;
}

export interface AnalysisResult {
  summary: string;
  insights: string[];
  recommendations: string[];
  visualizations: {
    type: string;
    title: string;
    description: string;
    dataKey?: string;
  }[];
}

/**
 * Generate data analysis using OpenAI
 */
export async function analyzeData(
  params: AnalysisPrompt
): Promise<AnalysisResult> {
  const { type, data, columns, userPrompt } = params;

  // Prepare data sample for analysis (limit to prevent token overflow)
  const sampleSize = Math.min(data.length, 100);
  const dataSample = data.slice(0, sampleSize);

  const systemPrompt = `You are a data analyst expert. Analyze the provided dataset and return insights in JSON format.
Your response must be valid JSON with this structure:
{
  "summary": "A brief summary of the data",
  "insights": ["insight 1", "insight 2", ...],
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "visualizations": [
    {
      "type": "bar|line|pie|scatter",
      "title": "Chart title",
      "description": "What this chart shows",
      "dataKey": "column_name"
    }
  ]
}`;

  const analysisPrompts: Record<string, string> = {
    summary: `Provide a comprehensive summary of this dataset. Include key statistics, data quality observations, and notable patterns.`,
    correlation: `Analyze correlations between columns in this dataset. Identify strong positive and negative correlations, and explain their potential significance.`,
    trend: `Identify trends in this time-series or sequential data. Look for patterns, seasonality, and forecast potential future values.`,
    anomaly: `Detect anomalies and outliers in this dataset. Identify unusual values, patterns that deviate from the norm, and potential data quality issues.`,
    custom:
      userPrompt || `Analyze this dataset and provide meaningful insights.`,
  };

  const userMessage = `Dataset Columns: ${columns.join(", ")}
Total Rows: ${data.length}
Sample Data (first ${sampleSize} rows):
${JSON.stringify(dataSample, null, 2)}

Analysis Type: ${type}
Task: ${analysisPrompts[type]}`;

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content) as AnalysisResult;
}

/**
 * Generate natural language explanation for chart data
 */
export async function explainVisualization(
  chartType: string,
  data: Record<string, unknown>[],
  title: string
): Promise<string> {
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a data visualization expert. Explain chart data in clear, concise language that anyone can understand.",
      },
      {
        role: "user",
        content: `Explain this ${chartType} chart titled "${title}" based on the following data:
${JSON.stringify(data.slice(0, 20), null, 2)}

Provide a 2-3 sentence explanation of what the chart shows and any notable patterns.`,
      },
    ],
    temperature: 0.5,
    max_tokens: 300,
  });

  return (
    response.choices[0]?.message?.content || "Unable to generate explanation."
  );
}

/**
 * Generate SQL query from natural language
 */
export async function generateQuery(
  naturalLanguage: string,
  columns: string[],
  tableName: string = "data"
): Promise<string> {
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a SQL expert. Convert natural language queries to SQL.
Return only the SQL query without any explanation or markdown formatting.
The table name is "${tableName}" and available columns are: ${columns.join(", ")}`,
      },
      {
        role: "user",
        content: naturalLanguage,
      },
    ],
    temperature: 0.3,
    max_tokens: 500,
  });

  return response.choices[0]?.message?.content || "";
}

/**
 * Generate report section from data
 */
export async function generateReportSection(
  data: Record<string, unknown>[],
  sectionType:
    | "executive_summary"
    | "key_findings"
    | "recommendations"
    | "conclusion"
): Promise<string> {
  const prompts: Record<string, string> = {
    executive_summary:
      "Write an executive summary for a data analysis report. Be concise and highlight the most important findings.",
    key_findings:
      "List and explain the key findings from this data analysis. Use bullet points for clarity.",
    recommendations:
      "Based on the data analysis, provide actionable recommendations for decision makers.",
    conclusion:
      "Write a conclusion for this data analysis report. Summarize the main points and suggest next steps.",
  };

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a business analyst writing a professional report. Write in a clear, professional tone.",
      },
      {
        role: "user",
        content: `${prompts[sectionType]}

Data Summary:
${JSON.stringify(data.slice(0, 50), null, 2)}`,
      },
    ],
    temperature: 0.6,
    max_tokens: 800,
  });

  return response.choices[0]?.message?.content || "";
}

/**
 * Dataset type classification result
 */
export interface DatasetClassification {
  type:
    | "finance"
    | "sales"
    | "inventory"
    | "marketing"
    | "operations"
    | "general";
  confidence: number;
  reasoning: string;
  indicators: string[];
}

/**
 * Classify dataset type using AI
 */
export async function classifyDatasetType(
  headers: string[],
  sampleRows: Record<string, unknown>[]
): Promise<DatasetClassification> {
  const systemPrompt = `You are a data classification expert. Analyze the dataset structure and classify it into one of these types:
- finance: Financial data (revenue, expenses, transactions, accounts)
- sales: Sales data (customers, deals, opportunities, leads)
- inventory: Inventory/stock data (products, quantities, warehouses)
- marketing: Marketing data (campaigns, ads, conversions, channels)
- operations: Operations data (tasks, projects, employees, KPIs)
- general: General numeric/statistical data that doesn't fit other categories

Return your response as valid JSON with this structure:
{
  "type": "finance|sales|inventory|marketing|operations|general",
  "confidence": 0.0-1.0,
  "reasoning": "Brief explanation of why this classification",
  "indicators": ["column1", "column2", ...]
}`;

  const userMessage = `Column Names: ${headers.join(", ")}

Sample Data (first ${Math.min(sampleRows.length, 10)} rows):
${JSON.stringify(sampleRows.slice(0, 10), null, 2)}

Classify this dataset type based on the column names and data patterns.`;

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3, // Lower temperature for more consistent classification
    max_tokens: 500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return JSON.parse(content) as DatasetClassification;
}

export { getOpenAI };
