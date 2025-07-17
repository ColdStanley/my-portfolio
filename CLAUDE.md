# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Development Notes

- The application integrates multiple external APIs and requires proper environment variable configuration
- Each module can be developed independently due to the modular architecture
- State management is deliberately kept simple with Zustand to avoid over-engineering
- The UI emphasizes responsive design with mobile-first approaches across all modules