/**
 * Dataset Health Score API
 * 
 * Current Work:
 * - Worker: Auto
 * - Task: API endpoint for health score calculation
 * - Status: in_progress
 */

import { NextRequest, NextResponse } from "next/server";
import { calculateHealthScore } from "@/lib/analyzers/health-score";
import { profileAllColumns } from "@/lib/analyzers";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const healthRequestSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.record(z.unknown())),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = healthRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { headers, rows } = validationResult.data;

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

    // Calculate health score
    const healthResult = calculateHealthScore(
      columnStats,
      rows.length,
      headers
    );

    return NextResponse.json({
      success: true,
      data: healthResult,
    });
  } catch (error) {
    console.error("Health score calculation error:", error);
    return NextResponse.json(
      { error: "Failed to calculate health score" },
      { status: 500 }
    );
  }
}

