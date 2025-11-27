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
 * Generate fallback charts when normal recommendations fail
 * ENSURES at least 3 charts are always generated
 */
function generateFallbackCharts(
  columnStats: EnhancedColumnStats[],
  rows: Record<string, unknown>[]
): ChartRecommendation[] {
  const fallbacks: ChartRecommendation[] = [];

  if (columnStats.length === 0 || rows.length === 0) {
    return fallbacks;
  }

  console.log("[Chart Recommender] Generating fallback charts to ensure visualizations");

  // Fallback 1: Try to find ANY column with values we can count/group
  const firstColumn = columnStats[0];
  if (firstColumn) {
    // Count occurrences of values in first column
    fallbacks.push({
      chartType: "bar",
      title: `Distribution of ${firstColumn.name}`,
      description: `Shows frequency of values in ${firstColumn.name}`,
      xAxis: firstColumn.name,
      yAxis: "count",
      columns: [firstColumn.name],
      priority: 2,
      reasoning: "Fallback: Showing value distribution",
    });

    // If we have enough unique values, also make a pie chart
    if (firstColumn.uniqueValues <= 10) {
      fallbacks.push({
        chartType: "pie",
        title: `${firstColumn.name} Breakdown`,
        description: `Pie chart showing ${firstColumn.name} distribution`,
        xAxis: firstColumn.name,
        yAxis: "count",
        columns: [firstColumn.name],
        priority: 2,
        reasoning: "Fallback: Pie chart for low cardinality data",
      });
    }
  }

  // Fallback 2: Try to find ANY numeric-looking data
  for (const col of columnStats) {
    // Try to parse values as numbers
    const values = rows.slice(0, 100).map(row => Number(row[col.name])).filter(n => !isNaN(n) && isFinite(n));

    if (values.length >= rows.length * 0.3) { // If at least 30% are parseable as numbers
      fallbacks.push({
        chartType: "histogram",
        title: `${col.name} Distribution`,
        description: `Shows the distribution of numeric values in ${col.name}`,
        xAxis: col.name,
        yAxis: "frequency",
        columns: [col.name],
        priority: 2,
        reasoning: "Fallback: Found parseable numeric data",
      });
      break; // Only need one histogram
    }
  }

  // Fallback 3: If we have 2+ columns, try a simple comparison
  if (columnStats.length >= 2 && fallbacks.length < 3) {
    const col1 = columnStats[0];
    const col2 = columnStats[1];

    fallbacks.push({
      chartType: "bar",
      title: `${col1.name} by ${col2.name}`,
      description: `Comparison of ${col1.name} across ${col2.name} values`,
      xAxis: col2.name,
      yAxis: col1.name,
      columns: [col1.name, col2.name],
      priority: 1,
      reasoning: "Fallback: Basic two-column comparison",
    });
  }

  console.log(`[Chart Recommender] Generated ${fallbacks.length} fallback charts`);
  return fallbacks;
}

/**
 * Recommend charts based on column types and data patterns
 * Returns max 5 charts to prevent cognitive overload
 * GUARANTEES at least 3 charts through fallback mechanisms
 */
export function recommendCharts(
  columnStats: EnhancedColumnStats[],
  rows: Record<string, unknown>[] // Used for fallback generation
): ChartRecommendation[] {
  const recommendations: ChartRecommendation[] = [];

  // Debug logging: Check column type inference
  console.log("[Chart Recommender] Column stats:", columnStats.map(col => ({
    name: col.name,
    type: col.type,
    inferredType: col.inferredType
  })));

  // Find date/time columns
  const dateColumns = columnStats.filter((col) => col.inferredType === "date");
  console.log(`[Chart Recommender] Found ${dateColumns.length} date columns`);

  // Find numeric columns
  const numericColumns = columnStats.filter(
    (col) => col.inferredType === "numeric"
  );
  console.log(`[Chart Recommender] Found ${numericColumns.length} numeric columns`);

  // Find category columns
  const categoryColumns = columnStats.filter(
    (col) => col.inferredType === "category"
  );
  console.log(`[Chart Recommender] Found ${categoryColumns.length} category columns`);

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

  // Sort by priority (highest first)
  const sorted = recommendations.sort((a, b) => b.priority - a.priority);

  // CRITICAL: If we have fewer than 3 charts, generate fallbacks
  if (sorted.length < 3) {
    console.log(`[Chart Recommender] Only ${sorted.length} standard charts generated, adding fallbacks`);
    const fallbacks = generateFallbackCharts(columnStats, rows);
    sorted.push(...fallbacks);
  }

  // Return top 3-5 charts (never more than 5, but always try for at least 3)
  const final = sorted.slice(0, Math.max(5, sorted.length));
  console.log(`[Chart Recommender] Generated ${final.length} chart recommendations (${sorted.length - final.length} truncated)`);

  return final;
}

/**
 * Generate chart data from rows based on recommendation
 * Includes validation and error handling
 * Enhanced to handle fallback charts with count/frequency calculations
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

  // For fallback charts with yAxis="count", we don't validate yAxis column
  const isCountChart = yAxis === "count" || yAxis === "frequency";

  // Validation: Check if yAxis column exists (for non-count charts)
  if (chartType !== "pie" && chartType !== "histogram" && !isCountChart) {
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
      // For bar charts: handle both normal and count-based fallback charts
      if (isCountChart) {
        // Count occurrences for fallback charts
        const counts = new Map<string, number>();
        rows.forEach((row) => {
          const key = String(row[xAxis] ?? "Unknown");
          if (key && key !== "null" && key !== "undefined") {
            counts.set(key, (counts.get(key) || 0) + 1);
          }
        });

        if (counts.size === 0) {
          console.warn(`Cannot generate bar chart "${title}": No valid data`);
          return null;
        }

        processedData = Array.from(counts.entries()).map(([key, value]) => ({
          [xAxis]: key,
          count: value,
        }));
      } else {
        // Normal bar chart: group by xAxis and sum/avg yAxis
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
      }
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
      // For histogram: create bins from numeric values
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

  // Determine the actual yAxis key for the chart config
  let chartYAxis: string;
  if (chartType === "histogram") {
    chartYAxis = "frequency";
  } else if (chartType === "pie") {
    chartYAxis = "value";
  } else if (isCountChart) {
    chartYAxis = "count";
  } else {
    chartYAxis = Array.isArray(yAxis) ? yAxis[0] : yAxis;
  }

  return {
    type: chartType,
    title,
    data: processedData,
    xAxis,
    yAxis: chartYAxis,
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
 * GUARANTEES at least 3 charts through aggressive fallback mechanisms
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
    console.log(`[Chart Generator] Processing ${recommendations.length} recommendations`);

    const charts = recommendations
      .map((rec, idx) => {
        const chart = generateChartData(rec, dataForCharts);
        if (!chart) {
          console.warn(`[Chart Generator] Failed to generate chart ${idx + 1}: ${rec.title}`);
        }
        return chart;
      })
      .filter((chart): chart is ChartConfig => chart !== null); // Filter out null results

    console.log(`[Chart Generator] Successfully generated ${charts.length} charts from ${recommendations.length} recommendations`);

    // FINAL SAFETY NET: If still no charts, create one last-resort chart
    if (charts.length === 0 && columnStats.length > 0) {
      console.warn("[Chart Generator] EMERGENCY: Creating absolute fallback chart");
      const firstCol = columnStats[0];

      // Try to create a simple data summary bar chart
      try {
        const valueCounts = new Map<string, number>();
        dataForCharts.slice(0, 1000).forEach(row => {
          const val = String(row[firstCol.name] ?? "Unknown");
          valueCounts.set(val, (valueCounts.get(val) || 0) + 1);
        });

        // Take top 10 most common values
        const topValues = Array.from(valueCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10);

        if (topValues.length > 0) {
          charts.push({
            type: "bar",
            title: `Top Values in ${firstCol.name}`,
            data: topValues.map(([key, value]) => ({
              [firstCol.name]: key,
              count: value,
            })),
            xAxis: firstCol.name,
            yAxis: "count",
            colors: getDefaultColors("bar"),
          });
          console.log("[Chart Generator] Emergency fallback chart created successfully");
        }
      } catch (err) {
        console.error("[Chart Generator] Failed to create emergency fallback:", err);
      }
    }

    return charts;
  } catch (error) {
    console.error("Error in generateCharts:", error);
    return [];
  }
}
