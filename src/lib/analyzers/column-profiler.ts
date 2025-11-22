/**
 * Enhanced Column Profiling Engine
 * 
 * Current Work:
 * - Worker: Auto
 * - Task: Building enhanced column profiling with outliers, better type inference, category detection
 * - Status: in_progress
 * - Last Updated: 2025-11-22
 */

import type { ColumnStats } from "@/types";

export interface EnhancedColumnStats extends ColumnStats {
  // Enhanced type detection
  inferredType: "numeric" | "date" | "category" | "text" | "boolean" | "mixed";
  
  // Outlier detection
  outliers?: {
    count: number;
    values: (number | string)[];
    method: "iqr" | "zscore" | "isolation";
  };
  
  // Category-specific stats
  topCategories?: Array<{
    value: string | number;
    count: number;
    percentage: number;
  }>;
  
  // Data quality metrics
  quality: {
    completeness: number; // 0-1, percentage of non-null values
    consistency: number; // 0-1, how consistent the data type is
    uniqueness: number; // 0-1, unique values / total values
  };
  
  // Date-specific stats (if type is date)
  dateRange?: {
    min: Date;
    max: Date;
    span: number; // days
  };
}

/**
 * Enhanced type inference with category detection
 */
export function inferColumnType(
  values: unknown[]
): "numeric" | "date" | "category" | "text" | "boolean" | "mixed" {
  const nonNullValues = values.filter(
    (v) => v !== null && v !== undefined && v !== ""
  );

  if (nonNullValues.length === 0) return "text";

  let numberCount = 0;
  let dateCount = 0;
  let booleanCount = 0;
  let stringCount = 0;
  const uniqueStrings = new Set<string>();

  for (const value of nonNullValues) {
    // Check for boolean
    if (
      typeof value === "boolean" ||
      value === "true" ||
      value === "false" ||
      value === "TRUE" ||
      value === "FALSE" ||
      value === "1" ||
      value === "0" ||
      value === "yes" ||
      value === "no"
    ) {
      booleanCount++;
      continue;
    }

    // Check for number
    const numValue = typeof value === "number" ? value : Number(value);
    if (!isNaN(numValue) && isFinite(numValue)) {
      numberCount++;
      continue;
    }

    // Enhanced date detection
    if (typeof value === "string") {
      const datePatterns = [
        /^\d{4}-\d{2}-\d{2}$/, // ISO date: 2024-01-15
        /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
        /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
        /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
        /^\d{1,2}\/\d{1,2}\/\d{4}$/, // M/D/YYYY
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, // ISO datetime
      ];
      
      if (datePatterns.some((p) => p.test(value))) {
        const parsed = new Date(value);
        if (!isNaN(parsed.getTime())) {
          dateCount++;
          continue;
        }
      }
      
      // Try parsing as date
      const parsed = Date.parse(value);
      if (!isNaN(parsed)) {
        dateCount++;
        continue;
      }
    }

    if (typeof value === "string") {
      uniqueStrings.add(value.toLowerCase().trim());
      stringCount++;
    } else {
      stringCount++;
    }
  }

  const total = nonNullValues.length;
  const threshold = 0.9; // 90% majority

  // Check for category (low cardinality string column)
  const uniqueRatio = uniqueStrings.size / total;
  const isCategory = stringCount / total >= threshold && uniqueRatio < 0.5 && total > 10;

  if (numberCount / total >= threshold) return "numeric";
  if (dateCount / total >= threshold) return "date";
  if (booleanCount / total >= threshold) return "boolean";
  if (isCategory) return "category";
  if (stringCount / total >= threshold) return "text";

  return "mixed";
}

/**
 * Detect outliers using IQR method
 */
export function detectOutliersIQR(values: number[]): number[] {
  if (values.length < 4) return [];

  const sorted = [...values].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return values.filter((v) => v < lowerBound || v > upperBound);
}

/**
 * Detect outliers using Z-score method
 */
export function detectOutliersZScore(values: number[]): number[] {
  if (values.length < 3) return [];

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance =
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    values.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return [];

  const threshold = 3; // 3 standard deviations
  return values.filter((v) => Math.abs((v - mean) / stdDev) > threshold);
}

/**
 * Calculate top categories for categorical data
 */
export function calculateTopCategories(
  values: unknown[],
  limit: number = 10
): Array<{ value: string | number; count: number; percentage: number }> {
  const counts = new Map<string | number, number>();
  const nonNullValues = values.filter(
    (v) => v !== null && v !== undefined && v !== ""
  );

  nonNullValues.forEach((v) => {
    const key: string | number = 
      typeof v === "string" 
        ? v.trim() 
        : typeof v === "number" 
        ? v 
        : String(v);
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const total = nonNullValues.length;
  const sorted = Array.from(counts.entries())
    .map(([value, count]) => ({
      value,
      count,
      percentage: (count / total) * 100,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);

  return sorted;
}

/**
 * Enhanced column profiling with outliers and better type inference
 */
export function profileColumn(
  columnName: string,
  values: unknown[]
): EnhancedColumnStats {
  const inferredType = inferColumnType(values);
  const nonNullValues = values.filter(
    (v) => v !== null && v !== undefined && v !== ""
  );
  const uniqueValues = new Set(nonNullValues.map(String)).size;
  const nullCount = values.length - nonNullValues.length;

  const stats: EnhancedColumnStats = {
    name: columnName,
    type: inferredType === "category" ? "string" : inferredType === "numeric" ? "number" : inferredType === "text" ? "string" : inferredType,
    inferredType,
    uniqueValues,
    nullCount,
    quality: {
      completeness: nonNullValues.length / values.length,
      consistency: 1, // Will be calculated below
      uniqueness: uniqueValues / nonNullValues.length,
    },
  };

  // Numeric statistics
  if (inferredType === "numeric") {
    const numbers = nonNullValues.map(Number).filter((n) => !isNaN(n) && isFinite(n));
    if (numbers.length > 0) {
      stats.min = Math.min(...numbers);
      stats.max = Math.max(...numbers);
      stats.mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;

      // Calculate median
      const sorted = [...numbers].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      stats.median =
        sorted.length % 2 !== 0
          ? sorted[mid]
          : (sorted[mid - 1] + sorted[mid]) / 2;

      // Calculate standard deviation
      const squaredDiffs = numbers.map((n) => Math.pow(n - stats.mean!, 2));
      stats.standardDeviation = Math.sqrt(
        squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length
      );

      // Detect outliers
      const outliersIQR = detectOutliersIQR(numbers);
      const outliersZScore = detectOutliersZScore(numbers);
      
      // Use IQR as primary, Z-score as fallback
      const outlierValues = outliersIQR.length > 0 ? outliersIQR : outliersZScore;
      
      if (outlierValues.length > 0) {
        stats.outliers = {
          count: outlierValues.length,
          values: outlierValues as (number | string)[],
          method: outliersIQR.length > 0 ? "iqr" : "zscore",
        };
      }

      // Calculate consistency (how many values are actually numeric)
      stats.quality.consistency = numbers.length / nonNullValues.length;
    }
  }

  // Date statistics
  if (inferredType === "date") {
    const dates = nonNullValues
      .map((v) => {
        if (v instanceof Date) return v;
        if (typeof v === "string") {
          const parsed = new Date(v);
          return isNaN(parsed.getTime()) ? null : parsed;
        }
        return null;
      })
      .filter((d): d is Date => d !== null);

    if (dates.length > 0) {
      const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime());
      stats.dateRange = {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        span: Math.ceil(
          (sorted[sorted.length - 1].getTime() - sorted[0].getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      };
      stats.min = sorted[0].toISOString();
      stats.max = sorted[sorted.length - 1].toISOString();
    }
  }

  // Category statistics
  if (inferredType === "category" || inferredType === "text") {
    const topCategories = calculateTopCategories(nonNullValues, 10);
    if (topCategories.length > 0) {
      stats.topCategories = topCategories;
      stats.mode = topCategories[0].value;
    }

    // Calculate consistency for text/category
    const typeConsistency = nonNullValues.filter(
      (v) => typeof v === "string"
    ).length / nonNullValues.length;
    stats.quality.consistency = typeConsistency;
  }

  // Boolean statistics
  if (inferredType === "boolean") {
    // Booleans are always consistent
    stats.quality.consistency = 1;
  }

  return stats;
}

/**
 * Profile all columns in a dataset
 */
export function profileAllColumns(
  headers: string[],
  rows: Record<string, unknown>[]
): EnhancedColumnStats[] {
  return headers.map((header) => {
    const values = rows.map((row) => row[header]);
    return profileColumn(header, values);
  });
}

