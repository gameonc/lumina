/**
 * PDF Export API
 *
 * Current Work:
 * - Worker: Auto/Cursor
 * - Task: API endpoint for PDF report generation
 * - Status: in_progress
 *
 * Note: This generates HTML for PDF. In production, you'd use:
 * - puppeteer for server-side PDF generation
 * - jsPDF for client-side generation
 * - or a service like PDF.co
 */

import { NextRequest, NextResponse } from "next/server";
import {
  generateReportHTML,
  createAnalysisReport,
  type PDFExportOptions,
} from "@/lib/reports/pdf-generator";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const exportRequestSchema = z.object({
  datasetName: z.string(),
  healthScore: z.object({
    score: z.number(),
    breakdown: z.object({
      completeness: z.number(),
      uniqueness: z.number(),
      consistency: z.number(),
      headerQuality: z.number(),
      anomalyScore: z.number(),
      overall: z.number(),
    }),
    issues: z.any(),
    recommendations: z.array(z.string()),
  }),
  charts: z.array(z.any()).optional(),
  insights: z
    .array(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    )
    .optional(),
  options: z
    .object({
      format: z.enum(["A4", "Letter"]).optional(),
      orientation: z.enum(["portrait", "landscape"]).optional(),
      includeCharts: z.boolean().optional(),
      includeHealthScore: z.boolean().optional(),
      includeInsights: z.boolean().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = exportRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const {
      datasetName,
      healthScore,
      charts = [],
      insights = [],
      options = {},
    } = validationResult.data;

    // Create report configuration
    const reportConfig = createAnalysisReport(
      datasetName,
      healthScore as any, // Type assertion for flexibility with schema
      charts,
      insights
    );

    // Generate HTML
    const html = generateReportHTML(reportConfig, options as PDFExportOptions);

    // Return HTML (client can convert to PDF or download)
    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="${datasetName}-report.html"`,
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate report",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to download report as HTML
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json(
        { error: "Report ID required" },
        { status: 400 }
      );
    }

    // TODO: Fetch report from database when Supabase integration is ready
    return NextResponse.json(
      { error: "Report not found or database integration pending" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Report fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}
