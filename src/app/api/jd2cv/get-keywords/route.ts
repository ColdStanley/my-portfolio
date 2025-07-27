import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { title, company } = await request.json()

    if (!title || !company) {
      return NextResponse.json(
        { error: 'Title and company are required' },
        { status: 400 }
      )
    }

    // Find existing page
    const database = await notion.databases.query({
      database_id: process.env.NOTION_JD2CV_DB_ID!,
      filter: {
        and: [
          {
            property: 'title',
            title: {
              equals: title,
            },
          },
          {
            property: 'company',
            rich_text: {
              equals: company,
            },
          },
        ],
      },
    })

    if (database.results.length === 0) {
      return NextResponse.json({
        capabilityKeywords: [],
        experienceKeywords: [],
        generatedKeywords: []
      })
    }

    const pageData = database.results[0] as any
    
    // Extract capability keywords (1-5)
    const capabilityKeywords = []
    for (let i = 1; i <= 5; i++) {
      const keywordsField = `capability_${i}_keywords`
      const keywordsContent = pageData.properties[keywordsField]?.rich_text?.[0]?.text?.content
      
      if (keywordsContent) {
        try {
          const keywords = JSON.parse(keywordsContent)
          capabilityKeywords.push({
            index: i,
            keywords: Array.isArray(keywords) ? keywords : []
          })
        } catch (e) {
          console.error(`Failed to parse ${keywordsField}:`, e)
          capabilityKeywords.push({
            index: i,
            keywords: []
          })
        }
      } else {
        capabilityKeywords.push({
          index: i,
          keywords: []
        })
      }
    }

    // Extract your experience keywords (1-5)
    const experienceKeywords = []
    for (let i = 1; i <= 5; i++) {
      const keywordsField = `your_experience_${i}_keywords`
      const keywordsContent = pageData.properties[keywordsField]?.rich_text?.[0]?.text?.content
      
      if (keywordsContent) {
        try {
          const keywords = JSON.parse(keywordsContent)
          experienceKeywords.push({
            index: i,
            keywords: Array.isArray(keywords) ? keywords : []
          })
        } catch (e) {
          console.error(`Failed to parse ${keywordsField}:`, e)
          experienceKeywords.push({
            index: i,
            keywords: []
          })
        }
      } else {
        experienceKeywords.push({
          index: i,
          keywords: []
        })
      }
    }

    // Extract generated text keywords (1-5)
    const generatedKeywords = []
    for (let i = 1; i <= 5; i++) {
      const keywordsField = `generated_text_${i}_keywords`
      const keywordsContent = pageData.properties[keywordsField]?.rich_text?.[0]?.text?.content
      
      if (keywordsContent) {
        try {
          const keywords = JSON.parse(keywordsContent)
          generatedKeywords.push({
            index: i,
            keywords: Array.isArray(keywords) ? keywords : []
          })
        } catch (e) {
          console.error(`Failed to parse ${keywordsField}:`, e)
          generatedKeywords.push({
            index: i,
            keywords: []
          })
        }
      } else {
        generatedKeywords.push({
          index: i,
          keywords: []
        })
      }
    }

    return NextResponse.json({
      capabilityKeywords,
      experienceKeywords,
      generatedKeywords
    })

  } catch (error) {
    console.error('Error fetching keywords:', error)
    return NextResponse.json(
      { error: 'Failed to fetch keywords' },
      { status: 500 }
    )
  }
}