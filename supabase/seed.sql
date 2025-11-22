-- ============================================================================
-- AI Data Insights Platform - Seed Data
-- File: seed.sql
-- Description: Sample data for development and testing
-- ============================================================================

-- Note: This seed file assumes you have a test user in auth.users
-- In development, create a user first via Supabase Auth UI or API
-- The profile will be auto-created by the trigger

-- ============================================================================
-- SAMPLE PROFILES (for testing without auth)
-- In production, profiles are created automatically via trigger
-- ============================================================================

-- Create a test user profile (use a consistent UUID for testing)
-- This simulates what the trigger would create
INSERT INTO public.profiles (id, email, full_name, subscription_tier, usage_quota, usage_count, preferences)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'demo@example.com',
    'Demo User',
    'free',
    10,
    3,
    '{"theme": "light", "notifications": true, "defaultChartType": "bar"}'
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    'pro@example.com',
    'Pro User',
    'pro',
    100,
    25,
    '{"theme": "dark", "notifications": true, "defaultChartType": "line"}'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE UPLOADS
-- ============================================================================

INSERT INTO public.uploads (id, user_id, filename, original_filename, storage_path, mime_type, file_size, status, metadata, created_at, processed_at)
VALUES
  -- Demo user uploads
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'sales_q4_2024_abc123.csv',
    'Sales Q4 2024.csv',
    'uploads/00000000-0000-0000-0000-000000000001/sales_q4_2024_abc123.csv',
    'text/csv',
    245678,
    'ready',
    '{"sheets": 1, "encoding": "utf-8", "hasHeaders": true}',
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days' + INTERVAL '30 seconds'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'inventory_dec_def456.xlsx',
    'Inventory December.xlsx',
    'uploads/00000000-0000-0000-0000-000000000001/inventory_dec_def456.xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    567890,
    'ready',
    '{"sheets": 3, "sheetNames": ["Products", "Locations", "Summary"]}',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days' + INTERVAL '45 seconds'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'customer_data_ghi789.csv',
    'Customer Data Export.csv',
    'uploads/00000000-0000-0000-0000-000000000001/customer_data_ghi789.csv',
    'text/csv',
    123456,
    'processing',
    '{"sheets": 1, "encoding": "utf-8"}',
    NOW() - INTERVAL '1 hour',
    NULL
  ),
  -- Pro user uploads
  (
    '10000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000002',
    'financial_report_jkl012.xlsx',
    'Q3 Financial Report.xlsx',
    'uploads/00000000-0000-0000-0000-000000000002/financial_report_jkl012.xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    890123,
    'ready',
    '{"sheets": 5, "sheetNames": ["Revenue", "Expenses", "P&L", "Balance Sheet", "Cash Flow"]}',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days' + INTERVAL '60 seconds'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE ANALYSES
-- ============================================================================

INSERT INTO public.analyses (id, upload_id, row_count, column_count, health_score, summary_stats, data_quality, dataset_type, status, processing_time, created_at, completed_at)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    1247,
    12,
    85,
    '{
      "totalRevenue": 1250000,
      "avgOrderValue": 1002.41,
      "totalOrders": 1247,
      "uniqueCustomers": 456,
      "topCategory": "Electronics"
    }',
    '{
      "completeness": 0.92,
      "consistency": 0.88,
      "accuracy": 0.95,
      "duplicateRate": 0.02
    }',
    'sales',
    'completed',
    12.5,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days' + INTERVAL '30 seconds'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000002',
    5432,
    8,
    72,
    '{
      "totalProducts": 5432,
      "totalValue": 2340000,
      "avgStockLevel": 145,
      "lowStockItems": 234,
      "outOfStock": 45
    }',
    '{
      "completeness": 0.78,
      "consistency": 0.82,
      "accuracy": 0.90,
      "duplicateRate": 0.05
    }',
    'inventory',
    'completed',
    28.3,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days' + INTERVAL '45 seconds'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000004',
    2890,
    15,
    94,
    '{
      "totalRevenue": 4500000,
      "totalExpenses": 3200000,
      "netProfit": 1300000,
      "profitMargin": 0.289
    }',
    '{
      "completeness": 0.98,
      "consistency": 0.96,
      "accuracy": 0.99,
      "duplicateRate": 0.001
    }',
    'finance',
    'completed',
    35.7,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days' + INTERVAL '60 seconds'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE COLUMN METADATA
-- ============================================================================

-- Sales Q4 columns
INSERT INTO public.column_metadata (id, analysis_id, column_name, column_index, detected_type, null_count, unique_count, null_percentage, statistics, sample_values, quality_score)
VALUES
  (
    '30000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'order_id',
    0,
    'string',
    0,
    1247,
    0.0,
    '{"isUnique": true, "pattern": "ORD-XXXXX"}',
    '["ORD-10001", "ORD-10002", "ORD-10003", "ORD-10004", "ORD-10005"]',
    100
  ),
  (
    '30000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'order_date',
    1,
    'date',
    0,
    92,
    0.0,
    '{"min": "2024-10-01", "max": "2024-12-31", "format": "YYYY-MM-DD"}',
    '["2024-10-01", "2024-10-15", "2024-11-01", "2024-12-15", "2024-12-31"]',
    100
  ),
  (
    '30000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000001',
    'customer_name',
    2,
    'string',
    15,
    456,
    1.2,
    '{"avgLength": 18, "maxLength": 45}',
    '["John Smith", "Jane Doe", "Bob Wilson", "Alice Brown", "Charlie Davis"]',
    95
  ),
  (
    '30000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000001',
    'amount',
    3,
    'number',
    0,
    823,
    0.0,
    '{"min": 25.50, "max": 15000.00, "mean": 1002.41, "median": 450.00, "std": 1245.67}',
    '[125.50, 450.00, 890.25, 1500.00, 5000.00]',
    100
  ),
  (
    '30000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000001',
    'category',
    4,
    'string',
    0,
    8,
    0.0,
    '{"categories": ["Electronics", "Clothing", "Home", "Sports", "Books", "Food", "Beauty", "Toys"]}',
    '["Electronics", "Clothing", "Home", "Sports", "Books"]',
    100
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE INSIGHTS
-- ============================================================================

INSERT INTO public.insights (id, analysis_id, title, description, category, urgency, confidence, actions, affected_columns, is_dismissed, display_order)
VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'Strong Q4 Sales Growth',
    'Sales increased by 23% compared to Q3, driven primarily by Electronics and Home categories. December showed the highest growth at 45% month-over-month.',
    'trend',
    'low',
    0.92,
    '[{"label": "View trend chart", "action": "showChart", "chartId": "trend-1"}, {"label": "Export report", "action": "export", "format": "pdf"}]',
    '["amount", "order_date", "category"]',
    FALSE,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'Unusual High-Value Order Detected',
    'Order ORD-11234 for $15,000 is 15x higher than the average order value. This may require verification to ensure it is not an error or fraud.',
    'anomaly',
    'high',
    0.88,
    '[{"label": "View order details", "action": "filter", "column": "order_id", "value": "ORD-11234"}, {"label": "Mark as reviewed", "action": "dismiss"}]',
    '["order_id", "amount"]',
    FALSE,
    2
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000001',
    'Missing Customer Names',
    '15 orders (1.2%) are missing customer names. This may impact customer relationship management and follow-up communications.',
    'quality',
    'medium',
    0.95,
    '[{"label": "Show missing data", "action": "filter", "column": "customer_name", "condition": "isNull"}, {"label": "Export for review", "action": "export", "format": "csv"}]',
    '["customer_name"]',
    FALSE,
    3
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000002',
    'Critical: 45 Items Out of Stock',
    '45 products are currently out of stock. This represents 0.8% of inventory but may include high-demand items that could impact sales.',
    'anomaly',
    'critical',
    0.99,
    '[{"label": "View out-of-stock items", "action": "filter", "column": "stock_level", "value": 0}, {"label": "Generate reorder report", "action": "export", "format": "csv"}]',
    '["product_id", "stock_level"]',
    FALSE,
    1
  ),
  (
    '40000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000002',
    'Recommend: Reorder 234 Low-Stock Items',
    'Based on historical sales velocity, 234 items are projected to run out within 2 weeks. Consider placing reorders now to maintain stock levels.',
    'recommendation',
    'high',
    0.85,
    '[{"label": "View low-stock items", "action": "filter", "column": "stock_level", "condition": "lessThan", "value": 50}, {"label": "Generate purchase order", "action": "export", "format": "xlsx"}]',
    '["product_id", "stock_level", "reorder_point"]',
    FALSE,
    2
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE CHARTS
-- ============================================================================

INSERT INTO public.charts (id, analysis_id, chart_type, title, description, config, data, columns_used, is_auto_generated, is_featured, display_order)
VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'line',
    'Daily Sales Trend',
    'Sales amount trend over Q4 2024',
    '{
      "xAxis": {"dataKey": "date", "label": "Date"},
      "yAxis": {"label": "Sales ($)"},
      "colors": ["#3b82f6"],
      "showGrid": true,
      "showTooltip": true
    }',
    '[
      {"date": "Oct 1", "sales": 12500},
      {"date": "Oct 15", "sales": 15200},
      {"date": "Nov 1", "sales": 18900},
      {"date": "Nov 15", "sales": 22100},
      {"date": "Dec 1", "sales": 28500},
      {"date": "Dec 15", "sales": 45200},
      {"date": "Dec 31", "sales": 52000}
    ]',
    ARRAY['order_date', 'amount'],
    TRUE,
    TRUE,
    1
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    'bar',
    'Sales by Category',
    'Total sales breakdown by product category',
    '{
      "xAxis": {"dataKey": "category", "label": "Category"},
      "yAxis": {"label": "Sales ($)"},
      "colors": ["#10b981"],
      "layout": "horizontal"
    }',
    '[
      {"category": "Electronics", "sales": 450000},
      {"category": "Clothing", "sales": 280000},
      {"category": "Home", "sales": 220000},
      {"category": "Sports", "sales": 150000},
      {"category": "Books", "sales": 80000},
      {"category": "Other", "sales": 70000}
    ]',
    ARRAY['category', 'amount'],
    TRUE,
    TRUE,
    2
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000001',
    'pie',
    'Order Distribution',
    'Distribution of orders by category',
    '{
      "colors": ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#6b7280"],
      "showLabels": true,
      "showPercentage": true
    }',
    '[
      {"name": "Electronics", "value": 35},
      {"name": "Clothing", "value": 25},
      {"name": "Home", "value": 18},
      {"name": "Sports", "value": 12},
      {"name": "Books", "value": 6},
      {"name": "Other", "value": 4}
    ]',
    ARRAY['category'],
    TRUE,
    TRUE,
    3
  ),
  (
    '50000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000002',
    'bar',
    'Stock Levels by Category',
    'Current inventory levels across product categories',
    '{
      "xAxis": {"dataKey": "category", "label": "Category"},
      "yAxis": {"label": "Units"},
      "colors": ["#f59e0b", "#ef4444"],
      "stacked": true
    }',
    '[
      {"category": "Electronics", "inStock": 1200, "lowStock": 45},
      {"category": "Clothing", "inStock": 2500, "lowStock": 120},
      {"category": "Home", "inStock": 800, "lowStock": 35},
      {"category": "Sports", "inStock": 450, "lowStock": 20},
      {"category": "Other", "inStock": 300, "lowStock": 14}
    ]',
    ARRAY['category', 'stock_level'],
    TRUE,
    TRUE,
    1
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE CHAT MESSAGES
-- ============================================================================

INSERT INTO public.chat_messages (id, analysis_id, user_id, role, content, chart_response, metadata)
VALUES
  (
    '60000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'user',
    'What were the top selling categories in December?',
    NULL,
    '{"timestamp": "2024-01-15T10:30:00Z"}'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'assistant',
    'Based on your Q4 2024 sales data, the top selling categories in December were:\n\n1. **Electronics** - $185,000 (41% of December sales)\n2. **Clothing** - $92,000 (20%)\n3. **Home** - $78,000 (17%)\n4. **Sports** - $55,000 (12%)\n5. **Books** - $45,000 (10%)\n\nElectronics showed particularly strong performance, likely due to holiday shopping. Would you like me to create a detailed breakdown chart?',
    NULL,
    '{"model": "gpt-4", "tokensUsed": 245}'
  ),
  (
    '60000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'user',
    'Yes, show me a chart comparing December to November',
    NULL,
    '{"timestamp": "2024-01-15T10:32:00Z"}'
  ),
  (
    '60000000-0000-0000-0000-000000000004',
    '20000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'assistant',
    'Here''s a comparison of sales by category between November and December:',
    '{
      "chartType": "bar",
      "title": "November vs December Sales",
      "config": {
        "xAxis": {"dataKey": "category"},
        "yAxis": {"label": "Sales ($)"},
        "colors": ["#94a3b8", "#3b82f6"]
      },
      "data": [
        {"category": "Electronics", "November": 120000, "December": 185000},
        {"category": "Clothing", "November": 75000, "December": 92000},
        {"category": "Home", "November": 62000, "December": 78000},
        {"category": "Sports", "November": 48000, "December": 55000},
        {"category": "Books", "November": 32000, "December": 45000}
      ]
    }',
    '{"model": "gpt-4", "tokensUsed": 312}'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE EXPORT JOBS
-- ============================================================================

INSERT INTO public.export_jobs (id, upload_id, user_id, export_type, status, storage_path, download_url, config, created_at, completed_at)
VALUES
  (
    '70000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'pdf',
    'completed',
    'exports/00000000-0000-0000-0000-000000000001/sales_q4_report.pdf',
    'https://example.supabase.co/storage/v1/object/sign/exports/sales_q4_report.pdf?token=xxx',
    '{"includeSummary": true, "includeCharts": true, "includeInsights": true}',
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days' + INTERVAL '15 seconds'
  ),
  (
    '70000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'csv',
    'completed',
    'exports/00000000-0000-0000-0000-000000000001/sales_filtered.csv',
    'https://example.supabase.co/storage/v1/object/sign/exports/sales_filtered.csv?token=yyy',
    '{"filters": {"category": "Electronics"}, "columns": ["order_id", "date", "amount"]}',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days' + INTERVAL '5 seconds'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SAMPLE API USAGE
-- ============================================================================

INSERT INTO public.api_usage (user_id, endpoint, tokens_used, cost_cents, metadata, created_at)
VALUES
  ('00000000-0000-0000-0000-000000000001', '/api/analyze', 1500, 3, '{"model": "gpt-4", "fileSize": 245678}', NOW() - INTERVAL '5 days'),
  ('00000000-0000-0000-0000-000000000001', '/api/chat', 250, 1, '{"model": "gpt-4"}', NOW() - INTERVAL '5 days'),
  ('00000000-0000-0000-0000-000000000001', '/api/chat', 312, 1, '{"model": "gpt-4"}', NOW() - INTERVAL '5 days'),
  ('00000000-0000-0000-0000-000000000001', '/api/analyze', 2800, 6, '{"model": "gpt-4", "fileSize": 567890}', NOW() - INTERVAL '3 days'),
  ('00000000-0000-0000-0000-000000000001', '/api/export', 0, 0, '{"format": "pdf"}', NOW() - INTERVAL '4 days'),
  ('00000000-0000-0000-0000-000000000002', '/api/analyze', 3500, 7, '{"model": "gpt-4", "fileSize": 890123}', NOW() - INTERVAL '2 days')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERIES (for testing)
-- ============================================================================

-- Uncomment to verify seed data:
-- SELECT 'profiles' as table_name, COUNT(*) as count FROM public.profiles
-- UNION ALL SELECT 'uploads', COUNT(*) FROM public.uploads
-- UNION ALL SELECT 'analyses', COUNT(*) FROM public.analyses
-- UNION ALL SELECT 'column_metadata', COUNT(*) FROM public.column_metadata
-- UNION ALL SELECT 'insights', COUNT(*) FROM public.insights
-- UNION ALL SELECT 'charts', COUNT(*) FROM public.charts
-- UNION ALL SELECT 'chat_messages', COUNT(*) FROM public.chat_messages
-- UNION ALL SELECT 'export_jobs', COUNT(*) FROM public.export_jobs
-- UNION ALL SELECT 'api_usage', COUNT(*) FROM public.api_usage;
