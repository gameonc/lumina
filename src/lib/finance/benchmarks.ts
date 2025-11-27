/**
 * Finance Benchmarks & Health Score
 *
 * Industry-standard benchmarks for evaluating financial health.
 * This is what differentiates Lumina from generic AI - contextual knowledge.
 */

// ============================================================================
// TYPES
// ============================================================================

export type HealthGrade = "A" | "B" | "C" | "D" | "F";

export interface BenchmarkThresholds {
  excellent: number; // Grade A
  good: number;      // Grade B
  fair: number;      // Grade C
  poor: number;      // Grade D
  // Below poor = Grade F
}

export interface FinanceMetricAnalysis {
  name: string;
  value: number;
  benchmark: string;
  status: "excellent" | "good" | "warning" | "critical";
  insight: string;
  recommendation?: string;
}

export interface FinanceHealthReport {
  overallGrade: HealthGrade;
  overallScore: number; // 0-100
  gradeDescription: string;
  metrics: FinanceMetricAnalysis[];
  redFlags: string[];
  positives: string[];
  actionItems: string[];
}

// ============================================================================
// INDUSTRY BENCHMARKS
// ============================================================================

/**
 * Standard financial benchmarks based on industry averages
 * Sources: Various industry reports, general small business guidelines
 */
export const FINANCE_BENCHMARKS = {
  // Expense ratio: Expenses / Revenue
  // Lower is better
  expenseRatio: {
    excellent: 0.50, // Under 50% = Excellent
    good: 0.60,      // 50-60% = Good
    fair: 0.75,      // 60-75% = Fair
    poor: 0.85,      // 75-85% = Poor
    // Over 85% = Critical
  },

  // Profit margin: (Revenue - Expenses) / Revenue
  // Higher is better
  profitMargin: {
    excellent: 0.20, // Over 20% = Excellent
    good: 0.15,      // 15-20% = Good
    fair: 0.08,      // 8-15% = Fair
    poor: 0.03,      // 3-8% = Poor
    // Under 3% = Critical
  },

  // Revenue growth (period over period)
  // Higher is better
  revenueGrowth: {
    excellent: 0.15, // Over 15% = Excellent
    good: 0.10,      // 10-15% = Good
    fair: 0.05,      // 5-10% = Fair
    poor: 0.00,      // 0-5% = Poor
    // Negative = Critical
  },

  // Expense growth (period over period)
  // Lower is better (inverted logic)
  expenseGrowth: {
    excellent: 0.02, // Under 2% = Excellent
    good: 0.05,      // 2-5% = Good
    fair: 0.10,      // 5-10% = Fair
    poor: 0.15,      // 10-15% = Poor
    // Over 15% = Critical
  },
};

// ============================================================================
// GRADE CALCULATION
// ============================================================================

/**
 * Calculate grade for a "higher is better" metric (like profit margin)
 */
function gradeHigherIsBetter(
  value: number,
  thresholds: BenchmarkThresholds
): { grade: HealthGrade; status: "excellent" | "good" | "warning" | "critical" } {
  if (value >= thresholds.excellent) return { grade: "A", status: "excellent" };
  if (value >= thresholds.good) return { grade: "B", status: "good" };
  if (value >= thresholds.fair) return { grade: "C", status: "warning" };
  if (value >= thresholds.poor) return { grade: "D", status: "warning" };
  return { grade: "F", status: "critical" };
}

/**
 * Calculate grade for a "lower is better" metric (like expense ratio)
 */
function gradeLowerIsBetter(
  value: number,
  thresholds: BenchmarkThresholds
): { grade: HealthGrade; status: "excellent" | "good" | "warning" | "critical" } {
  if (value <= thresholds.excellent) return { grade: "A", status: "excellent" };
  if (value <= thresholds.good) return { grade: "B", status: "good" };
  if (value <= thresholds.fair) return { grade: "C", status: "warning" };
  if (value <= thresholds.poor) return { grade: "D", status: "warning" };
  return { grade: "F", status: "critical" };
}

/**
 * Convert grade to numeric score (for averaging)
 */
function gradeToScore(grade: HealthGrade): number {
  const scores: Record<HealthGrade, number> = {
    A: 95,
    B: 85,
    C: 75,
    D: 65,
    F: 40,
  };
  return scores[grade];
}

/**
 * Convert numeric score to grade
 */
function scoreToGrade(score: number): HealthGrade {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

// ============================================================================
// INSIGHT GENERATORS
// ============================================================================

function getExpenseRatioInsight(ratio: number, status: string): string {
  const percentage = Math.round(ratio * 100);

  if (status === "excellent") {
    return `Your expenses are ${percentage}% of revenue - that's excellent cost control! Most businesses aim for under 60%.`;
  }
  if (status === "good") {
    return `Expenses at ${percentage}% of revenue is healthy. You're within the recommended range of 50-60%.`;
  }
  if (status === "warning") {
    return `Expenses at ${percentage}% of revenue is on the high side. Healthy businesses typically stay under 60%.`;
  }
  return `Warning: Expenses at ${percentage}% of revenue is concerning. This leaves very little room for profit.`;
}

function getProfitMarginInsight(margin: number, status: string): string {
  const percentage = Math.round(margin * 100);

  if (status === "excellent") {
    return `Profit margin of ${percentage}% is excellent! You're outperforming most businesses in this range.`;
  }
  if (status === "good") {
    return `Profit margin of ${percentage}% is solid. A healthy business typically targets 15-20%.`;
  }
  if (status === "warning") {
    return `Profit margin of ${percentage}% is below average. Consider ways to increase revenue or reduce costs.`;
  }
  return `Warning: Profit margin of ${percentage}% is very thin. This leaves little buffer for unexpected expenses.`;
}

function getRevenueGrowthInsight(growth: number, status: string): string {
  const percentage = Math.round(growth * 100);
  const direction = growth >= 0 ? "grew" : "declined";

  if (growth < 0) {
    return `Revenue ${direction} by ${Math.abs(percentage)}%. This is a red flag that needs immediate attention.`;
  }
  if (status === "excellent") {
    return `Revenue ${direction} ${percentage}% - impressive growth! Keep doing what's working.`;
  }
  if (status === "good") {
    return `Revenue ${direction} ${percentage}%. That's solid, sustainable growth.`;
  }
  if (status === "warning") {
    return `Revenue ${direction} only ${percentage}%. After inflation, real growth may be minimal.`;
  }
  return `Revenue is flat or barely growing. Consider new strategies to drive growth.`;
}

// ============================================================================
// MAIN ANALYSIS FUNCTION
// ============================================================================

export interface FinanceData {
  totalRevenue?: number;
  totalExpenses?: number;
  revenueGrowth?: number;   // Period over period as decimal (0.10 = 10%)
  expenseGrowth?: number;   // Period over period as decimal
  periodCount?: number;     // Number of time periods in data
}

/**
 * Generate a comprehensive finance health report
 */
export function analyzeFinanceHealth(data: FinanceData): FinanceHealthReport {
  const metrics: FinanceMetricAnalysis[] = [];
  const redFlags: string[] = [];
  const positives: string[] = [];
  const actionItems: string[] = [];
  const grades: HealthGrade[] = [];

  // 1. Analyze Expense Ratio
  if (data.totalRevenue && data.totalExpenses && data.totalRevenue > 0) {
    const expenseRatio = data.totalExpenses / data.totalRevenue;
    const { grade, status } = gradeLowerIsBetter(expenseRatio, FINANCE_BENCHMARKS.expenseRatio);
    grades.push(grade);

    metrics.push({
      name: "Expense Ratio",
      value: expenseRatio,
      benchmark: "Under 60% is healthy",
      status,
      insight: getExpenseRatioInsight(expenseRatio, status),
      recommendation: status === "critical" || status === "warning"
        ? "Review your largest expense categories for potential savings"
        : undefined,
    });

    if (status === "critical") {
      redFlags.push(`Expense ratio (${Math.round(expenseRatio * 100)}%) is dangerously high`);
      actionItems.push("Audit all expenses and identify cuts");
    } else if (status === "excellent") {
      positives.push("Excellent expense control");
    }
  }

  // 2. Analyze Profit Margin
  if (data.totalRevenue && data.totalExpenses !== undefined && data.totalRevenue > 0) {
    const profitMargin = (data.totalRevenue - data.totalExpenses) / data.totalRevenue;
    const { grade, status } = gradeHigherIsBetter(profitMargin, FINANCE_BENCHMARKS.profitMargin);
    grades.push(grade);

    metrics.push({
      name: "Profit Margin",
      value: profitMargin,
      benchmark: "15-20% is healthy",
      status,
      insight: getProfitMarginInsight(profitMargin, status),
      recommendation: status === "critical" || status === "warning"
        ? "Focus on either increasing prices or reducing costs"
        : undefined,
    });

    if (profitMargin < 0) {
      redFlags.push("Operating at a loss");
      actionItems.push("Identify path to profitability immediately");
    } else if (status === "excellent") {
      positives.push("Strong profit margins");
    }
  }

  // 3. Analyze Revenue Growth (if available)
  if (data.revenueGrowth !== undefined) {
    const { grade, status } = gradeHigherIsBetter(data.revenueGrowth, FINANCE_BENCHMARKS.revenueGrowth);
    grades.push(grade);

    metrics.push({
      name: "Revenue Growth",
      value: data.revenueGrowth,
      benchmark: "10%+ annual growth is good",
      status,
      insight: getRevenueGrowthInsight(data.revenueGrowth, status),
      recommendation: data.revenueGrowth < 0.05
        ? "Explore new revenue streams or marketing initiatives"
        : undefined,
    });

    if (data.revenueGrowth < 0) {
      redFlags.push(`Revenue declining (${Math.round(data.revenueGrowth * 100)}%)`);
      actionItems.push("Investigate cause of revenue decline");
    } else if (status === "excellent") {
      positives.push("Strong revenue growth");
    }
  }

  // Calculate overall score and grade
  const overallScore = grades.length > 0
    ? Math.round(grades.reduce((sum, g) => sum + gradeToScore(g), 0) / grades.length)
    : 70; // Default to C if no metrics

  const overallGrade = scoreToGrade(overallScore);

  // Generate grade description
  const gradeDescriptions: Record<HealthGrade, string> = {
    A: "Excellent financial health. Your business is performing above industry standards.",
    B: "Good financial health. Your business is on solid ground with room for improvement.",
    C: "Fair financial health. Some areas need attention to improve performance.",
    D: "Below average financial health. Significant improvements needed.",
    F: "Critical financial health. Immediate action required to address issues.",
  };

  return {
    overallGrade,
    overallScore,
    gradeDescription: gradeDescriptions[overallGrade],
    metrics,
    redFlags,
    positives,
    actionItems,
  };
}

// ============================================================================
// UTILITY: Detect anomalies/outliers in expenses
// ============================================================================

export interface ExpenseAnomaly {
  category: string;
  value: number;
  average: number;
  percentageAbove: number;
  insight: string;
}

/**
 * Detect expense anomalies (values significantly above average)
 */
export function detectExpenseAnomalies(
  expenses: Array<{ category: string; value: number }>
): ExpenseAnomaly[] {
  if (expenses.length < 3) return [];

  const values = expenses.map((e) => e.value);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length
  );

  // Anomaly = more than 2 standard deviations above mean
  const threshold = average + 2 * stdDev;

  return expenses
    .filter((e) => e.value > threshold)
    .map((e) => ({
      category: e.category,
      value: e.value,
      average: Math.round(average),
      percentageAbove: Math.round(((e.value - average) / average) * 100),
      insight: `${e.category} ($${e.value.toLocaleString()}) is ${Math.round(((e.value - average) / average) * 100)}% above your average expense of $${Math.round(average).toLocaleString()}. Is this correct?`,
    }));
}

// ============================================================================
// FORMAT HELPERS
// ============================================================================

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function getGradeColor(grade: HealthGrade): string {
  const colors: Record<HealthGrade, string> = {
    A: "#10b981", // emerald
    B: "#3b82f6", // blue
    C: "#f59e0b", // amber
    D: "#f97316", // orange
    F: "#ef4444", // red
  };
  return colors[grade];
}

export function getGradeEmoji(grade: HealthGrade): string {
  const emojis: Record<HealthGrade, string> = {
    A: "🌟",
    B: "👍",
    C: "📊",
    D: "⚠️",
    F: "🚨",
  };
  return emojis[grade];
}
