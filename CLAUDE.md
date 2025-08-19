# CLAUDE.md

**文本回答简明扼要，直击重点**

- 优先使用最少的词汇传达核心信息
- 直接回答问题，不添加不必要的前缀或后缀

## Development Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Code linting
```

## Architecture Overview

Next.js 15 portfolio with TypeScript, Zustand state management, Supabase database, and modular component structure.

### AI Streaming Response Requirements (CRITICAL)

**ALL AI responses MUST use streaming display:**

```typescript
// ✅ Streaming Implementation
await aiApi.processQueryStream(
  { query, model, prompt },
  (chunk: string) => {
    fullResponse += chunk
    updateUI({ response: fullResponse, isLoading: true })
  },
  () => updateUI({ isLoading: false })
)
```

## UI Design Guidelines

### Glass Morphism Design System (CRITICAL)

**Purple-themed glass morphism throughout all components**

#### Core Patterns
- **Background**: `bg-gradient-to-br from-slate-50 via-white to-purple-50/30`
- **Main Containers**: `bg-white/90 backdrop-blur-md rounded-xl shadow-xl`
- **Interactive Elements**: `bg-white/70 backdrop-blur-sm rounded-lg shadow-md`

#### Tab Navigation Pattern

```tsx
// Standard 3-tab layout
<div className="bg-white/95 backdrop-blur-md rounded-xl shadow-xl">
  <div className="flex">
    {tabs.map((tab, index) => (
      <button
        className={`flex-1 px-6 py-4 text-center font-medium transition-all duration-300 hover:scale-105 ${
          activeTab === index ? 'bg-purple-500 text-white' : 'text-gray-600 hover:bg-white/50'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
</div>
```

#### Color Standards
- **Primary Active**: `bg-purple-500 text-white`
- **Secondary Active**: `bg-gray-100 text-gray-800`
- **Primary Text**: `text-gray-600 hover:text-gray-800`
- **Interactive Hover**: `hover:bg-gray-50`

### Layout Standards

#### Button Requirements (CRITICAL)
- **Fixed Width**: All buttons in same interface: `w-32`, `w-40`
- **Single Line Text**: Always use `whitespace-nowrap truncate`
- **Standard Classes**: `px-6 py-2 rounded-lg font-medium`

```tsx
// ✅ Correct
<button className="w-32 px-6 py-2 bg-purple-500 text-white rounded-lg font-medium whitespace-nowrap">
  Save
</button>
```

#### Forbidden Patterns
- **Colors**: Never use blue, green, red, yellow
- **Backgrounds**: No solid colors - always use glass effect
- **Buttons**: No variable widths, no text wrapping

## Left Sidebar Navigation (CRITICAL)

**Standard Notion-style sidebar with purple theme**

### Core Implementation
```tsx
// Sidebar container
className="fixed top-32 left-4 w-64 h-[calc(100vh-12rem)] bg-white border border-gray-200 rounded-xl shadow-lg z-50"

// Interaction states
const [sidebarOpen, setSidebarOpen] = useState(false)
```

### Required Features
- **Hamburger click**: Opens sidebar
- **Click outside**: Closes sidebar  
- **Hover triggers**: Auto open/close
- **Purple active states**: `bg-purple-50 text-purple-700`

## L-Shaped Layout Standard (CRITICAL)

**Reserved space for navigation elements**

```tsx
// Main content with L-shaped offset
<div className="flex-1 ml-[68px] mt-[52px]">
  {/* All main content */}
</div>
```

- **68px horizontal**: Space for hamburger button
- **52px vertical**: Visual balance from top
- **Universal**: Apply to ALL main content areas

## Control Bar Pattern (CRITICAL)

**Fixed position control bar for Life pages**

```tsx
// Standard control bar
<div className="fixed top-20 right-4 flex items-center gap-4 z-40">
  {/* Refresh button - first */}
  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md">
    Refresh
  </button>
  
  {/* Primary action - last */}
  <button className="px-4 py-2 bg-purple-600 text-white rounded-md">
    New {ItemType}
  </button>
</div>

// Main content area
<div className="fixed top-32 left-[68px] right-4 bottom-4 overflow-y-auto">
  {/* Content */}
</div>
```

## Modern Card Design (CRITICAL)

**Glass morphism cards with premium shadows**

```tsx
// Standard card pattern
<div className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl transition-all duration-300 hover:shadow-2xl p-4">
  {/* Card content */}
</div>

// Completed state
<div className="bg-gradient-to-r from-purple-50/90 to-purple-100/90 backdrop-blur-md rounded-xl shadow-xl opacity-75 p-4">
  {/* Completed content */}
</div>
```

#### Requirements
- **Background**: `bg-white/90` with `backdrop-blur-md`
- **Shadow**: `shadow-xl` default, `shadow-2xl` on hover
- **Radius**: `rounded-xl` for modern appearance
- **Never**: Solid backgrounds or weak shadows

## Development Standards

### Text & Alignment
- **Language**: Concise English, professional tone
- **No Emojis**: Never include emojis in UI text
- **Alignment**: ALL elements properly aligned with flex layouts

```tsx
// ✅ Proper alignment
<div className="flex items-center justify-between">
  <h2 className="text-xl font-semibold">Dashboard</h2>
  <button className="w-32 px-6 py-2 bg-purple-500 text-white rounded-lg">
    Create New
  </button>
</div>
```

### State Management
- **Zustand Only**: Replace all useState with Zustand stores

## Global Rules (CRITICAL - NEVER VIOLATE)

- **Purple-Only Colors**: No blue, green, red, yellow
- **No Emojis**: Never in UI text, buttons, labels
- **State Preservation**: Never use `window.location.reload()` - use targeted refresh
- **Database-Driven Options**: ALL dropdown options from database schema APIs
- **Layout Stability**: No layout jumping - use disabled states vs hide/show

### Database Options Pattern (MANDATORY)

```typescript
// ✅ Correct - Database schema
const schema = await fetch('/api/strategy?action=schema')
const { statusOptions } = schema.schema

// ❌ Wrong - Hardcoded
const statusOptions = ['Not Started', 'Completed']
```

### Fixed Positioning Issues (CRITICAL)

**Forbidden CSS for Portal/Modal paths:**
- `backdrop-filter` / `backdrop-blur-*`
- `transform`, `perspective`, `filter`

**Solution**: Use `bg-white/95` + `shadow-xl` instead of backdrop-blur