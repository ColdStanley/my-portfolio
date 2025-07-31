import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Create supabase client with error handling
let supabase: any = null

try {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )
  }
} catch (error) {
  console.error('Failed to initialize Supabase client:', error)
}

export async function POST(req: NextRequest) {
  console.log('=== DELETE QUERY API START ===')
  
  try {
    // Check if supabase client is available
    if (!supabase) {
      console.error('Supabase client not initialized')
      return NextResponse.json({ 
        error: 'Database connection not available',
        details: 'Supabase client initialization failed'
      }, { status: 500 })
    }

    // Parse request body
    const body = await req.json()
    const { id, type, language } = body
    console.log('Request body:', body)

    if (!id || !type) {
      console.log('Missing parameters:', { id, type })
      return NextResponse.json({ 
        error: 'Missing required parameters', 
        details: { provided: { id, type, language }, required: ['id', 'type'] }
      }, { status: 400 })
    }

    const table = type === 'word' ? 'english_reading_word_queries' : 'english_reading_sentence_queries'
    console.log('Target table:', table)
    console.log('Record ID to delete:', id)
    
    // First check if the record exists
    console.log('Checking if record exists...')
    let existenceQuery = supabase
      .from(table)
      .select('id')
      .eq('id', id)
    
    // Add language filter if provided
    if (language) {
      existenceQuery = existenceQuery.or(`language.eq.${language},language.is.null`)
    }
    
    const { data: existingRecord, error: checkError } = await existenceQuery.single()

    console.log('Existence check result:', { existingRecord, checkError })

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking record existence:', checkError)
      return NextResponse.json({ 
        error: 'Failed to check record existence', 
        details: checkError.message,
        code: checkError.code
      }, { status: 500 })
    }

    if (!existingRecord) {
      console.log('Record not found')
      return NextResponse.json({ 
        error: 'Record not found', 
        details: `No ${type} query found with id ${id}` 
      }, { status: 404 })
    }

    // Now delete the record
    console.log('Deleting record...')
    let deleteQuery = supabase
      .from(table)
      .delete()
      .eq('id', id)
    
    // Add language filter if provided
    if (language) {
      deleteQuery = deleteQuery.or(`language.eq.${language},language.is.null`)
    }
    
    const { data: deletedData, error: deleteError } = await deleteQuery.select()

    console.log('Delete operation result:', { deletedData, deleteError })

    if (deleteError) {
      console.error('Database delete error:', deleteError)
      return NextResponse.json({ 
        error: 'Failed to delete query', 
        details: deleteError.message,
        code: deleteError.code,
        hint: deleteError.hint || 'No hint available'
      }, { status: 500 })
    }

    console.log('Delete successful!')
    console.log('=== DELETE QUERY API END ===')
    
    return NextResponse.json({ 
      success: true, 
      deleted: deletedData?.[0] || null,
      message: `Successfully deleted ${type} query with id ${id}`
    })

  } catch (error) {
    console.error('Unexpected API error:', error)
    console.log('=== DELETE QUERY API ERROR END ===')
    
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}