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

    // 获取所有 blocks
    do {
      const response = await notion.blocks.children.list({
        block_id: pageId,
        start_cursor: cursor,
      })
      blocks.push(...(response.results as BlockObjectResponse[]))
      cursor = response.has_more ? response.next_cursor || undefined : undefined
    } while (cursor)

    // 将 blocks 渲染为 HTML（不再包含 child_database）
    const html = await Promise.all(
      blocks.map(async (block) => {
        switch (block.type) {
          case 'paragraph':
            return `<p>${block.paragraph.rich_text.map(rt => rt.plain_text).join('')}</p>`
          case 'heading_1':
            return `<h1>${block.heading_1.rich_text.map(rt => rt.plain_text).join('')}</h1>`
          case 'heading_2':
            return `<h2>${block.heading_2.rich_text.map(rt => rt.plain_text).join('')}</h2>`
          case 'heading_3':
            return `<h3>${block.heading_3.rich_text.map(rt => rt.plain_text).join('')}</h3>`
          case 'image': {
            const src = block.image.type === 'file'
              ? block.image.file.url
              : block.image.external.url
            const alt = block.image.caption?.[0]?.plain_text || ''
            return `<img src="${src}" alt="${alt}" style="max-width:100%; border-radius:8px; margin:16px 0;" />`
          }
          case 'code':
            return `<pre><code>${block.code.rich_text.map(rt => rt.plain_text).join('')}</code></pre>`
          case 'quote':
            return `<blockquote>${block.quote.rich_text.map(rt => rt.plain_text).join('')}</blockquote>`
          case 'embed': {
            const url = block.embed.url
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
              return `<div class="video-container"><iframe width="560" height="315" src="${convertToYouTubeEmbed(url)}" frameborder="0" allowfullscreen></iframe></div>`
            }
            return `<a href="${url}" target="_blank">${url}</a>`
          }
          case 'bulleted_list_item':
            return `<ul><li>${block.bulleted_list_item.rich_text.map(rt => rt.plain_text).join('')}</li></ul>`
          case 'numbered_list_item':
            return `<ol><li>${block.numbered_list_item.rich_text.map(rt => rt.plain_text).join('')}</li></ol>`
          default:
            return ''
        }
      })
    )

    return NextResponse.json({
      html: html.join('\n'),
    })
  } catch (error) {
    console.error('❌ Error fetching Notion page blocks:', error)
    return NextResponse.json({ error: 'Failed to fetch page content' }, { status: 500 })
  }
}
