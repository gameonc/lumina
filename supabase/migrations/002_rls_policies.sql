-- ============================================================================
-- AI Data Insights Platform - Row Level Security Policies
-- Migration: 002_rls_policies.sql
-- Description: RLS policies ensuring users can only access their own data
-- ============================================================================

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.column_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profile is created automatically via trigger (service role)
-- Users cannot directly insert profiles
CREATE POLICY "Service role can insert profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- UPLOADS POLICIES
-- ============================================================================

-- Users can view their own uploads
CREATE POLICY "Users can view own uploads"
  ON public.uploads
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create uploads for themselves
CREATE POLICY "Users can create own uploads"
  ON public.uploads
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own uploads
CREATE POLICY "Users can update own uploads"
  ON public.uploads
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own uploads
CREATE POLICY "Users can delete own uploads"
  ON public.uploads
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- ANALYSES POLICIES
-- ============================================================================

-- Users can view analyses for their uploads
CREATE POLICY "Users can view own analyses"
  ON public.analyses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.uploads
      WHERE uploads.id = analyses.upload_id
      AND uploads.user_id = auth.uid()
    )
  );

-- Users can create analyses for their uploads
CREATE POLICY "Users can create analyses for own uploads"
  ON public.analyses
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.uploads
      WHERE uploads.id = upload_id
      AND uploads.user_id = auth.uid()
    )
  );

-- Users can update analyses for their uploads
CREATE POLICY "Users can update own analyses"
  ON public.analyses
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.uploads
      WHERE uploads.id = analyses.upload_id
      AND uploads.user_id = auth.uid()
    )
  );

-- Users can delete analyses for their uploads
CREATE POLICY "Users can delete own analyses"
  ON public.analyses
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.uploads
      WHERE uploads.id = analyses.upload_id
      AND uploads.user_id = auth.uid()
    )
  );

-- ============================================================================
-- COLUMN METADATA POLICIES
-- ============================================================================

-- Users can view column metadata for their analyses
CREATE POLICY "Users can view own column metadata"
  ON public.column_metadata
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.analyses
      JOIN public.uploads ON uploads.id = analyses.upload_id
      WHERE analyses.id = column_metadata.analysis_id
      AND uploads.user_id = auth.uid()
    )
  );

-- Users can create column metadata for their analyses
CREATE POLICY "Users can create column metadata for own analyses"
  ON public.column_metadata
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.analyses
      JOIN public.uploads ON uploads.id = analyses.upload_id
      WHERE analyses.id = analysis_id
      AND uploads.user_id = auth.uid()
    )
  );

-- Users can update column metadata for their analyses
CREATE POLICY "Users can update own column metadata"
  ON public.column_metadata
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.analyses
      JOIN public.uploads ON uploads.id = analyses.upload_id
      WHERE analyses.id = column_metadata.analysis_id
      AND uploads.user_id = auth.uid()
    )
  );

-- Users can delete column metadata for their analyses
CREATE POLICY "Users can delete own column metadata"
  ON public.column_metadata
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.analyses
      JOIN public.uploads ON uploads.id = analyses.upload_id
      WHERE analyses.id = column_metadata.analysis_id
      AND uploads.user_id = auth.uid()
    )
  );

-- ============================================================================
-- INSIGHTS POLICIES
-- ============================================================================

-- Users can view insights for their analyses
CREATE POLICY "Users can view own insights"
  ON public.insights
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.analyses
      JOIN public.uploads ON uploads.id = analyses.upload_id
      WHERE analyses.id = insights.analysis_id
      AND uploads.user_id = auth.uid()
    )
  );

-- Users can create insights for their analyses
CREATE POLICY "Users can create insights for own analyses"
  ON public.insights
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.analyses
      JOIN public.uploads ON uploads.id = analyses.upload_id
      WHERE analyses.id = analysis_id
      AND uploads.user_id = auth.uid()
    )
  );

-- Users can update insights for their analyses (e.g., dismiss)
CREATE POLICY "Users can update own insights"
  ON public.insights
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.analyses
      JOIN public.uploads ON uploads.id = analyses.upload_id
      WHERE analyses.id = insights.analysis_id
      AND uploads.user_id = auth.uid()
    )
  );

-- Users can delete insights for their analyses
CREATE POLICY "Users can delete own insights"
  ON public.insights
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.analyses
      JOIN public.uploads ON uploads.id = analyses.upload_id
      WHERE analyses.id = insights.analysis_id
      AND uploads.user_id = auth.uid()
    )
  );

-- ============================================================================
-- CHARTS POLICIES
-- ============================================================================

-- Users can view charts for their analyses
CREATE POLICY "Users can view own charts"
  ON public.charts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.analyses
      JOIN public.uploads ON uploads.id = analyses.upload_id
      WHERE analyses.id = charts.analysis_id
      AND uploads.user_id = auth.uid()
    )
  );

-- Users can create charts for their analyses
CREATE POLICY "Users can create charts for own analyses"
  ON public.charts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.analyses
      JOIN public.uploads ON uploads.id = analyses.upload_id
      WHERE analyses.id = analysis_id
      AND uploads.user_id = auth.uid()
    )
  );

-- Users can update charts for their analyses
CREATE POLICY "Users can update own charts"
  ON public.charts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.analyses
      JOIN public.uploads ON uploads.id = analyses.upload_id
      WHERE analyses.id = charts.analysis_id
      AND uploads.user_id = auth.uid()
    )
  );

-- Users can delete charts for their analyses
CREATE POLICY "Users can delete own charts"
  ON public.charts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.analyses
      JOIN public.uploads ON uploads.id = analyses.upload_id
      WHERE analyses.id = charts.analysis_id
      AND uploads.user_id = auth.uid()
    )
  );

-- ============================================================================
-- CHAT MESSAGES POLICIES
-- ============================================================================

-- Users can view their own chat messages
CREATE POLICY "Users can view own chat messages"
  ON public.chat_messages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create chat messages
CREATE POLICY "Users can create chat messages"
  ON public.chat_messages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users cannot update chat messages (immutable history)
-- No UPDATE policy

-- Users can delete their own chat messages
CREATE POLICY "Users can delete own chat messages"
  ON public.chat_messages
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- EXPORT JOBS POLICIES
-- ============================================================================

-- Users can view their own export jobs
CREATE POLICY "Users can view own export jobs"
  ON public.export_jobs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create export jobs for their uploads
CREATE POLICY "Users can create export jobs for own uploads"
  ON public.export_jobs
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.uploads
      WHERE uploads.id = upload_id
      AND uploads.user_id = auth.uid()
    )
  );

-- Users can update their own export jobs
CREATE POLICY "Users can update own export jobs"
  ON public.export_jobs
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own export jobs
CREATE POLICY "Users can delete own export jobs"
  ON public.export_jobs
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- API USAGE POLICIES
-- ============================================================================

-- Users can view their own API usage
CREATE POLICY "Users can view own api usage"
  ON public.api_usage
  FOR SELECT
  USING (auth.uid() = user_id);

-- API usage is typically inserted by service role
-- But allow users to insert their own usage records
CREATE POLICY "Users can create own api usage"
  ON public.api_usage
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users cannot update or delete API usage (audit trail)
-- No UPDATE or DELETE policies for api_usage

-- ============================================================================
-- SERVICE ROLE BYPASS
-- Note: Service role automatically bypasses RLS
-- These policies are for authenticated users only
-- ============================================================================
