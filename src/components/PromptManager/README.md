# PromptManager 通用组件

一个可复用的AI Prompt管理组件，提供统一的prompt编辑、保存和管理功能。

## 🚀 快速开始

```tsx
import PromptManager from '@/components/PromptManager'

const myPrompts = {
  analyze_text: {
    name: 'Text Analysis',
    location: 'Analysis Page → Analyze Button',
    model: 'gpt-4',
    count: 5,
    prompt: 'Analyze the following text and extract {count} key insights...'
  },
  generate_summary: {
    name: 'Summary Generation',
    location: 'Content Page → Summary Button',
    model: 'gpt-4',
    prompt: 'Generate a concise summary of the following content...'
  }
}

function MyComponent() {
  const [prompts, setPrompts] = useState(myPrompts)
  
  return (
    <div>
      {/* Your app content */}
      
      <PromptManager
        prompts={prompts}
        onPromptsChange={setPrompts}
        theme="purple"
        position="bottom-right"
        storageKey="my-app-prompts"
      />
    </div>
  )
}
```

## 📋 API 参考

### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `prompts` | `PromptData` | - | 必需。Prompt配置对象 |
| `onPromptsChange` | `(prompts: PromptData) => void` | - | Prompt变更回调函数 |
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | 按钮位置 |
| `theme` | `'purple' \| 'blue' \| 'green' \| 'gray'` | `'purple'` | 主题色 |
| `storageKey` | `string` | `'prompt-manager-data'` | localStorage存储键名 |
| `buttonIcon` | `string` | `'</>'` | 按钮图标 |
| `showInProduction` | `boolean` | `false` | 是否在生产环境显示 |
| `className` | `string` | `''` | 额外的CSS类名 |

### 数据结构

```typescript
interface PromptConfig {
  name: string           // 显示名称
  location: string       // 按钮位置描述
  model: 'gpt-4' | 'deepseek'  // AI模型
  count?: number         // 可选的数量参数
  prompt: string         // Prompt模板内容
}

interface PromptData {
  [key: string]: PromptConfig
}
```

## 🎨 主题配置

支持4种内置主题：

- `purple` - 紫色主题（默认）
- `blue` - 蓝色主题  
- `green` - 绿色主题
- `gray` - 灰色主题

## 📍 按钮位置

支持4个位置：

- `bottom-right` - 右下角（推荐）
- `bottom-left` - 左下角
- `top-right` - 右上角
- `top-left` - 左上角

## 🔧 高级用法

### 自定义按钮图标

```tsx
<PromptManager
  prompts={prompts}
  buttonIcon="⚙️"
  // 或使用其他图标
  buttonIcon="🔧"
/>
```

### 生产环境显示

```tsx
<PromptManager
  prompts={prompts}
  showInProduction={true}  // 生产环境也显示
/>
```

### 自定义存储键

```tsx
<PromptManager
  prompts={prompts}
  storageKey="my-special-prompts"
/>
```

## 💾 数据持久化

- 自动保存到 localStorage
- 组件挂载时自动加载已保存的prompt
- 支持重置到默认设置

## 🛠️ 功能特性

- ✅ 统一的视觉设计和交互体验
- ✅ 多主题支持
- ✅ 响应式设计
- ✅ TypeScript支持
- ✅ 自动持久化
- ✅ 生产环境控制
- ✅ 可定制按钮位置和样式

## 📝 使用场景

- AI应用的prompt管理
- 开发工具的配置管理
- 内容生成工具的模板管理
- 任何需要文本模板编辑的场景

## 🔍 调试模式

开发环境下组件会自动显示，生产环境下默认隐藏。如需在生产环境显示，设置 `showInProduction={true}`。