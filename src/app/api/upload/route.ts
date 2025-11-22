import { NextRequest, NextResponse } from "next/server";
import { parseSpreadsheet } from "@/lib/parsers";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = [
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
    ];

    if (
      !validTypes.includes(file.type) &&
      !file.name.match(/\.(csv|xlsx|xls)$/i)
    ) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload a CSV or Excel file." },
        { status: 400 }
      );
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 50MB." },
        { status: 400 }
      );
    }

    // Parse the spreadsheet
    const parsedData = await parseSpreadsheet(file);

    // TODO: Upload to Supabase Storage and create database record
    // import { createServiceRoleClient } from "@/lib/supabase/server";
    // const supabase = createServiceRoleClient();
    // const { data: uploadData, error: uploadError } = await supabase
    //   .storage
    //   .from('datasets')
    //   .upload(`${userId}/${file.name}`, file);

    return NextResponse.json({
      success: true,
      data: {
        filename: file.name,
        size: file.size,
        mimeType: file.type,
        rowCount: parsedData.rowCount,
        columnCount: parsedData.columnCount,
        columns: parsedData.headers,
        preview: parsedData.rows.slice(0, 5),
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to process file" },
      { status: 500 }
    );
  }
}
