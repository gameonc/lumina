import { NextRequest, NextResponse } from "next/server";
import { analyzeData, type AnalysisPrompt } from "@/lib/ai";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const analysisRequestSchema = z.object({
  datasetId: z.string().uuid(),
  type: z.enum(["summary", "correlation", "trend", "anomaly", "custom"]),
  prompt: z.string().optional(),
  columns: z.array(z.string()).optional(),
  data: z.array(z.record(z.unknown())),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = analysisRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { type, prompt, columns, data } = validationResult.data;

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: "No data provided for analysis" },
        { status: 400 }
      );
    }

    // Perform AI analysis
    const analysisParams: AnalysisPrompt = {
      type,
      data,
      columns: columns || Object.keys(data[0] || {}),
      userPrompt: prompt,
    };

    const result = await analyzeData(analysisParams);

    // TODO: Save analysis result to database
    // const supabase = createServiceRoleClient();
    // const { data: analysisRecord, error } = await supabase
    //   .from('analyses')
    //   .insert({
    //     dataset_id: datasetId,
    //     user_id: userId,
    //     type,
    //     prompt,
    //     result,
    //     insights: result.insights,
    //   })
    //   .select()
    //   .single();

    return NextResponse.json({
      success: true,
      data: {
        type,
        ...result,
      },
    });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to perform analysis" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const datasetId = searchParams.get("datasetId");

    if (!datasetId) {
      return NextResponse.json(
        { error: "Dataset ID is required" },
        { status: 400 }
      );
    }

    // TODO: Fetch analyses from database
    // const supabase = createServiceRoleClient();
    // const { data: analyses, error } = await supabase
    //   .from('analyses')
    //   .select('*')
    //   .eq('dataset_id', datasetId)
    //   .order('created_at', { ascending: false });

    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error) {
    console.error("Fetch analyses error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analyses" },
      { status: 500 }
    );
  }
}
