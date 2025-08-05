-- 修正版本：先删除RLS策略，再修改字段类型

-- 1. 删除所有现有的RLS策略
DROP POLICY IF EXISTS "Users can view own articles" ON readlingua_articles;
DROP POLICY IF EXISTS "Users can insert own articles" ON readlingua_articles;
DROP POLICY IF EXISTS "Users can update own articles" ON readlingua_articles;
DROP POLICY IF EXISTS "Users can delete own articles" ON readlingua_articles;

DROP POLICY IF EXISTS "Users can view own queries" ON readlingua_queries;
DROP POLICY IF EXISTS "Users can insert own queries" ON readlingua_queries;
DROP POLICY IF EXISTS "Users can update own queries" ON readlingua_queries;
DROP POLICY IF EXISTS "Users can delete own queries" ON readlingua_queries;

-- 2. 移除外键约束
ALTER TABLE readlingua_articles DROP CONSTRAINT IF EXISTS readlingua_articles_user_id_fkey;
ALTER TABLE readlingua_queries DROP CONSTRAINT IF EXISTS readlingua_queries_user_id_fkey;

-- 3. 修改user_id字段类型为TEXT
ALTER TABLE readlingua_articles ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE readlingua_queries ALTER COLUMN user_id TYPE TEXT;

-- 4. 重新创建RLS策略（支持匿名用户）
CREATE POLICY "Users can view own articles" ON readlingua_articles
  FOR SELECT USING (
    user_id = COALESCE(auth.uid()::text, 'anonymous')
  );

CREATE POLICY "Users can insert own articles" ON readlingua_articles
  FOR INSERT WITH CHECK (
    user_id = COALESCE(auth.uid()::text, 'anonymous')
  );

CREATE POLICY "Users can update own articles" ON readlingua_articles
  FOR UPDATE USING (
    user_id = COALESCE(auth.uid()::text, 'anonymous')
  );

CREATE POLICY "Users can delete own articles" ON readlingua_articles
  FOR DELETE USING (
    user_id = COALESCE(auth.uid()::text, 'anonymous')
  );

CREATE POLICY "Users can view own queries" ON readlingua_queries
  FOR SELECT USING (
    user_id = COALESCE(auth.uid()::text, 'anonymous')
  );

CREATE POLICY "Users can insert own queries" ON readlingua_queries
  FOR INSERT WITH CHECK (
    user_id = COALESCE(auth.uid()::text, 'anonymous')
  );

CREATE POLICY "Users can update own queries" ON readlingua_queries
  FOR UPDATE USING (
    user_id = COALESCE(auth.uid()::text, 'anonymous')
  );

CREATE POLICY "Users can delete own queries" ON readlingua_queries
  FOR DELETE USING (
    user_id = COALESCE(auth.uid()::text, 'anonymous')
  );