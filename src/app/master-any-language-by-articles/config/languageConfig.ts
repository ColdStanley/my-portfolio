// Language Configuration for Dynamic Prompts
// Supports native language (for explanations) and target language (being learned)

export type SupportedLanguage = 'chinese' | 'english' | 'spanish' | 'french' | 'german' | 'italian'

export interface LanguageConfig {
  native: SupportedLanguage    // Language for explanations
  target: SupportedLanguage    // Language being learned
}

export interface LanguageInfo {
  code: SupportedLanguage
  name: string
  nativeName: string
  flag: string
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  { code: 'chinese', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'english', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'spanish', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'french', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'german', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'italian', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' }
]

export const DEFAULT_LANGUAGE_CONFIG: LanguageConfig = {
  native: 'chinese',
  target: 'french'
}

export function getLanguageInfo(code: SupportedLanguage): LanguageInfo {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code) || SUPPORTED_LANGUAGES[0]
}

export function getLanguageName(code: SupportedLanguage, displayIn: SupportedLanguage = 'english'): string {
  const langInfo = getLanguageInfo(code)
  
  switch (displayIn) {
    case 'chinese':
      const chineseNames: Record<SupportedLanguage, string> = {
        chinese: '中文',
        english: '英语',
        spanish: '西班牙语',
        french: '法语',
        german: '德语',
        italian: '意大利语'
      }
      return chineseNames[code]
    
    case 'english':
      return langInfo.name
    
    case 'spanish':
      const spanishNames: Record<SupportedLanguage, string> = {
        chinese: 'Chino',
        english: 'Inglés',
        spanish: 'Español',
        french: 'Francés',
        german: 'Alemán',
        italian: 'Italiano'
      }
      return spanishNames[code]
    
    case 'french':
      const frenchNames: Record<SupportedLanguage, string> = {
        chinese: 'Chinois',
        english: 'Anglais',
        spanish: 'Espagnol',
        french: 'Français',
        german: 'Allemand',
        italian: 'Italien'
      }
      return frenchNames[code]
    
    default:
      return langInfo.name
  }
}