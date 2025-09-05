import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// POST: Setup marketplace with sample data (for testing)
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with request context
    const cookieStore = await cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })
    
    // Verify user authentication first
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    console.log('Setting up marketplace with test data...')

    // First check if table exists by trying to query it
    const { error: checkError } = await supabase
      .from('marketplace_items')
      .select('id')
      .limit(1)

    if (checkError) {
      return NextResponse.json({
        error: 'Database table does not exist. Please create the marketplace_items table using the SQL script provided.',
        sqlScript: `
-- Run this SQL in your Supabase SQL Editor:

-- First drop the existing constraint if it exists
ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS marketplace_items_description_check;

-- Create or recreate the table with updated constraints
CREATE TABLE IF NOT EXISTS marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(name) <= 100),
  description TEXT CHECK (length(description) <= 2000),
  data JSONB NOT NULL,
  content_hash VARCHAR(64) UNIQUE NOT NULL,
  author_id UUID NOT NULL,
  downloads INTEGER DEFAULT 0 NOT NULL CHECK (downloads >= 0),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add the updated constraint for existing tables
ALTER TABLE marketplace_items ADD CONSTRAINT marketplace_items_description_check CHECK (length(description) <= 2000);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_marketplace_content_hash ON marketplace_items(content_hash);
CREATE INDEX IF NOT EXISTS idx_marketplace_author_id ON marketplace_items(author_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_downloads ON marketplace_items(downloads DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_created_at ON marketplace_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_tags ON marketplace_items USING GIN(tags);

-- Create function to increment download count atomically
CREATE OR REPLACE FUNCTION increment_downloads(item_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE marketplace_items 
  SET downloads = downloads + 1 
  WHERE id = item_id;
END;
$$ LANGUAGE plpgsql;
        `
      }, { status: 400 })
    }

    // Update constraint for existing tables
    try {
      // First try to drop the old constraint
      await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE marketplace_items DROP CONSTRAINT IF EXISTS marketplace_items_description_check;'
      })
      // Add the new constraint
      await supabase.rpc('exec_sql', {
        sql: 'ALTER TABLE marketplace_items ADD CONSTRAINT marketplace_items_description_check CHECK (length(description) <= 2000);'
      })
      console.log('Successfully updated description constraint')
    } catch (error) {
      console.log('Constraint update may have failed (this is expected if exec_sql RPC doesn\'t exist):', error)
    }

    // Create some sample data for testing
    const sampleData = [
      {
        name: 'Content Writing Assistant',
        description: 'A complete workflow for generating blog posts, articles, and marketing content with AI assistance.',
        tags: ['writing', 'content', 'marketing'],
        data: {
          id: 'sample-col-1',
          cards: [
            {
              id: 'info-1',
              type: 'info',
              title: 'Content Brief',
              description: 'Define your content goals, target audience, and key messaging before writing.'
            },
            {
              id: 'aitool-1',
              type: 'aitool',
              buttonName: 'Generate Outline',
              promptText: 'Create a detailed blog post outline for: {{topic}}. Include introduction, main points, and conclusion.',
              aiModel: 'deepseek'
            },
            {
              id: 'aitool-2',
              type: 'aitool',
              buttonName: 'Write Content',
              promptText: 'Write engaging blog content based on this outline: {{outline}}. Make it informative and conversational.',
              aiModel: 'deepseek'
            }
          ]
        },
        content_hash: 'sample-hash-1',
        author_id: 'sample-user-1',
        downloads: 23
      },
      {
        name: 'Data Analysis Workflow',
        description: 'Step-by-step process for analyzing datasets, generating insights, and creating visualizations.',
        tags: ['analysis', 'data', 'insights'],
        data: {
          id: 'sample-col-2',
          cards: [
            {
              id: 'info-2',
              type: 'info',
              title: 'Data Requirements',
              description: 'Ensure your dataset is clean, properly formatted, and contains the necessary columns for analysis.'
            },
            {
              id: 'aitool-3',
              type: 'aitool',
              buttonName: 'Analyze Data',
              promptText: 'Analyze this dataset and provide key insights: {{data}}. Focus on trends, patterns, and actionable findings.',
              aiModel: 'openai'
            }
          ]
        },
        content_hash: 'sample-hash-2',
        author_id: 'sample-user-2',
        downloads: 15
      }
    ]

    // Insert sample data
    for (const item of sampleData) {
      const { error } = await supabase
        .from('marketplace_items')
        .upsert(item, { onConflict: 'content_hash' })

      if (error) {
        console.error('Error inserting sample data:', error)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sample data created successfully',
      itemsCreated: sampleData.length
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Setup failed', details: error },
      { status: 500 }
    )
  }
}