// ✅ 重构后的 renderNotionBlock.tsx
// ✅ 通用渲染系统结构（易拓展 / 暗黑模式友好 / 样式一致）

import React from 'react'

export function renderNotionBlock(block: any): JSX.Element | null {
  const { type, id } = block
  const value = block[type]

  switch (type) {
    case 'paragraph':
      return (
        <p
          key={id}
          className="mb-4 leading-relaxed text-gray-800 dark:text-gray-200 text-[17px]"
        >
          {value.rich_text.map((text: any, i: number) => (
            <span key={i}>{text.plain_text}</span>
          ))}
        </p>
      )

    case 'heading_1':
      return (
        <h1
          key={id}
          className="text-3xl md:text-4xl font-bold my-6 text-gray-900 dark:text-white"
        >
          {value.rich_text[0]?.plain_text}
        </h1>
      )

    case 'heading_2':
      return (
        <h2
          key={id}
          className="text-2xl font-semibold my-4 text-gray-800 dark:text-gray-100"
        >
          {value.rich_text[0]?.plain_text}
        </h2>
      )

    case 'bulleted_list_item':
      return (
        <li
          key={id}
          className="list-disc ml-6 text-gray-700 dark:text-gray-200 leading-relaxed"
        >
          {value.rich_text.map((text: any, i: number) => (
            <span key={i}>{text.plain_text}</span>
          ))}
        </li>
      )

    case 'image': {
      const src = value.type === 'external' ? value.external.url : value.file.url
      const caption = value.caption?.[0]?.plain_text || ''
      return (
        <figure
          key={id}
          className="my-6 rounded-xl overflow-hidden bg-white dark:bg-gray-800 shadow-md"
        >
          <img
            src={src}
            alt={caption}
            className="w-full h-auto object-contain"
          />
          {caption && (
            <figcaption className="text-sm text-center text-gray-500 dark:text-gray-400 mt-2">
              {caption}
            </figcaption>
          )}
        </figure>
      )
    }

    case 'quote':
      return (
        <blockquote
          key={id}
          className="border-l-4 border-purple-400 pl-4 italic text-gray-700 dark:text-gray-300 my-4"
        >
          {value.rich_text.map((text: any, i: number) => (
            <span key={i}>{text.plain_text}</span>
          ))}
        </blockquote>
      )

    case 'child_database':
      return (
        <div
          key={id}
          className="my-6 border border-purple-300 dark:border-purple-700 shadow-sm rounded-xl overflow-auto"
        >
          <div className="text-sm font-semibold bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 px-4 py-2 rounded-t-xl">
            📊 {block['child_database'].title || 'Inline Database'}
          </div>
          <div className="p-4 text-sm text-gray-600 dark:text-gray-400">
            <em>To display the table content, it must be parsed via Notion API server-side.</em>
          </div>
        </div>
      )

    default:
      return null
  }
}
