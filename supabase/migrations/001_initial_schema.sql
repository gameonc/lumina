-- ============================================================================
-- AI Data Insights Platform - Initial Schema
-- Migration: 001_initial_schema.sql
-- Description: Core tables for the AI Data Insights platform
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- ============================================================================
-- PROFILES TABLE
-- Extends Supabase auth.users with application-specific data
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  usage_quota INTEGER DEFAULT 10 CHECK (usage_quota >= 0),
  usage_count INTEGER DEFAULT 0 CHECK (usage_count >= 0),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.profiles IS 'User profiles extending Supabase auth.users';
COMMENT ON COLUMN public.profiles.subscription_tier IS 'User subscription level: free, pro, enterprise';
COMMENT ON COLUMN public.profiles.usage_quota IS 'Maximum number of analyses allowed per billing period';
COMMENT ON COLUMN public.profiles.usage_count IS 'Current number of analyses used in billing period';
COMMENT ON COLUMN public.profiles.preferences IS 'User preferences as JSON (theme, notifications, etc.)';

-- ============================================================================
-- UPLOADS TABLE
-- Stores metadata about uploaded files
-- ============================================================================
CREATE TABLE public.uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT CHECK (file_size >= 0),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'error')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  processed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

COMMENT ON TABLE public.uploads IS 'Uploaded spreadsheet files and their processing status';
COMMENT ON COLUMN public.uploads.filename IS 'Sanitized filename used in storage';
COMMENT ON COLUMN public.uploads.original_filename IS 'Original filename as uploaded by user';
COMMENT ON COLUMN public.uploads.storage_path IS 'Path to file in Supabase Storage';
COMMENT ON COLUMN public.uploads.status IS 'Processing status: pending, processing, ready, error';
COMMENT ON COLUMN public.uploads.metadata IS 'Additional file metadata (sheets, encoding, etc.)';
COMMENT ON COLUMN public.uploads.expires_at IS 'When the file will be automatically deleted';

-- ============================================================================
-- ANALYSES TABLE
-- Stores analysis results for uploaded files
-- ============================================================================
CREATE TABLE public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES public.uploads(id) ON DELETE CASCADE NOT NULL,
  row_count INTEGER CHECK (row_count >= 0),
  column_count INTEGER CHECK (column_count >= 0),
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  summary_stats JSONB DEFAULT '{}',
  data_quality JSONB DEFAULT '{}',
  dataset_type TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error')),
  processing_time FLOAT CHECK (processing_time >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ
);

COMMENT ON TABLE public.analyses IS 'Analysis results for uploaded spreadsheets';
COMMENT ON COLUMN public.analyses.health_score IS 'Overall data quality score from 0-100';
COMMENT ON COLUMN public.analyses.summary_stats IS 'Summary statistics for the entire dataset';
COMMENT ON COLUMN public.analyses.data_quality IS 'Data quality metrics (completeness, consistency, etc.)';
COMMENT ON COLUMN public.analyses.dataset_type IS 'Detected dataset category: finance, sales, inventory, etc.';
COMMENT ON COLUMN public.analyses.processing_time IS 'Time taken to complete analysis in seconds';

-- ============================================================================
-- COLUMN METADATA TABLE
-- Stores detailed metadata for each column in an analysis
-- ============================================================================
CREATE TABLE public.column_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE NOT NULL,
  column_name TEXT NOT NULL,
  column_index INTEGER NOT NULL CHECK (column_index >= 0),
  detected_type TEXT CHECK (detected_type IN ('string', 'number', 'date', 'boolean', 'mixed', 'unknown')),
  null_count INTEGER DEFAULT 0 CHECK (null_count >= 0),
  unique_count INTEGER CHECK (unique_count >= 0),
  null_percentage FLOAT CHECK (null_percentage >= 0 AND null_percentage <= 100),
  statistics JSONB DEFAULT '{}',
  sample_values JSONB DEFAULT '[]',
  quality_score FLOAT CHECK (quality_score >= 0 AND quality_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.column_metadata IS 'Detailed metadata for each column in an analysis';
COMMENT ON COLUMN public.column_metadata.detected_type IS 'Inferred data type: string, number, date, boolean, mixed, unknown';
COMMENT ON COLUMN public.column_metadata.statistics IS 'Column statistics: min, max, mean, median, mode, std_dev, etc.';
COMMENT ON COLUMN public.column_metadata.sample_values IS 'Array of sample values from the column';
COMMENT ON COLUMN public.column_metadata.quality_score IS 'Column-specific quality score from 0-100';

-- ============================================================================
-- INSIGHTS TABLE
-- AI-generated insights from analysis
-- ============================================================================
CREATE TABLE public.insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('trend', 'anomaly', 'correlation', 'quality', 'recommendation', 'summary')),
  urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  confidence FLOAT CHECK (confidence >= 0 AND confidence <= 1),
  actions JSONB DEFAULT '[]',
  affected_columns JSONB DEFAULT '[]',
  is_dismissed BOOLEAN DEFAULT FALSE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.insights IS 'AI-generated insights from data analysis';
COMMENT ON COLUMN public.insights.category IS 'Insight type: trend, anomaly, correlation, quality, recommendation, summary';
COMMENT ON COLUMN public.insights.urgency IS 'Priority level: low, medium, high, critical';
COMMENT ON COLUMN public.insights.confidence IS 'AI confidence score from 0.0 to 1.0';
COMMENT ON COLUMN public.insights.actions IS 'Suggested actions as JSON array';
COMMENT ON COLUMN public.insights.affected_columns IS 'Column names affected by this insight';
COMMENT ON COLUMN public.insights.is_dismissed IS 'Whether user has dismissed this insight';

-- ============================================================================
-- CHARTS TABLE
-- Auto-generated and custom chart configurations
-- ============================================================================
CREATE TABLE public.charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE NOT NULL,
  chart_type TEXT NOT NULL CHECK (chart_type IN ('line', 'bar', 'scatter', 'pie', 'area', 'histogram', 'heatmap', 'box')),
  title TEXT,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  data JSONB NOT NULL DEFAULT '[]',
  columns_used TEXT[] DEFAULT '{}',
  is_auto_generated BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.charts IS 'Chart configurations and data for visualizations';
COMMENT ON COLUMN public.charts.chart_type IS 'Type of chart: line, bar, scatter, pie, area, histogram, heatmap, box';
COMMENT ON COLUMN public.charts.config IS 'Recharts configuration object';
COMMENT ON COLUMN public.charts.data IS 'Processed data array for the chart';
COMMENT ON COLUMN public.charts.columns_used IS 'Column names used to generate this chart';
COMMENT ON COLUMN public.charts.is_auto_generated IS 'Whether chart was auto-generated or user-created';
COMMENT ON COLUMN public.charts.is_featured IS 'Whether chart appears in the main dashboard';

-- ============================================================================
-- CHAT MESSAGES TABLE
-- Conversational AI interactions
-- ============================================================================
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES public.analyses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  chart_response JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.chat_messages IS 'Chat history for AI data assistant conversations';
COMMENT ON COLUMN public.chat_messages.role IS 'Message sender: user, assistant, or system';
COMMENT ON COLUMN public.chat_messages.chart_response IS 'Chart generated in response (if applicable)';
COMMENT ON COLUMN public.chat_messages.metadata IS 'Additional metadata (tokens used, model, etc.)';

-- ============================================================================
-- EXPORT JOBS TABLE
-- Track export/download jobs
-- ============================================================================
CREATE TABLE public.export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID REFERENCES public.uploads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  export_type TEXT NOT NULL CHECK (export_type IN ('pdf', 'csv', 'xlsx', 'json', 'png')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'error', 'expired')),
  storage_path TEXT,
  download_url TEXT,
  config JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

COMMENT ON TABLE public.export_jobs IS 'Export job queue and status tracking';
COMMENT ON COLUMN public.export_jobs.export_type IS 'Export format: pdf, csv, xlsx, json, png';
COMMENT ON COLUMN public.export_jobs.config IS 'Export configuration (sections to include, formatting, etc.)';
COMMENT ON COLUMN public.export_jobs.expires_at IS 'When the export file will be automatically deleted';

-- ============================================================================
-- API USAGE TABLE
-- Track API usage for rate limiting and billing
-- ============================================================================
CREATE TABLE public.api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  cost_cents INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.api_usage IS 'API usage tracking for rate limiting and billing';
COMMENT ON COLUMN public.api_usage.tokens_used IS 'Number of AI tokens consumed';
COMMENT ON COLUMN public.api_usage.cost_cents IS 'Cost in cents for this API call';
