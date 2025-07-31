-- Add learning_records JSON field to chinese_french_articles table
-- This will store all learning data in a single JSON structure

ALTER TABLE chinese_french_articles 
ADD COLUMN learning_records JSONB DEFAULT '{"sentences": []}'::jsonb;

-- Add index for better JSON query performance
CREATE INDEX IF NOT EXISTS idx_chinese_french_learning_records 
ON chinese_french_articles USING GIN (learning_records);

-- Add comment
COMMENT ON COLUMN chinese_french_articles.learning_records IS 'JSON structure storing sentence learning records with words, phrases, grammar, and others analysis';

-- Example structure:
-- learning_records: {
--   "sentences": [
--     {
--       "id": "1234567890",
--       "text": "Le chat mange la souris.",
--       "startOffset": 100,
--       "endOffset": 125,
--       "timestamp": 1643723400000,
--       "words": [
--         {
--           "id": "word_1",
--           "query": "mange",
--           "response": "AI analysis...",
--           "timestamp": 1643723401000
--         }
--       ],
--       "phrases": [...],
--       "grammar": [...],
--       "others": [...]
--     }
--   ]
-- }