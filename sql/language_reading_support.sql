-- Language Reading Support
-- Add language support to existing English Reading tables

-- Add language column to articles table
ALTER TABLE english_reading_articles 
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'english';

-- Add language column to word queries table
ALTER TABLE english_reading_word_queries 
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'english';

-- Add language column to sentence queries table  
ALTER TABLE english_reading_sentence_queries 
ADD COLUMN IF NOT EXISTS language VARCHAR(10) DEFAULT 'english';

-- Update existing records to have 'english' as default language
UPDATE english_reading_articles SET language = 'english' WHERE language IS NULL;
UPDATE english_reading_word_queries SET language = 'english' WHERE language IS NULL;
UPDATE english_reading_sentence_queries SET language = 'english' WHERE language IS NULL;

-- Add French-specific fields for word queries
ALTER TABLE english_reading_word_queries 
ADD COLUMN IF NOT EXISTS gender VARCHAR(20), -- masculin/féminin
ADD COLUMN IF NOT EXISTS conjugation_info TEXT; -- verb conjugation details

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_language ON english_reading_articles(language);
CREATE INDEX IF NOT EXISTS idx_word_queries_language ON english_reading_word_queries(language);  
CREATE INDEX IF NOT EXISTS idx_sentence_queries_language ON english_reading_sentence_queries(language);

-- Create constraint to ensure valid languages
ALTER TABLE english_reading_articles 
ADD CONSTRAINT IF NOT EXISTS chk_articles_language 
CHECK (language IN ('english', 'french'));

ALTER TABLE english_reading_word_queries 
ADD CONSTRAINT IF NOT EXISTS chk_word_queries_language 
CHECK (language IN ('english', 'french'));

ALTER TABLE english_reading_sentence_queries 
ADD CONSTRAINT IF NOT EXISTS chk_sentence_queries_language 
CHECK (language IN ('english', 'french'));