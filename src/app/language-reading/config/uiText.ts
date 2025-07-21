// UI Text Configuration for Language Reading
// Supports English and French interfaces

export type Language = 'english' | 'french'

export interface UITexts {
  // Page titles and headers
  pageTitle: string
  readingSession: string
  newArticle: string
  
  // Article input
  articleInputTitle: string
  titleOptional: string
  titlePlaceholder: string
  articleContent: string
  contentPlaceholder: string
  startReading: string
  previousArticles: string
  untitled: string
  
  // Tooltip and actions
  textAnalysis: string
  aiAnalysis: string
  manualNotes: string
  queryWord: string
  querySentence: string
  markWord: string
  markSentence: string
  analyzing: string
  marking: string
  
  // Cards and content
  word: string
  sentence: string
  yourNotes: string
  notesPlaceholder: string
  save: string
  cancel: string
  delete: string
  
  // Status and feedback
  loading: string
  noArticles: string
  createFirstArticle: string
  selectForExplanations: string
  loadMore: string
  
  // Audio
  playWord: string
  playExample: string
  
  // French-specific
  masculin?: string
  feminin?: string
  plural?: string
  conjugation?: string
  
  // Collapsible content
  expand: string
  collapse: string
}

export const UI_TEXTS: Record<Language, UITexts> = {
  english: {
    pageTitle: 'English Reading Assistant',
    readingSession: 'Reading Session',
    newArticle: 'New Article',
    
    articleInputTitle: 'New Article',
    titleOptional: 'Title (Optional)',
    titlePlaceholder: 'Enter article title...',
    articleContent: 'Article Content *',
    contentPlaceholder: 'Paste your English article here...',
    startReading: 'Start Reading',
    previousArticles: 'Previous Articles',
    untitled: 'Untitled',
    
    textAnalysis: 'Text Analysis',
    aiAnalysis: 'AI Analysis',
    manualNotes: 'Manual Notes',
    queryWord: 'Query Word',
    querySentence: 'Query Sentence',
    markWord: 'Mark Word',
    markSentence: 'Mark Sentence',
    analyzing: 'Analyzing...',
    marking: 'Marking...',
    
    word: 'Word',
    sentence: 'Sentence',
    yourNotes: 'Your Notes:',
    notesPlaceholder: 'Click to add your notes...',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    
    loading: 'Loading...',
    noArticles: 'No articles yet. Create your first one!',
    createFirstArticle: 'No articles yet. Create your first one!',
    selectForExplanations: 'Select words or sentences to see explanations here',
    loadMore: 'Load More',
    
    playWord: 'Play word',
    playExample: 'Play example',
    
    expand: 'Show more',
    collapse: 'Show less'
  },
  
  french: {
    pageTitle: 'Assistant de Lecture Française',
    readingSession: 'Session de Lecture',
    newArticle: 'Nouvel Article',
    
    articleInputTitle: 'Nouvel Article',
    titleOptional: 'Titre (Optionnel)',
    titlePlaceholder: 'Saisissez le titre de l\'article...',
    articleContent: 'Contenu de l\'Article *',
    contentPlaceholder: 'Collez votre article français ici...',
    startReading: 'Commencer la Lecture',
    previousArticles: 'Articles Précédents',
    untitled: 'Sans Titre',
    
    textAnalysis: 'Analyse de Texte',
    aiAnalysis: 'Analyse IA',
    manualNotes: 'Notes Manuelles',
    queryWord: 'Analyser le Mot',
    querySentence: 'Analyser la Phrase',
    markWord: 'Marquer le Mot',
    markSentence: 'Marquer la Phrase',
    analyzing: 'Analyse en cours...',
    marking: 'Marquage en cours...',
    
    word: 'Mot',
    sentence: 'Phrase',
    yourNotes: 'Vos Notes :',
    notesPlaceholder: 'Cliquez pour ajouter vos notes...',
    save: 'Sauvegarder',
    cancel: 'Annuler',
    delete: 'Supprimer',
    
    loading: 'Chargement...',
    noArticles: 'Aucun article pour le moment. Créez le premier !',
    createFirstArticle: 'Aucun article pour le moment. Créez le premier !',
    selectForExplanations: 'Sélectionnez des mots ou phrases pour voir les explications ici',
    loadMore: 'Charger Plus',
    
    playWord: 'Écouter le mot',
    playExample: 'Écouter l\'exemple',
    
    expand: 'Voir plus',
    collapse: 'Voir moins',
    
    // French-specific terms
    masculin: 'masculin',
    feminin: 'féminin', 
    plural: 'pluriel',
    conjugation: 'conjugaison'
  }
}

export function getUITexts(language: Language): UITexts {
  return UI_TEXTS[language]
}