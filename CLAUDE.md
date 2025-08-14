# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Style

**文本回答永远简明扼要（除非明确要求详细）、直击重点**

- 优先使用最少的词汇传达核心信息
- 避免冗余解释和包装语言
- 直接回答问题，不添加不必要的前缀或后缀

## Development Commands

```bash
# Development server
npm run dev          # Start Next.js development server on localhost:3000

# Build and deployment
npm run build        # Create production build
npm run start        # Start production server
npm run cleanbuild   # Clean .next directory and rebuild

# Code quality
npm run lint         # Run ESLint for code linting
```

## Architecture Overview

This is a Next.js 15 portfolio application built with TypeScript, featuring multiple specialized modules for different use cases. The application uses the App Router architecture with a modular component structure.

### Core Technologies Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Database**: Supabase (PostgreSQL)
- **State Management**: Zustand for global state
- **Authentication**: Supabase Auth
- **AI Integration**: OpenAI API, DeepSeek embeddings
- **UI Components**: Radix UI primitives, custom components
- **Animations**: Framer Motion
- **File Storage**: Vercel Blob, Puppeteer for PDF generation

### Application Structure

The app follows a feature-based module organization:

```
src/app/
├── [category]/[slug]/          # Dynamic routes for blog posts
├── job-application/            # AI-powered resume builder & job matcher
├── feelink/                    # Creative picture quote generator
├── new-ielts-speaking/         # IELTS speaking practice platform
├── frenotes/                   # French learning with bilingual content
├── lueur/                      # Interactive reading comprehension game
├── notion-writer/              # Bulk Notion database management
├── ielts-reading/              # IELTS reading practice
└── api/                        # API routes for each module
```

### State Management Patterns

The application uses Zustand for state management with module-specific stores:

- **Global Auth Store** (`src/store/useAuthStore.ts`): User authentication and membership tiers
- **Job Application Store** (`src/app/job-application/store/`): Tab navigation and selection states
- **Module-specific stores**: Each major feature has its own store for isolated state management

### Authentication & Permissions

The app implements a tiered membership system:
- **guest**: Anonymous users with limited access
- **registered**: Authenticated users with basic features
- **pro/vip**: Premium users with advanced features
- **admin**: Full access to all features

Access control is managed through custom hooks:
- `useAccessGuard`: Enforces feature access based on membership
- `useCurrentUser`: Provides current user context
- `useUserMembership`: Handles membership tier logic

### AI & Vector Search Integration

The job-application module implements sophisticated AI matching:
- **Embedding Generation**: Uses DeepSeek API for text embeddings
- **Vector Similarity**: Cosine similarity matching between resume and job descriptions
- **Semantic Search**: Sentence-level matching with highlight visualization
- **Missing Coverage Detection**: Identifies gaps between candidate profile and job requirements

### Database Schema Patterns

Supabase tables follow consistent naming and structure:
- User management tables with membership tracking
- Module-specific data tables (e.g., `ielts_speaking_questions`, `frenotes_content`)
- Vector storage for embeddings with pgvector extension
- Audit trails for user actions and content updates

### Component Architecture

Components are organized by feature with shared UI components:
- **Feature Components**: Located within each module directory
- **Shared UI**: Radix-based components in `src/components/ui/`
- **Global Components**: Navigation, footer, and layout components
- **Notion Integration**: Custom block renderers for Notion content

### API Route Patterns

API routes follow RESTful conventions with feature-specific endpoints:
- Authentication routes for Supabase integration
- CRUD operations for each module's data
- AI integration endpoints (OpenAI, DeepSeek)
- File upload and processing routes (Vercel Blob)

### Performance Considerations

- **Image Optimization**: Next.js Image component with remote pattern configuration
- **Build Optimization**: ESLint and TypeScript errors ignored during builds for deployment flexibility
- **Code Splitting**: Module-based routing enables automatic code splitting
- **Vector Operations**: Optimized similarity calculations for large datasets

### Testing and Quality

The codebase prioritizes rapid development with build-time flexibility:
- ESLint configuration with Next.js rules
- TypeScript strict mode disabled for development speed
- Manual testing approach for UI interactions
- Performance monitoring through user interaction tracking

## UI Design Guidelines

### Modern Glass Design System
**CRITICAL**: This application uses a modern glass morphism design with purple accents throughout all components and modules.

#### Background Standards
- **Primary Background**: `bg-gradient-to-br from-slate-50 via-white to-purple-50/30` (微紫灰渐变)
- **Alternative Background**: `bg-gradient-to-br from-gray-50 via-white to-purple-50/20` (更中性版本)
- **Avoid**: 纯色背景、深色背景、过于鲜艳的渐变

#### Container & Glass Effect Standards
- **Main Containers**: `bg-white/90 backdrop-blur-md rounded-xl shadow-xl`
- **Secondary Containers**: `bg-white/80 backdrop-blur-sm rounded-lg shadow-lg`
- **Interactive Elements**: `bg-white/70 backdrop-blur-sm rounded-lg shadow-md`
- **Hover Enhancement**: `hover:bg-white/60` (增加透明度)

#### Tab Navigation Pattern (标准设计)
```tsx
// ✅ 正确的现代Tab设计 - 基于ReadLingua Dashboard/Learning tabs
<div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl">
  <div className="flex">
    <button className={`flex-1 px-6 py-4 text-center font-medium whitespace-nowrap rounded-l-xl transition-all ${
      isActive 
        ? 'bg-purple-500 text-white shadow-lg'
        : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
    }`}>
      <svg className="w-5 h-5 inline-block mr-2" fill="currentColor">...</svg>
      Tab Name
    </button>
  </div>
</div>
```

#### Color Theme
- **Purple Reserve**: 只在特别重要的地方使用紫色，如主要CTA按钮、当前激活的关键功能
- **Primary Active**: `bg-purple-500 text-white` (特别重要的激活状态)
- **Secondary Active**: `bg-gray-100 text-gray-800` (一般激活状态)
- **Primary Text**: `text-gray-600 hover:text-gray-800` (主要文本)
- **Interactive Hover**: `hover:bg-gray-50` (悬浮状态)
- **Notion-style Hierarchy**: 参照Notion页面层级缩进设计，浅灰为主，紫色点缀

#### Shadow System (立体感层次)
```css
/* Level 1 - 基础阴影 */
box-shadow: '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 4px rgba(139, 92, 246, 0.05)'

/* Level 2 - 中等阴影 */  
box-shadow: '0 4px 15px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(139, 92, 246, 0.1)'

/* Level 3 - 强阴影 */
box-shadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 10px rgba(139, 92, 246, 0.1)'
```

### Layout Design Principles

#### 1. Card-Based Layout (Minimal Lines)
- **Prefer**: Cards with `rounded-lg`, `shadow-sm`, light purple backgrounds
- **Avoid**: Heavy borders, divider lines, complex nested borders
- **Example**: `bg-purple-50 rounded-lg p-6 shadow-sm` instead of multiple `border` classes

#### 2. Button Standards (CRITICAL)
- **Fixed Width**: All buttons in same interface must have identical width using `w-32`, `w-40`, etc.
- **Single Line Text**: Button text NEVER wraps - use `whitespace-nowrap truncate`
- **Consistent Alignment**: Buttons in same section aligned using `justify-end` or `items-center`
- **Standard Classes**: `px-6 py-2 rounded-lg font-medium whitespace-nowrap`

```tsx
// ✅ Correct Button Pattern
<div className="flex gap-3 justify-end">
  <button className="w-32 px-6 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium whitespace-nowrap">
    Save
  </button>
  <button className="w-32 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium whitespace-nowrap">
    Cancel
  </button>
</div>

// ❌ Wrong - Variable width, potential wrapping
<button className="px-4 py-2 bg-purple-600">Very Long Button Text That Might Wrap</button>
```

#### 3. Clean & Spacious Design
- **Generous Spacing**: Use `p-6`, `gap-6`, `mb-8` for breathing room
- **Minimal Visual Clutter**: Avoid unnecessary decorative elements
- **Consistent Containers**: Use cards instead of complex nested layouts

#### 4. Interface Navigation Pattern
- **Tab-Based Navigation**: Prefer tabs over page navigation to reduce jumps
- **Single-Page Experience**: Keep related functionality within one interface
- **Minimal Navigation**: Avoid unnecessary route changes and redirects

#### 5. Minimalist Design Philosophy
- **Extreme Simplicity**: Remove all non-essential elements
- **Essential-Only Features**: Only include features that directly serve user goals
- **Clean Visual Hierarchy**: Clear information structure without decoration

#### 6. Compact Layout Standards
- **Space Efficiency**: Prioritize vertical space conservation
- **Tight Spacing**: Use `p-4`, `gap-3`, `mb-4` for compact layouts
- **Dense Information**: Present maximum information in minimum space
- **Reduced Padding**: Use smaller padding values when appropriate

#### 7. Button Icon Requirements (CRITICAL)
- **Mandatory SVG Icons**: ALL buttons MUST include consistent SVG icons
- **Icon Positioning**: Icons placed to the left of button text
- **Standard Icon Set**: Use consistent icon style across all buttons
- **Icon Size**: Uniform `w-4 h-4` or `w-5 h-5` for all button icons

```tsx
// ✅ Correct - Button with SVG icon
<button className="w-32 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium whitespace-nowrap flex items-center gap-2">
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
    <path d="M10 12l-4-4h8l-4 4z"/>
  </svg>
  Save
</button>

// ❌ Wrong - Button without icon
<button className="w-32 px-4 py-2 bg-purple-500 text-white rounded-lg">
  Save
</button>
```

### Loading States
- **Consistent Loading Animation**: Use circular spinner animation for ALL loading states across the application
- **No Skeleton Loaders**: Avoid skeleton screens, bars, or other loading patterns
- **Standard Implementation**: Use spinning circle with purple theme colors

### Forbidden Patterns
- **Old Design**: Never use solid borders, heavy dividers, or flat card designs
- **Colors**: Never use blue, green, red, yellow, indigo, or dark purples (800+)
- **Backgrounds**: Avoid pure solid colors - always use gradient backgrounds
- **Containers**: Never use opaque backgrounds - always use glass effect with backdrop-blur
- **Button Issues**: No variable widths, no text wrapping, no misaligned buttons
- **Heavy Styling**: No thick borders, heavy shadows, complex gradients

### Glass Morphism Requirements
- **CRITICAL**: ALL new components must use glass morphism design
- **Mandatory**: `backdrop-blur-md` or `backdrop-blur-sm` for all containers
- **Required**: Semi-transparent backgrounds `bg-white/90`, `bg-white/80`, etc.
- **Essential**: Gradient backgrounds for all page-level containers

### Independent Floating Glass Cards Architecture
- **Core Principle**: 每个组件都是独立浮动的glass卡片
- **No Wrapper Containers**: 避免使用大的背景容器包裹多个组件
- **Individual Glass Effects**: 每个功能区域都有自己独立的glass背景和阴影
- **Layout Freedom**: 组件可以全屏显示，不受统一容器约束
- **Visual Hierarchy**: 通过不同的glass透明度和阴影强度区分层次

#### Implementation Pattern
```tsx
// ✅ 正确 - 独立浮动glass卡片
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
  {/* Header - 独立glass卡片 */}
  <div className="bg-white/95 backdrop-blur-md shadow-lg">
    Header Content
  </div>
  
  {/* Content Areas - 各自独立glass卡片 */}
  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
    Article Content
  </div>
  
  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg">
    Query Panel
  </div>
</div>

// ❌ 错误 - 统一大容器包裹
<div className="bg-white rounded-lg shadow-sm">
  <Header />
  <Article />
  <QueryPanel />
</div>
```

## Content & Text Guidelines

### Text Content Standards
- **Language**: Use concise English for all frontend text and UI copy unless specifically requested otherwise
- **Tone**: Professional, clear, and direct language
- **No Emojis**: Never include emojis in any UI text, buttons, labels, or content
- **Consistency**: Maintain consistent terminology across all modules

### UI Alignment Requirements
- **Critical Rule**: ALL UI elements must be properly aligned at all times
- **Flex Layouts**: Use `justify-center`, `items-center`, `justify-between`, `justify-end` for proper alignment
- **Grid Systems**: Ensure consistent grid alignment with proper spacing
- **Visual Hierarchy**: Elements at same level must align horizontally and vertically
- **Responsive Alignment**: Maintain alignment across all screen sizes

```tsx
// ✅ Correct - Properly aligned elements
<div className="flex items-center justify-between">
  <h2 className="text-xl font-semibold">Dashboard</h2>
  <button className="w-32 px-6 py-2 bg-purple-500 text-white rounded-lg">
    Create New
  </button>
</div>

// ❌ Wrong - Misaligned elements
<div>
  <h2>Dashboard</h2>
  <button className="bg-purple-500 text-white">Create New</button>
</div>
```

## Development Notes

- The application integrates multiple external APIs and requires proper environment variable configuration
- Each module can be developed independently due to the modular architecture
- State management is deliberately kept simple with Zustand to avoid over-engineering
- **All state management use Zustand**: Replace all useState with Zustand stores, avoid React useState completely
- The UI emphasizes responsive design with mobile-first approaches across all modules

## Global Development Rules

**CRITICAL - NEVER VIOLATE THESE RULES**:
- **No Hard-coding**: Avoid hardcoded values, use constants and variables
- **Purple-Only Color Scheme**: ALL colors must be purple variants - no blue, green, red, yellow, etc.
- **No Emojis**: Never use emojis in any code, UI, or content
- **Consistent Theming**: All components must follow the purple color hierarchy
- **Answer based on code facts, not speculation**: When debugging, check actual code implementation rather than guessing possible causes
- **立体视觉 + 流畅动效 + 最少文案**: All UI components must feature 3D depth effects, smooth animations, and minimal text content
- **State Preservation Rule (CRITICAL)**: NEVER use `window.location.reload()` or full page refreshes after user actions (save, delete, update). Always use targeted data refresh functions to maintain UI state, selected tabs, form data, and user context. Page refreshes reset all React state and destroy user workflow continuity.

## Component Size Guidelines

**Recommended Component Line Counts**:
- **Simple Components**: 50-100 lines (buttons, inputs, cards)
- **Medium Components**: 100-200 lines (forms, list items, modals)
- **Complex Components**: 200-300 lines (page-level components, complex interactions)

**When exceeding 300 lines, consider refactoring**:
- Extract sub-components
- Move logic to custom hooks
- Split into multiple files

**Core principle**: Follow single responsibility principle rather than strict line limits.

## Reusable Components

### MarkdownContent Component

**Location**: `src/app/ielts-speaking-step-by-step/components/MarkdownContent.tsx`

**Purpose**: Universal Markdown parsing and rendering component for AI-generated content display.

**Technical Stack**:
- **Library**: `marked` - lightweight Markdown parser
- **Configuration**: 
  - `breaks: true` - Convert line breaks to `<br>` tags
  - `gfm: true` - GitHub Flavored Markdown support
  - `sanitize: false` - Allow HTML (use with caution)
- **Rendering**: `dangerouslySetInnerHTML` for direct HTML output
- **Styling**: Tailwind `prose` classes with purple theme customization

**Usage**:
```typescript
import MarkdownContent from './MarkdownContent'

// Basic usage
<MarkdownContent content={aiResponse} />

// With custom styling
<MarkdownContent 
  content={aiResponse}
  className="text-gray-800 leading-relaxed text-sm"
/>
```

**Features**:
- **Stream-compatible**: Works with both static and streaming content
- **Error handling**: Fallback to simple line break replacement
- **Theme integration**: Purple-themed prose styling
- **Responsive**: `max-w-none` for flexible container sizing

**Applications**:
- AI response displays in Step components (Step 1,2,3,4,6,7)
- Dashboard optimization results
- Any AI-generated content that needs formatting

**CSS Variables**:
```css
--tw-prose-body: #374151        /* Body text */
--tw-prose-headings: #111827     /* Headings */
--tw-prose-links: #7c3aed        /* Links (purple) */
--tw-prose-bold: #111827         /* Bold text */
--tw-prose-counters: #6b7280     /* List counters */
--tw-prose-bullets: #d1d5db      /* List bullets */
```

**Replication for New Projects**:
1. Copy the MarkdownContent component
2. Adjust CSS variables for project theme
3. Verify `marked` dependency is installed
4. Import and use for any AI content display

## ReadLingua Known Issues

### Tooltip Position Issues (未解决)

**问题描述**:
- TextSelectionToolbar和AIResponseFloatingPanel存在定位问题
- 即使使用Portal渲染到document.body，仍受父容器影响

**具体表现**:
1. **TextSelectionToolbar**: 修复前固定在页面左上角，修复后通过Portal正常跟随选中文本
2. **AIResponseFloatingPanel**: 只在Article部分居中，而非整个屏幕居中，右侧被query history遮挡

**已尝试解决方案**:
- 使用`createPortal(content, document.body)`渲染到body
- 设置高z-index值 (z-[9999])
- 强制设置`position: fixed`

**推测根因**:
- CSS层叠上下文影响fixed定位计算
- 父容器的transform、perspective等CSS属性创建新的定位上下文
- z-index层级冲突

**临时状态**: TextSelectionToolbar已修复，AIResponseFloatingPanel部分修复但未完全解决

**最终解决方案**: 移除LearningTab中的`backdrop-blur-md`属性，改用`bg-white/95`

### Fixed定位问题预防规则 (CRITICAL)

**永远禁止的CSS组合**:
- 任何包含Portal/Modal的组件路径上禁用：
  - `backdrop-filter` / `backdrop-blur-*`  
  - `filter`属性
  - `transform`属性
  - `perspective`属性
  - `will-change: transform`
  - `contain`属性

**检查规则**:
1. 新增Modal/Portal组件时，必须检查完整DOM路径
2. 使用`position: fixed`前必须确认无包含块创建者
3. glass效果用阴影和透明度替代，避免backdrop-filter

**替代方案**:
- `backdrop-blur-md` → `bg-white/95` + `shadow-xl`
- glass效果通过多层阴影实现立体感
- Portal组件必须渲染到document.body避免继承影响