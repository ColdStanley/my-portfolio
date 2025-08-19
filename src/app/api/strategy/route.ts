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

function extractRelationValue(relation: any[]): string[] {
  if (!relation || !Array.isArray(relation)) return []
  return relation.map(item => item.id)
}

export async function GET(request: NextRequest) {
  try {
    // 获取用户的Strategy数据库配置
    const { config: strategyConfig, user, error } = await getNotionDatabaseConfig('strategy')
    
    if (error || !strategyConfig) {
      return NextResponse.json({ 
        error: error || 'Strategy database not configured' 
      }, { status: 400 })
    }

    // Plan数据库配置已移除 - 不再计算进度以提升性能
    
    const notion = new Client({
      auth: strategyConfig.notion_api_key,
    })

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')


    // If requesting schema information
    if (action === 'schema') {
      const databaseInfo = await notion.databases.retrieve({
        database_id: strategyConfig.database_id
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
      database_id: strategyConfig.database_id,
      page_size: 100,
      sorts: [
        {
          property: 'due_date',
          direction: 'ascending',
        }
      ]
    })

    // 直接返回Strategy数据，移除进度计算以提升性能
    const data = response.results.map((page: any) => {
      const properties = page.properties

      return {
        id: page.id,
        objective: extractTitleContent(properties.objective?.title),
        description: extractTextContent(properties.description?.rich_text),
        key_results: extractTextContent(properties.key_results?.rich_text),
        progress: 0, // 进度字段保留但设为0，避免前端错误
        start_date: extractDateValue(properties.start_date?.date),
        due_date: extractDateValue(properties.due_date?.date),
        status: extractSelectValue(properties.status?.select),
        category: extractSelectValue(properties.category?.select),
        priority_quadrant: extractSelectValue(properties.priority_quadrant?.select),
        estimate_cost: extractTextContent(properties.estimate_cost?.rich_text),
        order: extractNumberValue(properties.order?.number),
        plan: extractRelationValue(properties.plan?.relation),
        task: extractRelationValue(properties.task?.relation),
        total_plans: 0, // 进度相关字段保留但设为0
        completed_plans: 0
      }
    })

    return NextResponse.json({ data })

  } catch (error) {
    console.error('Error fetching Strategy data:', error)
    console.error('Full error details:', JSON.stringify(error, null, 2))
    
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Failed to fetch data: ${error.message}`,
        details: error.stack
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'An unknown error occurred'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    
    // 获取用户的Strategy数据库配置
    const { config: strategyConfig, user, error } = await getNotionDatabaseConfig('strategy')
    
    
    if (error || !strategyConfig) {
      return NextResponse.json({ 
        error: error || 'Strategy database not configured' 
      }, { status: 400 })
    }

    const notion = new Client({
      auth: strategyConfig.notion_api_key,
    })

    const body = await request.json()
    
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
    if (status !== undefined && status !== '') properties.status = { select: { name: status } }
    if (category !== undefined && category !== '') properties.category = { select: { name: category } }
    if (priority_quadrant !== undefined && priority_quadrant !== '') properties.priority_quadrant = { select: { name: priority_quadrant } }
    if (estimate_cost !== undefined) properties.estimate_cost = { rich_text: [{ text: { content: estimate_cost } }] }
    if (typeof order === 'number') properties.order = { number: order }


    let response
    
    if (id) {
      // Update existing strategy
      response = await notion.pages.update({
        page_id: id,
        properties
      })
      
      return NextResponse.json({ success: true, id: response.id, updated: true })
    } else {
      // Create new strategy
      
      try {
        response = await notion.pages.create({
          parent: { database_id: strategyConfig.database_id },
          properties
        })
        
        return NextResponse.json({ success: true, id: response.id, created: true })
      } catch (createError: any) {
        console.error('Notion pages.create failed:', createError)
        console.error('Error details:', {
          code: createError.code,
          message: createError.message,
          status: createError.status,
          body: createError.body
        })
        throw createError
      }
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
    // 获取用户的Strategy数据库配置
    const { config: strategyConfig, user, error } = await getNotionDatabaseConfig('strategy')
    
    if (error || !strategyConfig) {
      return NextResponse.json({ 
        error: error || 'Strategy database not configured' 
      }, { status: 400 })
    }

    // 获取Plan和Task数据库配置
    const { config: planConfig } = await getNotionDatabaseConfig('plan')
    const { config: taskConfig } = await getNotionDatabaseConfig('task')

    const notion = new Client({
      auth: strategyConfig.notion_api_key,
    })

    const { searchParams } = new URL(request.url)
    const strategyId = searchParams.get('id')
    
    if (!strategyId) {
      return NextResponse.json({ 
        error: 'Strategy ID is required' 
      }, { status: 400 })
    }

    let deletedPlans = 0
    let deletedTasks = 0

    // Step 1: Delete all Plans that belong to this Strategy
    if (planConfig) {
      const plansResponse = await notion.databases.query({
        database_id: planConfig.database_id,
        filter: {
          property: 'strategy',
          relation: {
            contains: strategyId
          }
        }
      })

      for (const plan of plansResponse.results) {
        const planId = plan.id

        // Step 1a: Delete all Tasks that belong to this Plan
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

        // Step 1b: Delete the Plan
        await notion.pages.update({
          page_id: planId,
          archived: true
        })
        deletedPlans++
      }
    }

    // Step 2: Delete the Strategy itself
    await notion.pages.update({
      page_id: strategyId,
      archived: true
    })

    return NextResponse.json({ 
      success: true, 
      cascadeDeleted: {
        strategy: 1,
        plans: deletedPlans,
        tasks: deletedTasks
      }
    })

  } catch (error) {
    console.error('Error deleting strategy with cascade:', error)
    
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