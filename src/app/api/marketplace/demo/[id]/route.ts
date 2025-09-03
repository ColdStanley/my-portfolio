import { NextRequest, NextResponse } from 'next/server'

// This would normally be shared, but for demo we'll duplicate
let demoMarketplaceItems: any[] = [
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
    author_name: 'AI Writer Pro',
    downloads: 127,
    tags: ['writing', 'content', 'marketing', 'seo'],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
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
    author_name: 'Data Scientist',
    downloads: 89,
    tags: ['analysis', 'data', 'insights', 'statistics'],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
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
    author_name: 'Support Expert',
    downloads: 64,
    tags: ['support', 'customer', 'automation', 'service'],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
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
    author_name: 'Social Media Pro',
    downloads: 156,
    tags: ['social media', 'marketing', 'content', 'engagement'],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
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

    const item = demoMarketplaceItems.find(item => item.id === id)

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)

  } catch (error) {
    console.error('Demo API error:', error)
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

    const itemIndex = demoMarketplaceItems.findIndex(item => item.id === id)

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      )
    }

    // Increment download count
    demoMarketplaceItems[itemIndex].downloads += 1

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Demo API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}