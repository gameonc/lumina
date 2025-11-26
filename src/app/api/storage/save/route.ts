import { NextRequest, NextResponse } from "next/server";
import {
  getGoogleSheetsStorage,
  AnalysisRecord,
} from "@/lib/storage/google-sheets";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { analysisId, analysisData } = body;

    if (!analysisId || !analysisData) {
      return NextResponse.json(
        { success: false, error: "Missing analysisId or analysisData" },
        { status: 400 }
      );
    }

    const storage = getGoogleSheetsStorage();

    if (!storage.isConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Google Sheets not configured. Set GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY environment variables.",
        },
        { status: 503 }
      );
    }

    const record: AnalysisRecord = {
      id: analysisId,
      datasetName: analysisData.datasetName || "Untitled",
      healthScore: analysisData.healthScore?.score ?? null,
      rowCount: analysisData.rowCount || 0,
      columnCount: analysisData.columnCount || 0,
      datasetType: analysisData.datasetType || null,
      createdAt: new Date().toISOString(),
      charts: analysisData.charts || [],
      columnStats: analysisData.columnStats || [],
      fullData: {
        headers: analysisData.headers || [],
        rows: analysisData.rows || [],
        healthScore: analysisData.healthScore || null,
        insights: analysisData.insights || [],
      },
    };

    const saved = await storage.saveAnalysis(record);
    return NextResponse.json({ success: true, data: saved });
  } catch (error) {
    console.error("Save analysis error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("already exists")) {
      return NextResponse.json(
        { success: false, error: message },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
