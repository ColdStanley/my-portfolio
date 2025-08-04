# Vercel 部署配置指南

## 🚀 部署前准备

### 1. 数据库初始化 (Supabase)

在Supabase Dashboard的SQL Editor中按顺序执行以下SQL文件：

```bash
# 1. 核心用户认证和会员系统
sql/user_membership_schema.sql

# 2. 用户Notion配置
sql/user_notion_configs.sql

# 3. 英语阅读功能
sql/english_reading_schema.sql
sql/english_reading_mark_extension.sql

# 4. 验证初始化（可选）
sql/init_supabase_database.sql
```

### 2. 环境变量配置

在Vercel项目设置中配置以下环境变量：

#### 必需的环境变量

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://gkqiimehwoqvwmqkwphv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcWlpbWVod29xdndtcWt3cGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzNzQ3NzcsImV4cCI6MjA2NTk1MDc3N30.-P6fQfONDH6upQvrya6k9RB1vSXIL4OhtdsMQXN0v9Y
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrcWlpbWVod29xdndtcWt3cGh2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDM3NDc3NywiZXhwIjoyMDY1OTUwNzc3fQ.k9LyxAJeu4iHNsPqV3Mf3l-92BdSnzyJprciMcfFP8g

# 站点URL (替换为您的Vercel域名)
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app

# Vercel Blob 存储
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token-here

# AI API密钥
NEXT_PUBLIC_OPENAI_API_KEY=your-openai-api-key-here
DEEPSEEK_API_KEY=your-deepseek-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here

# Notion API配置
NOTION_API_KEY=your-notion-api-key-here
NOTION_DATABASE_ID=your-notion-database-id-here
NOTION_SPEAKING_DB_ID=your-notion-speaking-db-id-here
NOTION_NEW_SPEAKING_DB_ID=your-notion-new-speaking-db-id-here
NOTION_SUBSCRIBE_DB_ID=your-notion-subscribe-db-id-here
NOTION_VOICE_MATTERS_DB_ID=your-notion-voice-matters-db-id-here
NOTION_IELTS_READING_DB_ID=your-notion-ielts-reading-db-id-here
NOTION_Test_DB_ID=your-notion-test-db-id-here
NOTION_LLM_DB_ID=your-notion-llm-db-id-here
NOTION_PICGAME_DB_ID=your-notion-picgame-db-id-here
NOTION_Tasks_DB_ID=your-notion-tasks-db-id-here
NOTION_Plan_DB_ID=your-notion-plan-db-id-here
NOTION_STRATEGY_DB_ID=your-notion-strategy-db-id-here
NOTION_JD2CV_DB_ID=your-notion-jd2cv-db-id-here

# 其他可选配置
REVALIDATE_SECRET=your-secret-key-here
REPLICATE_API_TOKEN=your-replicate-api-token-here
```

#### Outlook集成（可选）
```env
OUTLOOK_CLIENT_ID=your-outlook-client-id-here
OUTLOOK_TENANT_ID=your-outlook-tenant-id-here
OUTLOOK_CLIENT_SECRET=your-outlook-client-secret-here
OUTLOOK_REDIRECT_URI=https://your-project.vercel.app/auth/callback
```

## 🔧 Vercel项目配置

### 1. Build & Development Settings

- **Framework Preset**: Next.js
- **Node.js Version**: 18.x 或更高
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 2. 域名配置

确保更新以下配置：
1. Vercel项目中设置自定义域名
2. 更新 `NEXT_PUBLIC_SITE_URL` 环境变量为生产域名
3. 更新 `OUTLOOK_REDIRECT_URI` (如果使用Outlook集成)

### 3. 函数配置

确保以下API路由能正常工作：
- `/api/auth/*` - 认证相关
- `/api/supabase/*` - 数据库操作
- `/api/openai/*` - AI功能
- `/api/notion/*` - Notion集成

## 🎯 部署后验证

### 1. 认证系统测试

1. 访问 `/register` 注册新用户
2. 访问 `/login` 登录测试
3. 访问 `/auth/debug` 检查认证状态
4. 访问 `/membership` 测试会员系统

### 2. 功能模块测试

- **JD2CV**: `/job-application`
- **IELTS Speaking**: `/new-ielts-speaking`
- **Feelink**: `/feelink`
- **French Notes**: `/frenotes`
- **English Reading**: `/english-reading`
- **Life Management**: `/cestlavie`

### 3. 数据库连接测试

检查Supabase连接：
```javascript
// 在浏览器控制台测试
fetch('/api/supabase/test-connection')
  .then(res => res.json())
  .then(data => console.log(data));
```

## 🚨 常见问题排查

### 认证问题
- 检查Supabase URL和密钥是否正确
- 确认 `user_product_membership` 表已创建
- 验证RLS策略是否正确设置

### 环境变量问题
- 确认所有必需的环境变量已在Vercel中设置
- 检查 `NEXT_PUBLIC_SITE_URL` 是否为生产域名
- 验证API密钥是否有效

### 构建失败
- 检查依赖版本兼容性
- 确认TypeScript和ESLint错误被正确忽略
- 查看Vercel构建日志

## 📋 部署检查清单

- [ ] Supabase数据库表已创建
- [ ] 所有环境变量已在Vercel中配置
- [ ] `NEXT_PUBLIC_SITE_URL` 已更新为生产域名
- [ ] 认证流程测试通过
- [ ] 主要功能模块可访问
- [ ] 数据库连接正常
- [ ] RLS策略工作正常
- [ ] Blob存储功能正常

## 🔄 更新部署

当需要更新数据库schema时：
1. 在本地测试新的SQL脚本
2. 在Supabase Dashboard中执行更新
3. 更新相关环境变量（如需要）
4. 重新部署Vercel应用

## 📞 支持

如遇到部署问题，检查：
1. Vercel部署日志
2. Supabase实时日志
3. 浏览器开发者工具
4. 网络连接状态