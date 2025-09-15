import { NextRequest, NextResponse } from 'next/server'
import { parentAgent } from './agents/parentAgent'
import { roleExpertAgent } from './agents/roleExpertAgent'
import { nonWorkExpertAgent } from './agents/nonWorkExpertAgent'
import { reviewerAgent } from './agents/reviewerAgent'

export async function POST(request: NextRequest) {
  try {
    const { jd, personalInfo } = await request.json()

    if (!jd?.title || !jd?.full_job_description) {
      return NextResponse.json({ error: 'Missing JD information' }, { status: 400 })
    }

    if (!personalInfo) {
      return NextResponse.json({ error: 'Missing personal information' }, { status: 400 })
    }

    // Step 1: Parent Agent - Role Classification
    console.log('Step 1: Classifying JD role...')
    const roleClassification = await parentAgent(jd)
    console.log('Role classified as:', roleClassification)

    // Step 2: Parallel processing - Role Expert + Non-Work Expert
    console.log('Step 2: Processing work experience and personal info...')
    const [customizedWorkExperience, customizedPersonalInfo] = await Promise.all([
      roleExpertAgent(jd, personalInfo, roleClassification),
      nonWorkExpertAgent(jd, personalInfo)
    ])

    // Step 3: Reviewer Agent - Style unification and final formatting
    console.log('Step 3: Reviewing and finalizing...')
    const finalResult = await reviewerAgent({
      workExperience: customizedWorkExperience,
      personalInfo: customizedPersonalInfo,
      originalPersonalInfo: personalInfo,
      jd: jd
    })

    console.log('LangChain processing completed successfully')

    return NextResponse.json({
      success: true,
      roleClassification,
      personalInfo: finalResult.personalInfo,
      workExperience: finalResult.workExperience
    })

  } catch (error) {
    console.error('LangChain generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate customized resume', details: error.message },
      { status: 500 }
    )
  }
}