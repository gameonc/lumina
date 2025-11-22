/**
 * Dataset Health Score Calculator
 * 
 * Current Work:
 * - Worker: Auto
 * - Task: Calculate 0-100 health score based on data quality metrics
 * - Status: in_progress
 * - Last Updated: 2025-11-22
 */

import type { EnhancedColumnStats } from "./column-profiler";

export interface HealthScoreBreakdown {
  completeness: number; // 0-100
  uniqueness: number; // 0-100
  consistency: number; // 0-100
  headerQuality: number; // 0-100
  anomalyScore: number; // 0-100 (lower is better, inverted)
  overall: number; // 0-100
}

export interface HealthIssues {
  missingData: {
    severity: "low" | "medium" | "high";
    message: string;
    affectedColumns: string[];
  }[];
  anomalies: {
    severity: "low" | "medium" | "high";
    message: string;
    affectedColumns: string[];
  }[];
  badHeaders: {
    severity: "low" | "medium" | "high";
    message: string;
    examples: string[];
  }[];
  typeIssues: {
    severity: "low" | "medium" | "high";
    message: string;
    affectedColumns: string[];
  }[];
  duplication: {
    severity: "low" | "medium" | "high";
    message: string;
    duplicateRows?: number;
    duplicatePercentage?: number;
  } | null;
}

export interface HealthScoreResult {
  score: number; // 0-100
  breakdown: HealthScoreBreakdown;
  issues: HealthIssues;
  recommendations: string[];
}

/**
 * Calculate dataset health score (0-100)
 */
export function calculateHealthScore(
  columnStats: EnhancedColumnStats[],
  totalRows: number,
  headers: string[]
): HealthScoreResult {
  const breakdown: HealthScoreBreakdown = {
    completeness: calculateCompleteness(columnStats),
    uniqueness: calculateUniqueness(columnStats, totalRows),
    consistency: calculateConsistency(columnStats),
    headerQuality: calculateHeaderQuality(headers),
    anomalyScore: calculateAnomalyScore(columnStats),
    overall: 0,
  };

  // Calculate overall score (weighted average)
  breakdown.overall = Math.round(
    breakdown.completeness * 0.3 +
    breakdown.uniqueness * 0.2 +
    breakdown.consistency * 0.2 +
    breakdown.headerQuality * 0.15 +
    breakdown.anomalyScore * 0.15
  );

  // Identify issues
  const issues = identifyIssues(columnStats, totalRows, headers);

  // Generate recommendations
  const recommendations = generateRecommendations(breakdown, issues);

  return {
    score: breakdown.overall,
    breakdown,
    issues,
    recommendations,
  };
}

/**
 * Calculate completeness score (0-100)
 * Based on percentage of non-null values across all columns
 */
function calculateCompleteness(columnStats: EnhancedColumnStats[]): number {
  if (columnStats.length === 0) return 0;

  const totalCompleteness = columnStats.reduce((sum, col) => {
    return sum + col.quality.completeness;
  }, 0);

  return Math.round((totalCompleteness / columnStats.length) * 100);
}

/**
 * Calculate uniqueness score (0-100)
 * Based on how unique values are across columns
 */
function calculateUniqueness(
  columnStats: EnhancedColumnStats[],
  totalRows: number
): number {
  if (columnStats.length === 0 || totalRows === 0) return 0;

  const uniquenessScores = columnStats.map((col) => {
    // For ID columns, high uniqueness is good
    // For other columns, moderate uniqueness is better
    const uniquenessRatio = col.uniqueValues / totalRows;
    
    if (uniquenessRatio > 0.95) {
      // Very unique - might be an ID (good)
      return 100;
    } else if (uniquenessRatio > 0.5) {
      // Good uniqueness
      return 80;
    } else if (uniquenessRatio > 0.1) {
      // Moderate uniqueness
      return 60;
    } else {
      // Low uniqueness - might indicate duplication
      return Math.max(20, uniquenessRatio * 200);
    }
  });

  const avgUniqueness =
    uniquenessScores.reduce((a, b) => a + b, 0) / uniquenessScores.length;
  return Math.round(avgUniqueness);
}

/**
 * Calculate consistency score (0-100)
 * Based on type consistency across columns
 */
function calculateConsistency(columnStats: EnhancedColumnStats[]): number {
  if (columnStats.length === 0) return 0;

  const totalConsistency = columnStats.reduce((sum, col) => {
    return sum + col.quality.consistency;
  }, 0);

  return Math.round((totalConsistency / columnStats.length) * 100);
}

/**
 * Calculate header quality score (0-100)
 * Based on header naming conventions
 */
function calculateHeaderQuality(headers: string[]): number {
  if (headers.length === 0) return 0;

  let score = 100;
  const issues: string[] = [];

  headers.forEach((header) => {
    const headerLower = header.toLowerCase().trim();

    // Check for empty or very short headers
    if (header.length === 0) {
      score -= 20;
      issues.push("Empty header");
    } else if (header.length < 2) {
      score -= 10;
      issues.push("Very short header");
    }

    // Check for generic names
    const genericNames = ["column", "col", "field", "data", "value", "item"];
    if (genericNames.some((name) => headerLower.includes(name))) {
      score -= 5;
      issues.push("Generic header name");
    }

    // Check for special characters (some are okay, too many are bad)
    const specialCharCount = (header.match(/[^a-zA-Z0-9\s]/g) || []).length;
    if (specialCharCount > 3) {
      score -= 5;
      issues.push("Too many special characters");
    }

    // Check for spaces (snake_case or camelCase preferred)
    if (header.includes(" ") && !header.includes("_") && !header.match(/[A-Z]/)) {
      score -= 3;
    }
  });

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate anomaly score (0-100, inverted - lower anomalies = higher score)
 */
function calculateAnomalyScore(columnStats: EnhancedColumnStats[]): number {
  if (columnStats.length === 0) return 100;

  const anomalyScores = columnStats.map((col) => {
    if (!col.outliers || col.outliers.count === 0) {
      return 100; // No outliers = perfect score
    }

    // Calculate outlier percentage
    const outlierPercentage = col.outliers.count / (col.uniqueValues || 1);

    if (outlierPercentage < 0.01) {
      // Less than 1% outliers - excellent
      return 90;
    } else if (outlierPercentage < 0.05) {
      // Less than 5% outliers - good
      return 75;
    } else if (outlierPercentage < 0.1) {
      // Less than 10% outliers - acceptable
      return 60;
    } else {
      // More than 10% outliers - poor
      return Math.max(20, 100 - outlierPercentage * 500);
    }
  });

  const avgAnomalyScore =
    anomalyScores.reduce((a, b) => a + b, 0) / anomalyScores.length;
  return Math.round(avgAnomalyScore);
}

/**
 * Identify specific health issues
 */
function identifyIssues(
  columnStats: EnhancedColumnStats[],
  totalRows: number,
  headers: string[]
): HealthIssues {
  const issues: HealthIssues = {
    missingData: [],
    anomalies: [],
    badHeaders: [],
    typeIssues: [],
    duplication: null,
  };

  // Check for missing data
  const missingDataColumns = columnStats.filter(
    (col) => col.quality.completeness < 0.8
  );

  if (missingDataColumns.length > 0) {
    const severity =
      missingDataColumns.some((col) => col.quality.completeness < 0.5)
        ? "high"
        : missingDataColumns.some((col) => col.quality.completeness < 0.7)
        ? "medium"
        : "low";

    issues.missingData.push({
      severity,
      message: `${missingDataColumns.length} column(s) have significant missing data`,
      affectedColumns: missingDataColumns.map((col) => col.name),
    });
  }

  // Check for anomalies
  const anomalyColumns = columnStats.filter(
    (col) => col.outliers && col.outliers.count > 0
  );

  if (anomalyColumns.length > 0) {
    const highAnomalyColumns = anomalyColumns.filter((col) => {
      const outlierPercentage =
        (col.outliers?.count || 0) / (col.uniqueValues || 1);
      return outlierPercentage > 0.1;
    });

    const severity = highAnomalyColumns.length > 0 ? "high" : "medium";

    issues.anomalies.push({
      severity,
      message: `${anomalyColumns.length} column(s) contain outliers`,
      affectedColumns: anomalyColumns.map((col) => col.name),
    });
  }

  // Check for bad headers
  const badHeaders = headers.filter((header) => {
    const headerLower = header.toLowerCase().trim();
    return (
      header.length === 0 ||
      header.length < 2 ||
      ["column", "col", "field", "data"].some((name) =>
        headerLower.includes(name)
      )
    );
  });

  if (badHeaders.length > 0) {
    issues.badHeaders.push({
      severity: badHeaders.length > headers.length * 0.3 ? "high" : "medium",
      message: `${badHeaders.length} header(s) need better naming`,
      examples: badHeaders.slice(0, 5),
    });
  }

  // Check for type issues (mixed types)
  const typeIssueColumns = columnStats.filter(
    (col) => col.quality.consistency < 0.7
  );

  if (typeIssueColumns.length > 0) {
    issues.typeIssues.push({
      severity: typeIssueColumns.some((col) => col.quality.consistency < 0.5)
        ? "high"
        : "medium",
      message: `${typeIssueColumns.length} column(s) have inconsistent data types`,
      affectedColumns: typeIssueColumns.map((col) => col.name),
    });
  }

  // Check for duplication (simplified - would need full row comparison for accuracy)
  const lowUniquenessColumns = columnStats.filter(
    (col) => col.uniqueValues / totalRows < 0.1 && totalRows > 10
  );

  if (lowUniquenessColumns.length > 0) {
    const duplicatePercentage =
      (1 - lowUniquenessColumns[0].uniqueValues / totalRows) * 100;

    issues.duplication = {
      severity:
        duplicatePercentage > 50 ? "high" : duplicatePercentage > 20 ? "medium" : "low",
      message: `Potential duplicate rows detected (${duplicatePercentage.toFixed(1)}% estimated)`,
      duplicatePercentage: Math.round(duplicatePercentage),
    };
  }

  return issues;
}

/**
 * Generate recommendations based on health score and issues
 */
function generateRecommendations(
  breakdown: HealthScoreBreakdown,
  issues: HealthIssues
): string[] {
  const recommendations: string[] = [];

  if (breakdown.completeness < 80) {
    recommendations.push(
      "Consider filling missing values or removing columns with high null rates"
    );
  }

  if (breakdown.consistency < 80) {
    recommendations.push(
      "Review columns with mixed data types and standardize formats"
    );
  }

  if (breakdown.headerQuality < 80) {
    recommendations.push(
      "Improve column headers with descriptive, consistent naming"
    );
  }

  if (breakdown.anomalyScore < 70) {
    recommendations.push(
      "Investigate and handle outliers in numeric columns"
    );
  }

  if (issues.duplication && issues.duplication.severity !== "low") {
    recommendations.push("Remove duplicate rows to improve data quality");
  }

  if (breakdown.overall >= 90) {
    recommendations.push("Dataset quality is excellent! Ready for analysis.");
  } else if (breakdown.overall >= 70) {
    recommendations.push("Dataset quality is good with minor improvements needed.");
  } else {
    recommendations.push(
      "Dataset needs significant quality improvements before analysis."
    );
  }

  return recommendations;
}

