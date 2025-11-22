/**
 * Chart Recommendation Engine
 * 
 * Current Work:
 * - Worker: Auto
 * - Task: Rules-based chart recommendation and auto-generation
 * - Status: in_progress
 * - Last Updated: 2025-11-22
 */

import type { EnhancedColumnStats } from "@/lib/analyzers/column-profiler";
import type { ChartConfig } from "@/types";

export type ChartType = "line" | "bar" | "pie" | "scatter" | "area" | "histogram";

export interface ChartRecommendation {
  chartType: ChartType;
  title: string;
  description: string;
  xAxis: string;
  yAxis: string | string[];
  columns: string[];
  priority: number; // 1-5, higher is better
  reasoning: string;
}

/**
 * Recommend charts based on column types and data patterns
 * Returns max 5 charts to prevent cognitive overload
 */
export function recommendCharts(
  columnStats: EnhancedColumnStats[],
  _rows: Record<string, unknown>[] // Reserved for future data pattern analysis
): ChartRecommendation[] {
  const recommendations: ChartRecommendation[] = [];

  // Find date/time columns
  const dateColumns = columnStats.filter(
    (col) => col.inferredType === "date"
  );

  // Find numeric columns
  const numericColumns = columnStats.filter(
    (col) => col.inferredType === "numeric"
  );

  // Find category columns
  const categoryColumns = columnStats.filter(
    (col) => col.inferredType === "category"
  );

  // Rule 1: Time + Numeric → Line Chart
  if (dateColumns.length > 0 && numericColumns.length > 0) {
    dateColumns.forEach((dateCol) => {
      numericColumns.forEach((numCol) => {
        recommendations.push({
          chartType: "line",
          title: `${numCol.name} Over Time`,
          description: `Shows ${numCol.name} trends over ${dateCol.name}`,
          xAxis: dateCol.name,
          yAxis: numCol.name,
          columns: [dateCol.name, numCol.name],
          priority: 5,
          reasoning: "Time series data with numeric values - perfect for line chart",
        });
      });
    });
  }

  // Rule 2: Category + Numeric → Bar Chart
  if (categoryColumns.length > 0 && numericColumns.length > 0) {
    categoryColumns.forEach((catCol) => {
      numericColumns.forEach((numCol) => {
        // Only recommend if category has reasonable cardinality
        if (catCol.uniqueValues <= 20) {
          recommendations.push({
            chartType: "bar",
            title: `${numCol.name} by ${catCol.name}`,
            description: `Compares ${numCol.name} across ${catCol.name} categories`,
            xAxis: catCol.name,
            yAxis: numCol.name,
            columns: [catCol.name, numCol.name],
            priority: 5,
            reasoning: "Categorical data with numeric values - ideal for bar chart",
          });
        }
      });
    });
  }

  // Rule 3: Two Numerics → Scatter Plot
  if (numericColumns.length >= 2) {
    for (let i = 0; i < numericColumns.length; i++) {
      for (let j = i + 1; j < numericColumns.length; j++) {
        recommendations.push({
          chartType: "scatter",
          title: `${numericColumns[i].name} vs ${numericColumns[j].name}`,
          description: `Relationship between ${numericColumns[i].name} and ${numericColumns[j].name}`,
          xAxis: numericColumns[i].name,
          yAxis: numericColumns[j].name,
          columns: [numericColumns[i].name, numericColumns[j].name],
          priority: 4,
          reasoning: "Two numeric variables - good for correlation analysis",
        });
      }
    }
  }

  // Rule 4: Category Distribution → Pie Chart (if low cardinality)
  categoryColumns.forEach((catCol) => {
    if (catCol.uniqueValues <= 10 && catCol.topCategories) {
      recommendations.push({
        chartType: "pie",
        title: `Distribution of ${catCol.name}`,
        description: `Shows the distribution across ${catCol.name} categories`,
        xAxis: catCol.name,
        yAxis: "count",
        columns: [catCol.name],
        priority: 3,
        reasoning: "Low cardinality category - suitable for pie chart",
      });
    }
  })

  // Rule 5: Single Numeric → Histogram
  numericColumns.forEach((numCol) => {
    recommendations.push({
      chartType: "histogram",
      title: `Distribution of ${numCol.name}`,
      description: `Shows the frequency distribution of ${numCol.name}`,
      xAxis: numCol.name,
      yAxis: "frequency",
      columns: [numCol.name],
      priority: 3,
      reasoning: "Single numeric column - histogram shows distribution",
    });
  });

  // Sort by priority (highest first) and return top 5
  return recommendations
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5);
}

/**
 * Generate chart data from rows based on recommendation
 */
export function generateChartData(
  recommendation: ChartRecommendation,
  rows: Record<string, unknown>[]
): ChartConfig {
  const { chartType, xAxis, yAxis, title, columns } = recommendation;

  // Process data based on chart type
  let processedData: Record<string, unknown>[] = [];

  if (chartType === "line" || chartType === "scatter" || chartType === "area") {
    // For line/scatter/area: use rows as-is, just ensure columns exist
    processedData = rows.map((row) => {
      const dataPoint: Record<string, unknown> = {};
      columns.forEach((col) => {
        dataPoint[col] = row[col] ?? null;
      });
      return dataPoint;
    });
  } else if (chartType === "bar") {
    // For bar: group by xAxis and sum/avg yAxis
    const grouped = new Map<string, number[]>();
    rows.forEach((row) => {
      const key = String(row[xAxis] ?? "Unknown");
      const value = Number(row[yAxis as string] ?? 0);
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(value);
    });

    processedData = Array.from(grouped.entries()).map(([key, values]) => ({
      [xAxis]: key,
      [yAxis as string]: values.reduce((a, b) => a + b, 0) / values.length, // Average
    }));
  } else if (chartType === "pie") {
    // For pie: count occurrences
    const counts = new Map<string, number>();
    rows.forEach((row) => {
      const key = String(row[xAxis] ?? "Unknown");
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    processedData = Array.from(counts.entries()).map(([key, value]) => ({
      [xAxis]: key,
      value,
    }));
  } else if (chartType === "histogram") {
    // For histogram: create bins
    const values = rows
      .map((row) => Number(row[xAxis] ?? 0))
      .filter((v) => !isNaN(v));
    
    if (values.length > 0) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const binCount = Math.min(10, Math.ceil(Math.sqrt(values.length)));
      const binSize = (max - min) / binCount;

      const bins = new Map<string, number>();
      values.forEach((value) => {
        const binIndex = Math.min(
          Math.floor((value - min) / binSize),
          binCount - 1
        );
        const binLabel = `${(min + binIndex * binSize).toFixed(1)}-${(min + (binIndex + 1) * binSize).toFixed(1)}`;
        bins.set(binLabel, (bins.get(binLabel) || 0) + 1);
      });

      processedData = Array.from(bins.entries()).map(([key, value]) => ({
        [xAxis]: key,
        frequency: value,
      }));
    }
  }

  return {
    type: chartType,
    title,
    data: processedData,
    xAxis,
    yAxis: Array.isArray(yAxis) ? yAxis[0] : yAxis,
    colors: getDefaultColors(chartType),
  };
}

/**
 * Get default colors for chart type
 */
function getDefaultColors(chartType: ChartType): string[] {
  const colorPalettes: Record<ChartType, string[]> = {
    line: ["#3b82f6", "#8b5cf6", "#ec4899"],
    bar: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
    pie: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"],
    scatter: ["#3b82f6"],
    area: ["#3b82f6", "#8b5cf6"],
    histogram: ["#3b82f6"],
  };

  return colorPalettes[chartType] || ["#3b82f6"];
}

/**
 * Generate multiple charts from column stats
 */
export function generateCharts(
  columnStats: EnhancedColumnStats[],
  rows: Record<string, unknown>[]
): ChartConfig[] {
  const recommendations = recommendCharts(columnStats, rows);
  return recommendations.map((rec) => generateChartData(rec, rows));
}

