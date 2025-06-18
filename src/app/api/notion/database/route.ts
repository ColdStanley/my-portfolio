import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const databaseId = process.env.NOTION_DATABASE_ID

if (!databaseId) throw new Error('❌ Missing NOTION_DATABASE_ID')

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const pageId = searchParams.get('pageId')

  if (!pageId || !['cards', 'home-latest'].includes(pageId)) {
    return NextResponse.json({ error: 'Page not found.' }, { status: 404 })
  }

  const sectionName = pageId === 'cards' ? 'Cards' : 'LatestHighlightCard'

  try {
    const res = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Section',
        select: {
          equals: sectionName,
        },
      },
      sorts: [
        {
          property: 'Order',
          direction: 'ascending',
        },
      ],
    })

    const data = res.results.map((page) => {
      const props = (page as PageObjectResponse).properties

      return {
        id: page.id,
        title:
          props.Title?.type === 'title'
            ? props.Title.title?.[0]?.plain_text || ''
            : '',
        description:
          props.Description?.type === 'rich_text'
            ? props.Description.rich_text?.[0]?.plain_text || ''
            : '',
        subtext:
          props.Subtext?.type === 'rich_text'
            ? props.Subtext.rich_text?.[0]?.plain_text || ''
            : '',
        link: props.Link?.type === 'url' ? props.Link.url || '' : '',
        imageUrl:
          props.Image?.type === 'files'
            ? props.Image.files?.[0]?.file?.url ||
              props.Image.files?.[0]?.external?.url ||
              ''
            : '',
        section:
          props.Section?.type === 'select'
            ? props.Section.select?.name || ''
            : '',
        category:
          props.Category?.type === 'select'
            ? props.Category.select?.name?.toLowerCase() || ''
            : '',
        slug:
          props.Slug?.type === 'url'
            ? props.Slug.url || ''
            : props.Slug?.type === 'rich_text'
            ? props.Slug.rich_text?.[0]?.plain_text || ''
            : '',
        body:
          props.Body?.type === 'rich_text'
            ? props.Body.rich_text?.[0]?.plain_text || ''
            : '',
        tag:
          props.Tag?.type === 'multi_select'
            ? props.Tag.multi_select.map((tag) => tag.name)
            : [],
        status:
          props.Status?.type === 'select'
            ? props.Status.select?.name || ''
            : '',
        order:
          props.Order?.type === 'number' ? props.Order.number ?? 0 : 0,

        // ✅ 新增字段：VisibleOnSite
        visibleOnSite:
          props.VisibleOnSite?.type === 'checkbox'
            ? props.VisibleOnSite.checkbox
            : false,
      }
    })

    return NextResponse.json({ data })
  } catch (err) {
    console.error('❌ Failed to fetch Notion database content:', err)
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}
