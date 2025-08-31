import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('ai_card_studios')
      .select('*')
      .limit(5)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Debug: extract specific fields from cards to check data integrity
    const debugData = data?.map(workspace => ({
      user_id: workspace.user_id,
      created_at: workspace.created_at,
      cards_debug: workspace.data?.map((col: any) => ({
        column_id: col.id,
        cards: col.cards?.map((card: any) => ({
          id: card.id,
          type: card.type,
          title: card.title,
          buttonName: card.buttonName,
          promptText: card.promptText,
          promptText_length: card.promptText?.length || 0,
          generatedContent: card.generatedContent,
          options: card.options,
          aiModel: card.aiModel
        }))
      }))
    }))

    return NextResponse.json({ 
      raw_data: data,
      debug_data: debugData,
      count: data?.length || 0
    })
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 })
  }
}