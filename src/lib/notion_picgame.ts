import { Client } from '@notionhq/client'

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

export const DATABASE_ID = process.env.NOTION_DB_ID!
