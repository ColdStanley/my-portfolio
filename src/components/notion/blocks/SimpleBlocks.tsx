'use client'

// Rich text renderer function to handle formatting
function renderRichText(richTextArray: any[]) {
  if (!richTextArray || richTextArray.length === 0) return null
  
  return richTextArray.map((textBlock: any, index: number) => {
    const { plain_text, annotations, href } = textBlock
    let element = plain_text
    
    // Apply formatting based on annotations
    if (annotations?.bold) {
      element = <strong key={`bold-${index}`}>{element}</strong>
    }
    if (annotations?.italic) {
      element = <em key={`italic-${index}`}>{element}</em>
    }
    if (annotations?.underline) {
      element = <u key={`underline-${index}`}>{element}</u>
    }
    if (annotations?.strikethrough) {
      element = <del key={`strike-${index}`}>{element}</del>
    }
    if (annotations?.code) {
      element = <code key={`code-${index}`} className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">{element}</code>
    }
    if (href) {
      element = (
        <a 
          key={`link-${index}`} 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {element}
        </a>
      )
    }
    
    return <span key={index}>{element}</span>
  })
}

// 分割线组件
export function DividerBlock() {
  return <hr className="my-4 border-gray-200 dark:border-gray-700" />
}

// 段落组件
export function ParagraphBlock({ block }: { block: any }) {
  const richText = block.paragraph?.rich_text || []
  if (!richText.length) return null
  
  return (
    <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
      {renderRichText(richText)}
    </p>
  )
}

// 引用块组件
export function QuoteBlock({ block }: { block: any }) {
  const richText = block.quote?.rich_text || []
  if (!richText.length) return null
  
  return (
    <blockquote className="border-l-4 border-purple-500 pl-4 py-2 my-4 bg-purple-50 dark:bg-purple-900/20 italic text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
      {renderRichText(richText)}
    </blockquote>
  )
}

// 列表组件
export function ListBlock({ block }: { block: any }) {
  const richText = block.bulleted_list_item?.rich_text || []
  if (!richText.length) return null
  
  return (
    <li className="ml-4 mb-2 text-gray-700 dark:text-gray-300 leading-relaxed list-disc whitespace-pre-wrap">
      {renderRichText(richText)}
    </li>
  )
}

// 有序列表组件
export function NumberedListBlock({ block }: { block: any }) {
  const richText = block.numbered_list_item?.rich_text || []
  const children = block.children || []
  
  if (!richText.length) return null
  
  return (
    <li className="ml-4 mb-2 text-gray-700 dark:text-gray-300 leading-relaxed list-decimal whitespace-pre-wrap">
      {renderRichText(richText)}
      {children.length > 0 && (
        <div className="mt-2 ml-4">
          {children.map((child: any, idx: number) => {
            if (child.type === 'bulleted_list_item') {
              const childRichText = child.bulleted_list_item?.rich_text || []
              return (
                <div key={child.id || idx} className="mb-1 text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  • {renderRichText(childRichText)}
                </div>
              )
            }
            return null
          })}
        </div>
      )}
    </li>
  )
}

// 标注块组件
export function CalloutBlock({ block }: { block: any }) {
  const richText = block.callout?.rich_text || []
  const emoji = block.callout?.icon?.emoji || "💡"
  
  if (!richText.length) return null
  
  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-4 rounded-lg my-4 border-l-4 border-blue-500">
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0">{emoji}</span>
        <div className="flex-1 whitespace-pre-wrap">{renderRichText(richText)}</div>
      </div>
    </div>
  )
}