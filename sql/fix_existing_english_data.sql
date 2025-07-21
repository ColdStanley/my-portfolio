-- Fix existing English data to have proper language values
-- This ensures backward compatibility with existing data

-- Update articles without language to be 'english'
UPDATE english_reading_articles 
SET language = 'english' 
WHERE language IS NULL OR language = '';

-- Update word queries without language to be 'english'
UPDATE english_reading_word_queries 
SET language = 'english' 
WHERE language IS NULL OR language = '';

-- Update sentence queries without language to be 'english'
UPDATE english_reading_sentence_queries 
SET language = 'english' 
WHERE language IS NULL OR language = '';

-- Verify the updates
SELECT 'Articles updated:' as info, COUNT(*) as count 
FROM english_reading_articles 
WHERE language = 'english';

SELECT 'Word queries updated:' as info, COUNT(*) as count 
FROM english_reading_word_queries 
WHERE language = 'english';

SELECT 'Sentence queries updated:' as info, COUNT(*) as count 
FROM english_reading_sentence_queries 
WHERE language = 'english';