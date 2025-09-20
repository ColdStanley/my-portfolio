import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'

const notion = new Client({ auth: process.env.NOTION_API_KEY })
const databaseId = process.env.NOTION_PROMPT_MANAGER_NOTION_DB_ID

if (!databaseId) throw new Error('❌ Missing NOTION_PROMPT_MANAGER_NOTION_DB_ID')

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const project = searchParams.get('project')
  const agent = searchParams.get('agent')

  if (!project || !agent) {
    return NextResponse.json({
      error: 'Missing required parameters: project and agent'
    }, { status: 400 })
  }

  try {
    const res = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: 'Project',
            select: {
              equals: project,
            },
          },
          {
            property: 'Agent',
            select: {
              equals: agent,
            },
          },
          {
            property: 'Status',
            select: {
              equals: 'Active',
            },
          },
        ],
      },
      sorts: [
        {
          property: 'Version',
          direction: 'descending',
        },
      ],
    })

    if (res.results.length === 0) {
      return NextResponse.json({
        error: `No active prompt found for project: ${project}, agent: ${agent}`
      }, { status: 404 })
    }

    const page = res.results[0] as PageObjectResponse
    const props = page.properties

    const promptContent = props.PromptContent?.type === 'rich_text'
      ? props.PromptContent.rich_text?.[0]?.plain_text || ''
      : ''

    if (!promptContent) {
      return NextResponse.json({
        error: `Empty prompt content for project: ${project}, agent: ${agent}`
      }, { status: 404 })
    }

    const version = props.Version?.type === 'number'
      ? props.Version.number ?? 0
      : 0

    const description = props.Description?.type === 'rich_text'
      ? props.Description.rich_text?.[0]?.plain_text || ''
      : ''

    return NextResponse.json({
      promptContent,
      version,
      description,
      project,
      agent
    })

  } catch (err) {
    console.error('❌ Failed to fetch prompt from Notion:', err)
    return NextResponse.json({
      error: 'Failed to fetch prompt from Notion database'
    }, { status: 500 })
  }
}