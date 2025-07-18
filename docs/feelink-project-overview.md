# Feelink Project Overview

## 项目简介

Feelink 是一个创新的情感表达平台，通过精美的图片配合个性化的 quotes 来帮助用户表达复杂的情感。项目采用现代化的全栈架构，提供流畅的用户体验和强大的内容管理能力。

## 核心功能

### 🎨 情感模板库
- **16个精选模板**：涵盖爱情、道歉、祝福、感谢四大情感类别
- **动态分类展示**：Love(7)、Sorry(3)、Blessing(6)、Thanks(3)
- **高质量视觉内容**：每个模板都配有精心设计的图片和文案

### 💫 交互体验
- **Apple 液体玻璃效果**：高透明度 quotes 展示，不遮挡图片美感
- **单击交互模式**：简化的用户交互，点击即可查看 quotes
- **响应式设计**：完美适配桌面、平板、手机等各种设备
- **流畅动画**：基于 Framer Motion 的优雅过渡效果

### 🗄️ 数据架构
- **Supabase 数据库**：存储模板元数据、quotes、描述等结构化信息
- **Vercel Blob 存储**：高性能图片 CDN，确保快速加载
- **TypeScript 全栈**：端到端类型安全，提升开发效率和代码质量

## 技术栈

### 前端技术
- **Next.js 15**: 最新的 React 全栈框架，支持 App Router
- **TypeScript**: 类型安全的 JavaScript 超集
- **Tailwind CSS**: 实用优先的 CSS 框架
- **Framer Motion**: 专业级动画库
- **React Hooks**: useState、useEffect 等现代状态管理

### 后端技术
- **Next.js API Routes**: 服务端 API 开发
- **Supabase**: PostgreSQL 数据库即服务
- **Vercel Blob**: 文件存储和 CDN 服务

### 开发工具
- **ESLint**: 代码质量检查
- **Git**: 版本控制
- **Node.js**: 运行时环境

## 项目架构

```
src/app/feelink/
├── page.tsx                    # 主页面 - 数据库驱动的动态内容
├── layout.tsx                  # 布局配置
├── upload/                     # 用户上传功能
├── user-view/[id]/            # 用户创建内容查看
└── [旧的 PicGame 组件们]        # 已迁移到数据库的历史组件

src/components/feelink/
├── FeelinkHeader.tsx           # 页面头部
├── FeelinkTemplateCard.tsx     # 模板卡片组件
├── FeelinkDisplay.tsx          # 通用显示组件
└── upload/                     # 上传相关组件

src/app/api/feelink/
├── templates/route.ts          # 模板数据 API
├── save-to-supabase/          # 保存到数据库
└── get-from-supabase/         # 从数据库获取
```

## 数据模型

### 模板数据结构
```typescript
interface FeelinkTemplate {
  id: string              // 唯一标识符
  name: string           // 模板名称
  imageUrl: string       // Vercel Blob 图片 URL
  quotes: string         // 情感文案（单条）
  description: string    // 详细描述
  category: string       // 分类：love/apology/blessing/thanks等
  section: string        // 页面展示分组
  webUrl: string         // 分享链接
  createdAt: string      // 创建时间
}
```

### 分类映射系统
```typescript
const CATEGORY_MAPPING = {
  'love': 'love',           // 爱情表达
  'apology': 'sorry',       // 道歉类型
  'blessing': 'blessing',   // 祝福类型
  'thanks': 'thanks',       // 感谢类型
  'general': 'thanks',      // 通用归类到感谢
  'anime': 'blessing',      // 动漫主题归类到祝福
  'gaming': 'blessing',     // 游戏主题归类到祝福
  'friendship': 'blessing'  // 友情归类到祝福
}
```

## 关键特性

### 🔄 数据迁移系统
项目完成了从静态组件到数据库驱动的完整迁移：
- **批量迁移脚本**：自动化处理 16 个 PicGame 组件
- **图片上传**：所有图片迁移到 Vercel Blob CDN
- **数据清洗**：标准化 quotes 格式和分类

### 🎯 智能分类
- **自动分类**：根据模板名称智能推断内容类别
- **灵活映射**：支持多对一的分类映射关系
- **动态统计**：实时显示各分类的模板数量

### ⚡ 性能优化
- **图片懒加载**：优化首屏加载速度
- **CDN 加速**：Vercel Blob 全球 CDN 分发
- **缓存策略**：合理的 API 缓存和数据管理
- **代码分割**：Next.js 自动代码分割

## 开发指南

### 环境配置
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 代码检查
npm run lint
```

### 环境变量
```bash
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Vercel Blob 配置
BLOB_READ_WRITE_TOKEN=your_blob_token

# 站点配置
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 数据库迁移
```bash
# 完整迁移所有模板
node scripts/migrate-all-picgames.js

# 单独测试数据结构
node scripts/test-migration.js

# 修复分类字段
node scripts/fix-categories.js
```

## API 文档

### GET /api/feelink/templates
获取所有模板数据，支持分类筛选

**响应示例：**
```json
{
  "success": true,
  "templates": [...],
  "templatesBySection": {
    "love": [...],
    "sorry": [...],
    "blessing": [...],
    "thanks": [...]
  },
  "totalCount": 19,
  "sectionCounts": {
    "love": 7,
    "sorry": 3,
    "blessing": 6,
    "thanks": 3
  }
}
```

### POST /api/feelink/templates
获取特定模板详情

**请求参数：**
```json
{
  "templateName": "picgame02"
}
```

## 设计理念

### 🎨 视觉设计
- **极简美学**：减少视觉干扰，突出内容本身
- **情感共鸣**：通过色彩和动画传达情感温度
- **Apple 风格**：借鉴 iOS 的液体玻璃效果，现代感十足

### 🚀 用户体验
- **直觉操作**：无需学习成本的自然交互
- **情感表达**：帮助用户在适当的时机表达真实情感
- **跨平台一致性**：确保在不同设备上的体验统一

### 🛠️ 技术哲学
- **数据驱动**：内容与展示分离，便于管理和扩展
- **性能优先**：每个技术选择都考虑用户体验
- **可维护性**：清晰的架构和充分的类型安全

## 未来规划

### 🔮 功能扩展
- **用户自定义模板**：允许用户上传图片和创建个性化 quotes
- **AI 生成 quotes**：基于情境智能生成个性化文案
- **社交分享优化**：针对不同社交平台的分享优化
- **多语言支持**：国际化的情感表达

### 🔧 技术演进
- **实时协作**：多人共同创建和编辑模板
- **PWA 支持**：离线可用的渐进式 Web 应用
- **AI 图像生成**：集成 DALL-E 等 AI 工具
- **语音转文字**：语音输入 quotes 功能

## 贡献指南

### 添加新模板
1. 在 `/public/images/` 添加图片文件
2. 更新 `TEMPLATE_CATEGORIES` 映射
3. 运行迁移脚本将数据添加到数据库
4. 测试新模板的显示效果

### 代码规范
- 使用 TypeScript 确保类型安全
- 遵循 ESLint 配置的代码风格
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case

### 提交规范
- feat: 新功能
- fix: 错误修复
- docs: 文档更新
- style: 样式调整
- refactor: 代码重构

## 联系方式

- **项目主页**: https://stanleyhi.com/feelink
- **GitHub**: [项目仓库链接]
- **问题反馈**: [Issues 页面]

---

*Feelink - 让每一份情感都能找到最美的表达方式* ✨