-- Add ai_notes columns to language reading tables
-- This enables saving AI assistant responses for both English and French reading features

-- English Reading Tables
ALTER TABLE english_reading_word_queries 
ADD COLUMN IF NOT EXISTS ai_notes TEXT;

ALTER TABLE english_reading_sentence_queries 
ADD COLUMN IF NOT EXISTS ai_notes TEXT;

-- French Reading Tables (if they exist)
ALTER TABLE french_reading_word_queries 
ADD COLUMN IF NOT EXISTS ai_notes TEXT;

ALTER TABLE french_reading_sentence_queries 
ADD COLUMN IF NOT EXISTS ai_notes TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_english_reading_word_queries_ai_notes 
ON english_reading_word_queries(ai_notes) WHERE ai_notes IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_english_reading_sentence_queries_ai_notes 
ON english_reading_sentence_queries(ai_notes) WHERE ai_notes IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_french_reading_word_queries_ai_notes 
ON french_reading_word_queries(ai_notes) WHERE ai_notes IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_french_reading_sentence_queries_ai_notes 
ON french_reading_sentence_queries(ai_notes) WHERE ai_notes IS NOT NULL;