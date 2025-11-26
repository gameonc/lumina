import { google, sheets_v4 } from "googleapis";

const SHEETS_ID_ENV = "GOOGLE_SHEETS_ID";
const SERVICE_ACCOUNT_EMAIL_ENV = "GOOGLE_SERVICE_ACCOUNT_EMAIL";
const PRIVATE_KEY_ENV = "GOOGLE_PRIVATE_KEY";
const SHEET_NAME = "Analyses";
const HEADERS = ["ID", "Dataset Name", "Health Score", "Row Count", "Column Count", "Dataset Type", "Created At", "Charts JSON", "Column Stats JSON", "Full Data JSON"];

export interface AnalysisRecord {
  id: string;
  datasetName: string;
  healthScore: number | null;
  rowCount: number;
  columnCount: number;
  datasetType: string | null;
  createdAt: string;
  charts: unknown[];
  columnStats: unknown[];
  fullData: {
    headers: string[];
    rows: Record<string, unknown>[];
    healthScore: unknown;
    insights: unknown[];
  };
}

export type AnalysisRecordUpdate = Partial<Omit<AnalysisRecord, "id">>;

interface GoogleSheetsConfig {
  spreadsheetId: string;
  serviceAccountEmail: string;
  privateKey: string;
}

export class GoogleSheetsStorage {
  private sheets: sheets_v4.Sheets | null = null;
  private config: GoogleSheetsConfig | null = null;
  private initialized = false;

  constructor(config?: Partial<GoogleSheetsConfig>) {
    const spreadsheetId = config?.spreadsheetId || process.env[SHEETS_ID_ENV];
    const serviceAccountEmail = config?.serviceAccountEmail || process.env[SERVICE_ACCOUNT_EMAIL_ENV];
    const privateKey = config?.privateKey || process.env[PRIVATE_KEY_ENV];

    if (spreadsheetId && serviceAccountEmail && privateKey) {
      this.config = { spreadsheetId, serviceAccountEmail, privateKey: privateKey.replace(/\\n/g, "\n") };
    }
  }

  isConfigured(): boolean {
    return this.config !== null;
  }

  private async initialize(): Promise<void> {
    if (this.initialized || !this.config) return;
    const auth = new google.auth.JWT({
      email: this.config.serviceAccountEmail,
      key: this.config.privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    this.sheets = google.sheets({ version: "v4", auth });
    this.initialized = true;
    await this.ensureHeaders();
  }

  private async ensureHeaders(): Promise<void> {
    if (!this.sheets || !this.config) return;
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range: SHEET_NAME + "!A1:J1",
      });
      if (!response.data.values || response.data.values.length === 0) {
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.config.spreadsheetId,
          range: SHEET_NAME + "!A1:J1",
          valueInputOption: "RAW",
          requestBody: { values: [HEADERS] },
        });
      }
    } catch { /* Sheet might not exist */ }
  }

  private rowToRecord(row: string[]): AnalysisRecord {
    return {
      id: row[0] || "",
      datasetName: row[1] || "",
      healthScore: row[2] ? parseFloat(row[2]) : null,
      rowCount: parseInt(row[3] || "0", 10),
      columnCount: parseInt(row[4] || "0", 10),
      datasetType: row[5] || null,
      createdAt: row[6] || "",
      charts: row[7] ? JSON.parse(row[7]) : [],
      columnStats: row[8] ? JSON.parse(row[8]) : [],
      fullData: row[9] ? JSON.parse(row[9]) : { headers: [], rows: [], healthScore: null, insights: [] },
    };
  }

  private recordToRow(record: AnalysisRecord): string[] {
    return [
      record.id,
      record.datasetName,
      record.healthScore?.toString() || "",
      record.rowCount.toString(),
      record.columnCount.toString(),
      record.datasetType || "",
      record.createdAt,
      JSON.stringify(record.charts),
      JSON.stringify(record.columnStats),
      JSON.stringify(record.fullData),
    ];
  }

  async saveAnalysis(analysis: AnalysisRecord): Promise<AnalysisRecord> {
    if (!this.config) throw new Error("Google Sheets not configured. Set GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY.");
    await this.initialize();
    if (!this.sheets) throw new Error("Failed to initialize Google Sheets client");

    const existing = await this.getAnalysis(analysis.id);
    if (existing) throw new Error("Analysis with ID " + analysis.id + " already exists");

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.config.spreadsheetId,
      range: SHEET_NAME + "!A:J",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: { values: [this.recordToRow(analysis)] },
    });
    return analysis;
  }

  async getAnalysis(id: string): Promise<AnalysisRecord | null> {
    if (!this.config) throw new Error("Google Sheets not configured.");
    await this.initialize();
    if (!this.sheets) throw new Error("Failed to initialize Google Sheets client");

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.config.spreadsheetId,
      range: SHEET_NAME + "!A:J",
    });
    const rows = response.data.values;
    if (!rows || rows.length <= 1) return null;

    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === id) return this.rowToRecord(rows[i]);
    }
    return null;
  }

  async listAnalyses(): Promise<AnalysisRecord[]> {
    if (!this.config) throw new Error("Google Sheets not configured.");
    await this.initialize();
    if (!this.sheets) throw new Error("Failed to initialize Google Sheets client");

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.config.spreadsheetId,
      range: SHEET_NAME + "!A:J",
    });
    const rows = response.data.values;
    if (!rows || rows.length <= 1) return [];
    return rows.slice(1).map((row) => this.rowToRecord(row));
  }

  async updateAnalysis(id: string, updates: AnalysisRecordUpdate): Promise<AnalysisRecord | null> {
    if (!this.config) throw new Error("Google Sheets not configured.");
    await this.initialize();
    if (!this.sheets) throw new Error("Failed to initialize Google Sheets client");

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.config.spreadsheetId,
      range: SHEET_NAME + "!A:J",
    });
    const rows = response.data.values;
    if (!rows || rows.length <= 1) return null;

    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === id) { rowIndex = i; break; }
    }
    if (rowIndex === -1) return null;

    const currentRecord = this.rowToRecord(rows[rowIndex]);
    const updatedRecord: AnalysisRecord = { ...currentRecord, ...updates, id };

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.config.spreadsheetId,
      range: SHEET_NAME + "!A" + (rowIndex + 1) + ":J" + (rowIndex + 1),
      valueInputOption: "RAW",
      requestBody: { values: [this.recordToRow(updatedRecord)] },
    });
    return updatedRecord;
  }

  async deleteAnalysis(id: string): Promise<boolean> {
    if (!this.config) throw new Error("Google Sheets not configured.");
    await this.initialize();
    if (!this.sheets) throw new Error("Failed to initialize Google Sheets client");

    const spreadsheet = await this.sheets.spreadsheets.get({ spreadsheetId: this.config.spreadsheetId });
    const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.title === SHEET_NAME);
    if (!sheet?.properties?.sheetId) throw new Error("Sheet not found");
    const sheetId = sheet.properties.sheetId;

    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.config.spreadsheetId,
      range: SHEET_NAME + "!A:J",
    });
    const rows = response.data.values;
    if (!rows || rows.length <= 1) return false;

    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === id) { rowIndex = i; break; }
    }
    if (rowIndex === -1) return false;

    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.config.spreadsheetId,
      requestBody: {
        requests: [{ deleteDimension: { range: { sheetId, dimension: "ROWS", startIndex: rowIndex, endIndex: rowIndex + 1 } } }],
      },
    });
    return true;
  }

  async getCount(): Promise<number> {
    return (await this.listAnalyses()).length;
  }
}

let storageInstance: GoogleSheetsStorage | null = null;

export function getGoogleSheetsStorage(): GoogleSheetsStorage {
  if (!storageInstance) storageInstance = new GoogleSheetsStorage();
  return storageInstance;
}

export const googleSheetsStorage = getGoogleSheetsStorage();
