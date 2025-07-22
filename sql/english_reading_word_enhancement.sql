-- English Reading Word Query Enhancement
-- Add new fields for improved word analysis

ALTER TABLE english_reading_word_queries 
ADD COLUMN IF NOT EXISTS part_of_speech VARCHAR(50),
ADD COLUMN IF NOT EXISTS root_form VARCHAR(255),
ADD COLUMN IF NOT EXISTS example_translation TEXT,
ADD COLUMN IF NOT EXISTS query_type VARCHAR(20) DEFAULT 'ai_query',
ADD COLUMN IF NOT EXISTS user_notes TEXT;

-- Update existing records to have default query_type if needed
UPDATE english_reading_word_queries 
SET query_type = 'ai_query' 
WHERE query_type IS NULL;

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_english_reading_word_queries_article_id 
ON english_reading_word_queries(article_id);
CREATE INDEX IF NOT EXISTS idx_english_reading_word_queries_query_type 
ON english_reading_word_queries(query_type);