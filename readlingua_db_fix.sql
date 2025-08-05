
-- 修改readlingua_articles表，移除外键约束
ALTER TABLE readlingua_articles DROP CONSTRAINT IF EXISTS readlingua_articles_user_id_fkey;

-- 修改readlingua_queries表，移除外键约束  
ALTER TABLE readlingua_queries DROP CONSTRAINT IF EXISTS readlingua_queries_user_id_fkey;

-- 修改user_id字段类型为TEXT，支持匿名用户
ALTER TABLE readlingua_articles ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE readlingua_queries ALTER COLUMN user_id TYPE TEXT;

-- 重新启用RLS策略（针对TEXT类型的user_id）
DROP POLICY IF EXISTS "Users can view own articles" ON readlingua_articles;
DROP POLICY IF EXISTS "Users can insert own articles" ON readlingua_articles;
DROP POLICY IF EXISTS "Users can update own articles" ON readlingua_articles;
DROP POLICY IF EXISTS "Users can delete own articles" ON readlingua_articles;

DROP POLICY IF EXISTS "Users can view own queries" ON readlingua_queries;
DROP POLICY IF EXISTS "Users can insert own queries" ON readlingua_queries;
DROP POLICY IF EXISTS "Users can update own queries" ON readlingua_queries;
DROP POLICY IF EXISTS "Users can delete own queries" ON readlingua_queries;

-- 新的RLS策略（支持匿名用户）
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

