-- Simplify Chinese-English Structure to Single Table with JSON
-- This script modifies the chinese_english_articles table to include analysis_records as JSON

-- First, add the JSON column to store all analysis records
ALTER TABLE chinese_english_articles 
ADD COLUMN IF NOT EXISTS analysis_records JSONB DEFAULT '[]'::jsonb;

-- Add comment to explain the JSON structure
COMMENT ON COLUMN chinese_english_articles.analysis_records IS 
'JSON array containing all analysis records: [{id, selected_text, context_sentence, analysis, analysis_mode, user_notes, start_offset, end_offset, created_at}]';

-- Create index for efficient JSON queries (optional, for future use)
CREATE INDEX IF NOT EXISTS idx_chinese_english_analysis_mode 
ON chinese_english_articles USING GIN ((analysis_records));

-- Drop the separate word and sentence query tables since we no longer need them
-- (We'll keep them for now and drop them after confirming everything works)

-- Example JSON structure for analysis_records:
-- [
--   {
--     "id": "uuid-1",
--     "selected_text": "hello world",
--     "context_sentence": "Say hello world to everyone",
--     "analysis": "AI analysis result...",
--     "analysis_mode": "simple",
--     "user_notes": "User notes here",
--     "ai_notes": "AI generated notes",
--     "start_offset": 4,
--     "end_offset": 15,
--     "query_type": "ai_query",
--     "created_at": "2024-01-01T10:00:00Z"
--   }
-- ]