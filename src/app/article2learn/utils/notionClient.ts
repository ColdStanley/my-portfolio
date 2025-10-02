import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export interface NotionPrompt {
  name: string
  promptType: string
  promptTemplate: string
  sortOrder: number
  articleLanguage: string
  motherTongue: string
}

export interface LanguageOptions {
  articleLanguages: string[]
  motherTongues: string[]
}

export async function getActivePrompts(): Promise<NotionPrompt[]> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_ARTICLE2LEARN_DB_ID!,
      filter: {
        property: 'Active',
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: 'Sort_Order',
          direction: 'ascending',
        },
      ],
    })

    return response.results.map((page: any) => ({
      name: page.properties.Name?.title?.[0]?.plain_text || '',
      promptType: page.properties.Prompt_Type?.rich_text?.[0]?.plain_text || '',
      promptTemplate: page.properties.Prompt_Template?.rich_text?.[0]?.plain_text || '',
      sortOrder: page.properties.Sort_Order?.number || 0,
      articleLanguage: page.properties.Article_Language?.select?.name || '',
      motherTongue: page.properties.Mother_Tongue?.select?.name || '',
    }))
  } catch (error) {
    console.error('Failed to fetch prompts from Notion:', error)
    throw new Error('Failed to load prompts')
  }
}

export async function getLanguageOptions(): Promise<LanguageOptions> {
  try {
    const prompts = await getActivePrompts()

    const articleLanguages = Array.from(
      new Set(prompts.map(p => p.articleLanguage).filter(Boolean))
    )
    const motherTongues = Array.from(
      new Set(prompts.map(p => p.motherTongue).filter(Boolean))
    )

    return {
      articleLanguages,
      motherTongues,
    }
  } catch (error) {
    console.error('Failed to fetch language options:', error)
    throw new Error('Failed to load language options')
  }
}
