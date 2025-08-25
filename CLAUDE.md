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

### Modern Glass Morphism Design System (2025 UPDATE)

**Purple-Indigo gradient theme with sophisticated glass effects throughout all components**

#### Core Color Palette (CRITICAL)
- **Primary Gradient**: `bg-gradient-to-r from-purple-600 to-indigo-600`
- **Text Gradient**: `bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent`
- **Background**: `bg-gradient-to-br from-slate-50 via-white to-purple-50/30`
- **Hover Gradient**: `hover:from-purple-700 hover:to-indigo-700`

#### Glass Morphism Patterns
- **Main Containers**: `bg-white/90 backdrop-blur-md rounded-xl shadow-xl`
- **Interactive Elements**: `bg-white/70 backdrop-blur-sm rounded-lg shadow-md`
- **Navigation Dropdowns**: `bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100`
- **Cards**: `bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/20`

#### Modern Button Styles
```tsx
// Primary gradient button
<button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl">
  Primary Action
</button>

// Secondary glass button  
<button className="px-6 py-2 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-purple-600 rounded-lg font-medium border border-purple-200 transition-all duration-300">
  Secondary Action
</button>
```

#### Navigation & Active States
- **Active Navigation**: Use gradient text `bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent`
- **Tab Active**: `bg-purple-600 text-white` (solid for clarity)
- **Hover States**: `text-gray-600 hover:text-purple-600`
- **Dropdown Items**: `hover:bg-purple-50/50 text-purple-600`

### Layout Standards

#### Button Requirements (CRITICAL)
- **Gradient Primary**: Always use `bg-gradient-to-r from-purple-600 to-indigo-600`
- **Glass Secondary**: Use `bg-white/70 backdrop-blur-sm` with purple text
- **Fixed Width**: All buttons in same interface: `w-32`, `w-40`
- **Single Line Text**: Always use `whitespace-nowrap truncate`
- **Standard Classes**: `px-6 py-2 rounded-lg font-medium`

```tsx
// ✅ Primary Button (Gradient)
<button className="w-32 px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium whitespace-nowrap transition-all duration-300 shadow-lg hover:shadow-xl">
  Save
</button>

// ✅ Secondary Button (Glass)  
<button className="w-32 px-6 py-2 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-purple-600 rounded-lg font-medium border border-purple-200 transition-all duration-300 whitespace-nowrap">
  Cancel
</button>
```

#### Forbidden Patterns (UPDATED)
- **Colors**: Never use blue, green, red, yellow - ONLY purple-indigo gradients
- **Backgrounds**: No solid colors - always use gradients or glass effects
- **Buttons**: No variable widths, no text wrapping
- **Old Purple**: Never use single `bg-purple-500` - always use gradients

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

## Mobile Layout Standards (NEW)

### Responsive Navigation Pattern
- **Desktop**: Left sidebar + L-shaped layout with `ml-[68px] mt-[52px]`
- **Mobile**: Bottom aggregate navigation + full-screen layout
- **Breakpoint**: Use `md:` prefix for desktop-specific styles

### Mobile-First Rules
- Remove L-shaped spacing on mobile: `ml-0 md:ml-[68px] mt-0 md:mt-[52px]`
- Replace left sidebar with `BottomAggregateNavigation` component
- Use `hidden md:block` for desktop-only features (filters, breadcrumbs, drill-down)

## Bottom Aggregate Navigation (MOBILE STANDARD)

### Position & Layout
- **Position**: `fixed bottom-6 right-6` 
- **Direction**: Vertical main buttons, horizontal sub-tab expansion to left
- **Structure**: Main tabs stacked vertically (Life bottom, Study top)
- **Safe Area**: Account for mobile gesture areas

### Button Specifications
- **Main Buttons**: 56px circle (`w-14 h-14`), purple gradient when active
- **Sub Buttons**: 40px height (`h-10`), glass effect, text-only labels
- **Spacing**: 16px gap between main buttons (`gap-4`)

### Animation Standards
- **Sub-tab Expand**: Scale + TranslateX from right to left
- **Timing**: 300ms expand with bounce easing `[0.34, 1.56, 0.64, 1]`
- **Stagger**: 50ms delay between multiple sub-buttons
- **Main Button**: Scale 1.1 + enhanced shadow when expanded

### Usage Pattern
```tsx
<BottomAggregateNavigation
  mainTabs={[
    { key: 'life', label: 'Life', subTabs: [{ key: 'task', label: 'Task Manager' }] },
    { key: 'career', label: 'Career' },
    { key: 'study', label: 'Study', subTabs: [{ key: 'french', label: 'French' }] }
  ]}
  activeMainTab={activeMain}
  activeSubTab={activeSub}
  onMainTabChange={setActiveMain}
  onSubTabChange={setActiveSub}
/>
```

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

- **Purple-Indigo Gradients Only**: No blue, green, red, yellow - ONLY purple-indigo gradients
- **Linear-Style Design**: Use gradient text for logos and active states like Linear
- **No Emojis**: Never in UI text, buttons, labels  
- **State Preservation**: Never use `window.location.reload()` - use targeted refresh
- **Database-Driven Options**: ALL dropdown options from database schema APIs
- **Layout Stability**: No layout jumping - use disabled states vs hide/show
- **Gradient Consistency**: All interactive elements must use the same purple-indigo gradient system
- **No Background Overlays**: Avoid `backdrop-blur-sm bg-black/10` overlays - users should see background content

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

### Modal/Overlay Design Rules (CRITICAL)

**No Background Overlays:**
```tsx
// ❌ Wrong - Blocks background visibility
{isOpen && (
  <>
    <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40" />
    <div className="modal-content">...</div>
  </>
)}

// ✅ Correct - Transparent background, users can see content
{isOpen && (
  <div className="modal-content">...</div>
)}
```

**Principle**: Users should always see background content for better UX

## Scrolling Standards (CRITICAL)

### Single-Layer Scrolling Rule

**MANDATORY: Use only ONE scrolling container per page to prevent scrolling conflicts**

#### Problem Pattern (FORBIDDEN)
```tsx
// ❌ Double scrolling containers cause conflicts
<div className="h-[calc(100vh-180px)] overflow-y-auto">  {/* Outer scroll */}
  <Component className="h-full overflow-y-auto">        {/* Inner scroll */}
    {/* Content gets trapped between layers */}
  </Component>
</div>
```

#### Correct Pattern (REQUIRED)
```tsx
// ✅ Single page-level scrolling
<div>  {/* No height restriction */}
  <Component className="min-h-screen pb-60">  {/* No overflow-y-auto */}
    {/* Content flows naturally with page scroll */}
  </Component>
</div>
```

### Implementation Rules

1. **Remove Outer Height Constraints**:
   - Never use `h-[calc(100vh-...)]` on containers
   - Use simple `<div>` without height restrictions

2. **Component Scrolling**:
   - Replace `h-full overflow-y-auto` with `min-h-screen`
   - Use adequate bottom padding (`pb-60` = 240px) for footer clearance
   - Let browser handle page-level scrolling

3. **User Experience**:
   - Default scroll wheel actions should work immediately
   - No need to click-focus before scrolling
   - Content should be fully accessible without footer blocking

### Standard Implementation
```tsx
// Page container - no height limits
<div className="flex-1 ml-[68px] mt-[52px]">
  <div>  {/* Simple wrapper */}
    <YourComponent />
  </div>
</div>

// Component - page-level layout
<div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 p-6 pb-60">
  {/* Your content */}
</div>
```

**Principle**: One scroll container = predictable user experience

## Text Selection Tooltip Animation (CRITICAL)

**Refined multi-dimensional animation for elegant tooltip appearance and dismissal**

### Animation Specifications

```tsx
// Enhanced tooltip animation pattern
className={`transition-all duration-200 ease-out ${
  isVisible 
    ? 'opacity-100 scale-100 translate-y-0' 
    : 'opacity-0 scale-95 translate-y-2'
}`}
```

### Implementation Rules

1. **Multi-Dimensional Transition**: Combine opacity, scale, and translate-y for sophisticated effect
2. **Scale Range**: 95% to 100% scale for subtle entrance/exit
3. **Vertical Motion**: 2px upward translation on appear creates floating effect
4. **Timing**: 200ms duration with `ease-out` for natural deceleration
5. **State Management**: Use `isVisible` state with delayed trigger for smooth mounting
6. **Graceful Exit**: Fade out before DOM removal to complete animation cycle

### Enhanced Implementation
```tsx
const [isVisible, setIsVisible] = useState(false)

// Smooth entrance with micro-delay
useEffect(() => {
  const timer = setTimeout(() => setIsVisible(true), 10)
  return () => clearTimeout(timer)
}, [])

// Graceful exit animation
const handleClose = useCallback(() => {
  setIsVisible(false)
  setTimeout(() => onClose(), 200) // Wait for animation completion
}, [onClose])
```

### Micro-Interaction Enhancements
```tsx
// Corner buttons with refined hover states
className="transition-all duration-150 hover:scale-110 hover:shadow-md"
```

### Visual Hierarchy
- **Main Animation**: Opacity + scale + translate-y (200ms)
- **Hover States**: Scale + shadow enhancement (150ms)  
- **State Timing**: 10ms entrance delay, 200ms exit delay

**Principle**: Layered motion creates depth and polish while maintaining performance