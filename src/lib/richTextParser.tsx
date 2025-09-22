import React from 'react'
import { getThemeClasses } from './themes'

// Color mapping for Notion colors to Tailwind CSS classes
const getNotionColorClasses = (color: string): { textColor: string; backgroundColor: string } => {
  const colorMap: Record<string, { textColor: string; backgroundColor: string }> = {
    default: { textColor: '', backgroundColor: '' },
    gray: { textColor: 'text-gray-600', backgroundColor: '' },
    brown: { textColor: 'text-amber-700', backgroundColor: '' },
    orange: { textColor: 'text-orange-600', backgroundColor: '' },
    yellow: { textColor: 'text-yellow-600', backgroundColor: '' },
    green: { textColor: 'text-green-600', backgroundColor: '' },
    blue: { textColor: 'text-blue-600', backgroundColor: '' },
    purple: { textColor: 'text-purple-600', backgroundColor: '' },
    pink: { textColor: 'text-pink-600', backgroundColor: '' },
    red: { textColor: 'text-red-600', backgroundColor: '' },
    gray_background: { textColor: '', backgroundColor: 'bg-gray-100' },
    brown_background: { textColor: '', backgroundColor: 'bg-amber-100' },
    orange_background: { textColor: '', backgroundColor: 'bg-orange-100' },
    yellow_background: { textColor: '', backgroundColor: 'bg-yellow-100' },
    green_background: { textColor: '', backgroundColor: 'bg-green-100' },
    blue_background: { textColor: '', backgroundColor: 'bg-blue-100' },
    purple_background: { textColor: '', backgroundColor: 'bg-purple-100' },
    pink_background: { textColor: '', backgroundColor: 'bg-pink-100' },
    red_background: { textColor: '', backgroundColor: 'bg-red-100' }
  }

  return colorMap[color] || { textColor: '', backgroundColor: '' }
}

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

export function parseRichText(richTextBlocks: RichTextBlock[], theme?: string): ParsedRichText {
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

      // Apply color styling (text color and background color)
      const colorClasses = getNotionColorClasses(block.annotations.color)
      if (colorClasses.textColor || colorClasses.backgroundColor) {
        const colorClassNames = [
          colorClasses.textColor,
          colorClasses.backgroundColor,
          colorClasses.backgroundColor ? 'px-1 py-0.5 rounded' : '' // Add padding for background colors
        ].filter(Boolean).join(' ')

        if (colorClassNames) {
          element = (
            <span
              key={`color-${index}-${lineIndex}`}
              className={colorClassNames}
            >
              {element}
            </span>
          )
        }
      }

      // Apply hyperlink
      const linkUrl = block.text.link?.url || block.href
      if (linkUrl) {
        const linkColorClasses = theme ? getThemeClasses(theme, 'linkColor') : 'text-purple-600 hover:text-purple-800'
        element = (
          <a
            key={`link-${index}-${lineIndex}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${linkColorClasses} underline transition-colors duration-200`}
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

export function RichTextRenderer({ richText, theme }: { richText: RichTextBlock[], theme?: string }) {
  const { content } = parseRichText(richText, theme)

  return (
    <div className="rich-text-content leading-relaxed">
      {content.map((element, index) => (
        <React.Fragment key={index}>{element}</React.Fragment>
      ))}
    </div>
  )
}