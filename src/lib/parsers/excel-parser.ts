import * as XLSX from "xlsx";
import type { ParsedSpreadsheet } from "@/types";

interface ParseOptions {
  sheetIndex?: number;
  sheetName?: string;
  headerRow?: number;
}

/**
 * Parse Excel file (xlsx, xls) to structured data
 */
export async function parseExcel(
  file: File,
  options: ParseOptions = {}
): Promise<ParsedSpreadsheet> {
  const { sheetIndex = 0, sheetName, headerRow = 0 } = options;

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  // Get sheet names
  const sheetNames = workbook.SheetNames;

  // Get target sheet
  const targetSheetName = sheetName || sheetNames[sheetIndex];
  if (!targetSheetName) {
    throw new Error("Sheet not found");
  }

  const worksheet = workbook.Sheets[targetSheetName];
  if (!worksheet) {
    throw new Error(`Sheet "${targetSheetName}" not found`);
  }

  // Convert to JSON
  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    worksheet,
    {
      header: headerRow === 0 ? 1 : undefined,
      defval: null,
    }
  );

  // Extract headers
  let headers: string[];
  let rows: Record<string, unknown>[];

  if (headerRow === 0 && jsonData.length > 0) {
    // First row contains headers
    const firstRow = jsonData[0];
    headers = Object.keys(firstRow).map((key) => {
      const value = firstRow[key];
      return typeof value === "string" ? value : String(key);
    });

    // Remap data to use actual headers
    rows = jsonData.slice(1).map((row) => {
      const newRow: Record<string, unknown> = {};
      Object.keys(row).forEach((key, index) => {
        if (headers[index]) {
          newRow[headers[index]] = row[key];
        }
      });
      return newRow;
    });
  } else {
    headers = Object.keys(jsonData[0] || {});
    rows = jsonData;
  }

  // Clean headers
  headers = headers.map(
    (h) => h?.toString().trim() || `Column_${headers.indexOf(h)}`
  );

  const fileType = file.name.endsWith(".xlsx") ? "xlsx" : "xls";

  return {
    headers,
    rows,
    rowCount: rows.length,
    columnCount: headers.length,
    fileType,
    sheetNames,
  };
}

/**
 * Parse Excel from ArrayBuffer
 */
export function parseExcelBuffer(
  buffer: ArrayBuffer,
  options: ParseOptions = {}
): ParsedSpreadsheet {
  const { sheetIndex = 0, sheetName } = options;

  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetNames = workbook.SheetNames;

  const targetSheetName = sheetName || sheetNames[sheetIndex];
  if (!targetSheetName) {
    throw new Error("Sheet not found");
  }

  const worksheet = workbook.Sheets[targetSheetName];
  if (!worksheet) {
    throw new Error(`Sheet "${targetSheetName}" not found`);
  }

  const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(
    worksheet,
    {
      defval: null,
    }
  );

  const headers = Object.keys(jsonData[0] || {}).map((h) => h.trim());
  const rows = jsonData;

  return {
    headers,
    rows,
    rowCount: rows.length,
    columnCount: headers.length,
    fileType: "xlsx",
    sheetNames,
  };
}

/**
 * Get list of sheet names from Excel file
 */
export async function getSheetNames(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  return workbook.SheetNames;
}

/**
 * Convert data to Excel buffer
 */
export function toExcel(
  headers: string[],
  rows: Record<string, unknown>[],
  sheetName: string = "Sheet1"
): ArrayBuffer {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  return XLSX.write(workbook, { type: "array", bookType: "xlsx" });
}

/**
 * Convert data to Excel Blob for download
 */
export function toExcelBlob(
  headers: string[],
  rows: Record<string, unknown>[],
  sheetName: string = "Sheet1"
): Blob {
  const buffer = toExcel(headers, rows, sheetName);
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
