export {
  parseCSV,
  parseCSVString,
  toCSV,
  detectColumnType,
  calculateColumnStats,
  calculateAllColumnStats,
} from "./csv-parser";

export {
  parseExcel,
  parseExcelBuffer,
  getSheetNames,
  toExcel,
  toExcelBlob,
} from "./excel-parser";

import type { ParsedSpreadsheet } from "@/types";
import { parseCSV } from "./csv-parser";
import { parseExcel } from "./excel-parser";

/**
 * Parse any supported spreadsheet file
 */
export async function parseSpreadsheet(file: File): Promise<ParsedSpreadsheet> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".csv")) {
    return parseCSV(file);
  }

  if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
    return parseExcel(file);
  }

  throw new Error(`Unsupported file type: ${fileName.split(".").pop()}`);
}

/**
 * Validate if file is a supported spreadsheet format
 */
export function isValidSpreadsheetFile(file: File): boolean {
  const validExtensions = [".csv", ".xlsx", ".xls"];
  const fileName = file.name.toLowerCase();
  return validExtensions.some((ext) => fileName.endsWith(ext));
}

/**
 * Get file type from file name
 */
export function getFileType(
  fileName: string
): "csv" | "xlsx" | "xls" | "unknown" {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".csv")) return "csv";
  if (lower.endsWith(".xlsx")) return "xlsx";
  if (lower.endsWith(".xls")) return "xls";
  return "unknown";
}
