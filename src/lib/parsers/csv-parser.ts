import Papa from "papaparse";
import type { ParsedSpreadsheet, ColumnStats } from "@/types";

interface ParseOptions {
  header?: boolean;
  skipEmptyLines?: boolean;
  transformHeader?: (header: string) => string;
}

/**
 * Parse CSV file to structured data
 */
export async function parseCSV(
  file: File,
  options: ParseOptions = {}
): Promise<ParsedSpreadsheet> {
  const {
    header = true,
    skipEmptyLines = true,
    transformHeader = (h) => h.trim(),
  } = options;

  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header,
      skipEmptyLines,
      transformHeader,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, unknown>[];

        resolve({
          headers,
          rows,
          rowCount: rows.length,
          columnCount: headers.length,
          fileType: "csv",
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

/**
 * Parse CSV string to structured data
 */
export function parseCSVString(
  csvString: string,
  options: ParseOptions = {}
): ParsedSpreadsheet {
  const {
    header = true,
    skipEmptyLines = true,
    transformHeader = (h) => h.trim(),
  } = options;

  const results = Papa.parse(csvString, {
    header,
    skipEmptyLines,
    transformHeader,
  });

  const headers = results.meta.fields || [];
  const rows = results.data as Record<string, unknown>[];

  return {
    headers,
    rows,
    rowCount: rows.length,
    columnCount: headers.length,
    fileType: "csv",
  };
}

/**
 * Convert data to CSV string
 */
export function toCSV(
  headers: string[],
  rows: Record<string, unknown>[]
): string {
  return Papa.unparse({
    fields: headers,
    data: rows,
  });
}

/**
 * Detect column types from data
 */
export function detectColumnType(
  values: unknown[]
): "string" | "number" | "date" | "boolean" | "mixed" {
  const nonNullValues = values.filter(
    (v) => v !== null && v !== undefined && v !== ""
  );

  if (nonNullValues.length === 0) return "string";

  let numberCount = 0;
  let dateCount = 0;
  let booleanCount = 0;
  let stringCount = 0;

  for (const value of nonNullValues) {
    // Check for boolean
    if (
      typeof value === "boolean" ||
      value === "true" ||
      value === "false" ||
      value === "TRUE" ||
      value === "FALSE"
    ) {
      booleanCount++;
      continue;
    }

    // Check for number
    if (typeof value === "number" || !isNaN(Number(value))) {
      numberCount++;
      continue;
    }

    // Check for date
    if (typeof value === "string") {
      const datePatterns = [
        /^\d{4}-\d{2}-\d{2}$/, // ISO date
        /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
        /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
      ];
      if (
        datePatterns.some((p) => p.test(value)) ||
        !isNaN(Date.parse(value))
      ) {
        dateCount++;
        continue;
      }
    }

    stringCount++;
  }

  const total = nonNullValues.length;
  const threshold = 0.9; // 90% majority

  if (numberCount / total >= threshold) return "number";
  if (dateCount / total >= threshold) return "date";
  if (booleanCount / total >= threshold) return "boolean";
  if (stringCount / total >= threshold) return "string";

  return "mixed";
}

/**
 * Calculate statistics for a column
 */
export function calculateColumnStats(
  columnName: string,
  values: unknown[]
): ColumnStats {
  const type = detectColumnType(values);
  const nonNullValues = values.filter(
    (v) => v !== null && v !== undefined && v !== ""
  );
  const uniqueValues = new Set(nonNullValues.map(String)).size;
  const nullCount = values.length - nonNullValues.length;

  const stats: ColumnStats = {
    name: columnName,
    type,
    uniqueValues,
    nullCount,
  };

  if (type === "number") {
    const numbers = nonNullValues.map(Number).filter((n) => !isNaN(n));
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
    }
  } else if (type === "string" || type === "mixed") {
    // Find mode for string columns
    const counts = new Map<string, number>();
    nonNullValues.forEach((v) => {
      const key = String(v);
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    let maxCount = 0;
    let mode: string | undefined;
    counts.forEach((count, value) => {
      if (count > maxCount) {
        maxCount = count;
        mode = value;
      }
    });
    stats.mode = mode;
  }

  return stats;
}

/**
 * Calculate statistics for all columns
 */
export function calculateAllColumnStats(
  headers: string[],
  rows: Record<string, unknown>[]
): ColumnStats[] {
  return headers.map((header) => {
    const values = rows.map((row) => row[header]);
    return calculateColumnStats(header, values);
  });
}
