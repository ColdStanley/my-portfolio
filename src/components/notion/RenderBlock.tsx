// ✅ 通用渲染入口组件 RenderBlock.tsx
// ✅ 自动匹配 block 类型，并渲染对应组件（支持嵌套 children）

import React from 'react'
import { 
  ParagraphBlock, 
  QuoteBlock, 
  ListBlock, 
  NumberedListBlock, 
  CalloutBlock,
  DividerBlock 
} from './blocks/SimpleBlocks'
import HeadingBlock from './blocks/HeadingBlock'
import ImageBlock from './blocks/ImageBlock'
import TodoBlock from './blocks/TodoBlock'
import ToggleBlock from './blocks/ToggleBlock'
import TableBlock from './blocks/TableBlock'
import ChildDatabaseBlock from './blocks/ChildDatabaseBlock'
import DatabaseInlineBlock from './blocks/DatabaseInlineBlock'


export default function RenderBlock({ blocks }: { blocks: any[] }) {
  if (!blocks || blocks.length === 0) return null

  return (
    <div className="space-y-6">
      {blocks.map((block) => {
        const { type, id } = block

        switch (type) {
          case 'paragraph':
            return <ParagraphBlock key={id} block={block} />
          case 'heading_1':
          case 'heading_2':
          case 'heading_3':
            return <HeadingBlock key={id} block={block} />
          case 'image':
            return <ImageBlock key={id} block={block} />
          case 'quote':
            return <QuoteBlock key={id} block={block} />
          case 'bulleted_list_item':
            return <ListBlock key={id} block={block} />
          case 'numbered_list_item':
            return <NumberedListBlock key={id} block={block} />
          case 'to_do':
            return <TodoBlock key={id} block={block} />
          case 'toggle':
            return <ToggleBlock key={id} block={block} />
          case 'callout':
            return <CalloutBlock key={id} block={block} />
          case 'divider':
            return <DividerBlock key={id} />
          case 'table':
            return <TableBlock key={id} block={block} />
         case 'child_database':
            return block.parent?.type === 'block_id'
            ? <DatabaseInlineBlock key={id} block={block} />
            : <ChildDatabaseBlock key={id} block={block} />
        default:
        return null
        }
      })}
    </div>
  )
}
