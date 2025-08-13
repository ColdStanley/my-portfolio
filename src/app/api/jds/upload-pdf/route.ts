import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const jdId = formData.get('jdId') as string
    const userId = formData.get('userId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!jdId || !userId) {
      return NextResponse.json({ error: 'JD ID and User ID are required' }, { status: 400 })
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
    }

    // Upload to Vercel Blob
    const timestamp = Date.now()
    const filename = `cv_${jdId}_${timestamp}.pdf`

    const blob = await put(filename, file, {
      access: 'public',
      contentType: 'application/pdf',
    })

    // Update JD record in Supabase
    const { error } = await supabase
      .from('jd_records')
      .update({
        cv_pdf_url: blob.url,
        cv_pdf_filename: file.name,
        updated_at: new Date().toISOString()
      })
      .eq('id', jdId)
      .eq('user_id', userId)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update JD record' },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      cv_pdf_url: blob.url,
      cv_pdf_filename: file.name,
      message: 'PDF uploaded successfully'
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}