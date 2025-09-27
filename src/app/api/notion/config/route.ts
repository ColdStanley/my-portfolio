import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

// Configuration storage directory
const CONFIG_DIR = path.join(process.cwd(), 'data', 'notion-configs')

// Ensure config directory exists
async function ensureConfigDir() {
  try {
    await fs.access(CONFIG_DIR)
  } catch {
    await fs.mkdir(CONFIG_DIR, { recursive: true })
  }
}

// Helper function to get config file path
function getConfigPath(key: string) {
  // Sanitize the key to be filesystem-safe
  const sanitizedKey = key.replace(/[^a-zA-Z0-9-]/g, '')
  return path.join(CONFIG_DIR, `${sanitizedKey}.json`)
}

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

    const key = `${city.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, '')}`
    const configPath = getConfigPath(key)

    try {
      const configData = await fs.readFile(configPath, 'utf-8')
      const config = JSON.parse(configData)

      return NextResponse.json({
        success: true,
        config
      })
    } catch (error) {
      // Config file doesn't exist
      return NextResponse.json({
        success: false,
        error: 'Configuration not found'
      }, { status: 404 })
    }
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

    await ensureConfigDir()

    const key = `${city.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, '')}`
    const configPath = getConfigPath(key)

    const config = {
      city,
      name,
      apiKey,
      databaseId,
      theme: theme || 'pink',
      updatedAt: new Date().toISOString()
    }

    await fs.writeFile(configPath, JSON.stringify(config, null, 2))

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

    const key = `${city.toLowerCase()}-${name.toLowerCase().replace(/\s+/g, '')}`
    const configPath = getConfigPath(key)

    try {
      await fs.unlink(configPath)
      return NextResponse.json({
        success: true,
        message: 'Configuration deleted successfully'
      })
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Configuration not found'
      }, { status: 404 })
    }
  } catch (error) {
    console.error('Error deleting config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}