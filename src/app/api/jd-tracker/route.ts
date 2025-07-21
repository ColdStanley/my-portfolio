import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints'
import { getUserNotionConfig } from '@/lib/getUserNotionConfig'

export async function GET() {
  try {
    // Since jd-tracker is not yet in user config system, use fallback for now
    // TODO: Add jd_tracker_db_id to user_notion_configs table
    const { config, user, error } = await getUserNotionConfig()
    
    if (error || !config) {
      return NextResponse.json({ 
        error: error || 'Notion not configured' 
      }, { status: 400 })
    }

    const notion = new Client({
      auth: config.notion_api_key,
    })

    // Temporary fallback to environment variable until jd_tracker_db_id is added to user config
    const jdTrackerDbId = process.env.NOTION_JD_Tracker_DB_ID
    if (!jdTrackerDbId) {
      return NextResponse.json({ 
        error: 'JD Tracker database not configured' 
      }, { status: 400 })
    }

    const response = await notion.databases.query({
      database_id: jdTrackerDbId,
      sorts: [
        {
          property: 'importance',
          direction: 'ascending',
        },
        {
          property: 'urgency', 
          direction: 'ascending',
        },
        {
          property: 'fit_score',
          direction: 'descending',
        }
      ],
    })

    const data = response.results.map((page) => {
      const props = (page as PageObjectResponse).properties

      // Helper functions to extract different property types
      const getTitle = (prop: { type?: string; title?: { plain_text?: string }[] }) => 
        prop?.type === 'title' ? prop.title?.[0]?.plain_text || '' : ''
      
      const getText = (prop: { type?: string; rich_text?: { plain_text?: string }[] }) => 
        prop?.type === 'rich_text' ? prop.rich_text?.[0]?.plain_text || '' : ''
      
      const getSelect = (prop: { type?: string; select?: { name?: string } }) => 
        prop?.type === 'select' ? prop.select?.name || '' : ''
      
      const getMultiSelect = (prop: { type?: string; multi_select?: { name: string }[] }) => 
        prop?.type === 'multi_select' ? prop.multi_select?.map(tag => tag.name) || [] : []
      
      const getNumber = (prop: { type?: string; number?: number | null }) => 
        prop?.type === 'number' ? prop.number ?? 0 : 0
      
      const getFiles = (prop: { type?: string; files?: { name: string; file?: { url?: string }; external?: { url?: string }; type: string }[] }) => {
        if (prop?.type === 'files' && prop.files?.length > 0) {
          return prop.files.map(file => ({
            name: file.name,
            url: file.file?.url || file.external?.url || '',
            type: file.type
          }))
        }
        return []
      }

      return {
        id: page.id,
        position_title: getTitle(props.position_title),
        company: getText(props.company),
        position_group: getSelect(props.position_group),
        jd_full_text: getText(props.jd_full_text),
        jd_responsibilities_text: getText(props.jd_responsibilities_text),
        jd_responsibilities_mindmap: getFiles(props.jd_responsibilities_mindmap),
        jd_requirements_text: getText(props.jd_requirements_text),
        jd_requirements_mindmap: getFiles(props.jd_requirements_mindmap),
        fit_score: getNumber(props.fit_score),
        interest_score: getNumber(props.interest_score),
        importance: getSelect(props.importance),
        urgency: getSelect(props.urgency),
        comment: getMultiSelect(props.comment),
        status: getSelect(props.status),
        final_tailored_cv: getFiles(props.final_tailored_cv),
      }
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error: Failed to fetch JD Tracker data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch JD Tracker data from Notion API' },
      { status: 500 }
    )
  }
}