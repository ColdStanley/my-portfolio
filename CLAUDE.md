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

### Color Theme
**CRITICAL**: This application uses a consistent light purple theme throughout all components and modules.

**Color Hierarchy (Light Purple Preference)**:
- **Primary Light**: `bg-purple-500`, `text-purple-500` (preferred for buttons)
- **Primary Medium**: `bg-purple-600`, `text-purple-600` (secondary choice)
- **Background Light**: `bg-purple-100`, `bg-purple-50` (preferred for cards/backgrounds)
- **Text Light**: `text-purple-600`, `text-purple-500` (preferred for text)
- **Hover States**: `hover:bg-purple-600` (from light to slightly darker)
- **Focus States**: `focus:ring-purple-500`, `focus:border-purple-500`
- **Borders**: `border-purple-200`, `border-purple-300`

**AVOID**: Dark purples like `purple-800`, `purple-900` - too deep and heavy

**Required Tailwind Classes**:
```tsx
// ✅ Preferred - Light purple theme
<button className="bg-purple-500 hover:bg-purple-600 text-white">Submit</button>
<div className="bg-purple-100 rounded-lg p-4">Card Content</div>

// ⚠️ Acceptable but not preferred - Medium purple
<button className="bg-purple-600 hover:bg-purple-700 text-white">Submit</button>

// ❌ Wrong - Too dark or other colors
<button className="bg-purple-800 hover:bg-purple-900 text-white">Submit</button>
<button className="bg-blue-500 hover:bg-blue-600 text-white">Submit</button>
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

### Forbidden Patterns
- **Colors**: Never use blue, green, red, yellow, indigo, or dark purples (800+)
- **Lines**: Avoid `border-t`, `border-b`, dividers - use cards and spacing instead  
- **Button Issues**: No variable widths, no text wrapping, no misaligned buttons
- **Heavy Styling**: No thick borders, heavy shadows, complex gradients

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
- The UI emphasizes responsive design with mobile-first approaches across all modules