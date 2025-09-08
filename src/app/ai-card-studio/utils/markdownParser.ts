// Enhanced markdown content structure for PDF generation
export interface ParsedContent {
  type: 'heading' | 'paragraph' | 'list' | 'code' | 'blockquote' | 'table' | 'hr' | 'image'
  level?: number  // for headings (1-6)
  content: string
  items?: string[]  // for lists
  language?: string  // for code blocks
  inline?: boolean   // for inline code
  listType?: 'ordered' | 'unordered'  // for lists
  src?: string  // for images
  alt?: string  // for images
  headers?: string[]  // for tables
  rows?: string[][]  // for tables
}

export interface PDFData {
  cardName: string
  parsedContent: ParsedContent[]
  generatedAt: string
}

/**
 * Enhanced markdown parser for Info Card descriptions & AI Tool Card responses
 * Supports both simple user content and complex AI-generated content
 */
export function parseMarkdownToStructure(markdown: string): ParsedContent[] {
  // Minimal preprocessing - only normalize line endings
  const preprocessed = markdown
    .replace(/\r\n/g, '\n') // Normalize line endings
    .trim()

  const lines = preprocessed.split('\n')
  const result: ParsedContent[] = []
  let currentList: { items: string[], type: 'ordered' | 'unordered' } | null = null
  let currentCodeBlock: { content: string[], language?: string } | null = null
  let currentTable: { headers?: string[], rows: string[][] } | null = null
  let currentBlockquote: string[] = []
  let currentParagraph: string[] = []
  
  // Function to flush accumulated paragraph
  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      result.push({
        type: 'paragraph',
        content: currentParagraph.join(' ').trim()
      })
      currentParagraph = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    
    // Flush current structures when encountering different content
    const flushCurrent = () => {
      if (currentList) {
        result.push({
          type: 'list',
          content: '',
          items: currentList.items,
          listType: currentList.type
        })
        currentList = null
      }
      
      if (currentTable) {
        result.push({
          type: 'table',
          content: '',
          headers: currentTable.headers,
          rows: currentTable.rows
        })
        currentTable = null
      }
      
      if (currentBlockquote.length > 0) {
        result.push({
          type: 'blockquote',
          content: currentBlockquote.join('\n')
        })
        currentBlockquote = []
      }
      
      flushParagraph()
    }
    
    // Handle code blocks (AI responses often contain code)
    if (trimmed.startsWith('```')) {
      flushCurrent()
      if (currentCodeBlock) {
        // End code block
        result.push({
          type: 'code',
          content: currentCodeBlock.content.join('\n'),
          language: currentCodeBlock.language,
          inline: false
        })
        currentCodeBlock = null
      } else {
        // Start code block
        const language = trimmed.slice(3).trim()
        currentCodeBlock = {
          content: [],
          language: language || undefined
        }
      }
      continue
    }
    
    // Inside code block
    if (currentCodeBlock) {
      currentCodeBlock.content.push(line)
      continue
    }
    
    // Handle empty lines
    if (!trimmed) {
      flushParagraph()
      continue
    }
    
    // Handle table headers (AI responses often contain tables)
    if (trimmed.includes('|') && trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!currentTable) {
        // Check if next line is separator
        const nextLine = i + 1 < lines.length ? lines[i + 1].trim() : ''
        if (nextLine.includes('---') || nextLine.includes('===')) {
          flushCurrent()
          const headers = trimmed.slice(1, -1).split('|').map(h => h.trim())
          currentTable = { headers, rows: [] }
          i++ // Skip separator line
          continue
        }
      }
      
      // Handle table row
      if (currentTable) {
        const cells = trimmed.slice(1, -1).split('|').map(c => c.trim())
        currentTable.rows.push(cells)
        continue
      }
    }
    
    // Flush table if line doesn't contain table format
    if (currentTable && !trimmed.includes('|')) {
      result.push({
        type: 'table',
        content: '',
        headers: currentTable.headers,
        rows: currentTable.rows
      })
      currentTable = null
    }
    
    // Headings (common in both Info Cards and AI responses)
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)/)
    if (headingMatch) {
      flushCurrent()
      result.push({
        type: 'heading',
        level: headingMatch[1].length,
        content: headingMatch[2]
      })
      continue
    }
    
    // Images (AI responses may include image references)
    const imageMatch = trimmed.match(/^!\[([^\]]*)\]\(([^\)]+)\)/)
    if (imageMatch) {
      flushCurrent()
      result.push({
        type: 'image',
        content: '',
        alt: imageMatch[1] || 'Image',
        src: imageMatch[2]
      })
      continue
    }
    
    // Enhanced Lists (unordered) - Support multiple formats
    const unorderedListMatch = trimmed.match(/^[\-\*\+]\s*(.+)/) || 
                              trimmed.match(/^•\s*(.+)/)
    if (unorderedListMatch) {
      flushParagraph()
      if (!currentList || currentList.type !== 'unordered') {
        if (currentList) flushCurrent()
        currentList = { items: [], type: 'unordered' }
      }
      currentList.items.push(unorderedListMatch[1])
      continue
    }
    
    // Enhanced Lists (ordered) - Support multiple numbering formats
    const orderedListMatch = trimmed.match(/^(\d+)[\.)\-]\s*(.+)/) ||
                            trimmed.match(/^\((\d+)\)\s*(.+)/)
    if (orderedListMatch) {
      flushParagraph()
      if (!currentList || currentList.type !== 'ordered') {
        if (currentList) flushCurrent()
        currentList = { items: [], type: 'ordered' }
      }
      currentList.items.push(orderedListMatch[2] || orderedListMatch[1])
      continue
    }
    
    // Horizontal rule (separators in AI responses)
    if (trimmed.match(/^---+$/) || trimmed.match(/^\*\*\*+$/) || trimmed.match(/^___+$/)) {
      flushCurrent()
      result.push({
        type: 'hr',
        content: ''
      })
      continue
    }
    
    // Blockquote (AI responses may include quotes or callouts)
    if (trimmed.startsWith('> ')) {
      currentBlockquote.push(trimmed.slice(2))
      continue
    }
    
    // Flush blockquote if line doesn't start with >
    if (currentBlockquote.length > 0 && !trimmed.startsWith('> ')) {
      result.push({
        type: 'blockquote',
        content: currentBlockquote.join('\n')
      })
      currentBlockquote = []
    }
    
    // Accumulate paragraph content (handle multi-line paragraphs)
    if (!currentList && !currentTable && currentBlockquote.length === 0) {
      currentParagraph.push(trimmed)
    }
  }
  
  // Flush all remaining structures
  flushParagraph()
  
  if (currentList) {
    result.push({
      type: 'list',
      content: '',
      items: currentList.items,
      listType: currentList.type
    })
  }
  
  if (currentTable) {
    result.push({
      type: 'table',
      content: '',
      headers: currentTable.headers,
      rows: currentTable.rows
    })
  }
  
  if (currentCodeBlock) {
    result.push({
      type: 'code',
      content: currentCodeBlock.content.join('\n'),
      language: currentCodeBlock.language,
      inline: false
    })
  }
  
  if (currentBlockquote.length > 0) {
    result.push({
      type: 'blockquote',
      content: currentBlockquote.join('\n')
    })
  }
  
  return result
}

/**
 * Process inline formatting (bold, italic, code, links)
 */
export function processInlineFormatting(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic  
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
}