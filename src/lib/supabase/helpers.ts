/**
 * Supabase Storage & Database Helpers
 *
 * Current Work:
 * - Worker: Auto/Cursor
 * - Task: Helper functions for file storage and data persistence
 * - Status: in_progress
 */

import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(
  file: File,
  userId: string
): Promise<{ path: string; url: string }> {
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("uploads")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("uploads").getPublicUrl(data.path);

  return {
    path: data.path,
    url: publicUrl,
  };
}

/**
 * Save upload record to database
 */
export async function saveUploadRecord(
  userId: string,
  fileName: string,
  filePath: string,
  fileSize: number,
  rowCount: number,
  columnCount: number
): Promise<string> {
  const { data, error } = await supabase
    .from("uploads")
    .insert({
      user_id: userId,
      file_name: fileName,
      file_path: filePath,
      file_size: fileSize,
      row_count: rowCount,
      column_count: columnCount,
      status: "completed",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to save upload record: ${error.message}`);
  }

  return data.id;
}

/**
 * Save analysis results to database
 */
export async function saveAnalysisResults(
  uploadId: string,
  analysisType: string,
  results: Record<string, unknown>
): Promise<string> {
  const { data, error } = await supabase
    .from("analyses")
    .insert({
      upload_id: uploadId,
      analysis_type: analysisType,
      results,
      status: "completed",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to save analysis results: ${error.message}`);
  }

  return data.id;
}

/**
 * Save chat message to database
 */
export async function saveChatMessage(
  uploadId: string,
  role: "user" | "assistant",
  message: string,
  metadata?: Record<string, unknown>
): Promise<string> {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      upload_id: uploadId,
      role,
      message,
      metadata,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to save chat message: ${error.message}`);
  }

  return data.id;
}

/**
 * Get chat history for a dataset
 */
export async function getChatHistory(
  uploadId: string
): Promise<Array<{ role: string; message: string; created_at: string }>> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("role, message, created_at")
    .eq("upload_id", uploadId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch chat history: ${error.message}`);
  }

  return data || [];
}

/**
 * Save generated chart to database
 */
export async function saveChart(
  uploadId: string,
  chartType: string,
  chartData: Record<string, unknown>,
  title: string
): Promise<string> {
  const { data, error } = await supabase
    .from("charts")
    .insert({
      upload_id: uploadId,
      chart_type: chartType,
      chart_data: chartData,
      title,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to save chart: ${error.message}`);
  }

  return data.id;
}

/**
 * Get all charts for a dataset
 */
export async function getCharts(uploadId: string): Promise<
  Array<{
    id: string;
    chart_type: string;
    chart_data: Record<string, unknown>;
    title: string;
    created_at: string;
  }>
> {
  const { data, error } = await supabase
    .from("charts")
    .select("id, chart_type, chart_data, title, created_at")
    .eq("upload_id", uploadId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch charts: ${error.message}`);
  }

  return data || [];
}

/**
 * Get upload details
 */
export async function getUpload(uploadId: string): Promise<{
  id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  row_count: number;
  column_count: number;
  created_at: string;
} | null> {
  const { data, error } = await supabase
    .from("uploads")
    .select("*")
    .eq("id", uploadId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // Not found
    }
    throw new Error(`Failed to fetch upload: ${error.message}`);
  }

  return data;
}

/**
 * Get user's recent uploads
 */
export async function getRecentUploads(
  userId: string,
  limit: number = 10
): Promise<
  Array<{
    id: string;
    file_name: string;
    row_count: number;
    column_count: number;
    created_at: string;
  }>
> {
  const { data, error } = await supabase
    .from("uploads")
    .select("id, file_name, row_count, column_count, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch recent uploads: ${error.message}`);
  }

  return data || [];
}

/**
 * Delete upload and all related data
 */
export async function deleteUpload(uploadId: string): Promise<void> {
  // Delete file from storage first
  const upload = await getUpload(uploadId);
  if (upload?.file_path) {
    await supabase.storage.from("uploads").remove([upload.file_path]);
  }

  // Delete from database (cascades to related tables)
  const { error } = await supabase.from("uploads").delete().eq("id", uploadId);

  if (error) {
    throw new Error(`Failed to delete upload: ${error.message}`);
  }
}
