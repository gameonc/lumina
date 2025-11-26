import { NextRequest, NextResponse } from "next/server";
import { generatePowerPoint } from "@/lib/exports/powerpoint-generator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      datasetName,
      charts,
      healthScore,
      datasetType,
      rowCount,
      columnCount,
    } = body;

    if (!datasetName) {
      return NextResponse.json(
        { error: "Dataset name is required" },
        { status: 400 }
      );
    }

    const validCharts = Array.isArray(charts) ? charts : [];

    const blob = await generatePowerPoint({
      datasetName,
      charts: validCharts,
      healthScore,
      datasetType: datasetType || "general",
      rowCount: rowCount || 0,
      columnCount: columnCount || 0,
    });

    // Convert blob to buffer
    const buffer = Buffer.from(await blob.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${datasetName.replace(/\.[^/.]+$/, "")}-report.pptx"`,
      },
    });
  } catch (error) {
    console.error("PowerPoint generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate PowerPoint" },
      { status: 500 }
    );
  }
}
