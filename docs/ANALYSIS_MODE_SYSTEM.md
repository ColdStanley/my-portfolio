# Analysis Mode System Documentation

## Overview

The Analysis Mode System is a comprehensive tooltip redesign that provides 4 different analysis modes for language learning content. It replaces the previous simple tooltip system with a sophisticated, AI-powered analysis interface centered around a purple theme.

## Analysis Modes

### 1. Mark Mode (`mark`)
- **Purpose**: Basic marking and note-taking
- **Behavior**: Preserves existing marking logic while adding a tooltip input box
- **UI**: Gray theme with pin icon (📌)
- **Features**:
  - User input box for custom notes
  - No AI analysis generated
  - Direct save to database with user_notes field
  - Tooltip closes after saving

### 2. Simple Mode (`simple`)
- **Purpose**: Standard word/phrase analysis
- **Behavior**: Uses existing Query Word logic with enhanced streaming display
- **UI**: Blue theme with lightbulb icon (💡)
- **Features**:
  - Traditional AI word analysis (definition, examples, etc.)
  - Real-time streaming response display
  - Enhanced visual presentation
  - Auto-save functionality

### 3. Deep Mode (`deep`)
- **Purpose**: Comparative analysis with multiple examples
- **Behavior**: Uses specialized prompt for in-depth analysis
- **UI**: Purple theme with magnifying glass icon (🔍)
- **Features**:
  - Prompt: "通过对比、例句的方式讲解，以便我能灵活运用"
  - Multiple example sentences with different contexts
  - Comparative analysis between similar words/phrases
  - Real-time streaming response display

### 4. Grammar Mode (`grammar`)
- **Purpose**: Structured grammar analysis and testing
- **Behavior**: Uses specialized prompt for grammar-focused analysis
- **UI**: Green theme with pencil icon (📝)
- **Features**:
  - Prompt: "结构化讲解语法，并提供例句（配以简单讲解），最后2个小测试"
  - Structured grammar explanations
  - Example sentences with simple explanations
  - 2 mini quizzes for practice
  - Real-time streaming response display

## Technical Implementation

### Database Schema Changes

The system requires the following new fields in the database:

```sql
-- english_reading_word_queries table additions
ALTER TABLE english_reading_word_queries 
ADD COLUMN analysis_mode VARCHAR(20) DEFAULT 'simple',
ADD COLUMN user_notes TEXT,
ADD COLUMN query_type VARCHAR(50) DEFAULT 'ai_query',
ADD COLUMN language VARCHAR(50) DEFAULT 'english';

-- english_reading_sentence_queries table additions  
ALTER TABLE english_reading_sentence_queries
ADD COLUMN analysis_mode VARCHAR(20) DEFAULT 'simple',
ADD COLUMN user_notes TEXT,
ADD COLUMN query_type VARCHAR(50) DEFAULT 'ai_query',
ADD COLUMN language VARCHAR(50) DEFAULT 'english';
```

### API Endpoints

#### 1. Smart Analysis Endpoint
- **Path**: `/api/language-reading/smart-analysis`
- **Method**: POST
- **Purpose**: Provides streaming AI analysis for simple, deep, and grammar modes
- **Parameters**:
  - `selectedText`: The selected word/phrase
  - `contextSentence`: The surrounding sentence for context
  - `mode`: Analysis mode ('simple', 'deep', 'grammar')
  - `language`: Target language ('english', 'french', etc.)

#### 2. Enhanced Mark Word Endpoint
- **Path**: `/api/language-reading/mark-word`
- **Method**: POST
- **Purpose**: Handles mark mode functionality
- **Parameters**:
  - `articleId`: Article ID
  - `wordText`: Selected text
  - `startOffset`, `endOffset`: Text position
  - `userNotes`: User-provided notes
  - `analysisMode`: Always 'mark'

#### 3. Enhanced Query Word Endpoint
- **Path**: `/api/language-reading/query-word`
- **Method**: POST
- **Purpose**: Handles traditional word queries with analysis_mode support
- **Parameters**:
  - Standard query parameters
  - `analysisMode`: The selected analysis mode
  - `analysis`: Pre-analyzed content from smart-analysis endpoint

### Component Architecture

#### SmartTooltip Component
- **Location**: `src/app/master-any-language-by-articles/components/SmartTooltip.tsx`
- **Features**:
  - Mode selection interface
  - Real-time streaming display
  - Purple gradient header design
  - Automatic positioning with screen boundary detection
  - Error handling and retry mechanisms

#### AnalysisModeTag Component
- **Location**: `src/app/master-any-language-by-articles/components/AnalysisModeTag.tsx`
- **Purpose**: Displays mode-specific tags on query cards
- **Features**:
  - Color-coded mode identification
  - Icon-based visual cues
  - Fallback handling for legacy data

## User Experience Flow

### 1. Text Selection
1. User selects text in the reading interface
2. SmartTooltip appears with 4 mode options
3. Tooltip positioned automatically with boundary detection

### 2. Mode Selection
1. User clicks on desired analysis mode
2. Appropriate prompt and styling applied
3. Real-time streaming begins immediately

### 3. Analysis Display
1. Content streams in real-time using Server-Sent Events
2. Purple-themed UI provides visual feedback
3. Loading states and error handling ensure smooth UX

### 4. Auto-Save
1. Analysis automatically saved to database
2. No user confirmation required
3. Card appears in query results with mode-specific tag

## Design System

### Color Themes
- **Mark Mode**: Gray (`bg-gray-100`, `text-gray-800`)
- **Simple Mode**: Blue (`bg-blue-100`, `text-blue-800`)  
- **Deep Mode**: Purple (`bg-purple-100`, `text-purple-800`)
- **Grammar Mode**: Green (`bg-green-100`, `text-green-800`)

### Purple Theme Elements
- Gradient headers: `bg-gradient-to-r from-purple-600 to-purple-800`
- Text colors: `text-purple-800`, `text-purple-600`
- Border colors: `border-purple-200`, `border-purple-300`
- Hover states: `hover:bg-purple-50`

## Migration Guide

### Automatic Migration
```bash
npm run migrate:analysis-mode
```

### Manual Migration
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Execute `sql/schema_migration_analysis_mode.sql`

### Verification
Check that these columns exist:
- `analysis_mode` in both word and sentence query tables
- `user_notes` field for mark mode functionality
- `language` field for multi-language support

## Integration Points

### ReadingView Integration
- SmartTooltip replaces old selection tooltip
- Context sentence extraction for better analysis
- Bidirectional mapping between highlights and cards

### QueryCards Integration
- AnalysisModeTag displays mode on each card
- Color-coded identification system
- Legacy data fallback handling

### State Management
- Zustand store extensions for analysis_mode
- Backward compatibility with existing data
- Type safety with TypeScript interfaces

## Future Enhancements

### Planned Features
1. Language selector integration
2. AI-driven test system with nested tabs
3. Dynamic prompt generation based on selected languages
4. Advanced analytics and progress tracking

### Extensibility
- Easy addition of new analysis modes
- Configurable prompts per language
- Modular component architecture for customization

## Troubleshooting

### Common Issues
1. **Database schema not updated**: Run migration script
2. **Missing analysis_mode on cards**: Check AnalysisModeTag fallback
3. **Streaming not working**: Verify API endpoint configuration
4. **Positioning issues**: Check SmartTooltip boundary detection

### Debug Tools
- Browser Developer Tools for streaming inspection
- Database queries to verify data structure
- Console logs for error tracking