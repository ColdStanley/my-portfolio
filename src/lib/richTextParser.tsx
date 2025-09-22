import React from 'react'

interface RichTextBlock {
  type: 'text'
  text: {
    content: string
    link?: {
      url: string
    } | null
  }
  annotations: {
    bold: boolean
    italic: boolean
    strikethrough: boolean
    underline: boolean
    code: boolean
    color: string
  }
  plain_text: string
  href?: string | null
}

interface ParsedRichText {
  content: React.ReactNode[]
  plainText: string
}

export function parseRichText(richTextBlocks: RichTextBlock[]): ParsedRichText {
  if (!richTextBlocks || richTextBlocks.length === 0) {
    return { content: [], plainText: '' }
  }

  const content: React.ReactNode[] = []
  let plainText = ''

  richTextBlocks.forEach((block, index) => {
    if (block.type !== 'text') return

    const text = block.text.content
    plainText += text

    // Split text by line breaks and create separate elements
    const lines = text.split('\n')

    lines.forEach((line, lineIndex) => {
      let element: React.ReactNode = line

      // Apply text styles
      if (block.annotations.bold) {
        element = <strong key={`bold-${index}-${lineIndex}`}>{element}</strong>
      }

      if (block.annotations.italic) {
        element = <em key={`italic-${index}-${lineIndex}`}>{element}</em>
      }

      if (block.annotations.strikethrough) {
        element = <s key={`strike-${index}-${lineIndex}`}>{element}</s>
      }

      if (block.annotations.underline) {
        element = <u key={`underline-${index}-${lineIndex}`}>{element}</u>
      }

      if (block.annotations.code) {
        element = (
          <code
            key={`code-${index}-${lineIndex}`}
            className="px-1.5 py-0.5 bg-gray-100 text-purple-600 rounded text-sm font-mono"
          >
            {element}
          </code>
        )
      }

      // Apply hyperlink
      const linkUrl = block.text.link?.url || block.href
      if (linkUrl) {
        element = (
          <a
            key={`link-${index}-${lineIndex}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 underline transition-colors duration-200"
          >
            {element}
          </a>
        )
      }

      content.push(element)

      // Add line break after each line except the last one
      if (lineIndex < lines.length - 1) {
        content.push(<br key={`br-${index}-${lineIndex}`} />)
      }
    })
  })

  return { content, plainText }
}

export function RichTextRenderer({ richText }: { richText: RichTextBlock[] }) {
  const { content } = parseRichText(richText)

  return (
    <div className="rich-text-content leading-relaxed">
      {content.map((element, index) => (
        <React.Fragment key={index}>{element}</React.Fragment>
      ))}
    </div>
  )
}