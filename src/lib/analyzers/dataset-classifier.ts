/**
 * Auto Sheet Classification Engine
 *
 * Current Work:
 * - Worker: Auto
 * - Task: AI-powered dataset type classification
 * - Status: in_progress
 * - Last Updated: 2025-11-22
 */

import { classifyDatasetType } from "@/lib/ai";

export type DatasetType =
  | "finance"
  | "sales"
  | "inventory"
  | "marketing"
  | "operations"
  | "general";

export interface DatasetClassification {
  type: DatasetType;
  confidence: number;
  reasoning: string;
  indicators: string[];
}

/**
 * Classify dataset type using AI and heuristics
 */
export async function classifyDataset(
  headers: string[],
  rows: Record<string, unknown>[]
): Promise<DatasetClassification> {
  // First, try heuristic-based classification (fast, no API call)
  const heuristicResult = classifyByHeuristics(headers);

  // If confidence is high, return early
  if (heuristicResult.confidence > 0.8) {
    return heuristicResult;
  }

  // Otherwise, use AI for more accurate classification
  try {
    const aiResult = await classifyDatasetType(headers, rows.slice(0, 20));
    return aiResult;
  } catch (error) {
    console.error("AI classification failed, using heuristic:", error);
    return heuristicResult;
  }
}

/**
 * Heuristic-based classification (fast, no API call)
 */
function classifyByHeuristics(headers: string[]): DatasetClassification {
  const headerLower = headers.map((h) => h.toLowerCase());
  const headerString = headerLower.join(" ");

  // Finance indicators
  const financeKeywords = [
    "revenue",
    "profit",
    "loss",
    "expense",
    "income",
    "balance",
    "cash",
    "payment",
    "invoice",
    "transaction",
    "account",
    "financial",
    "cost",
    "price",
    "amount",
    "currency",
    "dollar",
    "usd",
    "eur",
  ];

  // Sales indicators
  const salesKeywords = [
    "sale",
    "customer",
    "client",
    "order",
    "purchase",
    "deal",
    "opportunity",
    "lead",
    "prospect",
    "quota",
    "commission",
    "revenue",
    "closed",
    "won",
    "lost",
  ];

  // Inventory indicators
  const inventoryKeywords = [
    "stock",
    "inventory",
    "quantity",
    "warehouse",
    "supply",
    "product",
    "item",
    "sku",
    "barcode",
    "location",
    "reorder",
    "level",
    "units",
  ];

  // Marketing indicators
  const marketingKeywords = [
    "campaign",
    "ad",
    "advertisement",
    "impression",
    "click",
    "conversion",
    "ctr",
    "cpc",
    "cpm",
    "audience",
    "segment",
    "channel",
    "source",
    "medium",
    "referral",
    "email",
    "social",
  ];

  // Operations indicators
  const operationsKeywords = [
    "task",
    "project",
    "employee",
    "staff",
    "work",
    "hours",
    "time",
    "duration",
    "efficiency",
    "productivity",
    "resource",
    "capacity",
    "utilization",
    "kpi",
    "metric",
  ];

  const scores: Record<DatasetType, number> = {
    finance: 0,
    sales: 0,
    inventory: 0,
    marketing: 0,
    operations: 0,
    general: 0,
  };

  // Score based on keywords
  financeKeywords.forEach((keyword) => {
    if (headerString.includes(keyword)) scores.finance += 1;
  });

  salesKeywords.forEach((keyword) => {
    if (headerString.includes(keyword)) scores.sales += 1;
  });

  inventoryKeywords.forEach((keyword) => {
    if (headerString.includes(keyword)) scores.inventory += 1;
  });

  marketingKeywords.forEach((keyword) => {
    if (headerString.includes(keyword)) scores.marketing += 1;
  });

  operationsKeywords.forEach((keyword) => {
    if (headerString.includes(keyword)) scores.operations += 1;
  });

  // Find highest score
  const maxScore = Math.max(...Object.values(scores));
  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

  if (maxScore === 0 || totalScore === 0) {
    return {
      type: "general",
      confidence: 0.5,
      reasoning: "No clear indicators found in column names",
      indicators: [],
    };
  }

  const type = Object.entries(scores).find(
    ([, score]) => score === maxScore
  )?.[0] as DatasetType;

  const confidence = Math.min(maxScore / Math.max(totalScore, 1), 0.8);
  const indicators = headers.filter((h) => {
    const hLower = h.toLowerCase();
    return (
      financeKeywords.some((k) => hLower.includes(k)) ||
      salesKeywords.some((k) => hLower.includes(k)) ||
      inventoryKeywords.some((k) => hLower.includes(k)) ||
      marketingKeywords.some((k) => hLower.includes(k)) ||
      operationsKeywords.some((k) => hLower.includes(k))
    );
  });

  return {
    type,
    confidence,
    reasoning: `Classified based on ${maxScore} matching keyword(s) in column names`,
    indicators,
  };
}
