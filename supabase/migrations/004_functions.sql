-- ============================================================================
-- AI Data Insights Platform - Database Functions & Triggers
-- Migration: 004_functions.sql
-- Description: PostgreSQL functions and triggers for automated operations
-- ============================================================================

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- Automatically updates the updated_at column on row modification
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply updated_at trigger to profiles table
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- NEW USER PROFILE CREATION
-- Automatically creates a profile when a new user signs up
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users to create profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- USAGE COUNT INCREMENT
-- Safely increments usage count for a user
-- ============================================================================
CREATE OR REPLACE FUNCTION public.increment_usage_count(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
  v_result JSONB;
BEGIN
  -- Get current profile with lock
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'User not found'
    );
  END IF;

  -- Check quota
  IF v_profile.usage_count >= v_profile.usage_quota THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'error', 'Usage quota exceeded',
      'current_count', v_profile.usage_count,
      'quota', v_profile.usage_quota
    );
  END IF;

  -- Increment count
  UPDATE public.profiles
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'new_count', v_profile.usage_count + 1,
    'quota', v_profile.usage_quota,
    'remaining', v_profile.usage_quota - v_profile.usage_count - 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RESET USAGE COUNT
-- Resets usage count for a user (for billing cycle reset)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.reset_usage_count(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.profiles
  SET usage_count = 0,
      updated_at = NOW()
  WHERE id = p_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CHECK USER QUOTA
-- Checks if user can perform an analysis
-- ============================================================================
CREATE OR REPLACE FUNCTION public.check_user_quota(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_profile public.profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'allowed', FALSE,
      'error', 'User not found'
    );
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_profile.usage_count < v_profile.usage_quota,
    'current_count', v_profile.usage_count,
    'quota', v_profile.usage_quota,
    'remaining', GREATEST(0, v_profile.usage_quota - v_profile.usage_count),
    'subscription_tier', v_profile.subscription_tier
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UPDATE UPLOAD STATUS
-- Updates upload status and optionally sets processed_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_upload_status(
  p_upload_id UUID,
  p_status TEXT,
  p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.uploads
  SET
    status = p_status,
    error_message = CASE
      WHEN p_status = 'error' THEN COALESCE(p_error_message, error_message)
      ELSE NULL
    END,
    processed_at = CASE
      WHEN p_status IN ('ready', 'error') THEN NOW()
      ELSE processed_at
    END
  WHERE id = p_upload_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UPDATE ANALYSIS STATUS
-- Updates analysis status and optionally sets completed_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_analysis_status(
  p_analysis_id UUID,
  p_status TEXT,
  p_processing_time FLOAT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.analyses
  SET
    status = p_status,
    processing_time = COALESCE(p_processing_time, processing_time),
    completed_at = CASE
      WHEN p_status IN ('completed', 'error') THEN NOW()
      ELSE completed_at
    END
  WHERE id = p_analysis_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GET USER DASHBOARD DATA
-- Returns aggregated dashboard data for a user
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_dashboard(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_uploads', COUNT(DISTINCT u.id),
    'total_analyses', COUNT(DISTINCT a.id),
    'ready_uploads', COUNT(DISTINCT u.id) FILTER (WHERE u.status = 'ready'),
    'pending_uploads', COUNT(DISTINCT u.id) FILTER (WHERE u.status = 'pending'),
    'error_uploads', COUNT(DISTINCT u.id) FILTER (WHERE u.status = 'error'),
    'total_rows_analyzed', COALESCE(SUM(a.row_count), 0),
    'avg_health_score', ROUND(COALESCE(AVG(a.health_score), 0)::NUMERIC, 1),
    'total_insights', COUNT(DISTINCT i.id),
    'unread_insights', COUNT(DISTINCT i.id) FILTER (WHERE i.is_dismissed = FALSE),
    'recent_uploads', (
      SELECT jsonb_agg(row_to_json(r))
      FROM (
        SELECT
          u2.id,
          u2.original_filename,
          u2.status,
          u2.created_at,
          a2.health_score
        FROM public.uploads u2
        LEFT JOIN public.analyses a2 ON a2.upload_id = u2.id
        WHERE u2.user_id = p_user_id
        ORDER BY u2.created_at DESC
        LIMIT 5
      ) r
    )
  ) INTO v_result
  FROM public.uploads u
  LEFT JOIN public.analyses a ON a.upload_id = u.id
  LEFT JOIN public.insights i ON i.analysis_id = a.id
  WHERE u.user_id = p_user_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GET ANALYSIS SUMMARY
-- Returns complete analysis data with insights and charts
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_analysis_summary(p_analysis_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'analysis', row_to_json(a),
    'upload', row_to_json(u),
    'columns', (
      SELECT jsonb_agg(row_to_json(cm) ORDER BY cm.column_index)
      FROM public.column_metadata cm
      WHERE cm.analysis_id = a.id
    ),
    'insights', (
      SELECT jsonb_agg(row_to_json(i) ORDER BY i.display_order)
      FROM public.insights i
      WHERE i.analysis_id = a.id
      AND i.is_dismissed = FALSE
    ),
    'charts', (
      SELECT jsonb_agg(row_to_json(c) ORDER BY c.display_order)
      FROM public.charts c
      WHERE c.analysis_id = a.id
      AND c.is_featured = TRUE
    )
  ) INTO v_result
  FROM public.analyses a
  JOIN public.uploads u ON u.id = a.upload_id
  WHERE a.id = p_analysis_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CLEANUP EXPIRED UPLOADS
-- Deletes uploads past their expiration date
-- Should be called by a scheduled job
-- ============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_uploads()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  WITH deleted AS (
    DELETE FROM public.uploads
    WHERE expires_at < NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CLEANUP EXPIRED EXPORTS
-- Deletes export jobs past their expiration date
-- Should be called by a scheduled job
-- ============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_exports()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  WITH updated AS (
    UPDATE public.export_jobs
    SET status = 'expired',
        download_url = NULL
    WHERE expires_at < NOW()
    AND status = 'completed'
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM updated;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CALCULATE COLUMN QUALITY SCORE
-- Calculates a quality score for a column based on various factors
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calculate_column_quality(
  p_null_percentage FLOAT,
  p_unique_ratio FLOAT,
  p_is_consistent_type BOOLEAN
)
RETURNS FLOAT AS $$
DECLARE
  v_score FLOAT := 100;
BEGIN
  -- Penalize for nulls (up to 30 points)
  v_score := v_score - (p_null_percentage * 0.3);

  -- Reward uniqueness for identifiers, penalize for supposed unique columns
  -- This is a simplified heuristic
  IF p_unique_ratio < 0.01 THEN
    -- Very low uniqueness might indicate a constant column
    v_score := v_score - 10;
  END IF;

  -- Penalize for inconsistent types
  IF NOT p_is_consistent_type THEN
    v_score := v_score - 20;
  END IF;

  RETURN GREATEST(0, LEAST(100, v_score));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- RECORD API USAGE
-- Records an API call for usage tracking and billing
-- ============================================================================
CREATE OR REPLACE FUNCTION public.record_api_usage(
  p_user_id UUID,
  p_endpoint TEXT,
  p_tokens_used INTEGER DEFAULT 0,
  p_cost_cents INTEGER DEFAULT 0,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  v_usage_id UUID;
BEGIN
  INSERT INTO public.api_usage (user_id, endpoint, tokens_used, cost_cents, metadata)
  VALUES (p_user_id, p_endpoint, p_tokens_used, p_cost_cents, p_metadata)
  RETURNING id INTO v_usage_id;

  RETURN v_usage_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GET USER API USAGE SUMMARY
-- Returns API usage summary for billing period
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_user_api_usage(
  p_user_id UUID,
  p_start_date TIMESTAMPTZ DEFAULT DATE_TRUNC('month', NOW()),
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS JSONB AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'total_calls', COUNT(*),
      'total_tokens', COALESCE(SUM(tokens_used), 0),
      'total_cost_cents', COALESCE(SUM(cost_cents), 0),
      'by_endpoint', (
        SELECT jsonb_object_agg(endpoint, call_count)
        FROM (
          SELECT endpoint, COUNT(*) as call_count
          FROM public.api_usage
          WHERE user_id = p_user_id
          AND created_at BETWEEN p_start_date AND p_end_date
          GROUP BY endpoint
        ) e
      )
    )
    FROM public.api_usage
    WHERE user_id = p_user_id
    AND created_at BETWEEN p_start_date AND p_end_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEARCH ANALYSES
-- Full-text search across analyses and their insights
-- ============================================================================
CREATE OR REPLACE FUNCTION public.search_analyses(
  p_user_id UUID,
  p_query TEXT,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  analysis_id UUID,
  upload_id UUID,
  filename TEXT,
  health_score INTEGER,
  match_type TEXT,
  match_text TEXT,
  relevance FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (a.id)
    a.id as analysis_id,
    u.id as upload_id,
    u.original_filename as filename,
    a.health_score,
    CASE
      WHEN u.original_filename ILIKE '%' || p_query || '%' THEN 'filename'
      WHEN i.title ILIKE '%' || p_query || '%' THEN 'insight_title'
      WHEN i.description ILIKE '%' || p_query || '%' THEN 'insight_description'
      WHEN cm.column_name ILIKE '%' || p_query || '%' THEN 'column_name'
      ELSE 'other'
    END as match_type,
    CASE
      WHEN u.original_filename ILIKE '%' || p_query || '%' THEN u.original_filename
      WHEN i.title ILIKE '%' || p_query || '%' THEN i.title
      WHEN i.description ILIKE '%' || p_query || '%' THEN LEFT(i.description, 100)
      WHEN cm.column_name ILIKE '%' || p_query || '%' THEN cm.column_name
      ELSE ''
    END as match_text,
    similarity(
      COALESCE(u.original_filename, '') || ' ' ||
      COALESCE(i.title, '') || ' ' ||
      COALESCE(cm.column_name, ''),
      p_query
    ) as relevance
  FROM public.analyses a
  JOIN public.uploads u ON u.id = a.upload_id
  LEFT JOIN public.insights i ON i.analysis_id = a.id
  LEFT JOIN public.column_metadata cm ON cm.analysis_id = a.id
  WHERE u.user_id = p_user_id
  AND (
    u.original_filename ILIKE '%' || p_query || '%'
    OR i.title ILIKE '%' || p_query || '%'
    OR i.description ILIKE '%' || p_query || '%'
    OR cm.column_name ILIKE '%' || p_query || '%'
  )
  ORDER BY a.id, relevance DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
