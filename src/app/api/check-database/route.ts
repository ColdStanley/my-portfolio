import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    console.log('Database Check: Starting...')
    const supabase = createRouteHandlerClient({ cookies })
    
    // 获取当前用户
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('Database Check: Auth result:', { hasUser: !!user, error: authError?.message })
    
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        authenticated: false 
      }, { status: 401 })
    }

    // 检查必要的表是否存在
    const tables = [
      'user_product_membership',
      'user_notion_configs'
    ]

    const tableResults = {}
    
    for (const table of tables) {
      try {
        console.log(`Database Check: Checking table ${table}...`)
        const { data, error } = await supabase
          .from(table)
          .select('count', { count: 'exact', head: true })
        
        if (error) {
          console.log(`Database Check: Table ${table} error:`, error.code, error.message)
          tableResults[table] = { 
            exists: false, 
            error: error.message,
            code: error.code 
          }
        } else {
          console.log(`Database Check: Table ${table} exists`)
          tableResults[table] = { exists: true }
        }
      } catch (err) {
        console.log(`Database Check: Table ${table} exception:`, err)
        tableResults[table] = { 
          exists: false, 
          error: err instanceof Error ? err.message : 'Unknown error' 
        }
      }
    }

    // 检查用户在membership表中的记录
    let membershipStatus = null
    if (tableResults['user_product_membership']?.exists) {
      const { data: membership, error: membershipError } = await supabase
        .from('user_product_membership')
        .select('membership_level')
        .eq('user_id', user.id)
        .single()

      if (membershipError && membershipError.code !== 'PGRST116') {
        membershipStatus = { error: membershipError.message }
      } else {
        membershipStatus = { 
          exists: !!membership,
          level: membership?.membership_level || null 
        }
      }
    }

    return NextResponse.json({
      authenticated: true,
      userId: user.id,
      userEmail: user.email,
      tables: tableResults,
      membership: membershipStatus,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database Check: General error:', error)
    return NextResponse.json({
      error: 'Database check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}