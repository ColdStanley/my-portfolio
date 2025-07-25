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
  
  // Review Test
  reviewTest: string
  exitReview: string
  loadingTest: string
  noWordsForReview: string
  testCompleted: string
  score: string
  correct: string
  continueReading: string
  translateToEnglish: string
  fillInBlank: string
  chinese: string
  english: string
  typeAnswer: string
  submit: string
  nextQuestion: string
  finishTest: string
  greatJob: string
  correctAnswer: string
  viewQuery: string
  backToQuiz: string
  testAgain: string
  
  // AI Assistant
  askAI: string
  aiAssistant: string
  aiThinking: string
  saveAI: string
  editAI: string
  askAgain: string
  enterQuestion: string
  askQuestion: string
  yourQuestion: string
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
    collapse: 'Show less',
    
    // Review Test
    reviewTest: 'Review Test',
    exitReview: 'Exit Review',
    loadingTest: 'Loading test questions...',
    noWordsForReview: 'No words available for review in this article.',
    testCompleted: 'Test Completed!',
    score: 'Score',
    correct: 'correct',
    continueReading: 'Continue Reading',
    translateToEnglish: 'Translate to English:',
    fillInBlank: 'Fill in the blank:',
    chinese: 'Chinese:',
    english: 'English:',
    typeAnswer: 'Type your answer here...',
    submit: 'Submit',
    nextQuestion: 'Next Question',
    finishTest: 'Finish Test',
    greatJob: 'Great job!',
    correctAnswer: 'Correct answer:',
    viewQuery: 'View Query',
    backToQuiz: 'Back to Quiz',
    testAgain: 'Test Again',
    
    // AI Assistant
    askAI: 'Ask AI',
    aiAssistant: 'AI Assistant',
    aiThinking: 'AI is thinking...',
    saveAI: 'Save AI Notes',
    editAI: 'Edit',
    askAgain: 'Ask Again',
    enterQuestion: 'Enter your question...',
    askQuestion: 'Ask Question',
    yourQuestion: 'Your Question:'
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
    conjugation: 'conjugaison',
    
    // Review Test
    reviewTest: 'Test de Révision',
    exitReview: 'Quitter Révision',
    loadingTest: 'Chargement des questions...',
    noWordsForReview: 'Aucun mot disponible pour révision dans cet article.',
    testCompleted: 'Test Terminé !',
    score: 'Score',
    correct: 'correct',
    continueReading: 'Continuer la Lecture',
    translateToEnglish: 'Traduire en français :',
    fillInBlank: 'Remplir le blanc :',
    chinese: 'Chinois :',
    english: 'Français :',
    typeAnswer: 'Tapez votre réponse ici...',
    submit: 'Soumettre',
    nextQuestion: 'Question Suivante',
    finishTest: 'Terminer le Test',
    greatJob: 'Excellent travail !',
    correctAnswer: 'Réponse correcte :',
    viewQuery: 'Voir Requête',
    backToQuiz: 'Retour au Quiz',
    testAgain: 'Tester Encore',
    
    // AI Assistant
    askAI: 'Demander à l\'IA',
    aiAssistant: 'Assistant IA',
    aiThinking: 'L\'IA réfléchit...',
    saveAI: 'Sauvegarder Notes IA',
    editAI: 'Modifier',
    askAgain: 'Demander Encore',
    enterQuestion: 'Saisissez votre question...',
    askQuestion: 'Poser Question',
    yourQuestion: 'Votre Question :'
  }
}

export function getUITexts(language: Language): UITexts {
  return UI_TEXTS[language]
}