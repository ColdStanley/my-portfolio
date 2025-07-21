-- 用户管理系统简化前的数据备份
-- 执行日期: 2025-01-21
-- 目的: 备份现有用户数据，确保迁移安全

-- 1. 导出所有用户及其配置的完整视图
SELECT 
    '=== 完整用户数据备份 ===' as section,
    u.id as user_id,
    u.email,
    u.created_at as user_created_at,
    
    -- Notion配置信息
    unc.notion_api_key IS NOT NULL as has_notion_key,
    unc.tasks_db_id,
    unc.strategy_db_id,
    unc.plan_db_id,
    unc.created_at as notion_config_created_at,
    
    -- 产品会员信息
    upm.product_id,
    upm.membership_tier,
    upm.created_at as membership_created_at,
    upm.expires_at
FROM auth.users u
LEFT JOIN user_notion_configs unc ON u.id = unc.user_id
LEFT JOIN user_product_membership upm ON u.id = upm.user_id
ORDER BY u.created_at, upm.product_id;

-- 2. 统计当前系统状态
SELECT 
    '=== 系统状态统计 ===' as section,
    'Total users' as metric,
    COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
    '=== 系统状态统计 ===' as section,
    'Users with Notion configs' as metric,
    COUNT(*) as count  
FROM user_notion_configs
UNION ALL
SELECT 
    '=== 系统状态统计 ===' as section,
    'Total membership records' as metric,
    COUNT(*) as count
FROM user_product_membership
UNION ALL
SELECT 
    '=== 系统状态统计 ===' as section,
    'Unique product IDs' as metric,
    COUNT(DISTINCT product_id) as count
FROM user_product_membership;

-- 3. 产品分布统计
SELECT 
    '=== 产品权限分布 ===' as section,
    product_id,
    membership_tier,
    COUNT(*) as user_count
FROM user_product_membership
GROUP BY product_id, membership_tier
ORDER BY product_id, membership_tier;

-- 4. 检查特定用户的配置（开发者和朋友）
SELECT 
    '=== 关键用户配置检查 ===' as section,
    u.email,
    u.id as user_id,
    
    -- Notion配置状态
    CASE 
        WHEN unc.notion_api_key IS NOT NULL THEN 'HAS_API_KEY'
        ELSE 'NO_API_KEY'
    END as notion_status,
    
    unc.tasks_db_id IS NOT NULL as has_tasks_db,
    unc.strategy_db_id IS NOT NULL as has_strategy_db,
    unc.plan_db_id IS NOT NULL as has_plan_db,
    
    -- 会员权限状态
    STRING_AGG(
        upm.product_id || ':' || upm.membership_tier, 
        '; ' ORDER BY upm.product_id
    ) as all_memberships
    
FROM auth.users u
LEFT JOIN user_notion_configs unc ON u.id = unc.user_id
LEFT JOIN user_product_membership upm ON u.id = upm.user_id
WHERE u.email IN ('stanleytonight@hotmail.com') -- 添加朋友的邮箱
GROUP BY u.id, u.email, unc.notion_api_key, unc.tasks_db_id, 
         unc.strategy_db_id, unc.plan_db_id
ORDER BY u.email;

-- 5. 检查数据完整性
SELECT 
    '=== 数据完整性检查 ===' as section,
    'Users without Notion config' as check_type,
    COUNT(*) as count
FROM auth.users u
LEFT JOIN user_notion_configs unc ON u.id = unc.user_id
WHERE unc.user_id IS NULL
UNION ALL
SELECT 
    '=== 数据完整性检查 ===' as section,
    'Users without any membership' as check_type,
    COUNT(*) as count
FROM auth.users u
LEFT JOIN user_product_membership upm ON u.id = upm.user_id
WHERE upm.user_id IS NULL
UNION ALL
SELECT 
    '=== 数据完整性检查 ===' as section,
    'Orphaned Notion configs' as check_type,
    COUNT(*) as count
FROM user_notion_configs unc
LEFT JOIN auth.users u ON unc.user_id = u.id
WHERE u.id IS NULL
UNION ALL
SELECT 
    '=== 数据完整性检查 ===' as section,
    'Orphaned memberships' as check_type,
    COUNT(*) as count
FROM user_product_membership upm
LEFT JOIN auth.users u ON upm.user_id = u.id
WHERE u.id IS NULL;

-- 6. 导出原始表结构信息
SELECT 
    '=== 表结构信息 ===' as section,
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('user_notion_configs', 'user_product_membership', 'products')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;