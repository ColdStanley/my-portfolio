// src/app/api/notion/page/route.ts

import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import {
  BlockObjectResponse,
  PartialBlockObjectResponse,
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
  } catch {
    return url
  }
  return url
}

function renderRichText(richTextArray: any[]): string {
  return richTextArray.map(rt => rt.plain_text).join('')
}

async function fetchBlockChildren(blockId: string): Promise<BlockObjectResponse[]> {
  const children: BlockObjectResponse[] = []
  let cursor: string | undefined = undefined

  do {
    const res = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
    })
    children.push(...(res.results as BlockObjectResponse[]))
    cursor = res.has_more ? res.next_cursor || undefined : undefined
  } while (cursor)

  return children
}

async function renderDatabase(block: BlockObjectResponse): Promise<string> {
  const rows = await fetchBlockChildren(block.id)

  const headerRow = rows[0]?.type === 'table_row' ? rows[0].table_row?.cells || [] : []
  const headers = headerRow.map(cell => renderRichText(cell))

  const bodyRows = rows.slice(1).map(row => {
    const cells = row.type === 'table_row' ? row.table_row?.cells || [] : []
    const cellHTML = cells.map(cell => `<td>${renderRichText(cell)}</td>`).join('')
    return `<tr>${cellHTML}</tr>`
  })

  const thead = `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`
  const tbody = `<tbody>${bodyRows.join('')}</tbody>`

  return `<table class="notion-table">${thead}${tbody}</table>`
}

async function renderBlock(block: BlockObjectResponse): Promise<string> {
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
      const src = block.image.type === 'file'
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
    case 'numbered_list_item': {
      const tag = block.type === 'bulleted_list_item' ? 'ul' : 'ol'
      const children = await fetchBlockChildren(block.id)
      const nested = children.length > 0
        ? `<${tag}>${(await Promise.all(children.map(renderBlock))).join('')}</${tag}>`
        : ''
      const text = renderRichText(block[block.type].rich_text)
      return `<${tag}><li>${text}${nested}</li></${tag}>`
    }

    case 'divider':
      return `<hr />`

    case 'callout':
      return `<div style="padding: 0.5em 1em; background-color: #f9f9f9;">${renderRichText(block.callout.rich_text)}</div>`

    case 'toggle': {
      const children = await fetchBlockChildren(block.id)
      const content = await Promise.all(children.map(renderBlock))
      return `<details class="notion-toggle"><summary>${renderRichText(block.toggle.rich_text)}</summary>${content.join('')}</details>`
    }

    case 'child_page':
      return `<p><strong>📄 ${block.child_page.title}</strong></p>`

    case 'child_database':
      return await renderDatabase(block)

    case 'table': {
      const children = await fetchBlockChildren(block.id)
      const rows = await Promise.all(children.map(renderBlock))
      return `<table class="notion-table">${rows.join('')}</table>`
    }

    case 'table_row': {
      const cells = block.table_row?.cells || []
      const cellHTML = cells.map(cell => `<td>${renderRichText(cell)}</td>`).join('')
      return `<tr>${cellHTML}</tr>`
    }

    case 'bookmark':
      return `<a href="${block.bookmark.url}" target="_blank">${block.bookmark.url}</a>`

    default:
      return ''
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageId = searchParams.get('pageId')

  if (!pageId) {
    return NextResponse.json({ error: 'Missing pageId parameter' }, { status: 400 })
  }

  try {
    const blocks = await fetchBlockChildren(pageId)
    const htmlParts = await Promise.all(blocks.map(renderBlock))
    return NextResponse.json({
      html: htmlParts.join('\n'),
    })
  } catch (error) {
    console.error('❌ Error rendering Notion page:', error)
    return NextResponse.json({ error: 'Failed to render Notion content' }, { status: 500 })
  }
}
