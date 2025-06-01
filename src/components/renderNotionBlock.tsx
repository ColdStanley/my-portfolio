// ✅ src/components/ui/renderNotionBlock.tsx
// ✅ 支持数据库（child_database）渲染为 HTML 表格

import React from 'react'

export function renderNotionBlock(block: any): JSX.Element | null {
  const { type, id } = block
  const value = block[type]

  switch (type) {
    case 'paragraph':
      return (
        <p key={id} className="mb-4 text-gray-800 leading-relaxed">
          {value.rich_text.map((text: any, i: number) => (
            <span key={i}>{text.plain_text}</span>
          ))}
        </p>
      )

    case 'heading_1':
      return (
        <h1 key={id} className="text-3xl font-bold my-4">
          {value.rich_text[0]?.plain_text}
        </h1>
      )

    case 'heading_2':
      return (
        <h2 key={id} className="text-2xl font-semibold my-3">
          {value.rich_text[0]?.plain_text}
        </h2>
      )

    case 'image': {
      const src = value.type === 'external' ? value.external.url : value.file.url
      const caption = value.caption?.[0]?.plain_text || ''
      return (
        <figure key={id} className="my-6">
          <img
            src={src}
            alt={caption}
            className="rounded-md shadow mx-auto fade-image"
          />
          {caption && (
            <figcaption className="text-sm text-center text-gray-500 mt-2">
              {caption}
            </figcaption>
          )}
        </figure>
      )
    }

    case 'bulleted_list_item':
      return (
        <li key={id} className="list-disc ml-6">
          {value.rich_text.map((text: any, i: number) => (
            <span key={i}>{text.plain_text}</span>
          ))}
        </li>
      )

    case 'child_database':
      return (
        <div
          key={id}
          className="my-6 border border-purple-300 shadow-sm rounded-xl overflow-auto"
        >
          <div className="text-sm font-semibold bg-purple-100 text-purple-700 px-4 py-2 rounded-t-xl">
            📊 {block["child_database"].title || 'Inline Database'}
          </div>
          <div className="p-4 text-sm text-gray-600">
            <em>To display the table content, it must be parsed via Notion API server-side.</em>
          </div>
        </div>
      )

    default:
      return null
  }
}
