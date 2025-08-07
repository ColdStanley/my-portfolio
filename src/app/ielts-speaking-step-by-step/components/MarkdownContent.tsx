'use client'

import { marked } from 'marked'

interface MarkdownContentProps {
  content: string
  className?: string
}

export default function MarkdownContent({ content, className = '' }: MarkdownContentProps) {
  const parseMarkdownResponse = (text: string) => {
    if (!text) return ''
    try {
      return marked.parse(text, {
        breaks: true,
        gfm: true,
        sanitize: false,
      })
    } catch (error) {
      console.warn('Failed to parse AI response markdown:', error)
      return text.replace(/\n/g, '<br>')
    }
  }

  return (
    <div 
      className={`prose prose-sm max-w-none ${className}`}
      style={{
        '--tw-prose-body': '#374151',
        '--tw-prose-headings': '#111827',
        '--tw-prose-links': '#7c3aed',
        '--tw-prose-bold': '#111827',
        '--tw-prose-counters': '#6b7280',
        '--tw-prose-bullets': '#d1d5db',
      } as React.CSSProperties}
      dangerouslySetInnerHTML={{ 
        __html: parseMarkdownResponse(content) 
      }}
    />
  )
}