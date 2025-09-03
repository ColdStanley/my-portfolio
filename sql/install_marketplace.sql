-- ================================================
-- AI Card Studio Marketplace - Complete Installation Script
-- File: install_marketplace.sql
-- Purpose: Complete setup for marketplace functionality
-- Version: 1.0
-- ================================================

-- ================================================
-- Prerequisites Check
-- ================================================

-- Check if required extensions are available
DO $$
BEGIN
  -- Check for uuid-ossp extension (for UUID generation)
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') THEN
    RAISE NOTICE 'Installing uuid-ossp extension...';
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  END IF;
  
  -- Check for pg_trgm extension (for text search)
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    RAISE NOTICE 'Installing pg_trgm extension...';
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
  END IF;
  
  RAISE NOTICE 'Prerequisites check completed successfully.';
END
$$;

-- ================================================
-- Step 1: Create Main Table
-- ================================================

\echo 'Creating marketplace_items table...'

CREATE TABLE IF NOT EXISTS marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic information
  name TEXT NOT NULL CHECK (length(name) <= 100 AND length(trim(name)) > 0),
  description TEXT CHECK (length(description) <= 500),
  
  -- Column data (JSONB for efficient storage and querying)
  data JSONB NOT NULL,
  
  -- Security and deduplication
  content_hash VARCHAR(64) UNIQUE NOT NULL,
  
  -- Author information
  author_id UUID NOT NULL,
  
  -- Engagement metrics
  downloads INTEGER DEFAULT 0 NOT NULL CHECK (downloads >= 0),
  
  -- Categorization
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

\echo 'marketplace_items table created successfully.'

-- ================================================
-- Step 2: Create Indexes
-- ================================================

\echo 'Creating performance indexes...'

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_content_hash ON marketplace_items(content_hash);
CREATE INDEX IF NOT EXISTS idx_marketplace_author_id ON marketplace_items(author_id);

-- Sorting and pagination indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_downloads_desc ON marketplace_items(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_created_at_desc ON marketplace_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_name ON marketplace_items(name);

-- Full-text search optimization
CREATE INDEX IF NOT EXISTS idx_marketplace_text_search 
ON marketplace_items USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Tag search optimization
CREATE INDEX IF NOT EXISTS idx_marketplace_tags ON marketplace_items USING GIN(tags);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_marketplace_author_created ON marketplace_items(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_popular_items ON marketplace_items(downloads DESC, created_at DESC) WHERE downloads > 0;

\echo 'Indexes created successfully.'

-- ================================================
-- Step 3: Create Functions
-- ================================================

\echo 'Creating database functions...'

-- Function to atomically increment download count
CREATE OR REPLACE FUNCTION increment_marketplace_downloads(item_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE marketplace_items 
  SET downloads = downloads + 1,
      updated_at = NOW()
  WHERE id = item_id
  RETURNING downloads INTO new_count;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Marketplace item with id % not found', item_id;
  END IF;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_marketplace_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate column data
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
  
  cleaned_data := jsonb_build_object(
    'id', data->'id',
    'cards', cleaned_cards
  );
  
  RETURN cleaned_data;
END;
$$ LANGUAGE plpgsql;

-- Function for paginated item retrieval
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
  IF page_num < 1 THEN page_num := 1; END IF;
  IF page_size < 1 OR page_size > 100 THEN page_size := 20; END IF;
  IF sort_by NOT IN ('created_at', 'downloads', 'name') THEN sort_by := 'created_at'; END IF;
  IF sort_order NOT IN ('asc', 'desc') THEN sort_order := 'desc'; END IF;
  
  RETURN QUERY
  SELECT 
    m.id, m.name, m.description, m.author_id, m.downloads, m.tags, m.created_at,
    COUNT(*) OVER() as total_count
  FROM marketplace_items m
  ORDER BY 
    CASE WHEN sort_by = 'created_at' AND sort_order = 'desc' THEN m.created_at END DESC,
    CASE WHEN sort_by = 'created_at' AND sort_order = 'asc' THEN m.created_at END ASC,
    CASE WHEN sort_by = 'downloads' AND sort_order = 'desc' THEN m.downloads END DESC,
    CASE WHEN sort_by = 'downloads' AND sort_order = 'asc' THEN m.downloads END ASC,
    CASE WHEN sort_by = 'name' AND sort_order = 'desc' THEN m.name END DESC,
    CASE WHEN sort_by = 'name' AND sort_order = 'asc' THEN m.name END ASC
  LIMIT page_size OFFSET (page_num - 1) * page_size;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

\echo 'Database functions created successfully.'

-- ================================================
-- Step 4: Create Triggers
-- ================================================

\echo 'Creating triggers...'

CREATE TRIGGER trg_marketplace_items_updated_at
  BEFORE UPDATE ON marketplace_items
  FOR EACH ROW
  EXECUTE FUNCTION update_marketplace_updated_at();

\echo 'Triggers created successfully.'

-- ================================================
-- Step 5: Set up Row Level Security (Optional)
-- ================================================

\echo 'Setting up Row Level Security...'

-- Enable RLS
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

-- Anyone can read marketplace items
CREATE POLICY "marketplace_items_select_policy" 
ON marketplace_items FOR SELECT 
USING (true);

-- Users can only manage their own items
CREATE POLICY "marketplace_items_insert_policy" 
ON marketplace_items FOR INSERT 
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "marketplace_items_update_policy" 
ON marketplace_items FOR UPDATE 
USING (auth.uid() = author_id);

CREATE POLICY "marketplace_items_delete_policy" 
ON marketplace_items FOR DELETE 
USING (auth.uid() = author_id);

\echo 'Row Level Security configured successfully.'

-- ================================================
-- Step 6: Create Views
-- ================================================

\echo 'Creating helper views...'

-- View for marketplace list without full data
CREATE OR REPLACE VIEW marketplace_items_list AS
SELECT id, name, description, author_id, downloads, tags, created_at, updated_at
FROM marketplace_items;

-- View for popular items
CREATE OR REPLACE VIEW marketplace_popular_items AS
SELECT id, name, description, author_id, downloads, tags, created_at
FROM marketplace_items
WHERE downloads > 0
ORDER BY downloads DESC, created_at DESC;

\echo 'Views created successfully.'

-- ================================================
-- Step 7: Grant Permissions
-- ================================================

\echo 'Granting permissions...'

-- Grant function permissions
GRANT EXECUTE ON FUNCTION increment_marketplace_downloads TO authenticated;
GRANT EXECUTE ON FUNCTION validate_marketplace_data TO authenticated;
GRANT EXECUTE ON FUNCTION get_marketplace_items TO authenticated;

-- Grant view permissions
GRANT SELECT ON marketplace_items_list TO authenticated;
GRANT SELECT ON marketplace_popular_items TO authenticated;

\echo 'Permissions granted successfully.'

-- ================================================
-- Step 8: Add Documentation
-- ================================================

\echo 'Adding table documentation...'

COMMENT ON TABLE marketplace_items IS 'AI Card Studio Marketplace - stores shared workflow columns';
COMMENT ON COLUMN marketplace_items.id IS 'Primary key - auto-generated UUID';
COMMENT ON COLUMN marketplace_items.name IS 'Display name (max 100 chars)';
COMMENT ON COLUMN marketplace_items.description IS 'Description (max 500 chars)';
COMMENT ON COLUMN marketplace_items.data IS 'Column data - cleaned of sensitive info';
COMMENT ON COLUMN marketplace_items.content_hash IS 'SHA-256 hash to prevent duplicates';
COMMENT ON COLUMN marketplace_items.author_id IS 'User who shared this column';
COMMENT ON COLUMN marketplace_items.downloads IS 'Import count';
COMMENT ON COLUMN marketplace_items.tags IS 'Categorization tags';

-- ================================================
-- Step 9: Insert Sample Data (Optional)
-- ================================================

\echo 'Inserting sample data...'

INSERT INTO marketplace_items (name, description, data, content_hash, author_id, downloads, tags) 
VALUES 
(
  'Content Writing Assistant',
  'Complete workflow for generating blog posts, articles, and marketing content with AI assistance.',
  '{"id": "sample-col-1", "cards": [{"id": "info-1", "type": "info", "title": "Content Brief", "description": "Define your content goals, target audience, and key messaging."}, {"id": "aitool-1", "type": "aitool", "buttonName": "Generate Outline", "promptText": "Create a detailed blog post outline for: {{topic}}.", "aiModel": "deepseek"}]}',
  'demo-content-writing-hash',
  gen_random_uuid(),
  42,
  ARRAY['writing', 'content', 'marketing', 'ai']
),
(
  'Data Analysis Workflow', 
  'Step-by-step process for analyzing datasets and generating insights.',
  '{"id": "sample-col-2", "cards": [{"id": "info-2", "type": "info", "title": "Data Requirements", "description": "Ensure your dataset is clean and formatted."}, {"id": "aitool-2", "type": "aitool", "buttonName": "Analyze Data", "promptText": "Analyze this dataset: {{data}}", "aiModel": "openai"}]}',
  'demo-data-analysis-hash',
  gen_random_uuid(),
  28,
  ARRAY['analysis', 'data', 'insights']
),
(
  'Customer Support Bot',
  'Automated customer service responses for common support scenarios.',
  '{"id": "sample-col-3", "cards": [{"id": "info-3", "type": "info", "title": "Support Guidelines", "description": "Be helpful and professional."}, {"id": "aitool-3", "type": "aitool", "buttonName": "Generate Response", "promptText": "Create a support response for: {{issue}}", "aiModel": "deepseek"}]}',
  'demo-support-bot-hash',
  gen_random_uuid(),
  15,
  ARRAY['support', 'customer', 'automation']
)
ON CONFLICT (content_hash) DO NOTHING;

\echo 'Sample data inserted successfully.'

-- ================================================
-- Installation Complete
-- ================================================

\echo ''
\echo '================================================'
\echo 'AI Card Studio Marketplace installation complete!'
\echo '================================================'
\echo ''
\echo 'Summary:'
\echo '- marketplace_items table created with all constraints'
\echo '- Performance indexes created for fast queries'
\echo '- Helper functions for pagination and data validation'
\echo '- Row Level Security policies configured'
\echo '- Sample data inserted for testing'
\echo ''
\echo 'Next steps:'
\echo '1. Update your API endpoints to use the real database'
\echo '2. Test the marketplace functionality'
\echo '3. Monitor performance and adjust indexes as needed'
\echo ''
\echo 'Useful queries:'
\echo '- SELECT * FROM marketplace_items_list;'
\echo '- SELECT * FROM get_marketplace_items(1, 10, ''downloads'', ''desc'');'
\echo '- SELECT increment_marketplace_downloads(''<item-id>'');'
\echo '';

-- ================================================
-- Verification Queries
-- ================================================

-- Verify installation
DO $$
DECLARE
  table_count INTEGER;
  function_count INTEGER;
  index_count INTEGER;
  sample_count INTEGER;
BEGIN
  -- Check table exists
  SELECT COUNT(*) INTO table_count 
  FROM information_schema.tables 
  WHERE table_name = 'marketplace_items';
  
  -- Check functions exist
  SELECT COUNT(*) INTO function_count 
  FROM information_schema.routines 
  WHERE routine_name LIKE '%marketplace%';
  
  -- Check indexes exist
  SELECT COUNT(*) INTO index_count 
  FROM pg_indexes 
  WHERE tablename = 'marketplace_items';
  
  -- Check sample data
  SELECT COUNT(*) INTO sample_count FROM marketplace_items;
  
  RAISE NOTICE 'Installation verification:';
  RAISE NOTICE '- Tables: %', table_count;
  RAISE NOTICE '- Functions: %', function_count;
  RAISE NOTICE '- Indexes: %', index_count;
  RAISE NOTICE '- Sample items: %', sample_count;
  
  IF table_count = 1 AND function_count >= 4 AND index_count >= 6 THEN
    RAISE NOTICE 'Installation verified successfully! ✓';
  ELSE
    RAISE WARNING 'Installation may be incomplete. Please review the output above.';
  END IF;
END
$$;