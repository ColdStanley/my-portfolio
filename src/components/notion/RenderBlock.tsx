// ✅ 通用渲染入口组件 RenderBlock.tsx
// ✅ 自动匹配 block 类型，并渲染对应组件（易拓展 / 暗黑兼容）

import React from 'react'
import ParagraphBlock from './blocks/ParagraphBlock'
import HeadingBlock from './blocks/HeadingBlock'
import ImageBlock from './blocks/ImageBlock'
import QuoteBlock from './blocks/QuoteBlock'
import ListBlock from './blocks/ListBlock'
import ChildDatabaseBlock from './blocks/ChildDatabaseBlock'

export default function RenderBlock({ blocks }: { blocks: any[] }) {
  if (!blocks || blocks.length === 0) return null

  return (
    <div className="space-y-4">
      {blocks.map((block) => {
        const { type, id } = block
        switch (type) {
          case 'paragraph':
            return <ParagraphBlock block={block} key={id} />
          case 'heading_1':
          case 'heading_2':
            return <HeadingBlock block={block} key={id} />
          case 'image':
            return <ImageBlock block={block} key={id} />
          case 'quote':
            return <QuoteBlock block={block} key={id} />
          case 'bulleted_list_item':
            return <ListBlock block={block} key={id} />
          case 'child_database':
            return <ChildDatabaseBlock block={block} key={id} />
          default:
            return null
        }
      })}
    </div>
  )
}
