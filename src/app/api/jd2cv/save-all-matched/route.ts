import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

// Company field name mapping for JD2CV table columns
const getCompanyFieldName = (companyKey: string): string => {
  const fieldMapping: Record<string, string> = {
    'StanleyHi': 'stanleyhi',
    'Savvy Pro': 'savvypro',
    'NCS': 'ncs',
    'IceKredit': 'icekredit',
    'Huawei': 'huawei',
    'Diebold Nixdorf': 'dieboldnixdorf',
    'Fuji Xerox': 'fujixerox'
  }
  return fieldMapping[companyKey] || companyKey.toLowerCase()
}

// Fixed company order
const companyOrder = [
  'StanleyHi',
  'Savvy Pro', 
  'NCS',
  'IceKredit',
  'Huawei',
  'Diebold Nixdorf',
  'Fuji Xerox'
]

export async function POST(request: NextRequest) {
  try {
    const { jdTitle, jdCompany } = await request.json()

    // Validate required fields
    if (!jdTitle || !jdCompany) {
      return NextResponse.json(
        { success: false, error: 'Missing job description title or company information.' },
        { status: 400 }
      )
    }

    if (!process.env.NOTION_PROFESSIONALEXPERIENCE_DB_ID) {
      return NextResponse.json(
        { success: false, error: 'Professional experience database configuration missing.' },
        { status: 500 }
      )
    }

    if (!process.env.NOTION_JD2CV_DB_ID) {
      return NextResponse.json(
        { success: false, error: 'JD2CV database configuration missing.' },
        { status: 500 }
      )
    }

    // Step 1: Pre-filter experiences that contain JD company in comment
    console.log(`Pre-filtering experiences with comment containing: ${jdCompany}`)
    const matchedExperiences = await notion.databases.query({
      database_id: process.env.NOTION_PROFESSIONALEXPERIENCE_DB_ID,
      filter: {
        property: 'comment',
        rich_text: {
          contains: jdCompany
        }
      }
    })

    console.log(`Found ${matchedExperiences.results.length} matching experiences`)

    if (matchedExperiences.results.length === 0) {
      return NextResponse.json({
        success: false,
        error: `No experiences found with "${jdCompany}" in comment field.`
      }, { status: 404 })
    }

    // Step 2: Search for matching JD record
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
        error: `No matching job description found for "${jdTitle}" at "${jdCompany}".` 
      }, { status: 404 })
    }

    const targetPage = searchResults.results[0] as any
    const pageId = targetPage.id

    // Step 3: Process experiences in company order
    const results = []
    let processedCount = 0

    for (const companyName of companyOrder) {
      // Find experience for this company
      const experienceRecord = matchedExperiences.results.find((record: any) => {
        const companySelect = record.properties?.company?.select?.name
        return companySelect === companyName
      })

      if (!experienceRecord) {
        console.log(`No experience found for company: ${companyName}`)
        continue
      }

      try {
        // Extract data from Professional database record
        const properties = (experienceRecord as any).properties
        const experienceTitle = properties.title?.select?.name || ''
        const experienceContent = properties.experience?.rich_text?.map((item: any) => item.plain_text || '').join('') || ''
        const experienceTime = properties.time?.rich_text?.map((item: any) => item.plain_text || '').join('') || ''
        const experienceKeywords = properties.keywords?.multi_select?.map((item: any) => item.name || '').filter(Boolean) || []
        const experienceCompany = properties.company?.select?.name || ''

        console.log(`Processing ${companyName}: ${experienceTitle}`)

        // Create content blocks for display page
        const calloutContent = []
        
        // First line: Company Title Time (bold, spaced)
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
          const keywordsRichText = [
            {
              type: 'text',
              text: { content: 'Keywords: ' },
              annotations: { bold: true }
            }
          ]
          
          for (let i = 0; i < experienceKeywords.length; i++) {
            const keyword = experienceKeywords[i]
            keywordsRichText.push({
              type: 'text',
              text: { content: keyword },
              annotations: { code: true }
            })
            
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

        // Experience content
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

        // 1. Append to display page
        await notion.blocks.children.append({
          block_id: pageId,
          children: contentBlocks
        })

        // 2. Update company field in database
        const fieldName = getCompanyFieldName(companyName)
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

        processedCount++
        results.push({
          company: companyName,
          title: experienceTitle,
          success: true
        })

        // Small delay to avoid conflicts
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`Error processing ${companyName}:`, error)
        results.push({
          company: companyName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${processedCount} out of ${matchedExperiences.results.length} matching experiences.`,
      totalFound: matchedExperiences.results.length,
      processedCount,
      results
    })

  } catch (error) {
    console.error('Error in save-all-matched:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save matched experiences. Please try again.' },
      { status: 500 }
    )
  }
}