-- Add mark type support to English Reading tables
ALTER TABLE english_reading_word_queries ADD COLUMN IF NOT EXISTS query_type VARCHAR(20) DEFAULT 'ai_query';
ALTER TABLE english_reading_sentence_queries ADD COLUMN IF NOT EXISTS query_type VARCHAR(20) DEFAULT 'ai_query';

-- Add user notes field for manual marks
ALTER TABLE english_reading_word_queries ADD COLUMN IF NOT EXISTS user_notes TEXT;
ALTER TABLE english_reading_sentence_queries ADD COLUMN IF NOT EXISTS user_notes TEXT;

-- Update existing records to have ai_query type
UPDATE english_reading_word_queries SET query_type = 'ai_query' WHERE query_type IS NULL;
UPDATE english_reading_sentence_queries SET query_type = 'ai_query' WHERE query_type IS NULL;