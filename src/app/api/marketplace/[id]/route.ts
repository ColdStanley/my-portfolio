import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Demo data fallback (same as in main route)
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

// GET: Fetch single marketplace item with full data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    let item: any = null

    try {
      // Try to fetch from database first
      const { data: dbItem, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && dbItem) {
        item = dbItem
      } else {
        throw new Error('Database item not found')
      }
    } catch (error) {
      // Fallback to demo data if database fails or item not found
      console.log('Using demo data fallback for item:', id)
      item = demoMarketplaceItems.find(demoItem => demoItem.id === id)
    }

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Add author name with improved logic
    const itemWithAuthor = {
      ...item,
      author_name: item.author_id === 'placeholder-user-id' ? 'You' : 'Community'
    }

    return NextResponse.json(itemWithAuthor)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT: Increment download count
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    try {
      // Try to increment in database first
      const { error } = await supabase
        .rpc('increment_downloads', { item_id: id })

      if (!error) {
        return NextResponse.json({ success: true })
      } else {
        throw new Error('Database update failed')
      }
    } catch (error) {
      // For demo data, just return success (in-memory increment would reset on restart)
      console.log('Demo mode: simulating download increment for item:', id)
      
      // Find and increment demo item (for this request only)
      const itemIndex = demoMarketplaceItems.findIndex(item => item.id === id)
      if (itemIndex !== -1) {
        demoMarketplaceItems[itemIndex].downloads += 1
        return NextResponse.json({ success: true })
      } else {
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        )
      }
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Delete marketplace item (for user's own items)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    try {
      // Try to delete from database first
      const { error } = await supabase
        .from('marketplace_items')
        .delete()
        .eq('id', id)

      if (!error) {
        return NextResponse.json({ success: true })
      } else {
        throw new Error('Database delete failed')
      }
    } catch (error) {
      // For demo data, simulate deletion
      console.log('Demo mode: simulating delete for item:', id)
      
      const itemIndex = demoMarketplaceItems.findIndex(item => item.id === id)
      if (itemIndex !== -1) {
        demoMarketplaceItems.splice(itemIndex, 1)
        return NextResponse.json({ success: true })
      } else {
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        )
      }
    }

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}