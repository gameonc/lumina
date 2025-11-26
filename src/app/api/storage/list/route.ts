import { NextRequest, NextResponse } from "next/server";
import { getGoogleSheetsStorage } from "@/lib/storage/google-sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const limit = searchParams.get("limit");

    const storage = getGoogleSheetsStorage();

    if (!storage.isConfigured()) {
      return NextResponse.json(
        { success: false, error: "Google Sheets not configured" },
        { status: 503 }
      );
    }

    let analyses = await storage.listAnalyses();

    // Sort
    analyses.sort((a, b) => {
      let aVal: unknown = a[sortBy as keyof typeof a];
      let bVal: unknown = b[sortBy as keyof typeof b];

      if (sortBy === "createdAt") {
        aVal = new Date(aVal as string).getTime();
        bVal = new Date(bVal as string).getTime();
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal || "");
      const bStr = String(bVal || "");
      return sortOrder === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    // Limit
    if (limit) {
      analyses = analyses.slice(0, parseInt(limit, 10));
    }

    return NextResponse.json({
      success: true,
      data: analyses,
      count: analyses.length,
    });
  } catch (error) {
    console.error("List analyses error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
