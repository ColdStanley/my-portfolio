// src/app/api/notion/page/route.ts

import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import {
  BlockObjectResponse,
} from '@notionhq/client/build/src/api-endpoints'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

function convertToYouTubeEmbed(url: string): string {
  try {
    const yt = new URL(url)
    if (yt.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed/${yt.pathname.slice(1)}`
    }
    if (yt.hostname.includes('youtube.com') && yt.searchParams.get('v')) {
      return `https://www.youtube.com/embed/${yt.searchParams.get('v')}`
    }
  } catch (e) {
    return url
  }
  return url
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageId = searchParams.get('pageId')

  if (!pageId) {
    return NextResponse.json({ error: 'Missing pageId parameter' }, { status: 400 })
  }

  try {
    const blocks: BlockObjectResponse[] = []
    let cursor: string | undefined = undefined

    // 分页获取所有 block
    do {
      const response = await notion.blocks.children.list({
        block_id: pageId,
        start_cursor: cursor,
      })
      blocks.push(...(response.results as BlockObjectResponse[]))
      cursor = response.has_more ? response.next_cursor || undefined : undefined
    } while (cursor)

    // 辅助函数：格式化 rich_text
    const renderRichText = (richTextArray: any[]) =>
      richTextArray.map(rt => rt.plain_text).join('')

    // 拼接 HTML
    const htmlParts = await Promise.all(
      blocks.map(async (block) => {
        switch (block.type) {
          case 'paragraph':
            return `<p>${renderRichText(block.paragraph.rich_text)}</p>`

          case 'heading_1':
            return `<h1>${renderRichText(block.heading_1.rich_text)}</h1>`

          case 'heading_2':
            return `<h2>${renderRichText(block.heading_2.rich_text)}</h2>`

          case 'heading_3':
            return `<h3>${renderRichText(block.heading_3.rich_text)}</h3>`

          case 'quote':
            return `<blockquote>${renderRichText(block.quote.rich_text)}</blockquote>`

          case 'code':
            return `<pre><code>${renderRichText(block.code.rich_text)}</code></pre>`

          case 'image': {
            const src =
              block.image.type === 'file'
                ? block.image.file.url
                : block.image.external.url
            const alt = block.image.caption?.[0]?.plain_text || ''
            return `<figure><img src="${src}" alt="${alt}" style="max-width:100%; border-radius:8px; margin:16px 0;" />${alt ? `<figcaption style="text-align:center; font-size:0.85rem; color:#888;">${alt}</figcaption>` : ''}</figure>`
          }

          case 'embed': {
            const url = block.embed.url
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
              return `<div class="video-container"><iframe width="560" height="315" src="${convertToYouTubeEmbed(url)}" frameborder="0" allowfullscreen></iframe></div>`
            }
            return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
          }

          case 'bulleted_list_item':
            return `<ul><li>${renderRichText(block.bulleted_list_item.rich_text)}</li></ul>`

          case 'numbered_list_item':
            return `<ol><li>${renderRichText(block.numbered_list_item.rich_text)}</li></ol>`

          default:
            return ''
        }
      })
    )

    return NextResponse.json({
      html: htmlParts.join('\n'),
    })
  } catch (error) {
    console.error('❌ Error fetching Notion page blocks:', error)
    return NextResponse.json({ error: 'Failed to fetch page content' }, { status: 500 })
  }
}
