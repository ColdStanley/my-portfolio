import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// GET: Retrieve configuration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const name = searchParams.get('name')

    if (!city || !name) {
      return NextResponse.json(
        { error: 'Missing city or name parameter' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('notion_configs')
      .select('*')
      .eq('city', city)
      .eq('name', name)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return NextResponse.json({
          success: false,
          error: 'Configuration not found'
        }, { status: 404 })
      }
      throw error
    }

    const config = {
      city: data.city,
      name: data.name,
      displayCity: data.display_city,
      displayName: data.display_name,
      apiKey: data.api_key,
      databaseId: data.database_id,
      theme: data.theme,
      updatedAt: data.updated_at
    }

    return NextResponse.json({
      success: true,
      config
    })
  } catch (error) {
    console.error('Error retrieving config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Save configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { city, name, apiKey, databaseId, theme } = body

    if (!city || !name || !apiKey || !databaseId) {
      return NextResponse.json(
        { error: 'Missing required fields: city, name, apiKey, databaseId' },
        { status: 400 }
      )
    }

    // Standardize city and name to match URL format (lowercase, no spaces)
    const standardizedCity = city.toLowerCase().replace(/\s+/g, '')
    const standardizedName = name.toLowerCase().replace(/\s+/g, '')

    const { data, error } = await supabase
      .from('notion_configs')
      .upsert({
        city: standardizedCity,
        name: standardizedName,
        display_city: city,
        display_name: name,
        api_key: apiKey,
        database_id: databaseId,
        theme: theme || 'pink',
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    const key = `${standardizedCity}-${standardizedName}`

    return NextResponse.json({
      success: true,
      message: 'Configuration saved successfully',
      key
    })
  } catch (error) {
    console.error('Error saving config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE: Remove configuration (optional, for future use)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const name = searchParams.get('name')

    if (!city || !name) {
      return NextResponse.json(
        { error: 'Missing city or name parameter' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('notion_configs')
      .delete()
      .eq('city', city)
      .eq('name', name)

    if (error) {
      throw error
    }

    return NextResponse.json({
      success: true,
      message: 'Configuration deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}