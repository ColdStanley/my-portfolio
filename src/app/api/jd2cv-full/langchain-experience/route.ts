import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: NextRequest) {
  try {
    const { jd, workExperience, roleClassification } = await request.json()

    if (!jd?.id || !jd?.user_id || !workExperience || !roleClassification) {
      return NextResponse.json(
        { error: 'Missing required fields: jd, workExperience, roleClassification' },
        { status: 400 }
      )
    }

    // Parse work experience text into individual records
    const experiences = parseWorkExperience(workExperience)

    if (experiences.length === 0) {
      return NextResponse.json(
        { error: 'No valid work experience found in text' },
        { status: 400 }
      )
    }

    // Delete existing records for this JD (overwrite functionality)
    await supabase
      .from('experience_records')
      .delete()
      .eq('user_id', jd.user_id)
      .eq('jd_id', jd.id)
      .eq('comment', 'LangChain generated')

    // Insert new records
    const recordsToInsert = experiences.map(exp => ({
      user_id: jd.user_id,
      jd_id: jd.id,
      company: exp.company.trim(),
      title: exp.title.trim(),
      experience: exp.experience.trim(),
      keywords: extractKeywords(exp.experience),
      role_group: roleClassification,
      work_or_project: 'work',
      time: exp.time?.trim() || null,
      comment: 'LangChain generated'
    }))

    const { data, error } = await supabase
      .from('experience_records')
      .insert(recordsToInsert)
      .select()

    if (error) {
      console.error('Supabase insertion error:', error)
      return NextResponse.json(
        { error: 'Failed to save experience records', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data,
      message: `Successfully saved ${data.length} experience records`,
      count: data.length
    })
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}

// Simple parser for work experience text
function parseWorkExperience(workExperienceText: string) {
  const experiences = []

  // Split by double newlines to separate different work experiences
  const sections = workExperienceText.split('\n\n').filter(section => section.trim())

  for (const section of sections) {
    const lines = section.split('\n').filter(line => line.trim())
    if (lines.length === 0) continue

    const headerLine = lines[0]

    // Check if header matches format: "Company | Title | Time"
    if (headerLine.includes(' | ')) {
      const parts = headerLine.split(' | ')
      if (parts.length >= 2) {
        const company = parts[0]
        const title = parts[1]
        const time = parts[2] || null

        // Extract experience bullets (lines starting with - or bullet points)
        const experienceLines = lines.slice(1).filter(line =>
          line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('*')
        )

        if (experienceLines.length > 0) {
          const experience = experienceLines.join('\n')

          experiences.push({
            company,
            title,
            time,
            experience
          })
        }
      }
    }
  }

  return experiences
}

// Extract simple keywords from experience text
function extractKeywords(experienceText: string): string[] {
  const keywords = []
  const text = experienceText.toLowerCase()

  // Common tech/business keywords to extract
  const keywordPatterns = [
    'ai', 'machine learning', 'python', 'javascript', 'react', 'node', 'sales',
    'business development', 'partnership', 'revenue', 'growth', 'customer',
    'project management', 'technical', 'solution', 'api', 'database', 'cloud'
  ]

  keywordPatterns.forEach(keyword => {
    if (text.includes(keyword)) {
      keywords.push(keyword)
    }
  })

  return [...new Set(keywords)] // Remove duplicates
}