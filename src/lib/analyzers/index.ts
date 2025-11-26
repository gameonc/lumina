/**
 * Data Analysis Library
 *
 * Current Work:
 * - Worker: Auto
 * - Task: Building enhanced column profiling and dataset classification
 * - Status: in_progress
 */

export {
  profileColumn,
  profileAllColumns,
  inferColumnType,
  detectOutliersIQR,
  detectOutliersZScore,
  calculateTopCategories,
  type EnhancedColumnStats,
} from "./column-profiler";

export {
  classifyDataset,
  type DatasetType,
  type DatasetClassification,
} from "./dataset-classifier";

export {
  calculateHealthScore,
  type HealthScoreResult,
  type HealthScoreBreakdown,
  type HealthIssues,
} from "./health-score";
