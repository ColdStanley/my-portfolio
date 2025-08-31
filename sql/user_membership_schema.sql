-- 用户产品会员关系表 - 支持多用户认证系统
CREATE TABLE IF NOT EXISTS user_product_membership (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  membership_tier TEXT NOT NULL CHECK (membership_tier IN ('guest', 'registered', 'pro', 'vip', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP, -- 可选的过期时间，用于付费会员
  UNIQUE(user_id, product_id)
);

-- 产品定义表
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  default_tier TEXT NOT NULL DEFAULT 'registered',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- feelink相关表
CREATE TABLE IF NOT EXISTS feelink_quotes (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL表示模板
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  quotes TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'User', -- 'Template' 或 'User'
  web_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- IELTS Speaking相关表
CREATE TABLE IF NOT EXISTS ielts_speaking_questions (
  id SERIAL PRIMARY KEY,
  part INTEGER NOT NULL CHECK (part IN (1, 2, 3)),
  topic TEXT NOT NULL,
  question TEXT NOT NULL,
  sample_answer TEXT,
  keywords TEXT[],
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户练习记录表
CREATE TABLE IF NOT EXISTS user_speaking_practice (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES ielts_speaking_questions(id) ON DELETE CASCADE,
  user_answer TEXT,
  audio_url TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 9),
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 启用RLS (Row Level Security)
ALTER TABLE user_product_membership ENABLE ROW LEVEL SECURITY;
ALTER TABLE feelink_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_speaking_practice ENABLE ROW LEVEL SECURITY;

-- user_product_membership RLS策略
CREATE POLICY "Users can view own membership" ON user_product_membership
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own membership" ON user_product_membership
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own membership" ON user_product_membership
  FOR UPDATE USING (auth.uid() = user_id);

-- feelink_quotes RLS策略
CREATE POLICY "Everyone can view templates" ON feelink_quotes
  FOR SELECT USING (type = 'Template' OR auth.uid() = user_id);

CREATE POLICY "Users can insert own quotes" ON feelink_quotes
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own quotes" ON feelink_quotes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quotes" ON feelink_quotes
  FOR DELETE USING (auth.uid() = user_id);

-- user_speaking_practice RLS策略
CREATE POLICY "Users can manage own practice" ON user_speaking_practice
  FOR ALL USING (auth.uid() = user_id);

-- 公共表的策略（只读）
CREATE POLICY "Everyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Everyone can view questions" ON ielts_speaking_questions FOR SELECT USING (true);

-- 更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 应用触发器
CREATE TRIGGER update_user_product_membership_updated_at
  BEFORE UPDATE ON user_product_membership
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feelink_quotes_updated_at
  BEFORE UPDATE ON feelink_quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 插入默认产品
INSERT INTO products (id, name, description, default_tier) VALUES
('ielts-speaking', 'IELTS Speaking Practice', 'IELTS口语练习平台', 'registered'),
('feelink', 'Feelink Quote Generator', '情感引用生成器', 'registered'),
('lueur', 'Interactive Reading Game', '互动阅读理解游戏', 'registered'),
('job-application', 'AI Job Application Tools', 'AI求职工具套件', 'registered'),
('english-reading', 'English Reading Practice', '英语阅读练习', 'registered'),
('cestlavie', 'Life Management Dashboard', '人生管理仪表板', 'registered')
ON CONFLICT (id) DO NOTHING;