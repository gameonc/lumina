import { NextRequest, NextResponse } from "next/server";
import { generateReportSection } from "@/lib/ai";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const reportRequestSchema = z.object({
  title: z.string().min(1).max(200),
  datasetId: z.string().uuid(),
  analysisIds: z.array(z.string().uuid()),
  sections: z.array(
    z.enum([
      "executive_summary",
      "key_findings",
      "recommendations",
      "conclusion",
    ])
  ),
  data: z.array(z.record(z.unknown())).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = reportRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { title, sections, data } = validationResult.data;

    // Generate report sections using AI
    const generatedSections: Record<string, string> = {};

    for (const section of sections) {
      if (data && data.length > 0) {
        generatedSections[section] = await generateReportSection(data, section);
      } else {
        generatedSections[section] =
          `[${section.replace(/_/g, " ")}] - No data available`;
      }
    }

    // TODO: Save report to database
    // const supabase = createServiceRoleClient();
    // const { data: report, error } = await supabase
    //   .from('reports')
    //   .insert({
    //     user_id: userId,
    //     dataset_id: datasetId,
    //     analysis_ids: analysisIds,
    //     title,
    //     content: generatedSections,
    //   })
    //   .select()
    //   .single();

    return NextResponse.json({
      success: true,
      data: {
        title,
        sections: generatedSections,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

export async function GET(_request: NextRequest) {
  try {
    // TODO: Fetch reports from database
    // const { searchParams } = new URL(request.url);
    // const reportId = searchParams.get("id");
    // const supabase = createServiceRoleClient();
    // const { data: reports, error } = await supabase
    //   .from('reports')
    //   .select('*')
    //   .eq(reportId ? 'id' : 'user_id', reportId || userId)
    //   .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error) {
    console.error("Fetch reports error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}
