-- Supabase 数据库初始化脚本
-- 执行顺序：先创建基础表，再创建关联表，最后设置RLS策略

-- 1. 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. 执行其他schema文件
-- 注意：在Supabase Dashboard中需要按顺序执行以下文件：
-- user_membership_schema.sql
-- user_notion_configs.sql  
-- english_reading_schema.sql
-- english_reading_mark_extension.sql

-- 3. 验证表是否创建成功
DO $$ 
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
BEGIN
    -- 检查必需的表
    FOR table_name IN SELECT unnest(ARRAY[
        'user_product_membership',
        'products', 
        'feelink_quotes',
        'ielts_speaking_questions',
        'user_speaking_practice',
        'user_notion_configs',
        'english_reading_articles',
        'english_reading_word_queries',
        'english_reading_sentence_queries'
    ]) LOOP
        IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                      WHERE table_name = table_name AND table_schema = 'public') THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE '❌ 缺失的表: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✅ 所有必需的表都已创建成功';
    END IF;
END $$;

-- 4. 检查RLS策略
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('user_product_membership', 'feelink_quotes', 'user_speaking_practice', 'user_notion_configs')
    LOOP
        IF EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = table_record.schemaname 
            AND tablename = table_record.tablename
        ) THEN
            RAISE NOTICE '✅ 表 %.% 已启用RLS策略', table_record.schemaname, table_record.tablename;
        ELSE
            RAISE NOTICE '⚠️ 表 %.% 缺少RLS策略', table_record.schemaname, table_record.tablename;
        END IF;
    END LOOP;
END $$;