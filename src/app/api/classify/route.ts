/**
 * Dataset Classification API
 *
 * Current Work:
 * - Worker: Auto
 * - Task: API endpoint for dataset type classification
 * - Status: in_progress
 */

import { NextRequest, NextResponse } from "next/server";
import { classifyDataset } from "@/lib/analyzers";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const classifyRequestSchema = z.object({
  headers: z.array(z.string()),
  rows: z.array(z.record(z.unknown())),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = classifyRequestSchema.safeParse(body);
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

    // Classify dataset type
    const classification = await classifyDataset(headers, rows);

    return NextResponse.json({
      success: true,
      data: classification,
    });
  } catch (error) {
    console.error("Classification error:", error);
    return NextResponse.json(
      { error: "Failed to classify dataset" },
      { status: 500 }
    );
  }
}
