-- 用户Notion配置表
CREATE TABLE IF NOT EXISTS user_notion_configs (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notion_api_key TEXT NOT NULL,
  tasks_db_id TEXT,
  strategy_db_id TEXT,
  plan_db_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- 启用RLS (Row Level Security)
ALTER TABLE user_notion_configs ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：用户只能访问自己的配置
CREATE POLICY "Users can view own notion config" ON user_notion_configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notion config" ON user_notion_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notion config" ON user_notion_configs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notion config" ON user_notion_configs
  FOR DELETE USING (auth.uid() = user_id);

-- 更新时间戳触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_notion_configs_updated_at
  BEFORE UPDATE ON user_notion_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();