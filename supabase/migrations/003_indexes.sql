-- ============================================================================
-- AI Data Insights Platform - Performance Indexes
-- Migration: 003_indexes.sql
-- Description: Database indexes for query optimization
-- ============================================================================

-- ============================================================================
-- PROFILES INDEXES
-- ============================================================================

-- Email lookup for authentication
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Subscription tier for billing queries
CREATE INDEX idx_profiles_subscription_tier ON public.profiles(subscription_tier);

-- Usage tracking for quota checks
CREATE INDEX idx_profiles_usage ON public.profiles(usage_count, usage_quota);

-- ============================================================================
-- UPLOADS INDEXES
-- ============================================================================

-- User's uploads listing (most common query)
CREATE INDEX idx_uploads_user_id ON public.uploads(user_id);

-- Filter by status for processing queue
CREATE INDEX idx_uploads_status ON public.uploads(status);

-- Combined index for user's uploads with status
CREATE INDEX idx_uploads_user_status ON public.uploads(user_id, status);

-- Expiration cleanup job
CREATE INDEX idx_uploads_expires_at ON public.uploads(expires_at)
  WHERE expires_at IS NOT NULL;

-- Recent uploads sorting
CREATE INDEX idx_uploads_created_at ON public.uploads(created_at DESC);

-- User's recent uploads (most common listing)
CREATE INDEX idx_uploads_user_created ON public.uploads(user_id, created_at DESC);

-- ============================================================================
-- ANALYSES INDEXES
-- ============================================================================

-- Lookup by upload
CREATE INDEX idx_analyses_upload_id ON public.analyses(upload_id);

-- Processing queue
CREATE INDEX idx_analyses_status ON public.analyses(status);

-- Health score for filtering/sorting
CREATE INDEX idx_analyses_health_score ON public.analyses(health_score);

-- Dataset type for categorization
CREATE INDEX idx_analyses_dataset_type ON public.analyses(dataset_type)
  WHERE dataset_type IS NOT NULL;

-- Recent analyses
CREATE INDEX idx_analyses_created_at ON public.analyses(created_at DESC);

-- ============================================================================
-- COLUMN METADATA INDEXES
-- ============================================================================

-- Lookup by analysis
CREATE INDEX idx_column_metadata_analysis_id ON public.column_metadata(analysis_id);

-- Column ordering
CREATE INDEX idx_column_metadata_order ON public.column_metadata(analysis_id, column_index);

-- Type filtering for analysis
CREATE INDEX idx_column_metadata_type ON public.column_metadata(detected_type);

-- Quality score for data quality reports
CREATE INDEX idx_column_metadata_quality ON public.column_metadata(quality_score)
  WHERE quality_score IS NOT NULL;

-- Column name search (with trigram for fuzzy matching)
CREATE INDEX idx_column_metadata_name_trgm ON public.column_metadata
  USING gin(column_name gin_trgm_ops);

-- ============================================================================
-- INSIGHTS INDEXES
-- ============================================================================

-- Lookup by analysis
CREATE INDEX idx_insights_analysis_id ON public.insights(analysis_id);

-- Category filtering
CREATE INDEX idx_insights_category ON public.insights(category);

-- Urgency filtering for prioritization
CREATE INDEX idx_insights_urgency ON public.insights(urgency);

-- Active insights (not dismissed)
CREATE INDEX idx_insights_active ON public.insights(analysis_id, is_dismissed)
  WHERE is_dismissed = FALSE;

-- Display ordering
CREATE INDEX idx_insights_display ON public.insights(analysis_id, display_order);

-- Confidence score for quality filtering
CREATE INDEX idx_insights_confidence ON public.insights(confidence)
  WHERE confidence IS NOT NULL;

-- ============================================================================
-- CHARTS INDEXES
-- ============================================================================

-- Lookup by analysis
CREATE INDEX idx_charts_analysis_id ON public.charts(analysis_id);

-- Chart type filtering
CREATE INDEX idx_charts_type ON public.charts(chart_type);

-- Featured charts for dashboard
CREATE INDEX idx_charts_featured ON public.charts(analysis_id, is_featured)
  WHERE is_featured = TRUE;

-- Display ordering
CREATE INDEX idx_charts_display ON public.charts(analysis_id, display_order);

-- Auto-generated vs custom charts
CREATE INDEX idx_charts_auto_generated ON public.charts(is_auto_generated);

-- ============================================================================
-- CHAT MESSAGES INDEXES
-- ============================================================================

-- Lookup by analysis (conversation history)
CREATE INDEX idx_chat_messages_analysis_id ON public.chat_messages(analysis_id);

-- User's chat history
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);

-- Conversation ordering
CREATE INDEX idx_chat_messages_order ON public.chat_messages(analysis_id, created_at);

-- Role filtering (for assistant responses)
CREATE INDEX idx_chat_messages_role ON public.chat_messages(role);

-- Full-text search on message content
CREATE INDEX idx_chat_messages_content_trgm ON public.chat_messages
  USING gin(content gin_trgm_ops);

-- ============================================================================
-- EXPORT JOBS INDEXES
-- ============================================================================

-- User's export jobs
CREATE INDEX idx_export_jobs_user_id ON public.export_jobs(user_id);

-- Upload's export jobs
CREATE INDEX idx_export_jobs_upload_id ON public.export_jobs(upload_id);

-- Status for job queue processing
CREATE INDEX idx_export_jobs_status ON public.export_jobs(status);

-- Pending jobs for worker
CREATE INDEX idx_export_jobs_pending ON public.export_jobs(status, created_at)
  WHERE status = 'pending';

-- Expiration cleanup
CREATE INDEX idx_export_jobs_expires_at ON public.export_jobs(expires_at)
  WHERE expires_at IS NOT NULL;

-- ============================================================================
-- API USAGE INDEXES
-- ============================================================================

-- User's usage history
CREATE INDEX idx_api_usage_user_id ON public.api_usage(user_id);

-- Time-based queries for billing
CREATE INDEX idx_api_usage_created_at ON public.api_usage(created_at);

-- User's usage in time range (for quota checking)
CREATE INDEX idx_api_usage_user_time ON public.api_usage(user_id, created_at);

-- Endpoint analytics
CREATE INDEX idx_api_usage_endpoint ON public.api_usage(endpoint);

-- ============================================================================
-- COMPOSITE INDEXES FOR COMMON QUERIES
-- ============================================================================

-- Dashboard: User's recent ready uploads with analyses
CREATE INDEX idx_dashboard_uploads ON public.uploads(user_id, status, created_at DESC)
  WHERE status = 'ready';

-- Analysis listing: uploads with analysis status
CREATE INDEX idx_analysis_listing ON public.analyses(upload_id, status, created_at DESC);

-- Insights panel: active insights by urgency
CREATE INDEX idx_insights_panel ON public.insights(analysis_id, urgency, display_order)
  WHERE is_dismissed = FALSE;

-- Chart gallery: featured charts by analysis
CREATE INDEX idx_chart_gallery ON public.charts(analysis_id, display_order)
  WHERE is_featured = TRUE;

-- ============================================================================
-- PARTIAL INDEXES FOR COMMON FILTERS
-- ============================================================================

-- Only pending uploads (for processing queue)
CREATE INDEX idx_uploads_pending ON public.uploads(created_at)
  WHERE status = 'pending';

-- Only error uploads (for error monitoring)
CREATE INDEX idx_uploads_errors ON public.uploads(created_at DESC)
  WHERE status = 'error';

-- High urgency insights
CREATE INDEX idx_insights_urgent ON public.insights(analysis_id, created_at)
  WHERE urgency IN ('high', 'critical') AND is_dismissed = FALSE;

-- Low quality columns (for data quality reports)
CREATE INDEX idx_columns_low_quality ON public.column_metadata(analysis_id, quality_score)
  WHERE quality_score < 50;
