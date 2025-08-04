import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// Company field name mapping for JD2CV table columns
const getCompanyFieldName = (companyKey: string): string => {
  const fieldMapping: Record<string, string> = {
    'stanleyhi': 'stanleyhi',
    'savvy': 'savvypro',
    'ncs': 'ncs',
    'icekredit': 'icekredit',
    'huawei': 'huawei',
    'diebold': 'dieboldnixdorf',
    'fujixerox': 'fujixerox'
  }
  return fieldMapping[companyKey] || companyKey
}

export async function POST(request: NextRequest) {
  try {
    const { 
      jdTitle, 
      jdCompany, 
      experienceId,
      companyKey,
      saveToField
    } = await request.json()

    // Validate required fields
    if (!jdTitle || !jdCompany) {
      return NextResponse.json(
        { success: false, error: 'Missing job description title or company information.' },
        { status: 400 }
      )
    }

    if (!experienceId) {
      return NextResponse.json(
        { success: false, error: 'Missing experience ID.' },
        { status: 400 }
      )
    }

    // Fetch experience data from Professional database
    if (!process.env.NOTION_PROFESSIONALEXPERIENCE_DB_ID) {
      return NextResponse.json(
        { success: false, error: 'Professional experience database configuration missing.' },
        { status: 500 }
      )
    }

    // Get the experience record from Professional database
    const experienceRecord = await notion.pages.retrieve({ page_id: experienceId }) as any
    
    if (!experienceRecord) {
      return NextResponse.json(
        { success: false, error: 'Experience record not found.' },
        { status: 404 }
      )
    }

    // Extract data from Professional database record
    const properties = experienceRecord.properties
    const experienceTitle = properties.title?.select?.name || ''
    const experienceContent = properties.experience?.rich_text?.map((item: any) => item.plain_text || '').join('') || ''
    const experienceTime = properties.time?.rich_text?.map((item: any) => item.plain_text || '').join('') || ''
    const experienceKeywords = properties.keywords?.multi_select?.map((item: any) => item.name || '').filter(Boolean) || []
    const experienceCompany = properties.company?.select?.name || ''

    // Debug log for keywords
    console.log('Experience Keywords:', experienceKeywords)
    console.log('Keywords length:', experienceKeywords.length)

    if (!process.env.NOTION_JD2CV_DB_ID) {
      return NextResponse.json(
        { success: false, error: 'JD2CV database configuration missing.' },
        { status: 500 }
      )
    }

    // Search for matching JD record with both title and company
    const searchResults = await notion.databases.query({
      database_id: process.env.NOTION_JD2CV_DB_ID,
      filter: {
        and: [
          {
            property: 'title',
            title: {
              equals: jdTitle,
            },
          },
          {
            property: 'company',
            rich_text: {
              equals: jdCompany,
            },
          },
        ],
      },
    })

    if (searchResults.results.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: `No matching job description found for "${jdTitle}" at "${jdCompany}". Please ensure the JD record exists.` 
      }, { status: 404 })
    }

    // Get the first matching record
    const targetPage = searchResults.results[0] as any
    const pageId = targetPage.id

    // Get the title field page ID - the title field itself is a page
    const titleProperty = targetPage.properties.title
    if (!titleProperty || !titleProperty.title || titleProperty.title.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No title page found for this JD record.'
      }, { status: 404 })
    }

    // Create content blocks to append to the title page
    const calloutChildren = []

    // First line: Company Title Time using column layout
    const columns = [
      {
        object: 'block',
        type: 'column',
        column: {
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: { content: experienceCompany },
                    annotations: { bold: true }
                  }
                ]
              }
            }
          ]
        }
      },
      {
        object: 'block',
        type: 'column',
        column: {
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: { content: experienceTitle },
                    annotations: { bold: true }
                  }
                ]
              }
            }
          ]
        }
      }
    ]

    // Add Time column if provided
    if (experienceTime) {
      columns.push({
        object: 'block',
        type: 'column',
        column: {
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [
                  {
                    type: 'text',
                    text: { content: experienceTime },
                    annotations: { bold: true }
                  }
                ]
              }
            }
          ]
        }
      })
    }


    // Create content blocks with callout wrapping the structure
    const calloutContent = []
    
    // Add a paragraph with Company, Title, Time in one line (bold, spaced)
    const firstLineText = []
    firstLineText.push({
      type: 'text',
      text: { content: experienceCompany },
      annotations: { bold: true }
    })
    firstLineText.push({
      type: 'text',
      text: { content: '    ' } // spacing
    })
    firstLineText.push({
      type: 'text',
      text: { content: experienceTitle },
      annotations: { bold: true }
    })
    
    if (experienceTime) {
      firstLineText.push({
        type: 'text',
        text: { content: '    ' } // spacing
      })
      firstLineText.push({
        type: 'text',
        text: { content: experienceTime },
        annotations: { bold: true }
      })
    }

    calloutContent.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: firstLineText
      }
    })
    
    // Keywords line with individual tags
    if (experienceKeywords && Array.isArray(experienceKeywords) && experienceKeywords.length > 0) {
      // Create rich text array with Keywords: label and individual keyword tags
      const keywordsRichText = [
        {
          type: 'text',
          text: { content: 'Keywords: ' },
          annotations: { bold: true }
        }
      ]
      
      // Add each keyword as individual code block with spacing
      for (let i = 0; i < experienceKeywords.length; i++) {
        const keyword = experienceKeywords[i]
        keywordsRichText.push({
          type: 'text',
          text: { content: keyword },
          annotations: { code: true }
        })
        
        // Add space between keywords (except for last one)
        if (i < experienceKeywords.length - 1) {
          keywordsRichText.push({
            type: 'text',
            text: { content: ' ' }
          })
        }
      }
      
      calloutContent.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: keywordsRichText
        }
      })
    }

    // Experience content (no prefix)
    calloutContent.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: experienceContent
            }
          }
        ]
      }
    })

    // Create content blocks with callout containing everything
    const contentBlocks = [
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: ''
              }
            }
          ],
          children: calloutContent
        }
      },
      {
        object: 'block',
        type: 'divider',
        divider: {}
      }
    ]

    // Execute operations sequentially to avoid conflicts
    
    // 1. Always append experience content to the page
    await notion.blocks.children.append({
      block_id: pageId,
      children: contentBlocks
    })

    // 2. Optionally save to company field (overwrite strategy)
    if (saveToField && companyKey) {
      const fieldName = getCompanyFieldName(companyKey)
      await notion.pages.update({
        page_id: pageId,
        properties: {
          [fieldName]: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: experienceContent
                }
              }
            ]
          }
        }
      })
    }

    const fieldMessage = saveToField && companyKey 
      ? ` and ${getCompanyFieldName(companyKey)} field` 
      : ''

    return NextResponse.json({
      success: true,
      message: `Experience successfully saved to JD page${fieldMessage}: "${jdTitle}" at "${jdCompany}"`
    })
  } catch (error) {
    console.error('Error saving experience to page:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save experience to page. Please try again.' },
      { status: 500 }
    )
  }
}