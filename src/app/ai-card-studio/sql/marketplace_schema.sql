-- Create marketplace_items table
CREATE TABLE IF NOT EXISTS marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(name) <= 100),
  description TEXT CHECK (length(description) <= 500),
  data JSONB NOT NULL,
  content_hash VARCHAR(64) UNIQUE NOT NULL,
  author_id UUID NOT NULL, -- In a real app, this would reference users(id)
  downloads INTEGER DEFAULT 0 NOT NULL CHECK (downloads >= 0),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_content_hash ON marketplace_items(content_hash);
CREATE INDEX IF NOT EXISTS idx_marketplace_author_id ON marketplace_items(author_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_downloads ON marketplace_items(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_created_at ON marketplace_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_tags ON marketplace_items USING GIN(tags);

-- Create function to increment download count atomically
CREATE OR REPLACE FUNCTION increment_downloads(item_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE marketplace_items 
  SET downloads = downloads + 1 
  WHERE id = item_id;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE marketplace_items IS 'Stores shared columns from AI Card Studio marketplace';
COMMENT ON COLUMN marketplace_items.content_hash IS 'SHA-256 hash of column content to prevent duplicates';
COMMENT ON COLUMN marketplace_items.data IS 'Complete column data with cards';
COMMENT ON COLUMN marketplace_items.original_author_id IS 'ID of the user who originally created this content';