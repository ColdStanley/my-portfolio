// UI Text Configuration for Language Reading
// Supports English, French, Spanish, German, and Chinese interfaces

export type Language = 'english' | 'french' | 'spanish' | 'german' | 'chinese'

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
  },

  spanish: {
    pageTitle: 'Asistente de Lectura en Español',
    readingSession: 'Sesión de Lectura',
    newArticle: 'Nuevo Artículo',
    
    articleInputTitle: 'Nuevo Artículo',
    titleOptional: 'Título (Opcional)',
    titlePlaceholder: 'Ingresa el título del artículo...',
    articleContent: 'Contenido del Artículo *',
    contentPlaceholder: 'Pega tu artículo en español aquí...',
    startReading: 'Comenzar Lectura',
    previousArticles: 'Artículos Anteriores',
    untitled: 'Sin Título',
    
    textAnalysis: 'Análisis de Texto',
    aiAnalysis: 'Análisis IA',
    manualNotes: 'Notas Manuales',
    queryWord: 'Consultar Palabra',
    querySentence: 'Consultar Oración',
    markWord: 'Marcar Palabra',
    markSentence: 'Marcar Oración',
    analyzing: 'Analizando...',
    marking: 'Marcando...',
    
    word: 'Palabra',
    sentence: 'Oración',
    yourNotes: 'Tus Notas:',
    notesPlaceholder: 'Haz clic para agregar tus notas...',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    
    loading: 'Cargando...',
    noArticles: 'Aún no hay artículos. ¡Crea el primero!',
    createFirstArticle: 'Aún no hay artículos. ¡Crea el primero!',
    selectForExplanations: 'Selecciona palabras u oraciones para ver explicaciones aquí',
    loadMore: 'Cargar Más',
    
    playWord: 'Reproducir palabra',
    playExample: 'Reproducir ejemplo',
    
    expand: 'Ver más',
    collapse: 'Ver menos',
    
    reviewTest: 'Prueba de Repaso',
    exitReview: 'Salir del Repaso',
    loadingTest: 'Cargando preguntas de prueba...',
    noWordsForReview: 'No hay palabras disponibles para repasar en este artículo.',
    testCompleted: '¡Prueba Completada!',
    score: 'Puntuación',
    correct: 'correcto',
    continueReading: 'Continuar Leyendo',
    translateToEnglish: 'Traducir al español:',
    fillInBlank: 'Llenar el espacio:',
    chinese: 'Chino:',
    english: 'Español:',
    typeAnswer: 'Escribe tu respuesta aquí...',
    submit: 'Enviar',
    nextQuestion: 'Siguiente Pregunta',
    finishTest: 'Terminar Prueba',
    greatJob: '¡Excelente trabajo!',
    correctAnswer: 'Respuesta correcta:',
    viewQuery: 'Ver Consulta',
    backToQuiz: 'Volver al Quiz',
    testAgain: 'Probar Otra Vez',
    
    askAI: 'Preguntar a IA',
    aiAssistant: 'Asistente IA',
    aiThinking: 'La IA está pensando...',
    saveAI: 'Guardar Notas IA',
    editAI: 'Editar',
    askAgain: 'Preguntar Otra Vez',
    enterQuestion: 'Ingresa tu pregunta...',
    askQuestion: 'Hacer Pregunta',
    yourQuestion: 'Tu Pregunta:'
  },

  german: {
    pageTitle: 'Deutscher Lese-Assistent',
    readingSession: 'Lesesitzung',
    newArticle: 'Neuer Artikel',
    
    articleInputTitle: 'Neuer Artikel',
    titleOptional: 'Titel (Optional)',
    titlePlaceholder: 'Artikeltitel eingeben...',
    articleContent: 'Artikelinhalt *',
    contentPlaceholder: 'Fügen Sie Ihren deutschen Artikel hier ein...',
    startReading: 'Lesen Beginnen',
    previousArticles: 'Frühere Artikel',
    untitled: 'Ohne Titel',
    
    textAnalysis: 'Textanalyse',
    aiAnalysis: 'KI-Analyse',
    manualNotes: 'Manuelle Notizen',
    queryWord: 'Wort Abfragen',
    querySentence: 'Satz Abfragen',
    markWord: 'Wort Markieren',
    markSentence: 'Satz Markieren',
    analyzing: 'Analysiere...',
    marking: 'Markiere...',
    
    word: 'Wort',
    sentence: 'Satz',
    yourNotes: 'Ihre Notizen:',
    notesPlaceholder: 'Klicken Sie, um Ihre Notizen hinzuzufügen...',
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    
    loading: 'Lädt...',
    noArticles: 'Noch keine Artikel. Erstellen Sie den ersten!',
    createFirstArticle: 'Noch keine Artikel. Erstellen Sie den ersten!',
    selectForExplanations: 'Wählen Sie Wörter oder Sätze aus, um hier Erklärungen zu sehen',
    loadMore: 'Mehr Laden',
    
    playWord: 'Wort abspielen',
    playExample: 'Beispiel abspielen',
    
    expand: 'Mehr anzeigen',
    collapse: 'Weniger anzeigen',
    
    reviewTest: 'Wiederholungstest',
    exitReview: 'Wiederholung Beenden',
    loadingTest: 'Lade Testfragen...',
    noWordsForReview: 'Keine Wörter zum Wiederholen in diesem Artikel verfügbar.',
    testCompleted: 'Test Abgeschlossen!',
    score: 'Punktzahl',
    correct: 'richtig',
    continueReading: 'Weiter Lesen',
    translateToEnglish: 'Ins Deutsche übersetzen:',
    fillInBlank: 'Lücke ausfüllen:',
    chinese: 'Chinesisch:',
    english: 'Deutsch:',
    typeAnswer: 'Geben Sie Ihre Antwort hier ein...',
    submit: 'Absenden',
    nextQuestion: 'Nächste Frage',
    finishTest: 'Test Beenden',
    greatJob: 'Großartige Arbeit!',
    correctAnswer: 'Richtige Antwort:',
    viewQuery: 'Abfrage Anzeigen',
    backToQuiz: 'Zurück zum Quiz',
    testAgain: 'Nochmal Testen',
    
    askAI: 'KI Fragen',
    aiAssistant: 'KI-Assistent',
    aiThinking: 'KI denkt nach...',
    saveAI: 'KI-Notizen Speichern',
    editAI: 'Bearbeiten',
    askAgain: 'Nochmal Fragen',
    enterQuestion: 'Geben Sie Ihre Frage ein...',
    askQuestion: 'Frage Stellen',
    yourQuestion: 'Ihre Frage:'
  },

  chinese: {
    pageTitle: '中文阅读助手',
    readingSession: '阅读会话',
    newArticle: '新文章',
    
    articleInputTitle: '新文章',
    titleOptional: '标题（可选）',
    titlePlaceholder: '输入文章标题...',
    articleContent: '文章内容 *',
    contentPlaceholder: '在此粘贴您的中文文章...',
    startReading: '开始阅读',
    previousArticles: '以前的文章',
    untitled: '无标题',
    
    textAnalysis: '文本分析',
    aiAnalysis: 'AI分析',
    manualNotes: '手动笔记',
    queryWord: '查询词汇',
    querySentence: '查询句子',
    markWord: '标记词汇',
    markSentence: '标记句子',
    analyzing: '分析中...',
    marking: '标记中...',
    
    word: '词汇',
    sentence: '句子',
    yourNotes: '您的笔记：',
    notesPlaceholder: '点击添加您的笔记...',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    
    loading: '加载中...',
    noArticles: '暂无文章。创建第一个吧！',
    createFirstArticle: '暂无文章。创建第一个吧！',
    selectForExplanations: '选择词汇或句子以在此查看解释',
    loadMore: '加载更多',
    
    playWord: '播放词汇',
    playExample: '播放例句',
    
    expand: '显示更多',
    collapse: '显示更少',
    
    reviewTest: '复习测试',
    exitReview: '退出复习',
    loadingTest: '加载测试题中...',
    noWordsForReview: '本文章中没有可复习的词汇。',
    testCompleted: '测试完成！',
    score: '得分',
    correct: '正确',
    continueReading: '继续阅读',
    translateToEnglish: '翻译成中文：',
    fillInBlank: '填空：',
    chinese: '中文：',
    english: '中文：',
    typeAnswer: '在此输入您的答案...',
    submit: '提交',
    nextQuestion: '下一题',
    finishTest: '完成测试',
    greatJob: '做得很好！',
    correctAnswer: '正确答案：',
    viewQuery: '查看查询',
    backToQuiz: '返回测验',
    testAgain: '再次测试',
    
    askAI: '询问AI',
    aiAssistant: 'AI助手',
    aiThinking: 'AI正在思考...',
    saveAI: '保存AI笔记',
    editAI: '编辑',
    askAgain: '再次询问',
    enterQuestion: '输入您的问题...',
    askQuestion: '提问',
    yourQuestion: '您的问题：'
  }
}

export function getUITexts(language: Language): UITexts {
  return UI_TEXTS[language]
}