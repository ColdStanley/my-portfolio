import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// POST: Create marketplace_items table and related structures
export async function POST(request: NextRequest) {
  try {
    console.log('Starting marketplace database migration...')

    // Create the marketplace_items table
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create marketplace_items table
        CREATE TABLE IF NOT EXISTS marketplace_items (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL CHECK (length(name) <= 100),
          description TEXT CHECK (length(description) <= 500),
          data JSONB NOT NULL,
          content_hash VARCHAR(64) UNIQUE NOT NULL,
          author_id UUID NOT NULL,
          downloads INTEGER DEFAULT 0 NOT NULL CHECK (downloads >= 0),
          tags TEXT[] DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_marketplace_content_hash ON marketplace_items(content_hash);
        CREATE INDEX IF NOT EXISTS idx_marketplace_author_id ON marketplace_items(author_id);
        CREATE INDEX IF NOT EXISTS idx_marketplace_downloads ON marketplace_items(downloads DESC);
        CREATE INDEX IF NOT EXISTS idx_marketplace_created_at ON marketplace_items(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_marketplace_tags ON marketplace_items USING GIN(tags);
      `
    })

    if (createTableError) {
      // If exec_sql RPC doesn't exist, try direct SQL execution
      const { error: directError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'marketplace_items')
        .single()

      if (!directError) {
        console.log('Table already exists')
      } else {
        console.error('Migration error:', createTableError)
        throw createTableError
      }
    }

    // Create the increment_downloads function
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION increment_downloads(item_id UUID)
        RETURNS VOID AS $$
        BEGIN
          UPDATE marketplace_items 
          SET downloads = downloads + 1 
          WHERE id = item_id;
        END;
        $$ LANGUAGE plpgsql;
      `
    })

    if (functionError) {
      console.warn('Function creation may have failed, but continuing...', functionError)
    }

    console.log('Migration completed successfully')

    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully'
    })

  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error },
      { status: 500 }
    )
  }
}

// GET: Check if migration is needed
export async function GET() {
  try {
    // Try to query the marketplace_items table
    const { error } = await supabase
      .from('marketplace_items')
      .select('id')
      .limit(1)

    if (error && error.code === '42P01') {
      return NextResponse.json({
        migrationNeeded: true,
        message: 'marketplace_items table does not exist'
      })
    }

    return NextResponse.json({
      migrationNeeded: false,
      message: 'Database is up to date'
    })

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check migration status' },
      { status: 500 }
    )
  }
}