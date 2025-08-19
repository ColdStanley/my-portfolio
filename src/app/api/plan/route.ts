import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'
import { getNotionDatabaseConfig } from '@/lib/getSimplifiedUserConfig'

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

function extractRelationValue(relation: any[]): string {
  if (!relation || !Array.isArray(relation) || relation.length === 0) return ''
  return relation[0].id // 取第一个relation的id作为单个字符串
}

function extractRelationArrayValue(relation: any[]): string[] {
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
    // 获取用户的Plan数据库配置
    const { config: planConfig, user, error } = await getNotionDatabaseConfig('plan')
    
    if (error || !planConfig) {
      return NextResponse.json({ 
        error: error || 'Plan database not configured' 
      }, { status: 400 })
    }

    // 获取Tasks数据库配置（用于计算进度）
    const { config: tasksConfig } = await getNotionDatabaseConfig('tasks')
    
    const notion = new Client({
      auth: planConfig.notion_api_key,
    })

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // If requesting schema information
    if (action === 'schema') {
      const databaseInfo = await notion.databases.retrieve({
        database_id: planConfig.database_id
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
      database_id: planConfig.database_id,
      page_size: 100,
      sorts: [
        {
          property: 'due_date',
          direction: 'ascending',
        }
      ]
    })

    // 获取所有Tasks来计算Progress (如果Tasks数据库已配置)
    let taskResponse = null
    if (tasksConfig) {
      taskResponse = await notion.databases.query({
        database_id: tasksConfig.database_id
      })
    }

    const data = await Promise.all(response.results.map(async (page: any) => {
      const properties = page.properties
      const planId = page.id
      
      // 计算该Plan下的Tasks进度
      let totalTasks = 0
      let completedTasks = 0
      let calculatedProgress = 0
      
      if (taskResponse) {
        const relatedTasks = taskResponse.results.filter((task: any) => {
          const planRelations = task.properties.plan?.relation || []
          return planRelations.some((plan: any) => plan.id === planId)
        })
        
        totalTasks = relatedTasks.length
        completedTasks = relatedTasks.filter((task: any) => {
          const status = task.properties.status?.select?.name || ''
          return status === 'Completed'
        }).length
        
        calculatedProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      }

      return {
        id: page.id,
        objective: extractTitleContent(properties.objective?.title),
        description: extractTextContent(properties.description?.rich_text),
        strategy: extractRelationValue(properties.strategy?.relation),
        start_date: extractDateValue(properties.start_date?.date),
        due_date: extractDateValue(properties.due_date?.date),
        status: extractSelectValue(properties.status?.select),
        priority_quadrant: extractSelectValue(properties.priority_quadrant?.select),
        progress: calculatedProgress,
        task: extractRelationArrayValue(properties.task?.relation),
        estimate_resources: extractTextContent(properties.estimate_resources?.rich_text),
        budget_money: extractNumberValue(properties.budget_money?.number),
        budget_time: extractNumberValue(properties.budget_time?.number),
        display_order: extractNumberValue(properties.display_order?.number),
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
    // 获取用户的Plan数据库配置
    const { config: planConfig, user, error } = await getNotionDatabaseConfig('plan')
    
    if (error || !planConfig) {
      return NextResponse.json({ 
        error: error || 'Plan database not configured' 
      }, { status: 400 })
    }

    const notion = new Client({
      auth: planConfig.notion_api_key,
    })

    const body = await request.json()
    
    const { 
      id,
      objective, 
      description, 
      strategy,
      start_date, 
      due_date, 
      status,
      priority_quadrant,
      estimate_resources,
      budget_money,
      budget_time,
      display_order
    } = body

    const properties: any = {
      objective: {
        title: [{ text: { content: objective || '' } }]
      }
    }

    if (description) properties.description = { rich_text: [{ text: { content: description } }] }
    if (strategy) {
      properties.strategy = { relation: [{ id: strategy }] }
    }
    if (start_date) properties.start_date = { date: { start: start_date } }
    if (due_date) properties.due_date = { date: { start: due_date } }
    if (status) properties.status = { select: { name: status } }
    if (priority_quadrant) properties.priority_quadrant = { select: { name: priority_quadrant } }
    if (estimate_resources) properties.estimate_resources = { rich_text: [{ text: { content: estimate_resources } }] }
    if (typeof budget_money === 'number') properties.budget_money = { number: budget_money }
    if (typeof budget_time === 'number') properties.budget_time = { number: budget_time }
    if (typeof display_order === 'number') properties.display_order = { number: display_order }

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
        parent: { database_id: planConfig.database_id },
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
    // 获取用户的Plan数据库配置
    const { config: planConfig, user, error } = await getNotionDatabaseConfig('plan')
    
    if (error || !planConfig) {
      return NextResponse.json({ 
        error: error || 'Plan database not configured' 
      }, { status: 400 })
    }

    // 获取Task数据库配置
    const { config: taskConfig } = await getNotionDatabaseConfig('task')

    const notion = new Client({
      auth: planConfig.notion_api_key,
    })

    const { searchParams } = new URL(request.url)
    const planId = searchParams.get('id')
    
    if (!planId) {
      return NextResponse.json({ 
        error: 'Plan ID is required' 
      }, { status: 400 })
    }

    let deletedTasks = 0

    // Step 1: Delete all Tasks that belong to this Plan
    if (taskConfig) {
      const tasksResponse = await notion.databases.query({
        database_id: taskConfig.database_id,
        filter: {
          property: 'plan',
          relation: {
            contains: planId
          }
        }
      })

      for (const task of tasksResponse.results) {
        await notion.pages.update({
          page_id: task.id,
          archived: true
        })
        deletedTasks++
      }
    }

    // Step 2: Delete the Plan itself
    await notion.pages.update({
      page_id: planId,
      archived: true
    })

    return NextResponse.json({ 
      success: true,
      cascadeDeleted: {
        plan: 1,
        tasks: deletedTasks
      }
    })

  } catch (error) {
    console.error('Error deleting plan with cascade:', error)
    
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