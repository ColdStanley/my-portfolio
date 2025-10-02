-- Migration: Add language fields to article2learn tables
-- Created: 2025-10-02
-- Description: Add article_language and mother_tongue fields to track language selections

-- Add language fields to article2learn_articles table
ALTER TABLE article2learn_articles
ADD COLUMN IF NOT EXISTS article_language TEXT,
ADD COLUMN IF NOT EXISTS mother_tongue TEXT;

-- Add language fields to article2learn_queries table
ALTER TABLE article2learn_queries
ADD COLUMN IF NOT EXISTS article_language TEXT,
ADD COLUMN IF NOT EXISTS mother_tongue TEXT;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_languages
ON article2learn_articles(article_language, mother_tongue);

CREATE INDEX IF NOT EXISTS idx_queries_languages
ON article2learn_queries(article_language, mother_tongue);

-- Add comments for documentation
COMMENT ON COLUMN article2learn_articles.article_language IS 'Language of the article content';
COMMENT ON COLUMN article2learn_articles.mother_tongue IS 'User''s mother tongue for translations';
COMMENT ON COLUMN article2learn_queries.article_language IS 'Article language used during query';
COMMENT ON COLUMN article2learn_queries.mother_tongue IS 'Mother tongue used during query';
