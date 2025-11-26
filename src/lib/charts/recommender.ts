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

export type ChartType =
  | "line"
  | "bar"
  | "pie"
  | "scatter"
  | "area"
  | "histogram";

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
  const dateColumns = columnStats.filter((col) => col.inferredType === "date");

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
          reasoning:
            "Time series data with numeric values - perfect for line chart",
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
            reasoning:
              "Categorical data with numeric values - ideal for bar chart",
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
  });

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
  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 5);
}

/**
 * Generate chart data from rows based on recommendation
 * Includes validation and error handling
 */
export function generateChartData(
  recommendation: ChartRecommendation,
  rows: Record<string, unknown>[]
): ChartConfig | null {
  const { chartType, xAxis, yAxis, title, columns } = recommendation;

  // Validation: Check if required columns exist in data
  if (!rows || rows.length === 0) {
    console.warn(`Cannot generate chart "${title}": No data rows provided`);
    return null;
  }

  // Validation: Check if xAxis column exists
  const sampleRow = rows[0];
  if (!sampleRow || !(xAxis in sampleRow)) {
    console.warn(
      `Cannot generate chart "${title}": Column "${xAxis}" not found in data`
    );
    return null;
  }

  // Validation: Check if yAxis column exists (for charts that need it)
  if (chartType !== "pie" && chartType !== "histogram") {
    const yAxisKey = Array.isArray(yAxis) ? yAxis[0] : yAxis;
    if (!(yAxisKey in sampleRow)) {
      console.warn(
        `Cannot generate chart "${title}": Column "${yAxisKey}" not found in data`
      );
      return null;
    }
  }

  // Process data based on chart type
  let processedData: Record<string, unknown>[] = [];

  try {
    if (
      chartType === "line" ||
      chartType === "scatter" ||
      chartType === "area"
    ) {
      // For line/scatter/area: use rows as-is, just ensure columns exist
      processedData = rows
        .map((row) => {
          const dataPoint: Record<string, unknown> = {};
          columns.forEach((col) => {
            dataPoint[col] = row[col] ?? null;
          });
          return dataPoint;
        })
        .filter((point) => {
          // Filter out rows with null/invalid data for required columns
          const xValue = point[xAxis];
          const yValue = point[Array.isArray(yAxis) ? yAxis[0] : yAxis];
          return xValue != null && yValue != null;
        });

      // Validation: Ensure we have data after filtering
      if (processedData.length === 0) {
        console.warn(
          `Cannot generate ${chartType} chart "${title}": No valid data points after filtering`
        );
        return null;
      }
    } else if (chartType === "bar") {
      // For bar: group by xAxis and sum/avg yAxis
      const grouped = new Map<string, number[]>();
      rows.forEach((row) => {
        const key = String(row[xAxis] ?? "Unknown");
        const yAxisKey = Array.isArray(yAxis) ? yAxis[0] : yAxis;
        const value = Number(row[yAxisKey] ?? 0);

        // Skip invalid values
        if (isNaN(value)) return;

        if (!grouped.has(key)) {
          grouped.set(key, []);
        }
        grouped.get(key)!.push(value);
      });

      if (grouped.size === 0) {
        console.warn(
          `Cannot generate bar chart "${title}": No valid data points`
        );
        return null;
      }

      processedData = Array.from(grouped.entries()).map(([key, values]) => ({
        [xAxis]: key,
        [yAxis as string]: values.reduce((a, b) => a + b, 0) / values.length, // Average
      }));
    } else if (chartType === "pie") {
      // For pie: count occurrences
      const counts = new Map<string, number>();
      rows.forEach((row) => {
        const key = String(row[xAxis] ?? "Unknown");
        if (key && key !== "null" && key !== "undefined") {
          counts.set(key, (counts.get(key) || 0) + 1);
        }
      });

      if (counts.size === 0) {
        console.warn(
          `Cannot generate pie chart "${title}": No valid categories found`
        );
        return null;
      }

      processedData = Array.from(counts.entries()).map(([key, value]) => ({
        [xAxis]: key,
        value,
      }));
    } else if (chartType === "histogram") {
      // For histogram: create bins
      const values = rows
        .map((row) => Number(row[xAxis] ?? 0))
        .filter((v) => !isNaN(v) && isFinite(v));

      if (values.length === 0) {
        console.warn(
          `Cannot generate histogram "${title}": No valid numeric values found`
        );
        return null;
      }

      const min = Math.min(...values);
      const max = Math.max(...values);

      // Handle edge case: all values are the same
      if (min === max) {
        processedData = [
          {
            [xAxis]: `${min}`,
            frequency: values.length,
          },
        ];
      } else {
        const binCount = Math.min(
          10,
          Math.max(3, Math.ceil(Math.sqrt(values.length)))
        );
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
    } else {
      console.warn(`Unsupported chart type: ${chartType}`);
      return null;
    }
  } catch (error) {
    console.error(`Error generating chart data for "${title}":`, error);
    return null;
  }

  // Final validation: Ensure we have data
  if (!processedData || processedData.length === 0) {
    console.warn(`Chart "${title}" generated with no data`);
    return null;
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
 * Includes validation and filters out failed chart generations
 * Optimized for large datasets with sampling
 */
export function generateCharts(
  columnStats: EnhancedColumnStats[],
  rows: Record<string, unknown>[]
): ChartConfig[] {
  // Validation: Check inputs
  if (!columnStats || columnStats.length === 0) {
    console.warn("Cannot generate charts: No column stats provided");
    return [];
  }

  if (!rows || rows.length === 0) {
    console.warn("Cannot generate charts: No data rows provided");
    return [];
  }

  // Performance optimization: Sample large datasets for chart generation
  const MAX_ROWS_FOR_CHARTS = 5000;
  let dataForCharts = rows;

  if (rows.length > MAX_ROWS_FOR_CHARTS) {
    // Sample data for chart generation (charts don't need all rows)
    const sampleSize = MAX_ROWS_FOR_CHARTS;
    const step = Math.floor(rows.length / sampleSize);
    dataForCharts = [];

    for (let i = 0; i < rows.length; i += step) {
      if (dataForCharts.length >= sampleSize) break;
      dataForCharts.push(rows[i]);
    }

    // Always include last row
    if (dataForCharts.length < rows.length) {
      dataForCharts.push(rows[rows.length - 1]);
    }

    console.log(
      `Sampling ${dataForCharts.length} rows from ${rows.length} for chart generation`
    );
  }

  try {
    const recommendations = recommendCharts(columnStats, dataForCharts);
    const charts = recommendations
      .map((rec) => generateChartData(rec, dataForCharts))
      .filter((chart): chart is ChartConfig => chart !== null); // Filter out null results

    return charts;
  } catch (error) {
    console.error("Error in generateCharts:", error);
    return [];
  }
}
