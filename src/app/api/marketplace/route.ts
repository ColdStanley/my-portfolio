import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Demo data fallback
const demoMarketplaceItems: any[] = [
  {
    id: 'demo-item-1',
    name: 'Content Writing Assistant',
    description: 'A complete workflow for generating blog posts, articles, and marketing content with AI assistance. Perfect for content creators and marketers.',
    data: {
      id: 'sample-col-1',
      cards: [
        {
          id: 'info-1',
          type: 'info',
          title: 'Content Brief',
          description: 'Define your content goals, target audience, and key messaging before writing. This card helps you organize your thoughts and plan your content strategy.'
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
        },
        {
          id: 'aitool-3',
          type: 'aitool',
          buttonName: 'SEO Optimize',
          promptText: 'Optimize this content for SEO: {{content}}. Add relevant keywords and improve readability.',
          aiModel: 'openai'
        }
      ]
    },
    content_hash: 'demo-hash-1',
    author_id: 'demo-user-1',
    downloads: 127,
    tags: ['writing', 'content', 'marketing', 'seo'],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-item-2',
    name: 'Data Analysis Workflow',
    description: 'Step-by-step process for analyzing datasets, generating insights, and creating data-driven reports.',
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
          id: 'aitool-4',
          type: 'aitool',
          buttonName: 'Data Summary',
          promptText: 'Analyze this dataset and provide a summary: {{data}}. Include data types, missing values, and basic statistics.',
          aiModel: 'openai'
        },
        {
          id: 'aitool-5',
          type: 'aitool',
          buttonName: 'Find Insights',
          promptText: 'Analyze this data for insights: {{data}}. Focus on trends, patterns, and actionable findings.',
          aiModel: 'deepseek'
        }
      ]
    },
    content_hash: 'demo-hash-2',
    author_id: 'demo-user-2',
    downloads: 89,
    tags: ['analysis', 'data', 'insights', 'statistics'],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-item-3',
    name: 'Customer Support Bot',
    description: 'Automated customer service responses and issue resolution workflow for common support scenarios.',
    data: {
      id: 'sample-col-3',
      cards: [
        {
          id: 'info-3',
          type: 'info',
          title: 'Support Guidelines',
          description: 'Always be helpful, professional, and empathetic. Aim to resolve issues quickly while maintaining quality.'
        },
        {
          id: 'aitool-6',
          type: 'aitool',
          buttonName: 'Classify Issue',
          promptText: 'Classify this customer inquiry: {{inquiry}}. Category: Technical, Billing, General, or Urgent.',
          aiModel: 'openai'
        },
        {
          id: 'aitool-7',
          type: 'aitool',
          buttonName: 'Generate Response',
          promptText: 'Create a helpful customer service response for: {{issue}}. Be professional and provide clear solutions.',
          aiModel: 'deepseek'
        }
      ]
    },
    content_hash: 'demo-hash-3',
    author_id: 'demo-user-3',
    downloads: 64,
    tags: ['support', 'customer', 'automation', 'service'],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-item-4',
    name: 'Social Media Manager',
    description: 'Complete social media content creation and scheduling workflow for multiple platforms.',
    data: {
      id: 'sample-col-4',
      cards: [
        {
          id: 'info-4',
          type: 'info',
          title: 'Platform Guidelines',
          description: 'Different platforms require different approaches. Consider character limits, hashtag usage, and audience preferences.'
        },
        {
          id: 'aitool-8',
          type: 'aitool',
          buttonName: 'Create Post',
          promptText: 'Create a social media post about: {{topic}}. Make it engaging and platform-appropriate for {{platform}}.',
          aiModel: 'openai'
        },
        {
          id: 'aitool-9',
          type: 'aitool',
          buttonName: 'Add Hashtags',
          promptText: 'Add relevant hashtags to this social media post: {{post}}. Include trending and niche hashtags.',
          aiModel: 'deepseek'
        }
      ]
    },
    content_hash: 'demo-hash-4',
    author_id: 'demo-user-4',
    downloads: 156,
    tags: ['social media', 'marketing', 'content', 'engagement'],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
]

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

    // Check for duplicate content in database
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
    const searchQuery = searchParams.get('search') || ''

    // Calculate offset
    const offset = (page - 1) * limit

    // Validate sort parameters
    const allowedSortFields = ['created_at', 'downloads', 'name']
    const allowedOrderValues = ['asc', 'desc']
    
    const finalSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'created_at'
    const finalOrder = allowedOrderValues.includes(order) ? order : 'desc'

    let items: any[] = []
    let count = 0

    try {
      // Try to fetch from database first
      let query = supabase
        .from('marketplace_items')
        .select('id, name, description, author_id, downloads, tags, created_at', { count: 'exact' })

      // Add search filter if provided
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
      }

      const { data: dbItems, error, count: dbCount } = await query
        .order(finalSortBy, { ascending: finalOrder === 'asc' })
        .range(offset, offset + limit - 1)

      if (!error && dbItems) {
        items = dbItems
        count = dbCount || 0
      } else {
        throw new Error('Database not available')
      }
    } catch (error) {
      // Fallback to demo data if database fails
      console.log('Using demo data fallback')
      
      let filteredDemoItems = [...demoMarketplaceItems]

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        filteredDemoItems = filteredDemoItems.filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some((tag: string) => tag.toLowerCase().includes(query))
        )
      }

      // Sort demo items
      if (sortBy === 'downloads') {
        filteredDemoItems.sort((a, b) => finalOrder === 'desc' ? b.downloads - a.downloads : a.downloads - b.downloads)
      } else if (sortBy === 'name') {
        filteredDemoItems.sort((a, b) => finalOrder === 'desc' 
          ? b.name.localeCompare(a.name) 
          : a.name.localeCompare(b.name))
      } else {
        filteredDemoItems.sort((a, b) => finalOrder === 'desc' 
          ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          : new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      }

      // Apply pagination
      count = filteredDemoItems.length
      items = filteredDemoItems.slice(offset, offset + limit).map(({ data, ...item }) => item)
    }

    // Add author names with improved logic
    const itemsWithAuthors = items.map(item => ({
      ...item,
      author_name: item.author_id === 'placeholder-user-id' ? 'You' : 'Community'
    }))

    return NextResponse.json({
      items: itemsWithAuthors,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit)
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