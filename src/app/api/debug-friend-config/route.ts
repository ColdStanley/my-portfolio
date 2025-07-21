import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Client } from '@notionhq/client'

export async function GET(request: NextRequest) {
  try {
    console.log('=== 朋友配置诊断开始 ===')
    
    const cookieStore = await cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        debug: 'auth_failed' 
      }, { status: 401 })
    }

    console.log('当前用户:', user.email)

    // 检查用户的Notion配置
    const { data: notionConfig, error: notionError } = await supabase
      .from('user_notion_configs')
      .select('*')
      .eq('user_id', user.id)
      .single()

    console.log('Notion配置查询结果:', { 
      hasConfig: !!notionConfig, 
      error: notionError?.code 
    })

    // 检查用户的会员权限
    const { data: memberships, error: membershipError } = await supabase
      .from('user_product_membership')
      .select('*')
      .eq('user_id', user.id)

    console.log('会员权限查询结果:', { 
      membershipCount: memberships?.length || 0,
      error: membershipError?.code 
    })

    // 如果有Notion配置，测试API连接
    let notionTest = null
    if (notionConfig?.notion_api_key) {
      try {
        const notion = new Client({ auth: notionConfig.notion_api_key })
        
        // 测试API Key有效性
        const userInfo = await notion.users.me()
        console.log('Notion API 用户验证成功')

        // 测试Strategy数据库访问
        let strategyDbTest = null
        if (notionConfig.strategy_db_id) {
          try {
            const dbInfo = await notion.databases.retrieve({
              database_id: notionConfig.strategy_db_id
            })
            strategyDbTest = {
              accessible: true,
              title: dbInfo.title?.[0]?.plain_text || 'Untitled',
              propertyCount: Object.keys(dbInfo.properties || {}).length,
              properties: Object.keys(dbInfo.properties || {})
            }
          } catch (dbError: any) {
            strategyDbTest = {
              accessible: false,
              error: {
                code: dbError.code,
                message: dbError.message
              }
            }
          }
        }

        notionTest = {
          apiKeyValid: true,
          userInfo: {
            name: userInfo.name,
            type: userInfo.type
          },
          strategyDbTest
        }
      } catch (notionError: any) {
        notionTest = {
          apiKeyValid: false,
          error: {
            code: notionError.code,
            message: notionError.message
          }
        }
      }
    }

    // 汇总诊断结果
    const diagnosis = {
      user: {
        id: user.id,
        email: user.email,
        isDeveloper: user.email === 'stanleytonight@hotmail.com'
      },
      notionConfig: {
        exists: !!notionConfig,
        hasApiKey: !!notionConfig?.notion_api_key,
        hasTasksDb: !!notionConfig?.tasks_db_id,
        hasStrategyDb: !!notionConfig?.strategy_db_id,
        hasPlanDb: !!notionConfig?.plan_db_id,
        error: notionError?.message || null
      },
      memberships: {
        total: memberships?.length || 0,
        records: memberships || [],
        error: membershipError?.message || null
      },
      notionTest,
      environmentCheck: {
        hasDevNotionKey: !!process.env.NOTION_API_KEY,
        hasDevStrategyDb: !!process.env.NOTION_STRATEGY_DB_ID,
        hasDevTasksDb: !!process.env.NOTION_Tasks_DB_ID,
        hasDevPlanDb: !!process.env.NOTION_Plan_DB_ID
      }
    }

    console.log('诊断完成:', JSON.stringify(diagnosis, null, 2))
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      diagnosis
    })

  } catch (error) {
    console.error('诊断过程出错:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}