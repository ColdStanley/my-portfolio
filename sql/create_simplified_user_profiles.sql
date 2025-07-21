-- 用户管理系统简化：创建新的用户档案表
-- 执行日期: 2025-01-21
-- 目的: 替换复杂的多表结构为单一用户档案表

-- 1. 创建简化的用户档案表
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    
    -- Notion集成配置
    notion_api_key TEXT,
    notion_tasks_db_id TEXT,
    notion_strategy_db_id TEXT,
    notion_plan_db_id TEXT,
    
    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. 创建更新触发器
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- 4. 启用行级安全策略 (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. 创建RLS策略
-- 用户可以查看自己的档案
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- 用户可以插入自己的档案
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户可以更新自己的档案
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- 用户可以删除自己的档案
CREATE POLICY "Users can delete own profile" ON user_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- 6. 创建有用的索引
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at);

-- 7. 数据迁移：从现有表迁移数据到新表
INSERT INTO user_profiles (
    user_id, 
    role, 
    notion_api_key, 
    notion_tasks_db_id, 
    notion_strategy_db_id, 
    notion_plan_db_id,
    created_at
)
SELECT DISTINCT
    u.id,
    CASE 
        WHEN u.email = 'stanleytonight@hotmail.com' THEN 'admin'
        ELSE 'user'
    END as role,
    unc.notion_api_key,
    unc.tasks_db_id,
    unc.strategy_db_id,
    unc.plan_db_id,
    COALESCE(unc.created_at, u.created_at) as created_at
FROM auth.users u
LEFT JOIN user_notion_configs unc ON u.id = unc.user_id
ON CONFLICT (user_id) DO UPDATE SET
    notion_api_key = EXCLUDED.notion_api_key,
    notion_tasks_db_id = EXCLUDED.notion_tasks_db_id,
    notion_strategy_db_id = EXCLUDED.notion_strategy_db_id,
    notion_plan_db_id = EXCLUDED.notion_plan_db_id,
    updated_at = CURRENT_TIMESTAMP;

-- 8. 验证迁移结果
DO $$
DECLARE
    user_count INT;
    profile_count INT;
    admin_count INT;
    notion_config_count INT;
BEGIN
    SELECT COUNT(*) INTO user_count FROM auth.users;
    SELECT COUNT(*) INTO profile_count FROM user_profiles;
    SELECT COUNT(*) INTO admin_count FROM user_profiles WHERE role = 'admin';
    SELECT COUNT(*) INTO notion_config_count FROM user_profiles WHERE notion_api_key IS NOT NULL;
    
    RAISE NOTICE '=== 迁移结果验证 ===';
    RAISE NOTICE '总用户数: %', user_count;
    RAISE NOTICE '用户档案数: %', profile_count;
    RAISE NOTICE '管理员用户数: %', admin_count;
    RAISE NOTICE '有Notion配置的用户数: %', notion_config_count;
    
    IF user_count = profile_count THEN
        RAISE NOTICE '✅ 数据迁移成功：所有用户都有对应的档案';
    ELSE
        RAISE NOTICE '❌ 数据迁移可能有问题：用户数与档案数不匹配';
    END IF;
END $$;

-- 9. 显示迁移后的数据概览
SELECT 
    'Migration Summary' as report_type,
    up.role,
    COUNT(*) as user_count,
    COUNT(CASE WHEN up.notion_api_key IS NOT NULL THEN 1 END) as with_notion_config
FROM user_profiles up
GROUP BY up.role
UNION ALL
SELECT 
    'User Details' as report_type,
    u.email as role,
    1 as user_count,
    CASE WHEN up.notion_api_key IS NOT NULL THEN 1 ELSE 0 END as with_notion_config
FROM auth.users u
JOIN user_profiles up ON u.id = up.user_id
ORDER BY report_type, role;