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

    case 'image':
      const src = value.type === 'external' ? value.external.url : value.file.url
      const caption = value.caption?.[0]?.plain_text || ''
      return (
        <figure key={id} className="my-6">
          <img src={src} alt={caption} className="rounded-md shadow" />
          {caption && <figcaption className="text-sm text-center text-gray-500 mt-2">{caption}</figcaption>}
        </figure>
      )

    case 'bulleted_list_item':
      return (
        <li key={id} className="list-disc ml-6">
          {value.rich_text.map((text: any, i: number) => (
            <span key={i}>{text.plain_text}</span>
          ))}
        </li>
      )

    // 更多类型待添加…

    default:
      return null // 若不支持就忽略
  }
}
