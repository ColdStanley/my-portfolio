-- Create user_prompts table for JD2CV project
-- This table stores user-customized prompts for AI model interactions

CREATE TABLE IF NOT EXISTS user_prompts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    prompt_type VARCHAR(50) NOT NULL, 
    ai_model VARCHAR(30) NOT NULL DEFAULT 'deepseek',
    prompt_content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    -- Constraints
    CONSTRAINT user_prompts_user_id_fkey FOREIGN KEY (user_id) 
        REFERENCES auth.users(id) ON DELETE CASCADE,
    CONSTRAINT user_prompts_unique_user_type_model 
        UNIQUE (user_id, prompt_type, ai_model),
    CONSTRAINT user_prompts_prompt_type_check 
        CHECK (prompt_type IN ('jd_key_sentences', 'jd_keywords', 'cv_optimization')),
    CONSTRAINT user_prompts_ai_model_check 
        CHECK (ai_model IN ('deepseek', 'openai', 'claude', 'gemini'))
);

-- Add RLS (Row Level Security)
ALTER TABLE user_prompts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only see their own prompts" ON user_prompts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prompts" ON user_prompts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prompts" ON user_prompts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prompts" ON user_prompts
    FOR DELETE USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_user_prompts_user_id ON user_prompts (user_id);
CREATE INDEX idx_user_prompts_type_model ON user_prompts (prompt_type, ai_model);
CREATE INDEX idx_user_prompts_active ON user_prompts (is_active) WHERE is_active = true;

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_prompts_updated_at 
    BEFORE UPDATE ON user_prompts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default prompts (optional, for reference)
-- Note: These are just examples, actual defaults should be handled in application code
INSERT INTO user_prompts (user_id, prompt_type, ai_model, prompt_content) VALUES
-- Example default prompts (replace with actual user_id as needed)
-- ('00000000-0000-0000-0000-000000000000', 'jd_key_sentences', 'deepseek', 'Extract exactly 10 key sentences...'),
-- ('00000000-0000-0000-0000-000000000000', 'jd_keywords', 'deepseek', 'From the following key sentences...'),
-- ('00000000-0000-0000-0000-000000000000', 'cv_optimization', 'deepseek', 'Based on the following job keywords...');

-- Add comments for documentation
COMMENT ON TABLE user_prompts IS 'Stores user-customized prompts for AI model interactions in JD2CV project';
COMMENT ON COLUMN user_prompts.prompt_type IS 'Type of prompt: jd_key_sentences, jd_keywords, or cv_optimization';
COMMENT ON COLUMN user_prompts.ai_model IS 'AI model to use: deepseek (default), openai, claude, gemini';
COMMENT ON COLUMN user_prompts.prompt_content IS 'The actual prompt template with placeholders';
COMMENT ON COLUMN user_prompts.is_active IS 'Whether this prompt configuration is currently active';