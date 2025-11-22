import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  profileAllColumns,
  classifyDataset,
  calculateHealthScore,
} from "@/lib/analyzers";
import { generateCharts } from "@/lib/charts";

export const runtime = "nodejs";
export const maxDuration = 60;

const analyzeRequestSchema = z.object({
  headers: z.array(z.string().min(1)),
  rows: z.array(z.record(z.unknown())).min(1),
  datasetName: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validationResult = analyzeRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { headers, rows } = validationResult.data;

    // Profile all columns
    const columnStats = profileAllColumns(headers, rows);

    // Classify dataset type
    const datasetType = await classifyDataset(headers, rows.slice(0, 5));

    // Generate chart configs
    const charts = generateCharts(columnStats, rows);

    // Calculate health score
    const healthScore = calculateHealthScore(columnStats, rows.length, headers);

    return NextResponse.json({
      success: true,
      data: {
        columnStats,
        charts,
        healthScore,
        datasetType,
        rowCount: rows.length,
        columnCount: headers.length,
      },
    });
  } catch (error) {
    console.error("Analyze endpoint error:", error);
    return NextResponse.json(
      { error: "Failed to analyze dataset" },
      { status: 500 }
    );
  }
}

