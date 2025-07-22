-- Add ai_notes columns to reading tables
-- This enables saving AI assistant responses for both English and French reading features
-- (Both languages use the same tables, differentiated by the 'language' column)

-- Reading Tables (supports both English and French)
ALTER TABLE english_reading_word_queries 
ADD COLUMN IF NOT EXISTS ai_notes TEXT;

ALTER TABLE english_reading_sentence_queries 
ADD COLUMN IF NOT EXISTS ai_notes TEXT;

-- Add indexes for better performance (optional)
CREATE INDEX IF NOT EXISTS idx_english_reading_word_queries_ai_notes 
ON english_reading_word_queries(ai_notes) WHERE ai_notes IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_english_reading_sentence_queries_ai_notes 
ON english_reading_sentence_queries(ai_notes) WHERE ai_notes IS NOT NULL;