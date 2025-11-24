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
  const startTime = Date.now();
  
  try {
    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid JSON in request body",
          message: "Please ensure your request contains valid JSON data"
        },
        { status: 400 }
      );
    }

    const validationResult = analyzeRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid request data",
          details: validationResult.error.errors,
          message: "Please check that headers and rows are provided correctly"
        },
        { status: 400 }
      );
    }

    const { headers, rows } = validationResult.data;

    // Additional validation: Check for empty data
    if (headers.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: "No columns found",
          message: "Your dataset must contain at least one column"
        },
        { status: 400 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: "No data rows found",
          message: "Your dataset must contain at least one row of data"
        },
        { status: 400 }
      );
    }

    // Performance optimization: Limit dataset size for analysis
    const MAX_ROWS_FOR_ANALYSIS = 100000;
    if (rows.length > MAX_ROWS_FOR_ANALYSIS) {
      return NextResponse.json(
        { 
          success: false,
          error: "Dataset too large",
          message: `Datasets with more than ${MAX_ROWS_FOR_ANALYSIS.toLocaleString()} rows are not supported. Please use a smaller dataset or sample your data.`
        },
        { status: 400 }
      );
    }

    // Performance check: Warn about large datasets
    const MAX_ROWS_WARNING = 50000;
    if (rows.length > MAX_ROWS_WARNING) {
      console.warn(`Large dataset detected: ${rows.length} rows. Analysis may take longer.`);
    }

    // Performance optimization: Limit number of columns
    const MAX_COLUMNS = 100;
    if (headers.length > MAX_COLUMNS) {
      return NextResponse.json(
        { 
          success: false,
          error: "Too many columns",
          message: `Datasets with more than ${MAX_COLUMNS} columns are not supported. Please use a dataset with fewer columns.`
        },
        { status: 400 }
      );
    }

    // Profile all columns with error handling
    let columnStats;
    try {
      columnStats = profileAllColumns(headers, rows);
    } catch (profileError) {
      console.error("Column profiling error:", profileError);
      return NextResponse.json(
        { 
          success: false,
          error: "Failed to analyze columns",
          message: "An error occurred while analyzing your data columns. Please check your data format."
        },
        { status: 500 }
      );
    }

    // Classify dataset type with error handling
    let datasetType = "general";
    try {
      datasetType = await classifyDataset(headers, rows.slice(0, 5));
    } catch (classifyError) {
      console.error("Dataset classification error:", classifyError);
      // Non-critical error - continue with default type
      console.warn("Using default dataset type 'general' due to classification error");
    }

    // Generate chart configs with error handling
    let charts: ReturnType<typeof generateCharts> = [];
    try {
      charts = generateCharts(columnStats, rows);
    } catch (chartError) {
      console.error("Chart generation error:", chartError);
      // Non-critical error - continue with empty charts
      console.warn("Chart generation failed, continuing without charts");
    }

    // Calculate health score with error handling
    let healthScore;
    try {
      healthScore = calculateHealthScore(columnStats, rows.length, headers);
    } catch (healthError) {
      console.error("Health score calculation error:", healthError);
      return NextResponse.json(
        { 
          success: false,
          error: "Failed to calculate data health score",
          message: "An error occurred while analyzing data quality. Please try again."
        },
        { status: 500 }
      );
    }

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

    return NextResponse.json({
      success: true,
      data: {
        columnStats,
        charts,
        healthScore,
        datasetType,
        rowCount: rows.length,
        columnCount: headers.length,
        processingTime: `${processingTime}s`,
      },
    });
  } catch (error) {
    console.error("Analyze endpoint error:", error);
    
    // Provide more specific error messages
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to analyze dataset",
        message: "An unexpected error occurred. Please try again or contact support if the issue persists.",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

