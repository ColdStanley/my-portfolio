import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// POST: Upload column to marketplace
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, tags, data } = body

    // Validate required fields
    if (!name || !description || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: name, description, data' },
        { status: 400 }
      )
    }

    // Validate name and description lengths
    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Name must be 100 characters or less' },
        { status: 400 }
      )
    }

    if (description.length > 500) {
      return NextResponse.json(
        { error: 'Description must be 500 characters or less' },
        { status: 400 }
      )
    }

    // Check if data already has original_author_id (security check)
    if (data.original_author_id) {
      return NextResponse.json(
        { error: 'This work has already been shared and cannot be uploaded again.' },
        { status: 403 }
      )
    }

    // Clean sensitive data from column
    const cleanData = {
      ...data,
      cards: data.cards?.map((card: any) => {
        const { generatedContent, isGenerating, justCreated, deleting, urls, ...cleanCard } = card
        return cleanCard
      })
    }

    // Generate content hash for duplicate detection
    const contentHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(cleanData))
      .digest('hex')

    // Check for duplicate content
    const { data: existingItem } = await supabase
      .from('marketplace_items')
      .select('id')
      .eq('content_hash', contentHash)
      .single()

    if (existingItem) {
      return NextResponse.json(
        { error: 'This content already exists in the Marketplace.' },
        { status: 409 }
      )
    }

    // For now, we'll use a placeholder user ID since we don't have auth
    // In a real app, this would come from the authenticated user
    const authorId = 'placeholder-user-id'

    // Add original_author_id to cleaned data
    const finalData = {
      ...cleanData,
      original_author_id: authorId
    }

    // Insert into marketplace_items table
    const { data: insertedItem, error } = await supabase
      .from('marketplace_items')
      .insert([
        {
          name: name.trim(),
          description: description.trim(),
          data: finalData,
          content_hash: contentHash,
          author_id: authorId,
          tags: tags || [],
          downloads: 0
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to save to marketplace' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      id: insertedItem.id,
      message: 'Successfully uploaded to marketplace'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET: Fetch marketplace items
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50) // Max 50 items per page
    const sortBy = searchParams.get('sort') || 'created_at'
    const order = searchParams.get('order') || 'desc'

    // Calculate offset
    const offset = (page - 1) * limit

    // Validate sort parameters
    const allowedSortFields = ['created_at', 'downloads', 'name']
    const allowedOrderValues = ['asc', 'desc']
    
    const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at'
    const finalOrder = allowedOrderValues.includes(order) ? order : 'desc'

    // Fetch items (without full data field for performance)
    const { data: items, error, count } = await supabase
      .from('marketplace_items')
      .select('id, name, description, author_id, downloads, tags, created_at', { count: 'exact' })
      .order(finalSortBy, { ascending: finalOrder === 'asc' })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch marketplace items' },
        { status: 500 }
      )
    }

    // Add author names (placeholder for now)
    const itemsWithAuthors = items?.map(item => ({
      ...item,
      author_name: 'Anonymous' // In a real app, this would be fetched from users table
    })) || []

    return NextResponse.json({
      items: itemsWithAuthors,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}