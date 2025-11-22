/**
 * Chart Generation API
 * 
 * Current Work:
 * - Worker: Auto
 * - Task: API endpoint for auto-generating charts
 * - Status: in_progress
 */

import { NextRequest, NextResponse } from "next/server";
import { generateCharts, recommendCharts } from "@/lib/charts/recommender";
import { profileAllColumns } from "@/lib/analyzers";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const chartRequestSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.record(z.unknown())),
  generateData: z.boolean().optional().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = chartRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { headers, rows, generateData } = validationResult.data;

    if (!headers || headers.length === 0) {
      return NextResponse.json(
        { error: "No headers provided" },
        { status: 400 }
      );
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "No data rows provided" },
        { status: 400 }
      );
    }

    // Profile columns first
    const columnStats = profileAllColumns(headers, rows);

    // Get chart recommendations
    const recommendations = recommendCharts(columnStats, rows);

    // Generate chart data if requested
    const charts = generateData
      ? generateCharts(columnStats, rows)
      : recommendations.map((rec) => ({
          type: rec.chartType,
          title: rec.title,
          description: rec.description,
          xAxis: rec.xAxis,
          yAxis: rec.yAxis,
          data: [],
          colors: [],
        }));

    return NextResponse.json({
      success: true,
      data: {
        charts,
        recommendations,
        totalCharts: charts.length,
      },
    });
  } catch (error) {
    console.error("Chart generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate charts" },
      { status: 500 }
    );
  }
}

