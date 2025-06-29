// utils/parseHighlightData.ts

import { HighlightWord, LueurItem, ParsedLueurItem } from '../types'

export function parseHighlightData(item: LueurItem): ParsedLueurItem {
  let parsed: HighlightWord[] = []

  try {
    parsed = JSON.parse(item.highlight_data)
  } catch (e) {
    console.error('❌ highlight_data JSON 解析失败：', e)
  }

  return {
    id: item.id,
    title: item.title,
    imageUrl: item.image_url,
    createdAt: item.created_at,
    paragraphs: item.paragraphs.split('\n').map(p => p.trim()).filter(Boolean),
    highlightData: parsed,
  }
}
