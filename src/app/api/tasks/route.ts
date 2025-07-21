import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { getDatabaseConfig } from '@/lib/getUserNotionConfig'

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
  // 直接返回原始日期字符串，不进行UTC转换
  return date?.start || ''
}

function extractNumberValue(number: any): number {
  return number ?? 0
}

function extractCheckboxValue(checkbox: any): boolean {
  return checkbox === true
}

function extractRelationValue(relation: any[]): string[] {
  if (!relation || !Array.isArray(relation)) return []
  return relation.map(item => item.id)
}

// Calculate hours between two dates
function calculateHours(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffMs = end.getTime() - start.getTime()
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100 // Round to 2 decimal places
}

export async function GET(request: NextRequest) {
  try {
    console.log('Tasks API: Starting request...')
    
    // 获取用户的Notion配置
    const { config, user, error } = await getDatabaseConfig('tasks')
    
    console.log('Tasks API: Config result:', { 
      hasConfig: !!config, 
      hasUser: !!user, 
      error,
      databaseId: config?.database_id ? `${config.database_id.substring(0, 8)}...` : 'none'
    })
    
    if (error || !config) {
      console.log('Tasks API: Configuration error:', error)
      return NextResponse.json({ 
        error: error || 'Tasks database not configured' 
      }, { status: 400 })
    }

    console.log('Tasks API: Creating Notion client...')
    const notion = new Client({
      auth: config.notion_api_key,
    })

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // If requesting schema information
    if (action === 'schema') {
      console.log('Tasks API: Requesting schema...')
      try {
        const databaseInfo = await notion.databases.retrieve({
          database_id: config.database_id
        })

        const properties = databaseInfo.properties as any
        const statusOptions = properties.status?.select?.options?.map((opt: any) => opt.name) || []
        const priorityOptions = properties.priority_quadrant?.select?.options?.map((opt: any) => opt.name) || []

        console.log('Tasks API: Schema retrieved successfully')
        return NextResponse.json({ 
          schema: {
            statusOptions,
            priorityOptions
          }
        })
      } catch (schemaError) {
        console.error('Tasks API: Schema retrieval failed:', schemaError)
        throw schemaError
      }
    }

    console.log('Tasks API: Querying database...')
    let response
    try {
      response = await notion.databases.query({
        database_id: config.database_id,
        page_size: 100,
        sorts: [
          {
            property: 'start_date',
            direction: 'descending',
          }
        ]
      })
      
      console.log('Tasks API: Database query successful, results:', response.results.length)
    } catch (queryError) {
      console.error('Tasks API: Database query failed:', queryError)
      throw queryError
    }

    const data = response.results.map((page: any) => {
      const properties = page.properties

      return {
        id: page.id,
        title: extractTitleContent(properties.title?.title),
        status: extractSelectValue(properties.status?.select),
        start_date: extractDateValue(properties.start_date?.date),
        end_date: extractDateValue(properties.end_date?.date),
        all_day: extractCheckboxValue(properties.all_day?.checkbox),
        remind_before: extractNumberValue(properties.remind_before?.number),
        plan: extractRelationValue(properties.plan?.relation),
        priority_quadrant: extractSelectValue(properties.priority_quadrant?.select),
        note: extractTextContent(properties.note?.rich_text),
        actual_start: extractDateValue(properties.actual_start?.date),
        actual_end: extractDateValue(properties.actual_end?.date),
        budget_time: extractNumberValue(properties.budget_time?.number),
        actual_time: extractNumberValue(properties.actual_time?.number),
        quality_rating: extractNumberValue(properties.quality_rating?.number),
        next: extractTextContent(properties.next?.rich_text),
        is_plan_critical: extractCheckboxValue(properties.is_plan_critical?.checkbox),
        timer_status: extractSelectValue(properties.timer_status?.select),
      }
    })

    return NextResponse.json({ data })

  } catch (error) {
    console.error('Tasks API: Error fetching Tasks data:', error)
    
    if (error instanceof Error) {
      // 检查是否是Notion API相关的错误
      if (error.message.includes('unauthorized') || error.message.includes('Unauthorized')) {
        return NextResponse.json({ 
          error: 'Notion API key is invalid or has expired. Please check your Notion integration settings.' 
        }, { status: 401 })
      }
      
      if (error.message.includes('not_found') || error.message.includes('Could not find database')) {
        return NextResponse.json({ 
          error: 'Tasks database not found. Please verify your database ID in the Notion configuration.' 
        }, { status: 404 })
      }
      
      if (error.message.includes('restricted_resource')) {
        return NextResponse.json({ 
          error: 'Access denied to the tasks database. Please ensure your Notion integration has access to this database.' 
        }, { status: 403 })
      }
      
      console.error('Tasks API: Detailed error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
      
      return NextResponse.json({ 
        error: `Failed to fetch tasks: ${error.message}`,
        details: 'Check server logs for more information'
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'An unknown error occurred while fetching tasks' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // 获取用户的Notion配置
    const { config, user, error } = await getDatabaseConfig('tasks')
    
    if (error || !config) {
      return NextResponse.json({ 
        error: error || 'Tasks database not configured' 
      }, { status: 400 })
    }

    const notion = new Client({
      auth: config.notion_api_key,
    })

    const body = await request.json()
    const { 
      id, // 添加id字段来判断是否是编辑
      title, 
      status, 
      start_date, 
      end_date, 
      all_day,
      remind_before,
      plan,
      priority_quadrant,
      note,
      actual_start,
      actual_end,
      budget_time,
      actual_time,
      quality_rating,
      next,
      is_plan_critical,
      timer_status
    } = body

    const properties: any = {
      title: {
        title: [{ text: { content: title || '' } }]
      }
    }

    if (status) properties.status = { select: { name: status } }
    if (start_date) {
      // 保持原始日期时间，不进行UTC转换以避免日期偏移
      properties.start_date = { date: { start: start_date } }
    }
    if (end_date) {
      // 保持原始日期时间，不进行UTC转换以避免日期偏移
      properties.end_date = { date: { start: end_date } }
    }
    if (typeof all_day === 'boolean') properties.all_day = { checkbox: all_day }
    if (typeof remind_before === 'number') properties.remind_before = { number: remind_before }
    if (plan && plan.length > 0) {
      properties.plan = { relation: plan.map((id: string) => ({ id })) }
    }
    if (priority_quadrant) properties.priority_quadrant = { select: { name: priority_quadrant } }
    if (note) properties.note = { rich_text: [{ text: { content: note } }] }
    if (actual_start) {
      // 保持原始日期时间，不进行UTC转换以避免日期偏移
      properties.actual_start = { date: { start: actual_start } }
    }
    if (actual_end) {
      // 保持原始日期时间，不进行UTC转换以避免日期偏移
      properties.actual_end = { date: { start: actual_end } }
    }
    
    // Auto-calculate budget_time if start_date and end_date are provided
    if (start_date && end_date) {
      const calculatedBudgetTime = calculateHours(start_date, end_date)
      properties.budget_time = { number: calculatedBudgetTime }
    } else if (typeof budget_time === 'number') {
      properties.budget_time = { number: budget_time }
    }
    
    // Auto-calculate actual_time if actual_start and actual_end are provided
    if (actual_start && actual_end) {
      const calculatedActualTime = calculateHours(actual_start, actual_end)
      properties.actual_time = { number: calculatedActualTime }
    } else if (typeof actual_time === 'number') {
      properties.actual_time = { number: actual_time }
    }

    // Add quality_rating if provided
    if (typeof quality_rating === 'number') {
      properties.quality_rating = { number: quality_rating }
    }

    // Add next if provided
    if (next) {
      properties.next = { rich_text: [{ text: { content: next } }] }
    }

    // Add is_plan_critical if provided
    if (typeof is_plan_critical === 'boolean') {
      properties.is_plan_critical = { checkbox: is_plan_critical }
    }

    // Add timer_status if provided
    if (timer_status) {
      properties.timer_status = { select: { name: timer_status } }
    }

    let response
    
    if (id) {
      // 更新现有任务
      response = await notion.pages.update({
        page_id: id,
        properties
      })
      
      return NextResponse.json({ success: true, id: response.id, updated: true })
    } else {
      // 创建新任务
      response = await notion.pages.create({
        parent: { database_id: config.database_id },
        properties
      })
      
      return NextResponse.json({ success: true, id: response.id, created: true })
    }

  } catch (error) {
    console.error('Error creating task:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Failed to create task: ${error.message}` 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'An unknown error occurred' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 获取用户的Notion配置
    const { config, error } = await getDatabaseConfig('tasks')
    
    if (error || !config) {
      return NextResponse.json({ 
        error: error || 'Tasks database not configured' 
      }, { status: 400 })
    }

    const notion = new Client({
      auth: config.notion_api_key,
    })

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
    console.error('Error deleting task:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Failed to delete task: ${error.message}` 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'An unknown error occurred' 
    }, { status: 500 })
  }
}