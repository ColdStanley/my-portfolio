import { Client } from '@notionhq/client'
import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

export async function fetchBlockChildrenRecursively(blockId: string): Promise<BlockObjectResponse[]> {
  const children: BlockObjectResponse[] = []
  let cursor: string | undefined = undefined

  do {
    const res = await notion.blocks.children.list({ block_id: blockId, start_cursor: cursor })
    const blocks = res.results as BlockObjectResponse[]
    for (const block of blocks) {
      if ('has_children' in block && block.has_children) {
        const nested = await fetchBlockChildrenRecursively(block.id)
        ;(block as any).children = nested
      }
    }
    children.push(...blocks)
    cursor = res.has_more ? res.next_cursor || undefined : undefined
  } while (cursor)

  return children
}
