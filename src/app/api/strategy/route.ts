import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const STRATEGY_DB_ID = process.env.NOTION_STRATEGY_DB_ID
const PLAN_DB_ID = process.env.NOTION_Plan_DB_ID

if (!STRATEGY_DB_ID) {
  console.error('Missing NOTION_STRATEGY_DB_ID environment variable')
}
if (!PLAN_DB_ID) {
  console.error('Missing NOTION_Plan_DB_ID environment variable')
}

function extractTextContent(richText: any[]): string {
  if (!richText || !Array.isArray(richText)) return ''
  return richText.map(block => block.plain_text || '').join('')
}

function extractTitleContent(title: any[]): string {
  if (!title || !Array.isArray(title)) return ''
  return title.map(block => block.plain_text || '').join('')
}

function extractSelectValue(select: any): string {
  return select?.name || ''
}

function extractDateValue(date: any): string {
  return date?.start || ''
}

function extractNumberValue(number: any): number {
  return number ?? 0
}

export async function GET(request: NextRequest) {
  try {
    if (!STRATEGY_DB_ID) {
      return NextResponse.json({ 
        error: 'Strategy database ID not configured' 
      }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Test database connection first
    if (action === 'test') {
      const databaseInfo = await notion.databases.retrieve({
        database_id: STRATEGY_DB_ID
      })
      
      return NextResponse.json({ 
        success: true,
        database_title: databaseInfo.title,
        properties: Object.keys(databaseInfo.properties || {})
      })
    }

    // If requesting schema information
    if (action === 'schema') {
      const databaseInfo = await notion.databases.retrieve({
        database_id: STRATEGY_DB_ID
      })

      const properties = databaseInfo.properties as any
      const statusOptions = properties.status?.select?.options?.map((opt: any) => opt.name) || []
      const categoryOptions = properties.category?.select?.options?.map((opt: any) => opt.name) || []
      const priorityOptions = properties.priority_quadrant?.select?.options?.map((opt: any) => opt.name) || []

      return NextResponse.json({ 
        schema: {
          statusOptions,
          categoryOptions,
          priorityOptions
        }
      })
    }

    const response = await notion.databases.query({
      database_id: STRATEGY_DB_ID,
      page_size: 100,
      sorts: [
        {
          property: 'due_date',
          direction: 'ascending',
        }
      ]
    })

    // 获取所有Plans来计算Progress
    const planResponse = await notion.databases.query({
      database_id: PLAN_DB_ID!
    })
    
    const data = await Promise.all(response.results.map(async (page: any) => {
      const properties = page.properties
      const strategyId = page.id
      
      // 计算该Strategy下的Plans进度
      const relatedPlans = planResponse.results.filter((plan: any) => {
        const parentGoals = plan.properties.parent_goal?.relation || []
        return parentGoals.some((goal: any) => goal.id === strategyId)
      })
      
      const totalPlans = relatedPlans.length
      const completedPlans = relatedPlans.filter((plan: any) => {
        const status = plan.properties.status?.select?.name || ''
        return status === 'Completed'
      }).length
      
      const calculatedProgress = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0

      return {
        id: page.id,
        objective: extractTitleContent(properties.objective?.title),
        description: extractTextContent(properties.description?.rich_text),
        key_results: extractTextContent(properties.key_results?.rich_text),
        progress: calculatedProgress,
        start_date: extractDateValue(properties.start_date?.date),
        due_date: extractDateValue(properties.due_date?.date),
        status: extractSelectValue(properties.status?.select),
        category: extractSelectValue(properties.category?.select),
        priority_quadrant: extractSelectValue(properties.priority_quadrant?.select),
        estimate_cost: extractTextContent(properties.estimate_cost?.rich_text),
        order: extractNumberValue(properties.order?.number),
        total_plans: totalPlans,
        completed_plans: completedPlans
      }
    }))

    return NextResponse.json({ data })

  } catch (error) {
    console.error('Error fetching Strategy data:', error)
    console.error('Full error details:', JSON.stringify(error, null, 2))
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Failed to fetch data: ${error.message}`,
        details: error.stack,
        database_id: STRATEGY_DB_ID
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'An unknown error occurred',
      database_id: STRATEGY_DB_ID
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!STRATEGY_DB_ID) {
      return NextResponse.json({ 
        error: 'Strategy database ID not configured' 
      }, { status: 500 })
    }

    const body = await request.json()
    console.log('Strategy API received body:', body)
    
    const { 
      id,
      objective, 
      description, 
      key_results,
      start_date, 
      due_date, 
      status,
      category,
      priority_quadrant,
      estimate_cost,
      order
    } = body

    const properties: any = {}

    // For creating new strategy, objective is required. For updates, it's optional
    if (id) {
      // Update mode - only update provided fields
      if (objective !== undefined) properties.objective = { title: [{ text: { content: objective } }] }
    } else {
      // Create mode - objective is required
      properties.objective = { title: [{ text: { content: objective || '' } }] }
    }
    if (description !== undefined) properties.description = { rich_text: [{ text: { content: description } }] }
    if (key_results !== undefined) properties.key_results = { rich_text: [{ text: { content: key_results } }] }
    if (start_date !== undefined) properties.start_date = { date: { start: start_date } }
    if (due_date !== undefined) properties.due_date = { date: { start: due_date } }
    if (status !== undefined) properties.status = { select: { name: status } }
    if (category !== undefined) properties.category = { select: { name: category } }
    if (priority_quadrant !== undefined) properties.priority_quadrant = { select: { name: priority_quadrant } }
    if (estimate_cost !== undefined) properties.estimate_cost = { rich_text: [{ text: { content: estimate_cost } }] }
    if (typeof order === 'number') properties.order = { number: order }

    console.log('Properties to update:', properties)

    let response
    
    if (id) {
      // Update existing strategy
      console.log('Updating strategy with ID:', id)
      response = await notion.pages.update({
        page_id: id,
        properties
      })
      
      console.log('Update response:', response.id)
      return NextResponse.json({ success: true, id: response.id, updated: true })
    } else {
      // Create new strategy
      console.log('Creating new strategy')
      response = await notion.pages.create({
        parent: { database_id: STRATEGY_DB_ID },
        properties
      })
      
      console.log('Create response:', response.id)
      return NextResponse.json({ success: true, id: response.id, created: true })
    }

  } catch (error) {
    console.error('Error in strategy operation:', error)
    console.error('Error details:', {
      name: (error as any)?.name,
      message: (error as any)?.message,
      code: (error as any)?.code,
      status: (error as any)?.status
    })
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Failed to process strategy: ${error.message}`,
        details: error.stack
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'An unknown error occurred' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageId = searchParams.get('id')
    
    if (!pageId) {
      return NextResponse.json({ 
        error: 'Page ID is required' 
      }, { status: 400 })
    }

    await notion.pages.update({
      page_id: pageId,
      archived: true
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting strategy:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Failed to delete strategy: ${error.message}` 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'An unknown error occurred' 
    }, { status: 500 })
  }
}