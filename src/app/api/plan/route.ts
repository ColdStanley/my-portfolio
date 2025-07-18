import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const PLAN_DB_ID = process.env.NOTION_Plan_DB_ID
const TASKS_DB_ID = process.env.NOTION_Tasks_DB_ID

if (!PLAN_DB_ID) {
  console.error('Missing NOTION_Plan_DB_ID environment variable')
}
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
  return date?.start || ''
}

function extractNumberValue(number: any): number {
  return number ?? 0
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
    if (!PLAN_DB_ID) {
      return NextResponse.json({ 
        error: 'Plan database ID not configured' 
      }, { status: 500 })
    }

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // If requesting schema information
    if (action === 'schema') {
      const databaseInfo = await notion.databases.retrieve({
        database_id: PLAN_DB_ID
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
      database_id: PLAN_DB_ID,
      page_size: 100,
      sorts: [
        {
          property: 'due_date',
          direction: 'ascending',
        }
      ]
    })

    // 获取所有Tasks来计算Progress
    const taskResponse = await notion.databases.query({
      database_id: TASKS_DB_ID!
    })

    const data = await Promise.all(response.results.map(async (page: any) => {
      const properties = page.properties
      const planId = page.id
      
      // 计算budget_time
      const startDate = extractDateValue(properties.start_date?.date)
      const endDate = extractDateValue(properties.due_date?.date)
      const budgetTime = calculateHours(startDate, endDate)
      
      // 计算该Plan下的Tasks进度
      const relatedTasks = taskResponse.results.filter((task: any) => {
        const planRelations = task.properties.plan?.relation || []
        return planRelations.some((plan: any) => plan.id === planId)
      })
      
      const totalTasks = relatedTasks.length
      const completedTasks = relatedTasks.filter((task: any) => {
        const status = task.properties.status?.select?.name || ''
        return status === 'Completed'
      }).length
      
      const calculatedProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

      return {
        id: page.id,
        objective: extractTitleContent(properties.objective?.title),
        description: extractTextContent(properties.description?.rich_text),
        parent_goal: extractRelationValue(properties.parent_goal?.relation),
        start_date: startDate,
        due_date: endDate,
        status: extractSelectValue(properties.status?.select),
        priority_quadrant: extractSelectValue(properties.priority_quadrant?.select),
        progress: calculatedProgress,
        linked_tasks: extractRelationValue(properties.linked_tasks?.relation),
        estimate_resources: extractTextContent(properties.estimate_resources?.rich_text),
        budget_money: extractNumberValue(properties.budget_money?.number),
        budget_time: budgetTime,
        total_tasks: totalTasks,
        completed_tasks: completedTasks
      }
    }))

    return NextResponse.json({ data })

  } catch (error) {
    console.error('Error fetching Plan data:', error)
    
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
    if (!PLAN_DB_ID) {
      return NextResponse.json({ 
        error: 'Plan database ID not configured' 
      }, { status: 500 })
    }

    const body = await request.json()
    const { 
      id,
      objective, 
      description, 
      parent_goal,
      start_date, 
      due_date, 
      status,
      priority_quadrant,
      linked_tasks,
      estimate_resources,
      budget_money
    } = body

    const properties: any = {
      objective: {
        title: [{ text: { content: objective || '' } }]
      }
    }

    if (description) properties.description = { rich_text: [{ text: { content: description } }] }
    if (parent_goal && parent_goal.length > 0) {
      properties.parent_goal = { relation: parent_goal.map((id: string) => ({ id })) }
    }
    if (start_date) properties.start_date = { date: { start: start_date } }
    if (due_date) properties.due_date = { date: { start: due_date } }
    if (status) properties.status = { select: { name: status } }
    if (priority_quadrant) properties.priority_quadrant = { select: { name: priority_quadrant } }
    if (linked_tasks && linked_tasks.length > 0) {
      properties.linked_tasks = { relation: linked_tasks.map((id: string) => ({ id })) }
    }
    if (estimate_resources) properties.estimate_resources = { rich_text: [{ text: { content: estimate_resources } }] }
    if (typeof budget_money === 'number') properties.budget_money = { number: budget_money }
    
    // Auto-calculate budget_time if start_date and due_date are provided
    if (start_date && due_date) {
      const calculatedBudgetTime = calculateHours(start_date, due_date)
      properties.budget_time = { number: calculatedBudgetTime }
    }

    let response
    
    if (id) {
      // Update existing plan
      response = await notion.pages.update({
        page_id: id,
        properties
      })
      
      return NextResponse.json({ success: true, id: response.id, updated: true })
    } else {
      // Create new plan
      response = await notion.pages.create({
        parent: { database_id: PLAN_DB_ID },
        properties
      })
      
      return NextResponse.json({ success: true, id: response.id, created: true })
    }

  } catch (error) {
    console.error('Error creating plan:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Failed to create plan: ${error.message}` 
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
    console.error('Error deleting plan:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Failed to delete plan: ${error.message}` 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'An unknown error occurred' 
    }, { status: 500 })
  }
}