-- Schema Migration: Add analysis_mode support and missing fields
-- Run this after the existing english_reading_schema.sql

-- Update english_reading_word_queries table to add missing fields
ALTER TABLE english_reading_word_queries 
ADD COLUMN IF NOT EXISTS part_of_speech VARCHAR(100),
ADD COLUMN IF NOT EXISTS root_form VARCHAR(255),
ADD COLUMN IF NOT EXISTS example_translation TEXT,
ADD COLUMN IF NOT EXISTS query_type VARCHAR(50) DEFAULT 'ai_query',
ADD COLUMN IF NOT EXISTS user_notes TEXT,
ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'english',
ADD COLUMN IF NOT EXISTS analysis_mode VARCHAR(20) DEFAULT 'simple',
ADD COLUMN IF NOT EXISTS gender VARCHAR(20), -- For French words
ADD COLUMN IF NOT EXISTS conjugation_info TEXT, -- For French verbs
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update english_reading_sentence_queries table to add missing fields  
ALTER TABLE english_reading_sentence_queries
ADD COLUMN IF NOT EXISTS query_type VARCHAR(50) DEFAULT 'ai_query',
ADD COLUMN IF NOT EXISTS user_notes TEXT,
ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'english',
ADD COLUMN IF NOT EXISTS analysis_mode VARCHAR(20) DEFAULT 'simple',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update english_reading_articles table to add missing fields
ALTER TABLE english_reading_articles
ADD COLUMN IF NOT EXISTS language VARCHAR(50) DEFAULT 'english',
ADD COLUMN IF NOT EXISTS background_image_url TEXT,
ADD COLUMN IF NOT EXISTS source_url TEXT,
ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20);

-- Create index for better performance on analysis_mode queries
CREATE INDEX IF NOT EXISTS idx_word_queries_analysis_mode ON english_reading_word_queries(analysis_mode);
CREATE INDEX IF NOT EXISTS idx_sentence_queries_analysis_mode ON english_reading_sentence_queries(analysis_mode);
CREATE INDEX IF NOT EXISTS idx_word_queries_language ON english_reading_word_queries(language);
CREATE INDEX IF NOT EXISTS idx_sentence_queries_language ON english_reading_sentence_queries(language);

-- Add constraints for analysis_mode values
ALTER TABLE english_reading_word_queries 
ADD CONSTRAINT IF NOT EXISTS chk_word_analysis_mode 
CHECK (analysis_mode IN ('mark', 'simple', 'deep', 'grammar'));

ALTER TABLE english_reading_sentence_queries 
ADD CONSTRAINT IF NOT EXISTS chk_sentence_analysis_mode 
CHECK (analysis_mode IN ('mark', 'simple', 'deep', 'grammar'));

-- Add constraints for language values  
ALTER TABLE english_reading_word_queries
ADD CONSTRAINT IF NOT EXISTS chk_word_language
CHECK (language IN ('english', 'french', 'spanish', 'german', 'italian'));

ALTER TABLE english_reading_sentence_queries
ADD CONSTRAINT IF NOT EXISTS chk_sentence_language  
CHECK (language IN ('english', 'french', 'spanish', 'german', 'italian'));

ALTER TABLE english_reading_articles
ADD CONSTRAINT IF NOT EXISTS chk_article_language
CHECK (language IN ('english', 'french', 'spanish', 'german', 'italian'));

-- Update timestamp trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_word_queries_updated_at ON english_reading_word_queries;
CREATE TRIGGER update_word_queries_updated_at 
    BEFORE UPDATE ON english_reading_word_queries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sentence_queries_updated_at ON english_reading_sentence_queries;
CREATE TRIGGER update_sentence_queries_updated_at 
    BEFORE UPDATE ON english_reading_sentence_queries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_articles_updated_at ON english_reading_articles;
CREATE TRIGGER update_articles_updated_at 
    BEFORE UPDATE ON english_reading_articles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data to test analysis_mode field (optional)
-- DELETE FROM english_reading_word_queries WHERE word_text = 'test_analysis_mode';
-- INSERT INTO english_reading_word_queries (
--   article_id, word_text, definition, part_of_speech, root_form,
--   examples, example_translation, start_offset, end_offset,
--   query_type, language, analysis_mode
-- ) VALUES (
--   1, 'test_analysis_mode', 'Test definition', 'noun', 'test',
--   ARRAY['Test example sentence.'], 'Test translation', 0, 17,
--   'ai_query', 'english', 'deep'
-- );

COMMENT ON COLUMN english_reading_word_queries.analysis_mode IS 'Analysis mode: mark (basic marking), simple (standard analysis), deep (comparative analysis with examples), grammar (structured grammar analysis)';
COMMENT ON COLUMN english_reading_sentence_queries.analysis_mode IS 'Analysis mode: mark (basic marking), simple (standard analysis), deep (comparative analysis with examples), grammar (structured grammar analysis)';
COMMENT ON COLUMN english_reading_word_queries.gender IS 'Grammatical gender for French/Spanish/German words (masculine/feminine/neuter)';
COMMENT ON COLUMN english_reading_word_queries.conjugation_info IS 'Verb conjugation information for French/Spanish/German verbs';