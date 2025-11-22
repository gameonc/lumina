/**
 * AI Data Insights Platform - Database Types
 * TypeScript types matching the Supabase schema
 *
 * To regenerate from live database:
 * npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
 */

// ============================================================================
// ENUMS
// ============================================================================

export type SubscriptionTier = "free" | "pro" | "enterprise";

export type UploadStatus = "pending" | "processing" | "ready" | "error";

export type AnalysisStatus = "pending" | "processing" | "completed" | "error";

export type ColumnType =
  | "string"
  | "number"
  | "date"
  | "boolean"
  | "mixed"
  | "unknown";

export type InsightCategory =
  | "trend"
  | "anomaly"
  | "correlation"
  | "quality"
  | "recommendation"
  | "summary";

export type InsightUrgency = "low" | "medium" | "high" | "critical";

export type ChartType =
  | "line"
  | "bar"
  | "scatter"
  | "pie"
  | "area"
  | "histogram"
  | "heatmap"
  | "box";

export type MessageRole = "user" | "assistant" | "system";

export type ExportType = "pdf" | "csv" | "xlsx" | "json" | "png";

export type ExportStatus =
  | "pending"
  | "processing"
  | "completed"
  | "error"
  | "expired";

// ============================================================================
// JSON TYPES
// ============================================================================

export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  notifications?: boolean;
  defaultChartType?: ChartType;
  language?: string;
  timezone?: string;
}

export interface UploadMetadata {
  sheets?: number;
  sheetNames?: string[];
  encoding?: string;
  hasHeaders?: boolean;
  delimiter?: string;
}

export interface SummaryStats {
  totalRevenue?: number;
  avgOrderValue?: number;
  totalOrders?: number;
  uniqueCustomers?: number;
  topCategory?: string;
  [key: string]: unknown;
}

export interface DataQuality {
  completeness?: number;
  consistency?: number;
  accuracy?: number;
  duplicateRate?: number;
}

export interface ColumnStatistics {
  min?: number | string;
  max?: number | string;
  mean?: number;
  median?: number;
  mode?: number | string;
  std?: number;
  variance?: number;
  sum?: number;
  isUnique?: boolean;
  pattern?: string;
  format?: string;
  categories?: string[];
  avgLength?: number;
  maxLength?: number;
}

export interface InsightAction {
  label: string;
  action: "showChart" | "filter" | "export" | "dismiss" | "navigate";
  chartId?: string;
  column?: string;
  value?: unknown;
  condition?: "equals" | "lessThan" | "greaterThan" | "isNull" | "contains";
  format?: ExportType;
}

export interface ChartConfig {
  xAxis?: {
    dataKey: string;
    label?: string;
    type?: "category" | "number" | "time";
  };
  yAxis?: {
    dataKey?: string;
    label?: string;
    domain?: [number | "auto", number | "auto"];
  };
  colors?: string[];
  showGrid?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  layout?: "horizontal" | "vertical";
  stacked?: boolean;
  showLabels?: boolean;
  showPercentage?: boolean;
}

export interface ChartDataPoint {
  [key: string]: string | number | null;
}

export interface ChartResponse {
  chartType: ChartType;
  title: string;
  description?: string;
  config: ChartConfig;
  data: ChartDataPoint[];
}

export interface ChatMetadata {
  model?: string;
  tokensUsed?: number;
  timestamp?: string;
  processingTime?: number;
}

export interface ExportConfig {
  includeSummary?: boolean;
  includeCharts?: boolean;
  includeInsights?: boolean;
  filters?: Record<string, unknown>;
  columns?: string[];
  format?: string;
}

export interface ApiUsageMetadata {
  model?: string;
  fileSize?: number;
  format?: string;
  endpoint?: string;
}

// ============================================================================
// TABLE ROW TYPES
// ============================================================================

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  usage_quota: number;
  usage_count: number;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

export interface Upload {
  id: string;
  user_id: string;
  filename: string;
  original_filename: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  status: UploadStatus;
  error_message: string | null;
  metadata: UploadMetadata;
  created_at: string;
  processed_at: string | null;
  expires_at: string | null;
}

export interface Analysis {
  id: string;
  upload_id: string;
  row_count: number | null;
  column_count: number | null;
  health_score: number | null;
  summary_stats: SummaryStats;
  data_quality: DataQuality;
  dataset_type: string | null;
  status: AnalysisStatus;
  processing_time: number | null;
  created_at: string;
  completed_at: string | null;
}

export interface ColumnMetadata {
  id: string;
  analysis_id: string;
  column_name: string;
  column_index: number;
  detected_type: ColumnType | null;
  null_count: number;
  unique_count: number | null;
  null_percentage: number | null;
  statistics: ColumnStatistics;
  sample_values: unknown[];
  quality_score: number | null;
  created_at?: string;
}

export interface Insight {
  id: string;
  analysis_id: string;
  title: string;
  description: string | null;
  category: InsightCategory | null;
  urgency: InsightUrgency;
  confidence: number | null;
  actions: InsightAction[];
  affected_columns: string[];
  is_dismissed: boolean;
  display_order: number;
  created_at: string;
}

export interface Chart {
  id: string;
  analysis_id: string;
  chart_type: ChartType;
  title: string | null;
  description: string | null;
  config: ChartConfig;
  data: ChartDataPoint[];
  columns_used: string[];
  is_auto_generated: boolean;
  is_featured: boolean;
  display_order: number;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  analysis_id: string;
  user_id: string;
  role: MessageRole;
  content: string;
  chart_response: ChartResponse | null;
  metadata: ChatMetadata;
  created_at: string;
}

export interface ExportJob {
  id: string;
  upload_id: string;
  user_id: string;
  export_type: ExportType;
  status: ExportStatus;
  storage_path: string | null;
  download_url: string | null;
  config: ExportConfig;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
  expires_at: string | null;
}

export interface ApiUsage {
  id: string;
  user_id: string;
  endpoint: string;
  tokens_used: number;
  cost_cents: number;
  metadata: ApiUsageMetadata;
  created_at: string;
}

// ============================================================================
// INSERT TYPES
// ============================================================================

export interface ProfileInsert {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  subscription_tier?: SubscriptionTier;
  usage_quota?: number;
  usage_count?: number;
  preferences?: UserPreferences;
}

export interface UploadInsert {
  id?: string;
  user_id: string;
  filename: string;
  original_filename: string;
  storage_path: string;
  mime_type?: string | null;
  file_size?: number | null;
  status?: UploadStatus;
  error_message?: string | null;
  metadata?: UploadMetadata;
  expires_at?: string | null;
}

export interface AnalysisInsert {
  id?: string;
  upload_id: string;
  row_count?: number | null;
  column_count?: number | null;
  health_score?: number | null;
  summary_stats?: SummaryStats;
  data_quality?: DataQuality;
  dataset_type?: string | null;
  status?: AnalysisStatus;
  processing_time?: number | null;
}

export interface ColumnMetadataInsert {
  id?: string;
  analysis_id: string;
  column_name: string;
  column_index: number;
  detected_type?: ColumnType | null;
  null_count?: number;
  unique_count?: number | null;
  null_percentage?: number | null;
  statistics?: ColumnStatistics;
  sample_values?: unknown[];
  quality_score?: number | null;
}

export interface InsightInsert {
  id?: string;
  analysis_id: string;
  title: string;
  description?: string | null;
  category?: InsightCategory | null;
  urgency?: InsightUrgency;
  confidence?: number | null;
  actions?: InsightAction[];
  affected_columns?: string[];
  is_dismissed?: boolean;
  display_order?: number;
}

export interface ChartInsert {
  id?: string;
  analysis_id: string;
  chart_type: ChartType;
  title?: string | null;
  description?: string | null;
  config: ChartConfig;
  data: ChartDataPoint[];
  columns_used?: string[];
  is_auto_generated?: boolean;
  is_featured?: boolean;
  display_order?: number;
}

export interface ChatMessageInsert {
  id?: string;
  analysis_id: string;
  user_id: string;
  role: MessageRole;
  content: string;
  chart_response?: ChartResponse | null;
  metadata?: ChatMetadata;
}

export interface ExportJobInsert {
  id?: string;
  upload_id: string;
  user_id: string;
  export_type: ExportType;
  status?: ExportStatus;
  storage_path?: string | null;
  download_url?: string | null;
  config?: ExportConfig;
  error_message?: string | null;
  expires_at?: string | null;
}

export interface ApiUsageInsert {
  id?: string;
  user_id: string;
  endpoint: string;
  tokens_used?: number;
  cost_cents?: number;
  metadata?: ApiUsageMetadata;
}

// ============================================================================
// UPDATE TYPES
// ============================================================================

export interface ProfileUpdate {
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  subscription_tier?: SubscriptionTier;
  usage_quota?: number;
  usage_count?: number;
  preferences?: UserPreferences;
}

export interface UploadUpdate {
  filename?: string;
  original_filename?: string;
  storage_path?: string;
  mime_type?: string | null;
  file_size?: number | null;
  status?: UploadStatus;
  error_message?: string | null;
  metadata?: UploadMetadata;
  processed_at?: string | null;
  expires_at?: string | null;
}

export interface AnalysisUpdate {
  row_count?: number | null;
  column_count?: number | null;
  health_score?: number | null;
  summary_stats?: SummaryStats;
  data_quality?: DataQuality;
  dataset_type?: string | null;
  status?: AnalysisStatus;
  processing_time?: number | null;
  completed_at?: string | null;
}

export interface InsightUpdate {
  title?: string;
  description?: string | null;
  category?: InsightCategory | null;
  urgency?: InsightUrgency;
  confidence?: number | null;
  actions?: InsightAction[];
  affected_columns?: string[];
  is_dismissed?: boolean;
  display_order?: number;
}

export interface ChartUpdate {
  chart_type?: ChartType;
  title?: string | null;
  description?: string | null;
  config?: ChartConfig;
  data?: ChartDataPoint[];
  columns_used?: string[];
  is_auto_generated?: boolean;
  is_featured?: boolean;
  display_order?: number;
}

export interface ExportJobUpdate {
  status?: ExportStatus;
  storage_path?: string | null;
  download_url?: string | null;
  config?: ExportConfig;
  error_message?: string | null;
  completed_at?: string | null;
  expires_at?: string | null;
}

// ============================================================================
// COMPOSITE TYPES (for joins and aggregations)
// ============================================================================

export interface UploadWithAnalysis extends Upload {
  analysis?: Analysis | null;
}

export interface AnalysisWithDetails extends Analysis {
  upload: Upload;
  columns: ColumnMetadata[];
  insights: Insight[];
  charts: Chart[];
}

export interface DashboardData {
  total_uploads: number;
  total_analyses: number;
  ready_uploads: number;
  pending_uploads: number;
  error_uploads: number;
  total_rows_analyzed: number;
  avg_health_score: number;
  total_insights: number;
  unread_insights: number;
  recent_uploads: Array<{
    id: string;
    original_filename: string;
    status: UploadStatus;
    created_at: string;
    health_score: number | null;
  }>;
}

export interface UserQuotaInfo {
  allowed: boolean;
  current_count: number;
  quota: number;
  remaining: number;
  subscription_tier: SubscriptionTier;
  error?: string;
}

export interface UsageIncrementResult {
  success: boolean;
  new_count?: number;
  quota?: number;
  remaining?: number;
  error?: string;
}

export interface ApiUsageSummary {
  total_calls: number;
  total_tokens: number;
  total_cost_cents: number;
  by_endpoint: Record<string, number>;
}

export interface SearchResult {
  analysis_id: string;
  upload_id: string;
  filename: string;
  health_score: number | null;
  match_type:
    | "filename"
    | "insight_title"
    | "insight_description"
    | "column_name"
    | "other";
  match_text: string;
  relevance: number;
}

// ============================================================================
// SUPABASE DATABASE TYPE
// ============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      uploads: {
        Row: Upload;
        Insert: UploadInsert;
        Update: UploadUpdate;
      };
      analyses: {
        Row: Analysis;
        Insert: AnalysisInsert;
        Update: AnalysisUpdate;
      };
      column_metadata: {
        Row: ColumnMetadata;
        Insert: ColumnMetadataInsert;
        Update: Partial<ColumnMetadataInsert>;
      };
      insights: {
        Row: Insight;
        Insert: InsightInsert;
        Update: InsightUpdate;
      };
      charts: {
        Row: Chart;
        Insert: ChartInsert;
        Update: ChartUpdate;
      };
      chat_messages: {
        Row: ChatMessage;
        Insert: ChatMessageInsert;
        Update: never;
      };
      export_jobs: {
        Row: ExportJob;
        Insert: ExportJobInsert;
        Update: ExportJobUpdate;
      };
      api_usage: {
        Row: ApiUsage;
        Insert: ApiUsageInsert;
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: {
      handle_updated_at: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      handle_new_user: {
        Args: Record<string, never>;
        Returns: unknown;
      };
      increment_usage_count: {
        Args: { p_user_id: string };
        Returns: UsageIncrementResult;
      };
      reset_usage_count: {
        Args: { p_user_id: string };
        Returns: boolean;
      };
      check_user_quota: {
        Args: { p_user_id: string };
        Returns: UserQuotaInfo;
      };
      update_upload_status: {
        Args: {
          p_upload_id: string;
          p_status: UploadStatus;
          p_error_message?: string | null;
        };
        Returns: boolean;
      };
      update_analysis_status: {
        Args: {
          p_analysis_id: string;
          p_status: AnalysisStatus;
          p_processing_time?: number | null;
        };
        Returns: boolean;
      };
      get_user_dashboard: {
        Args: { p_user_id: string };
        Returns: DashboardData;
      };
      get_analysis_summary: {
        Args: { p_analysis_id: string };
        Returns: AnalysisWithDetails;
      };
      cleanup_expired_uploads: {
        Args: Record<string, never>;
        Returns: number;
      };
      cleanup_expired_exports: {
        Args: Record<string, never>;
        Returns: number;
      };
      calculate_column_quality: {
        Args: {
          p_null_percentage: number;
          p_unique_ratio: number;
          p_is_consistent_type: boolean;
        };
        Returns: number;
      };
      record_api_usage: {
        Args: {
          p_user_id: string;
          p_endpoint: string;
          p_tokens_used?: number;
          p_cost_cents?: number;
          p_metadata?: ApiUsageMetadata;
        };
        Returns: string;
      };
      get_user_api_usage: {
        Args: {
          p_user_id: string;
          p_start_date?: string;
          p_end_date?: string;
        };
        Returns: ApiUsageSummary;
      };
      search_analyses: {
        Args: {
          p_user_id: string;
          p_query: string;
          p_limit?: number;
        };
        Returns: SearchResult[];
      };
    };
    Enums: {
      subscription_tier: SubscriptionTier;
      upload_status: UploadStatus;
      analysis_status: AnalysisStatus;
      column_type: ColumnType;
      insight_category: InsightCategory;
      insight_urgency: InsightUrgency;
      chart_type: ChartType;
      message_role: MessageRole;
      export_type: ExportType;
      export_status: ExportStatus;
    };
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** Helper type to extract Row type from a table */
export type TableRow<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];

/** Helper type to extract Insert type from a table */
export type TableInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];

/** Helper type to extract Update type from a table */
export type TableUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

/** Helper type for function arguments */
export type FunctionArgs<T extends keyof Database["public"]["Functions"]> =
  Database["public"]["Functions"][T]["Args"];

/** Helper type for function return values */
export type FunctionReturns<T extends keyof Database["public"]["Functions"]> =
  Database["public"]["Functions"][T]["Returns"];

// ============================================================================
// LEGACY COMPATIBILITY (maintaining backwards compatibility with old types)
// ============================================================================

/** @deprecated Use Upload instead */
export type Dataset = Upload;

/** @deprecated Use UploadStatus instead */
export type DatasetStatus = UploadStatus;

/** @deprecated Use InsightCategory instead */
export type AnalysisType = InsightCategory;

/** @deprecated Use Analysis instead - old Report type */
export interface Report {
  id: string;
  user_id: string;
  dataset_id: string;
  analysis_ids: string[];
  title: string;
  description: string | null;
  content: Record<string, unknown>;
  is_public: boolean;
  share_token: string | null;
  created_at: string;
  updated_at: string;
}
