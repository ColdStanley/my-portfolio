// ✅ 通用渲染入口组件 RenderBlock.tsx
// ✅ 自动匹配 block 类型，并渲染对应组件（支持嵌套 children）

import React from 'react'
import ParagraphBlock from './blocks/ParagraphBlock'
import HeadingBlock from './blocks/HeadingBlock'
import ImageBlock from './blocks/ImageBlock'
import QuoteBlock from './blocks/QuoteBlock'
import ListBlock from './blocks/ListBlock'
import NumberedListBlock from './blocks/NumberedListBlock'
import TodoBlock from './blocks/TodoBlock'
import ToggleBlock from './blocks/ToggleBlock'
import CalloutBlock from './blocks/CalloutBlock'
import DividerBlock from './blocks/DividerBlock'
import TableBlock from './blocks/TableBlock'
import ChildDatabaseBlock from './blocks/ChildDatabaseBlock'

export default function RenderBlock({ blocks }: { blocks: any[] }) {
  if (!blocks || blocks.length === 0) return null

  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        const { type, id } = block

        // ✅ 将 children 注入各 block 支持嵌套渲染
        const props = { block, key: id }
        if (block.has_children && block.children) {
          (props as any).block.children = block.children
        }

        switch (type) {
          case 'paragraph':
            return <ParagraphBlock {...props} />
          case 'heading_1':
          case 'heading_2':
            return <HeadingBlock {...props} />
          case 'image':
            return <ImageBlock {...props} />
          case 'quote':
            return <QuoteBlock {...props} />
          case 'bulleted_list_item':
            return <ListBlock {...props} />
          case 'numbered_list_item':
            return <NumberedListBlock {...props} />
          case 'to_do':
            return <TodoBlock {...props} />
          case 'toggle':
            return <ToggleBlock {...props} />
          case 'callout':
            return <CalloutBlock {...props} />
          case 'divider':
            return <DividerBlock key={id} />
          case 'table':
            return <TableBlock {...props} />
          case 'child_database':
            return <ChildDatabaseBlock {...props} />
          default:
            return null
        }
      })}
    </div>
  )
}
