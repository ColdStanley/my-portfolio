-- ================================================
-- Performance Optimizations for Marketplace
-- File: 003_performance_optimizations.sql
-- Purpose: Additional indexes and optimizations for production
-- ================================================

-- ================================================
-- Advanced Indexes for Complex Queries
-- ================================================

-- Partial index for active items (items with downloads)
CREATE INDEX IF NOT EXISTS idx_marketplace_popular_items 
ON marketplace_items(downloads DESC, created_at DESC) 
WHERE downloads > 0;

-- Partial index for recent items (last 30 days)
CREATE INDEX IF NOT EXISTS idx_marketplace_recent_active 
ON marketplace_items(created_at DESC) 
WHERE created_at > NOW() - INTERVAL '30 days';

-- Composite index for author's items with download stats
CREATE INDEX IF NOT EXISTS idx_marketplace_author_stats 
ON marketplace_items(author_id, downloads DESC, created_at DESC);

-- Index for tag-based filtering with downloads
CREATE INDEX IF NOT EXISTS idx_marketplace_tags_downloads 
ON marketplace_items USING GIN(tags) 
WHERE downloads > 0;

-- ================================================
-- Database Statistics and Maintenance
-- ================================================

-- Function to update table statistics (run periodically)
CREATE OR REPLACE FUNCTION update_marketplace_statistics()
RETURNS VOID AS $$
BEGIN
  -- Update table statistics for better query planning
  ANALYZE marketplace_items;
  
  -- Log maintenance activity
  INSERT INTO pg_stat_statements_reset();
  
  RAISE NOTICE 'Marketplace statistics updated at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- Materialized Views for Heavy Queries
-- ================================================

-- Materialized view for tag statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS marketplace_tag_stats AS
SELECT 
  tag,
  COUNT(*) as item_count,
  SUM(downloads) as total_downloads,
  AVG(downloads)::INTEGER as avg_downloads,
  MAX(created_at) as latest_item
FROM marketplace_items m
CROSS JOIN LATERAL unnest(m.tags) as tag
GROUP BY tag
HAVING COUNT(*) >= 2  -- Only tags with 2+ items
ORDER BY total_downloads DESC, item_count DESC;

-- Create unique index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_marketplace_tag_stats_unique 
ON marketplace_tag_stats(tag);

-- Function to refresh tag statistics
CREATE OR REPLACE FUNCTION refresh_marketplace_tag_stats()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY marketplace_tag_stats;
  RAISE NOTICE 'Marketplace tag statistics refreshed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- Materialized view for trending items (items gaining downloads)
CREATE MATERIALIZED VIEW IF NOT EXISTS marketplace_trending_items AS
WITH recent_activity AS (
  SELECT 
    id,
    name,
    description,
    author_id,
    downloads,
    tags,
    created_at,
    -- Calculate trend score based on downloads and recency
    (downloads::FLOAT / GREATEST(1, EXTRACT(days FROM NOW() - created_at))) as trend_score
  FROM marketplace_items
  WHERE created_at > NOW() - INTERVAL '90 days'  -- Last 90 days
    AND downloads > 0
)
SELECT *
FROM recent_activity
ORDER BY trend_score DESC, downloads DESC
LIMIT 100;

-- Create unique index on trending items view
CREATE UNIQUE INDEX IF NOT EXISTS idx_marketplace_trending_unique 
ON marketplace_trending_items(id);

-- ================================================
-- Performance Monitoring Functions
-- ================================================

-- Function to get table size and statistics
CREATE OR REPLACE FUNCTION get_marketplace_table_stats()
RETURNS TABLE(
  table_name TEXT,
  row_count BIGINT,
  table_size TEXT,
  index_size TEXT,
  total_size TEXT,
  last_vacuum TIMESTAMP,
  last_analyze TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'marketplace_items'::TEXT,
    (SELECT COUNT(*) FROM marketplace_items),
    pg_size_pretty(pg_total_relation_size('marketplace_items')),
    pg_size_pretty(pg_indexes_size('marketplace_items')),
    pg_size_pretty(pg_total_relation_size('marketplace_items') + pg_indexes_size('marketplace_items')),
    (SELECT last_vacuum FROM pg_stat_user_tables WHERE relname = 'marketplace_items'),
    (SELECT last_analyze FROM pg_stat_user_tables WHERE relname = 'marketplace_items');
END;
$$ LANGUAGE plpgsql;

-- Function to get slow query statistics
CREATE OR REPLACE FUNCTION get_marketplace_query_stats()
RETURNS TABLE(
  query_type TEXT,
  avg_duration INTERVAL,
  total_calls BIGINT,
  query_text TEXT
) AS $$
BEGIN
  -- This function requires pg_stat_statements extension
  -- Enable with: CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
  
  RETURN QUERY
  SELECT 
    'marketplace'::TEXT as query_type,
    (mean_exec_time * interval '1 millisecond') as avg_duration,
    calls as total_calls,
    LEFT(query, 100) as query_text
  FROM pg_stat_statements 
  WHERE query ILIKE '%marketplace_items%'
    AND calls > 10
  ORDER BY mean_exec_time DESC
  LIMIT 10;
  
  EXCEPTION
    WHEN undefined_table THEN
      RAISE NOTICE 'pg_stat_statements extension not available. Install with: CREATE EXTENSION pg_stat_statements;';
      RETURN;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- Automated Maintenance Tasks
-- ================================================

-- Function to perform routine maintenance
CREATE OR REPLACE FUNCTION marketplace_routine_maintenance()
RETURNS VOID AS $$
BEGIN
  -- Update statistics
  PERFORM update_marketplace_statistics();
  
  -- Refresh materialized views
  PERFORM refresh_marketplace_tag_stats();
  REFRESH MATERIALIZED VIEW CONCURRENTLY marketplace_trending_items;
  
  -- Clean up old temporary data (if any)
  -- This is a placeholder for any future cleanup needs
  
  RAISE NOTICE 'Marketplace routine maintenance completed at %', NOW();
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- Grant Permissions
-- ================================================

-- Grant execute permissions on maintenance functions to service role
GRANT EXECUTE ON FUNCTION update_marketplace_statistics TO service_role;
GRANT EXECUTE ON FUNCTION refresh_marketplace_tag_stats TO service_role;
GRANT EXECUTE ON FUNCTION marketplace_routine_maintenance TO service_role;

-- Grant select permissions on statistics functions to authenticated users
GRANT EXECUTE ON FUNCTION get_marketplace_table_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_marketplace_query_stats TO authenticated;

-- Grant select on materialized views
GRANT SELECT ON marketplace_tag_stats TO authenticated;
GRANT SELECT ON marketplace_trending_items TO authenticated;

-- ================================================
-- Scheduled Maintenance (Comments for Cron Setup)
-- ================================================

/*
-- To set up automated maintenance, you can use pg_cron extension:
-- (This needs to be run as a superuser)

-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule routine maintenance to run daily at 2 AM
SELECT cron.schedule('marketplace-maintenance', '0 2 * * *', 'SELECT marketplace_routine_maintenance();');

-- Schedule tag statistics refresh every 4 hours
SELECT cron.schedule('marketplace-tag-refresh', '0 */4 * * *', 'SELECT refresh_marketplace_tag_stats();');

-- View scheduled jobs
SELECT * FROM cron.job;

-- Remove a scheduled job (if needed)
-- SELECT cron.unschedule('marketplace-maintenance');
*/

-- ================================================
-- Usage Examples (Comments)
-- ================================================

/*
-- Get table statistics
SELECT * FROM get_marketplace_table_stats();

-- Get trending items
SELECT * FROM marketplace_trending_items LIMIT 10;

-- Get popular tags
SELECT * FROM marketplace_tag_stats ORDER BY total_downloads DESC LIMIT 10;

-- Run maintenance manually
SELECT marketplace_routine_maintenance();

-- Get query performance stats
SELECT * FROM get_marketplace_query_stats();
*/