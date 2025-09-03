-- ================================================
-- API Integration Updates
-- File: 002_update_api_endpoints.sql  
-- Purpose: Helper functions and views for API integration
-- ================================================

-- ================================================
-- Helper Functions for API
-- ================================================

-- Function to get marketplace items with pagination and sorting
CREATE OR REPLACE FUNCTION get_marketplace_items(
  page_num INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 20,
  sort_by TEXT DEFAULT 'created_at',
  sort_order TEXT DEFAULT 'desc'
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  author_id UUID,
  downloads INTEGER,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  total_count BIGINT
) AS $$
BEGIN
  -- Validate parameters
  IF page_num < 1 THEN
    page_num := 1;
  END IF;
  
  IF page_size < 1 OR page_size > 100 THEN
    page_size := 20;
  END IF;
  
  IF sort_by NOT IN ('created_at', 'downloads', 'name') THEN
    sort_by := 'created_at';
  END IF;
  
  IF sort_order NOT IN ('asc', 'desc') THEN
    sort_order := 'desc';
  END IF;
  
  -- Return paginated results with total count
  RETURN QUERY
  SELECT 
    m.id,
    m.name,
    m.description,
    m.author_id,
    m.downloads,
    m.tags,
    m.created_at,
    COUNT(*) OVER() as total_count
  FROM marketplace_items m
  ORDER BY 
    CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN m.created_at END DESC,
    CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN m.created_at END ASC,
    CASE WHEN sort_by = 'downloads' AND sort_order = 'desc' THEN m.downloads END DESC,
    CASE WHEN sort_by = 'downloads' AND sort_order = 'asc' THEN m.downloads END ASC,
    CASE WHEN sort_by = 'name' AND sort_order = 'desc' THEN m.name END DESC,
    CASE WHEN sort_by = 'name' AND sort_order = 'asc' THEN m.name END ASC
  LIMIT page_size
  OFFSET (page_num - 1) * page_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search marketplace items by text
CREATE OR REPLACE FUNCTION search_marketplace_items(
  search_query TEXT,
  page_num INTEGER DEFAULT 1,
  page_size INTEGER DEFAULT 20
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  description TEXT,
  author_id UUID,
  downloads INTEGER,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  total_count BIGINT,
  rank REAL
) AS $$
BEGIN
  -- Validate parameters
  IF page_num < 1 THEN
    page_num := 1;
  END IF;
  
  IF page_size < 1 OR page_size > 100 THEN
    page_size := 20;
  END IF;
  
  -- Return search results with ranking
  RETURN QUERY
  SELECT 
    m.id,
    m.name,
    m.description,
    m.author_id,
    m.downloads,
    m.tags,
    m.created_at,
    COUNT(*) OVER() as total_count,
    ts_rank(
      to_tsvector('english', m.name || ' ' || COALESCE(m.description, '')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM marketplace_items m
  WHERE 
    to_tsvector('english', m.name || ' ' || COALESCE(m.description, '')) 
    @@ plainto_tsquery('english', search_query)
    OR m.tags && string_to_array(lower(search_query), ' ')
    OR lower(m.name) LIKE '%' || lower(search_query) || '%'
    OR lower(m.description) LIKE '%' || lower(search_query) || '%'
  ORDER BY rank DESC, m.downloads DESC
  LIMIT page_size
  OFFSET (page_num - 1) * page_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to validate and clean column data before insertion
CREATE OR REPLACE FUNCTION validate_marketplace_data(data JSONB)
RETURNS JSONB AS $$
DECLARE
  cleaned_data JSONB;
  card JSONB;
  cleaned_cards JSONB := '[]'::JSONB;
BEGIN
  -- Check if data has required structure
  IF NOT (data ? 'cards' AND jsonb_typeof(data->'cards') = 'array') THEN
    RAISE EXCEPTION 'Invalid data structure: missing cards array';
  END IF;
  
  -- Clean each card
  FOR card IN SELECT * FROM jsonb_array_elements(data->'cards')
  LOOP
    -- Remove sensitive/temporary fields and keep only essential data
    cleaned_cards := cleaned_cards || jsonb_build_array(
      jsonb_strip_nulls(
        jsonb_build_object(
          'id', card->'id',
          'type', card->'type',
          'title', card->'title',
          'description', card->'description',
          'buttonName', card->'buttonName',
          'promptText', card->'promptText',
          'aiModel', card->'aiModel'
        )
      )
    );
  END LOOP;
  
  -- Build cleaned data structure
  cleaned_data := jsonb_build_object(
    'id', data->'id',
    'cards', cleaned_cards
  );
  
  RETURN cleaned_data;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- Views for Common API Queries
-- ================================================

-- View for marketplace list (without full data)
CREATE OR REPLACE VIEW marketplace_items_list AS
SELECT 
  id,
  name,
  description,
  author_id,
  downloads,
  tags,
  created_at,
  updated_at
FROM marketplace_items;

-- View for popular items (top downloaded)
CREATE OR REPLACE VIEW marketplace_popular_items AS
SELECT 
  id,
  name,
  description,
  author_id,
  downloads,
  tags,
  created_at
FROM marketplace_items
WHERE downloads > 0
ORDER BY downloads DESC, created_at DESC
LIMIT 50;

-- View for recent items
CREATE OR REPLACE VIEW marketplace_recent_items AS
SELECT 
  id,
  name,
  description,
  author_id,
  downloads,
  tags,
  created_at
FROM marketplace_items
ORDER BY created_at DESC
LIMIT 50;

-- ================================================
-- Grant Permissions
-- ================================================

-- Grant execute permissions on functions to authenticated users
GRANT EXECUTE ON FUNCTION get_marketplace_items TO authenticated;
GRANT EXECUTE ON FUNCTION search_marketplace_items TO authenticated;
GRANT EXECUTE ON FUNCTION increment_marketplace_downloads TO authenticated;
GRANT EXECUTE ON FUNCTION validate_marketplace_data TO authenticated;

-- Grant select permissions on views
GRANT SELECT ON marketplace_items_list TO authenticated;
GRANT SELECT ON marketplace_popular_items TO authenticated;
GRANT SELECT ON marketplace_recent_items TO authenticated;

-- ================================================
-- Usage Examples (Comments)
-- ================================================

/*
-- Get first page of items sorted by downloads (descending)
SELECT * FROM get_marketplace_items(1, 10, 'downloads', 'desc');

-- Search for items containing "content"
SELECT * FROM search_marketplace_items('content writing', 1, 10);

-- Increment download count for an item
SELECT increment_marketplace_downloads('550e8400-e29b-41d4-a716-446655440000');

-- Get popular items
SELECT * FROM marketplace_popular_items LIMIT 10;

-- Get recent items
SELECT * FROM marketplace_recent_items LIMIT 10;
*/