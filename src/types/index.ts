// Re-export database types
export * from "./database";

// Common types used across the application

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * File upload progress
 */
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

/**
 * Parsed spreadsheet data
 */
export interface ParsedSpreadsheet {
  headers: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  columnCount: number;
  fileType: "csv" | "xlsx" | "xls";
  sheetNames?: string[];
}

/**
 * Column statistics
 */
export interface ColumnStats {
  name: string;
  type: "string" | "number" | "date" | "boolean" | "mixed";
  uniqueValues: number;
  nullCount: number;
  min?: number | string;
  max?: number | string;
  mean?: number;
  median?: number;
  mode?: string | number;
  standardDeviation?: number;
}

/**
 * Enhanced column statistics with outliers and quality metrics
 */
export interface EnhancedColumnStats extends ColumnStats {
  // Enhanced type detection
  inferredType: "numeric" | "date" | "category" | "text" | "boolean" | "mixed";

  // Outlier detection
  outliers?: {
    count: number;
    values: (number | string)[];
    method: "iqr" | "zscore" | "isolation";
  };

  // Category-specific stats
  topCategories?: Array<{
    value: string | number;
    count: number;
    percentage: number;
  }>;

  // Data quality metrics
  quality: {
    completeness: number; // 0-1, percentage of non-null values
    consistency: number; // 0-1, how consistent the data type is
    uniqueness: number; // 0-1, unique values / total values
  };

  // Date-specific stats (if type is date)
  dateRange?: {
    min: Date;
    max: Date;
    span: number; // days
  };
}

/**
 * Dataset summary
 */
export interface DatasetSummary {
  totalRows: number;
  totalColumns: number;
  columnStats: ColumnStats[];
  dataQuality: {
    completeness: number;
    uniqueness: number;
    consistency: number;
  };
}

/**
 * AI Analysis request
 */
export interface AnalysisRequest {
  datasetId: string;
  type: "summary" | "correlation" | "trend" | "anomaly" | "custom";
  prompt?: string;
  columns?: string[];
  options?: Record<string, unknown>;
}

/**
 * AI Insight
 */
export interface Insight {
  id: string;
  type: "finding" | "recommendation" | "warning" | "opportunity";
  title: string;
  description: string;
  confidence: number;
  relatedColumns?: string[];
  visualization?: ChartConfig;
}

/**
 * Chart configuration
 */
export interface ChartConfig {
  type:
    | "line"
    | "bar"
    | "pie"
    | "scatter"
    | "area"
    | "radar"
    | "heatmap"
    | "histogram";
  title: string;
  data: Record<string, unknown>[];
  xAxis?: string;
  yAxis?: string | string[];
  colors?: string[];
  options?: Record<string, unknown>;
  explanation?: string;
}

/**
 * Report section
 */
export interface ReportSection {
  id: string;
  type: "text" | "chart" | "table" | "insight" | "divider";
  content: unknown;
  order: number;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme: "light" | "dark" | "system";
  defaultChartType: ChartConfig["type"];
  autoAnalysis: boolean;
  emailNotifications: boolean;
}

/**
 * Navigation item
 */
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  disabled?: boolean;
  children?: NavItem[];
}

/**
 * Toast notification
 */
export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}
