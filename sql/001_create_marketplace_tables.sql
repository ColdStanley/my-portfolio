-- ================================================
-- AI Card Studio Marketplace Database Schema
-- File: 001_create_marketplace_tables.sql
-- Purpose: Create marketplace_items table and related structures
-- ================================================

-- Create marketplace_items table
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
  -- Note: In production, add foreign key constraint to users table:
  -- CONSTRAINT fk_marketplace_author FOREIGN KEY (author_id) REFERENCES auth.users(id)
  
  -- Engagement metrics
  downloads INTEGER DEFAULT 0 NOT NULL CHECK (downloads >= 0),
  
  -- Categorization
  tags TEXT[] DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- Indexes for Performance Optimization
-- ================================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_content_hash 
ON marketplace_items(content_hash);

CREATE INDEX IF NOT EXISTS idx_marketplace_author_id 
ON marketplace_items(author_id);

-- Sorting and pagination indexes
CREATE INDEX IF NOT EXISTS idx_marketplace_downloads_desc 
ON marketplace_items(downloads DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_created_at_desc 
ON marketplace_items(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marketplace_name 
ON marketplace_items(name);

-- Full-text search on name and description
CREATE INDEX IF NOT EXISTS idx_marketplace_text_search 
ON marketplace_items USING GIN(to_tsvector('english', name || ' ' || COALESCE(description, '')));

-- Tag search optimization
CREATE INDEX IF NOT EXISTS idx_marketplace_tags 
ON marketplace_items USING GIN(tags);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_marketplace_author_created 
ON marketplace_items(author_id, created_at DESC);

-- ================================================
-- Database Functions
-- ================================================

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

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_marketplace_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- Triggers
-- ================================================

-- Trigger to automatically update updated_at column
CREATE TRIGGER trg_marketplace_items_updated_at
  BEFORE UPDATE ON marketplace_items
  FOR EACH ROW
  EXECUTE FUNCTION update_marketplace_updated_at();

-- ================================================
-- Row Level Security (RLS) Policies
-- ================================================

-- Enable RLS on the table
ALTER TABLE marketplace_items ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read marketplace items
CREATE POLICY "marketplace_items_select_policy" 
ON marketplace_items FOR SELECT 
USING (true);

-- Policy: Users can only insert their own items
CREATE POLICY "marketplace_items_insert_policy" 
ON marketplace_items FOR INSERT 
WITH CHECK (auth.uid() = author_id);

-- Policy: Users can only update their own items
CREATE POLICY "marketplace_items_update_policy" 
ON marketplace_items FOR UPDATE 
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Policy: Users can only delete their own items
CREATE POLICY "marketplace_items_delete_policy" 
ON marketplace_items FOR DELETE 
USING (auth.uid() = author_id);

-- ================================================
-- Comments for Documentation
-- ================================================

COMMENT ON TABLE marketplace_items IS 'Stores shared columns from AI Card Studio marketplace';
COMMENT ON COLUMN marketplace_items.id IS 'Primary key - UUID generated automatically';
COMMENT ON COLUMN marketplace_items.name IS 'Display name of the shared column (max 100 chars)';
COMMENT ON COLUMN marketplace_items.description IS 'Detailed description of the column functionality (max 500 chars)';
COMMENT ON COLUMN marketplace_items.data IS 'Complete column data including cards - cleaned of sensitive information';
COMMENT ON COLUMN marketplace_items.content_hash IS 'SHA-256 hash of column content to prevent duplicate uploads';
COMMENT ON COLUMN marketplace_items.author_id IS 'UUID of the user who shared this column';
COMMENT ON COLUMN marketplace_items.downloads IS 'Number of times this column has been imported';
COMMENT ON COLUMN marketplace_items.tags IS 'Array of tags for categorization and search';
COMMENT ON COLUMN marketplace_items.created_at IS 'Timestamp when the item was first shared';
COMMENT ON COLUMN marketplace_items.updated_at IS 'Timestamp when the item was last modified';

-- ================================================
-- Sample Data (Optional - for testing)
-- ================================================

-- Uncomment the following lines to insert sample data for testing:

/*
INSERT INTO marketplace_items (name, description, data, content_hash, author_id, downloads, tags) VALUES 
(
  'Content Writing Assistant',
  'A complete workflow for generating blog posts, articles, and marketing content with AI assistance.',
  '{"id": "sample-col-1", "cards": [{"id": "info-1", "type": "info", "title": "Content Brief", "description": "Define your content goals, target audience, and key messaging before writing."}, {"id": "aitool-1", "type": "aitool", "buttonName": "Generate Outline", "promptText": "Create a detailed blog post outline for: {{topic}}. Include introduction, main points, and conclusion.", "aiModel": "deepseek"}]}',
  'sample-hash-content-writing',
  '00000000-0000-0000-0000-000000000001',
  45,
  ARRAY['writing', 'content', 'marketing', 'ai']
),
(
  'Data Analysis Workflow', 
  'Step-by-step process for analyzing datasets, generating insights, and creating data-driven reports.',
  '{"id": "sample-col-2", "cards": [{"id": "info-2", "type": "info", "title": "Data Requirements", "description": "Ensure your dataset is clean and properly formatted."}, {"id": "aitool-2", "type": "aitool", "buttonName": "Analyze Data", "promptText": "Analyze this dataset and provide key insights: {{data}}", "aiModel": "openai"}]}',
  'sample-hash-data-analysis',
  '00000000-0000-0000-0000-000000000002', 
  23,
  ARRAY['analysis', 'data', 'insights', 'statistics']
);
*/