import { NextRequest, NextResponse } from "next/server";
import { getGoogleSheetsStorage } from "@/lib/storage/google-sheets";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing id parameter" },
        { status: 400 }
      );
    }

    const storage = getGoogleSheetsStorage();

    if (!storage.isConfigured()) {
      return NextResponse.json(
        { success: false, error: "Google Sheets not configured" },
        { status: 503 }
      );
    }

    const deleted = await storage.deleteAnalysis(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Analysis not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Analysis deleted" });
  } catch (error) {
    console.error("Delete analysis error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
