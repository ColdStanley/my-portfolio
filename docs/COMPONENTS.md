# 组件使用文档

## 概述
本文档介绍了重构后的统一组件系统，包括使用方法、最佳实践和扩展指南。

## 核心组件

### 1. UnifiedCardSection
**位置**: `src/components/common/UnifiedCardSection.tsx`

**用途**: 统一的卡片列表组件，用于显示不同类别的项目内容

**使用方法**:
```tsx
import UnifiedCardSection from '@/components/common/UnifiedCardSection'

// 基本使用
<UnifiedCardSection category="technology" />
<UnifiedCardSection category="knowledge" />
<UnifiedCardSection category="life" />

// 自定义样式
<UnifiedCardSection 
  category="technology" 
  className="custom-class"
/>
```

**Props**:
- `category: CategoryType` - 卡片类别 ('technology' | 'knowledge' | 'life')
- `className?: string` - 自定义CSS类名

**特性**:
- 自动加载和过滤Notion数据
- 响应式设计
- 统一的卡片样式和交互
- 加载状态和错误处理

### 2. PageLayout
**位置**: `src/components/layout/PageLayout.tsx`

**用途**: 标准页面布局组件，提供一致的页面结构

**使用方法**:
```tsx
import PageLayout from '@/components/layout/PageLayout'

<PageLayout
  title="Page Title"
  subtitle="Optional subtitle"
  description="Optional description"
>
  <YourContent />
</PageLayout>
```

**Props**:
- `title: string` - 页面标题
- `subtitle?: string` - 可选副标题
- `description?: string` - 可选描述
- `children: ReactNode` - 页面内容
- `className?: string` - 自定义CSS类名
- `showComingSoon?: boolean` - 是否显示侧边栏 (默认true)

**特性**:
- 统一的页面标题区域
- 响应式网格布局
- 可选的Coming Soon侧边栏
- framer-motion动画效果

### 3. IntroSections
**位置**: `src/components/home/IntroSections.tsx`

**用途**: 可复用的介绍区块组件

**使用方法**:
```tsx
import { IntroSection, TechnologyIntro, KnowledgeIntro } from '@/components/home/IntroSections'

// 使用预设组件
<TechnologyIntro />
<KnowledgeIntro />

// 自定义使用
<IntroSection
  title="Custom Title"
  subtitle="Custom subtitle"
  description="Custom description"
  linkText="Custom link"
  href="/custom-page"
/>
```

**特性**:
- 预设的Technology和Knowledge介绍
- 完全可定制的通用版本
- motion动画效果
- 响应式设计

## 数据获取Hooks

### useNotionCards
**位置**: `src/hooks/useNotionData.ts`

**用途**: 获取Notion卡片数据

```tsx
import { useNotionCards } from '@/hooks/useNotionData'

const { cards, loading, error, refetch } = useNotionCards('pageId')
```

**返回值**:
- `cards: CardItem[]` - 卡片数据数组
- `loading: boolean` - 加载状态
- `error: string | null` - 错误信息
- `refetch: () => void` - 重新获取数据

### useNotionHighlights
**位置**: `src/hooks/useNotionData.ts`

**用途**: 获取最新动态数据

```tsx
import { useNotionHighlights } from '@/hooks/useNotionData'

const { highlights, loading, error } = useNotionHighlights()
```

## 合并的组件集合

### SimpleBlocks
**位置**: `src/components/notion/blocks/SimpleBlocks.tsx`

**包含组件**:
- `DividerBlock` - 分割线
- `ParagraphBlock` - 段落
- `QuoteBlock` - 引用块
- `ListBlock` - 无序列表
- `NumberedListBlock` - 有序列表
- `CalloutBlock` - 标注块

**使用方法**:
```tsx
import { 
  DividerBlock, 
  ParagraphBlock, 
  QuoteBlock,
  CalloutBlock 
} from '@/components/notion/blocks/SimpleBlocks'

<DividerBlock />
<ParagraphBlock>Text content</ParagraphBlock>
<QuoteBlock>Quote content</QuoteBlock>
<CalloutBlock emoji="💡" backgroundColor="bg-blue-50">
  Callout content
</CalloutBlock>
```

### SimpleComponents
**位置**: `src/components/ui/SimpleComponents.tsx`

**包含组件**:
- `Skeleton` - 加载占位符
- `Textarea` - 文本域组件

**使用方法**:
```tsx
import { Skeleton, Textarea } from '@/components/ui/SimpleComponents'

<Skeleton className="h-4 w-full" />
<Textarea placeholder="Enter text..." />
```

## 类型定义

### 核心类型
**位置**: `src/types/common.ts`

```typescript
interface CardItem {
  id: string
  title: string
  content: string
  subtext: string
  link: string
  imageUrl: string
  category: string
  slug: string
  section: string
  tech?: string[]
  pageId?: string
}

interface HighlightItem {
  title: string
  description?: string
  slug?: string
  category?: string
  status?: string
  order?: number
  tag?: string[]
  visibleOnSite?: boolean
}

type CategoryType = 'technology' | 'knowledge' | 'life'
```

## 最佳实践

### 1. 组件选择
- 对于列表页面，优先使用 `PageLayout` + `UnifiedCardSection`
- 对于介绍页面，使用 `IntroSection` 组件
- 对于Notion内容渲染，使用 `SimpleBlocks` 中的组件

### 2. 数据获取
- 使用统一的hooks而不是直接fetch
- 总是处理loading和error状态
- 利用refetch功能实现数据刷新

### 3. 扩展新类别
```tsx
// 1. 在types/common.ts中添加新类别
type CategoryType = 'technology' | 'knowledge' | 'life' | 'newCategory'

// 2. 直接使用UnifiedCardSection
<UnifiedCardSection category="newCategory" />

// 3. 创建对应的页面布局
<PageLayout title="New Category">
  <UnifiedCardSection category="newCategory" />
</PageLayout>
```

### 4. 自定义样式
- 使用className prop传递自定义样式
- 遵循现有的设计系统（紫色主题）
- 保持响应式设计原则

## 迁移指南

### 从旧组件迁移
1. **TechnologyCardSection → UnifiedCardSection**
   ```tsx
   // 旧写法
   <TechnologyCardSection />
   
   // 新写法
   <UnifiedCardSection category="technology" />
   ```

2. **自定义页面布局 → PageLayout**
   ```tsx
   // 旧写法
   <main className="min-h-screen pt-28...">
     <h1>Title</h1>
     <div className="grid...">
       <Content />
       <ComingSoonCard />
     </div>
   </main>
   
   // 新写法
   <PageLayout title="Title">
     <Content />
   </PageLayout>
   ```

3. **直接fetch → useNotionCards**
   ```tsx
   // 旧写法
   useEffect(() => {
     fetch('/api/notion').then(...)
   }, [])
   
   // 新写法
   const { cards, loading, error } = useNotionCards()
   ```

## 性能优化

### 1. 数据获取优化
- hooks内置了错误重试机制
- 自动缓存机制（通过React的依赖数组）
- 统一的loading状态减少重复渲染

### 2. 组件优化
- 使用React.memo优化不必要的重渲染
- framer-motion动画经过性能优化
- 响应式图片加载优化

## 故障排除

### 常见问题
1. **组件找不到**: 检查import路径是否正确
2. **数据不显示**: 检查category是否匹配数据库中的值
3. **样式异常**: 确认Tailwind类名是否正确
4. **TypeScript错误**: 检查types/common.ts中的类型定义

### 调试技巧
1. 使用浏览器开发者工具检查网络请求
2. 利用hooks返回的error状态调试数据问题
3. 检查console.log输出定位问题

## 贡献指南

### 添加新组件
1. 遵循现有的文件结构
2. 使用TypeScript严格类型
3. 添加适当的文档注释
4. 更新此文档

### 代码规范
- 使用函数式组件和hooks
- 遵循React最佳实践
- 保持组件的单一职责
- 使用有意义的变量和函数名

---

**最后更新**: 2024年
**维护者**: Stanley