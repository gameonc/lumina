/**
 * Chat With Your Data API
 * 
 * Current Work:
 * - Worker: Auto/Cursor
 * - Task: API endpoint for natural language chat
 * - Status: in_progress
 */

import { NextRequest, NextResponse } from "next/server";
import { processChatMessage, type ChatContext } from "@/lib/ai/chat-handler";
import { profileAllColumns } from "@/lib/analyzers";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const chatRequestSchema = z.object({
  message: z.string().min(1),
  datasetId: z.string().optional(),
  headers: z.array(z.string()),
  rows: z.array(z.record(z.unknown())),
  conversationHistory: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
    timestamp: z.number().optional(),
  })).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = chatRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { message, datasetId, headers, rows, conversationHistory } = validationResult.data;

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

    // Profile columns for better context
    const columnStats = profileAllColumns(headers, rows);

    // Build context
    const context: ChatContext = {
      datasetId,
      headers,
      rows,
      columnStats,
      conversationHistory,
    };

    // Process the message
    const response = await processChatMessage(message, context);

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Chat processing error:", error);
    return NextResponse.json(
      { 
        error: "Failed to process chat message",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to fetch chat history for a dataset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const datasetId = searchParams.get("datasetId");

    if (!datasetId) {
      return NextResponse.json(
        { error: "Dataset ID required" },
        { status: 400 }
      );
    }

    // TODO: Fetch from database when Supabase integration is ready
    // For now, return empty history
    return NextResponse.json({
      success: true,
      data: {
        messages: [],
        datasetId,
      },
    });
  } catch (error) {
    console.error("Chat history fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat history" },
      { status: 500 }
    );
  }
}

