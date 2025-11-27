/**
 * Business Metrics Extractor
 * 
 * Extracts business-focused KPIs based on dataset type
 * Replaces technical jargon with actionable business metrics
 */

import type { EnhancedColumnStats } from "./column-profiler";
import {
  analyzeFinanceHealth,
  FINANCE_BENCHMARKS,
  formatCurrency,
  type FinanceHealthReport,
} from "@/lib/finance/benchmarks";

export interface BusinessMetric {
  label: string;
  value: string | number;
  format?: "currency" | "percentage" | "number" | "text";
  trend?: "up" | "down" | "stable";
  icon?: string;
  description?: string;
}

export interface BusinessMetrics {
  datasetType: string;
  metrics: BusinessMetric[];
  topItems?: Array<{ name: string; value: number | string }>;
  summary?: string;
}

/**
 * Extract business metrics based on dataset type
 */
export function extractBusinessMetrics(
  datasetType: string,
  headers: string[],
  rows: Record<string, unknown>[],
  columnStats: EnhancedColumnStats[]
): BusinessMetrics {
  // Find numeric columns for calculations
  const numericColumns = columnStats.filter(
    (col) => col.type === "number" || col.inferredType === "numeric"
  );

  // Find date columns for time-based analysis
  const dateColumns = columnStats.filter(
    (col) => col.inferredType === "date"
  );

  // Find category columns for grouping
  const categoryColumns = columnStats.filter(
    (col) => col.inferredType === "category"
  );

  switch (datasetType.toLowerCase()) {
    case "sales":
      return extractSalesMetrics(headers, rows, numericColumns, categoryColumns, dateColumns);
    
    case "finance":
      return extractFinanceMetrics(headers, rows, numericColumns, categoryColumns);
    
    case "inventory":
      return extractInventoryMetrics(headers, rows, numericColumns, categoryColumns);
    
    case "marketing":
      return extractMarketingMetrics(headers, rows, numericColumns, categoryColumns);
    
    case "operations":
      return extractOperationsMetrics(headers, rows, numericColumns, categoryColumns);
    
    default:
      return extractGeneralMetrics(headers, rows, numericColumns, categoryColumns);
  }
}

/**
 * Extract sales-specific metrics
 */
function extractSalesMetrics(
  headers: string[],
  rows: Record<string, unknown>[],
  _numericColumns: EnhancedColumnStats[],
  _categoryColumns: EnhancedColumnStats[],
  dateColumns: EnhancedColumnStats[]
): BusinessMetrics {
  const metrics: BusinessMetric[] = [];
  const topItems: Array<{ name: string; value: number | string }> = [];

  // Find revenue/sales columns
  const revenueCol = findColumnByKeywords(headers, ["revenue", "sales", "amount", "total", "price"]);
  const productCol = findColumnByKeywords(headers, ["product", "item", "sku", "name"]);

  if (revenueCol && rows.length > 0) {
    const totalRevenue = rows.reduce((sum, row) => {
      const val = Number(row[revenueCol]) || 0;
      return sum + val;
    }, 0);

    metrics.push({
      label: "Total Revenue",
      value: totalRevenue,
      format: "currency",
      icon: "💰",
      description: `Total sales across ${rows.length} transactions`,
    });

    // Average order value
    if (rows.length > 0) {
      const avgOrder = totalRevenue / rows.length;
      metrics.push({
        label: "Average Order Value",
        value: avgOrder,
        format: "currency",
        icon: "📊",
      });
    }

    // Top products
    if (productCol && revenueCol) {
      const productSales = new Map<string, number>();
      rows.forEach((row) => {
        const product = String(row[productCol] || "Unknown");
        const revenue = Number(row[revenueCol]) || 0;
        productSales.set(product, (productSales.get(product) || 0) + revenue);
      });

      const sorted = Array.from(productSales.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      sorted.forEach(([name, value]) => {
        topItems.push({ name, value });
      });
    }
  }

  // Growth calculation if date column exists
  if (dateColumns.length > 0 && revenueCol) {
    const sortedRows = [...rows].sort((a, b) => {
      const dateA = new Date(String(a[dateColumns[0].name] || 0)).getTime();
      const dateB = new Date(String(b[dateColumns[0].name] || 0)).getTime();
      return dateA - dateB;
    });

    if (sortedRows.length >= 2) {
      const firstHalf = sortedRows.slice(0, Math.floor(sortedRows.length / 2));
      const secondHalf = sortedRows.slice(Math.floor(sortedRows.length / 2));

      const firstHalfRevenue = firstHalf.reduce((sum, row) => sum + (Number(row[revenueCol]) || 0), 0);
      const secondHalfRevenue = secondHalf.reduce((sum, row) => sum + (Number(row[revenueCol]) || 0), 0);

      if (firstHalfRevenue > 0) {
        const growth = ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100;
        metrics.push({
          label: "Growth Rate",
          value: growth,
          format: "percentage",
          trend: growth > 0 ? "up" : growth < 0 ? "down" : "stable",
          icon: growth > 0 ? "📈" : "📉",
        });
      }
    }
  }

  return {
    datasetType: "sales",
    metrics,
    topItems: topItems.length > 0 ? topItems : undefined,
    summary: `Analyzed ${rows.length} sales transactions`,
  };
}

/**
 * Extract finance-specific metrics with BENCHMARK comparisons
 * This is what makes Lumina different from ChatGPT!
 */
function extractFinanceMetrics(
  headers: string[],
  rows: Record<string, unknown>[],
  _numericColumns: EnhancedColumnStats[],
  _categoryColumns: EnhancedColumnStats[]
): BusinessMetrics {
  const metrics: BusinessMetric[] = [];

  const expenseCol = findColumnByKeywords(headers, ["expense", "cost", "spend", "amount"]);
  const incomeCol = findColumnByKeywords(headers, ["income", "revenue", "earnings", "profit", "sales"]);

  let totalExpenses = 0;
  let totalIncome = 0;

  // Calculate totals
  if (expenseCol && rows.length > 0) {
    totalExpenses = rows.reduce((sum, row) => sum + (Number(row[expenseCol]) || 0), 0);
  }

  if (incomeCol && rows.length > 0) {
    totalIncome = rows.reduce((sum, row) => sum + (Number(row[incomeCol]) || 0), 0);
  }

  // Generate health report if we have financial data
  let healthReport: FinanceHealthReport | undefined;
  if (totalIncome > 0 || totalExpenses > 0) {
    healthReport = analyzeFinanceHealth({
      totalRevenue: totalIncome > 0 ? totalIncome : undefined,
      totalExpenses: totalExpenses > 0 ? totalExpenses : undefined,
      periodCount: rows.length,
    });

    // Add Health Grade as the first metric (key differentiator!)
    metrics.push({
      label: "Financial Health",
      value: healthReport.overallGrade,
      format: "text",
      icon: healthReport.overallGrade === "A" || healthReport.overallGrade === "B" ? "🌟" :
            healthReport.overallGrade === "C" ? "📊" : "⚠️",
      description: healthReport.gradeDescription,
    });
  }

  // Add expense metric with benchmark comparison
  if (totalExpenses > 0) {
    const expenseRatio = totalIncome > 0 ? totalExpenses / totalIncome : 0;
    const isHealthy = expenseRatio <= FINANCE_BENCHMARKS.expenseRatio.good;

    metrics.push({
      label: "Total Expenses",
      value: totalExpenses,
      format: "currency",
      icon: "💸",
      description: totalIncome > 0
        ? `${Math.round(expenseRatio * 100)}% of revenue${isHealthy ? " - healthy!" : ". Target: under 60%"}`
        : undefined,
    });
  }

  // Add income metric
  if (totalIncome > 0) {
    metrics.push({
      label: "Total Revenue",
      value: totalIncome,
      format: "currency",
      icon: "💵",
    });

    // Add profit margin with benchmark comparison
    if (totalExpenses > 0) {
      const profitMargin = (totalIncome - totalExpenses) / totalIncome;
      const isHealthy = profitMargin >= FINANCE_BENCHMARKS.profitMargin.good;
      const profitMarginPct = Math.round(profitMargin * 100);

      metrics.push({
        label: "Profit Margin",
        value: profitMarginPct,
        format: "percentage",
        icon: isHealthy ? "📈" : profitMargin > 0 ? "📊" : "📉",
        trend: profitMargin >= FINANCE_BENCHMARKS.profitMargin.excellent ? "up" :
               profitMargin < FINANCE_BENCHMARKS.profitMargin.fair ? "down" : "stable",
        description: isHealthy
          ? `Above the 15% healthy target!`
          : profitMargin > 0
            ? `Below the 15% target. Look for ways to improve.`
            : `Operating at a loss. This needs attention.`,
      });

      // Add Net Profit for clarity
      const netProfit = totalIncome - totalExpenses;
      metrics.push({
        label: "Net Profit",
        value: netProfit,
        format: "currency",
        icon: netProfit >= 0 ? "✅" : "🚨",
        description: netProfit >= 0
          ? `You're making money - ${formatCurrency(netProfit)} profit!`
          : `Losing ${formatCurrency(Math.abs(netProfit))} - needs immediate attention`,
      });
    }
  }

  // Generate summary with benchmark context
  let summary = `Analyzed ${rows.length} financial records`;
  if (healthReport) {
    summary = `Grade ${healthReport.overallGrade}: ${healthReport.gradeDescription}`;
  }

  return {
    datasetType: "finance",
    metrics,
    summary,
  };
}

/**
 * Extract inventory-specific metrics
 */
function extractInventoryMetrics(
  headers: string[],
  rows: Record<string, unknown>[],
  _numericColumns: EnhancedColumnStats[],
  _categoryColumns: EnhancedColumnStats[]
): BusinessMetrics {
  const metrics: BusinessMetric[] = [];
  const topItems: Array<{ name: string; value: number | string }> = [];

  const stockCol = findColumnByKeywords(headers, ["stock", "quantity", "qty", "inventory"]);
  const productCol = findColumnByKeywords(headers, ["product", "item", "sku", "name"]);

  if (stockCol && rows.length > 0) {
    const totalStock = rows.reduce((sum, row) => sum + (Number(row[stockCol]) || 0), 0);
    metrics.push({
      label: "Total Stock",
      value: totalStock,
      format: "number",
      icon: "📦",
    });

    // Low stock items
    if (productCol) {
      const lowStock = rows
        .filter((row) => (Number(row[stockCol]) || 0) < 10)
        .map((row) => ({
          name: String(row[productCol] || "Unknown"),
          value: Number(row[stockCol]) || 0,
        }))
        .slice(0, 5);

      if (lowStock.length > 0) {
        topItems.push(...lowStock);
        metrics.push({
          label: "Low Stock Items",
          value: lowStock.length,
          format: "number",
          icon: "⚠️",
        });
      }
    }
  }

  return {
    datasetType: "inventory",
    metrics,
    topItems: topItems.length > 0 ? topItems : undefined,
    summary: `Analyzed ${rows.length} inventory items`,
  };
}

/**
 * Extract marketing-specific metrics
 */
function extractMarketingMetrics(
  headers: string[],
  rows: Record<string, unknown>[],
  _numericColumns: EnhancedColumnStats[],
  _categoryColumns: EnhancedColumnStats[]
): BusinessMetrics {
  const metrics: BusinessMetric[] = [];

  const spendCol = findColumnByKeywords(headers, ["spend", "cost", "budget", "investment"]);
  const conversionCol = findColumnByKeywords(headers, ["conversion", "clicks", "impressions", "leads"]);

  if (spendCol && rows.length > 0) {
    const totalSpend = rows.reduce((sum, row) => sum + (Number(row[spendCol]) || 0), 0);
    metrics.push({
      label: "Total Marketing Spend",
      value: totalSpend,
      format: "currency",
      icon: "📢",
    });
  }

  if (conversionCol && spendCol && rows.length > 0) {
    const totalConversions = rows.reduce((sum, row) => sum + (Number(row[conversionCol]) || 0), 0);
    const totalSpend = rows.reduce((sum, row) => sum + (Number(row[spendCol]) || 0), 0);
    
    if (totalSpend > 0) {
      const roi = (totalConversions / totalSpend) * 100;
      metrics.push({
        label: "ROI",
        value: roi,
        format: "percentage",
        icon: "🎯",
      });
    }
  }

  return {
    datasetType: "marketing",
    metrics,
    summary: `Analyzed ${rows.length} marketing campaigns`,
  };
}

/**
 * Extract operations-specific metrics
 */
function extractOperationsMetrics(
  headers: string[],
  rows: Record<string, unknown>[],
  _numericColumns: EnhancedColumnStats[],
  _categoryColumns: EnhancedColumnStats[]
): BusinessMetrics {
  const metrics: BusinessMetric[] = [];

  const timeCol = findColumnByKeywords(headers, ["time", "duration", "hours", "minutes"]);
  const efficiencyCol = findColumnByKeywords(headers, ["efficiency", "utilization", "rate", "performance"]);

  if (timeCol && rows.length > 0) {
    const avgTime = rows.reduce((sum, row) => sum + (Number(row[timeCol]) || 0), 0) / rows.length;
    metrics.push({
      label: "Average Time",
      value: avgTime,
      format: "number",
      icon: "⏱️",
    });
  }

  if (efficiencyCol && rows.length > 0) {
    const avgEfficiency = rows.reduce((sum, row) => sum + (Number(row[efficiencyCol]) || 0), 0) / rows.length;
    metrics.push({
      label: "Average Efficiency",
      value: avgEfficiency,
      format: "percentage",
      icon: "⚡",
    });
  }

  return {
    datasetType: "operations",
    metrics,
    summary: `Analyzed ${rows.length} operational records`,
  };
}

/**
 * Extract general metrics for any dataset type
 */
function extractGeneralMetrics(
  headers: string[],
  rows: Record<string, unknown>[],
  numericColumns: EnhancedColumnStats[],
  _categoryColumns: EnhancedColumnStats[]
): BusinessMetrics {
  const metrics: BusinessMetric[] = [];

  // Show totals and averages for numeric columns
  numericColumns.slice(0, 4).forEach((col) => {
    const values = rows.map((row) => Number(row[col.name]) || 0).filter((v) => !isNaN(v));
    
    if (values.length > 0) {
      const total = values.reduce((sum, v) => sum + v, 0);
      const avg = total / values.length;

      metrics.push({
        label: `Total ${col.name}`,
        value: total,
        format: isCurrencyColumn(col.name) ? "currency" : "number",
        icon: "📊",
      });

      if (metrics.length < 4) {
        metrics.push({
          label: `Average ${col.name}`,
          value: avg,
          format: isCurrencyColumn(col.name) ? "currency" : "number",
          icon: "📈",
        });
      }
    }
  });

  return {
    datasetType: "general",
    metrics: metrics.slice(0, 4), // Limit to 4 metrics
    summary: `Analyzed ${rows.length} records with ${headers.length} columns`,
  };
}

/**
 * Helper: Find column by keywords
 */
function findColumnByKeywords(headers: string[], keywords: string[]): string | null {
  const lowerHeaders = headers.map((h) => h.toLowerCase());
  for (const keyword of keywords) {
    const index = lowerHeaders.findIndex((h) => h.includes(keyword.toLowerCase()));
    if (index !== -1) {
      return headers[index];
    }
  }
  return null;
}

/**
 * Helper: Check if column name suggests currency
 */
function isCurrencyColumn(columnName: string): boolean {
  const lower = columnName.toLowerCase();
  return (
    lower.includes("revenue") ||
    lower.includes("sales") ||
    lower.includes("price") ||
    lower.includes("cost") ||
    lower.includes("expense") ||
    lower.includes("amount") ||
    lower.includes("total") ||
    lower.includes("profit") ||
    lower.includes("income") ||
    lower.includes("spend") ||
    lower.includes("budget")
  );
}

