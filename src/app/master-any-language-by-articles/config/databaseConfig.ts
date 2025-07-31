// Database Configuration for Language Pair Tables
// This file manages the mapping between language pairs and their corresponding database tables

export interface LanguagePairConfig {
  code: string
  native: string
  learning: string
  displayName: string
  tables: {
    articles: string
  }
}

// Supported language pair configurations
export const LANGUAGE_PAIR_CONFIGS: Record<string, LanguagePairConfig> = {
  'chinese-english': {
    code: 'chinese-english',
    native: 'chinese',
    learning: 'english',
    displayName: '中文 → English',
    tables: {
      articles: 'chinese_english_articles'
    }
  },
  'chinese-french': {
    code: 'chinese-french',
    native: 'chinese',
    learning: 'french',
    displayName: '中文 → Français',
    tables: {
      articles: 'chinese_french_articles'
    }
  }
}

// Helper function to get language pair configuration
export function getLanguagePairConfig(languagePair: string): LanguagePairConfig | null {
  return LANGUAGE_PAIR_CONFIGS[languagePair] || null
}

// Helper function to validate language pair
export function isValidLanguagePair(languagePair: string): boolean {
  return languagePair in LANGUAGE_PAIR_CONFIGS
}

// Helper function to get all supported language pairs
export function getSupportedLanguagePairs(): string[] {
  return Object.keys(LANGUAGE_PAIR_CONFIGS)
}

// Helper function to get table names for a language pair
export function getTableNames(languagePair: string) {
  const config = getLanguagePairConfig(languagePair)
  if (!config) {
    throw new Error(`Unsupported language pair: ${languagePair}`)
  }
  return config.tables
}

// Database utility functions
export class DatabaseHelper {
  static getArticlesTable(languagePair: string): string {
    return getTableNames(languagePair).articles
  }


  static getDisplayName(languagePair: string): string {
    const config = getLanguagePairConfig(languagePair)
    return config?.displayName || languagePair
  }

  static getNativeLanguage(languagePair: string): string {
    const config = getLanguagePairConfig(languagePair)
    return config?.native || 'unknown'
  }

  static getLearningLanguage(languagePair: string): string {
    const config = getLanguagePairConfig(languagePair)
    return config?.learning || 'unknown'
  }
}

// Type definitions for database records
export interface ArticleRecord {
  id: number
  content: string
  title: string
  background_image_url?: string
  source_url?: string
  difficulty_level?: string
  created_at: string
  updated_at: string
}

export interface WordQueryRecord {
  id: number
  article_id: number
  word_text: string
  definition?: string
  examples?: string[]
  part_of_speech?: string
  root_form?: string
  example_translation?: string
  gender?: string // For French
  conjugation_info?: string // For French
  start_offset: number
  end_offset: number
  query_type: string
  user_notes?: string
  analysis_mode: string
  created_at: string
  updated_at: string
}

export interface SentenceQueryRecord {
  id: number
  article_id: number
  sentence_text: string
  translation?: string
  analysis?: string
  start_offset: number
  end_offset: number
  query_type: string
  user_notes?: string
  analysis_mode: string
  created_at: string
  updated_at: string
}