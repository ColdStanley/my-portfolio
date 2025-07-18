import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const TASKS_DB_ID = process.env.NOTION_Tasks_DB_ID

if (!TASKS_DB_ID) {
  console.error('Missing NOTION_Tasks_DB_ID environment variable')
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
  const dateStr = date?.start || ''
  // 确保返回的是UTC格式的ISO字符串
  if (dateStr && !dateStr.endsWith('Z')) {
    try {
      return new Date(dateStr).toISOString()
    } catch (error) {
      console.error('Error parsing date:', dateStr)
      return dateStr
    }
  }
  return dateStr
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
    if (!TASKS_DB_ID) {
      return NextResponse.json({ 
        error: 'Tasks database ID not configured' 
      }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // If requesting schema information
    if (action === 'schema') {
      const databaseInfo = await notion.databases.retrieve({
        database_id: TASKS_DB_ID
      })

      const properties = databaseInfo.properties as any
      const statusOptions = properties.status?.select?.options?.map((opt: any) => opt.name) || []
      const priorityOptions = properties.priority_quadrant?.select?.options?.map((opt: any) => opt.name) || []

      return NextResponse.json({ 
        schema: {
          statusOptions,
          priorityOptions
        }
      })
    }

    const response = await notion.databases.query({
      database_id: TASKS_DB_ID,
      page_size: 100,
      sorts: [
        {
          property: 'start_date',
          direction: 'descending',
        }
      ]
    })

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
      }
    })

    return NextResponse.json({ data })

  } catch (error) {
    console.error('Error fetching Tasks data:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Failed to fetch data: ${error.message}` 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'An unknown error occurred' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!TASKS_DB_ID) {
      return NextResponse.json({ 
        error: 'Tasks database ID not configured' 
      }, { status: 500 })
    }

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
      actual_time
    } = body

    const properties: any = {
      title: {
        title: [{ text: { content: title || '' } }]
      }
    }

    if (status) properties.status = { select: { name: status } }
    if (start_date) {
      // 确保时间是UTC格式
      const utcStartDate = start_date.endsWith('Z') ? start_date : new Date(start_date).toISOString()
      properties.start_date = { date: { start: utcStartDate } }
    }
    if (end_date) {
      // 确保时间是UTC格式
      const utcEndDate = end_date.endsWith('Z') ? end_date : new Date(end_date).toISOString()
      properties.end_date = { date: { start: utcEndDate } }
    }
    if (typeof all_day === 'boolean') properties.all_day = { checkbox: all_day }
    if (typeof remind_before === 'number') properties.remind_before = { number: remind_before }
    if (plan && plan.length > 0) {
      properties.plan = { relation: plan.map((id: string) => ({ id })) }
    }
    if (priority_quadrant) properties.priority_quadrant = { select: { name: priority_quadrant } }
    if (note) properties.note = { rich_text: [{ text: { content: note } }] }
    if (actual_start) {
      const utcActualStart = actual_start.endsWith('Z') ? actual_start : new Date(actual_start).toISOString()
      properties.actual_start = { date: { start: utcActualStart } }
    }
    if (actual_end) {
      const utcActualEnd = actual_end.endsWith('Z') ? actual_end : new Date(actual_end).toISOString()
      properties.actual_end = { date: { start: utcActualEnd } }
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
        parent: { database_id: TASKS_DB_ID },
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