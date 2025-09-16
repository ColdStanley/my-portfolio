import { NextRequest, NextResponse } from 'next/server'
import { parentAgent } from './agents/parentAgent'
import { roleExpertAgent } from './agents/roleExpertAgent'
import { nonWorkExpertAgent } from './agents/nonWorkExpertAgent'
import { reviewerAgent } from './agents/reviewerAgent'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  let requestId: string

  try {
    const { jd, personalInfo, requestId: clientRequestId } = await request.json()
    requestId = clientRequestId || Date.now().toString()

    if (!jd?.title || !jd?.full_job_description) {
      return NextResponse.json({ error: 'Missing JD information' }, { status: 400 })
    }

    if (!personalInfo) {
      return NextResponse.json({ error: 'Missing personal information' }, { status: 400 })
    }


    // Step 1: Parent Agent - Role Classification
    const step1Start = Date.now()

    const parentResult = await parentAgent(jd)
    const roleClassification = parentResult.classification

    // Display Parent Agent output in browser console
    console.log('🎯 Parent Agent - Role Classification:', roleClassification)


    // Step 2: Role Expert Agent - Work Experience Customization
    const step2Start = Date.now()

    const roleExpertResult = await roleExpertAgent(jd, personalInfo, roleClassification)
    const customizedWorkExperience = roleExpertResult.content

    // Display Role Expert Agent output in browser console
    console.log('💼 Role Expert Agent - Customized Work Experience:', customizedWorkExperience)

    // Step 3: Non-Work Expert Agent - Personal Info Customization (based on work experience)
    const step3Start = Date.now()

    const nonWorkExpertResult = await nonWorkExpertAgent(customizedWorkExperience, personalInfo)
    const customizedPersonalInfo = nonWorkExpertResult.content

    // Display Non-Work Expert Agent output in browser console
    console.log('👤 Non-Work Expert Agent - Customized Personal Info:', customizedPersonalInfo)

    // Calculate combined tokens for steps 2 & 3
    const step23Tokens = {
      prompt: roleExpertResult.tokens.prompt + nonWorkExpertResult.tokens.prompt,
      completion: roleExpertResult.tokens.completion + nonWorkExpertResult.tokens.completion,
      total: roleExpertResult.tokens.total + nonWorkExpertResult.tokens.total
    }


    // Step 4: Reviewer Agent - Style unification and final formatting
    const step4Start = Date.now()

    const reviewerResult = await reviewerAgent({
      workExperience: customizedWorkExperience,
      personalInfo: customizedPersonalInfo,
      originalPersonalInfo: personalInfo,
      jd: jd
    })

    const finalResult = {
      personalInfo: reviewerResult.personalInfo,
      workExperience: reviewerResult.workExperience
    }


    // Final completion
    const totalDuration = Date.now() - startTime

    // Calculate total tokens consumed across all steps
    const totalTokens = {
      prompt: parentResult.tokens.prompt + step23Tokens.prompt + reviewerResult.tokens.prompt,
      completion: parentResult.tokens.completion + step23Tokens.completion + reviewerResult.tokens.completion,
      total: parentResult.tokens.total + step23Tokens.total + reviewerResult.tokens.total
    }



    return NextResponse.json({
      success: true,
      requestId,
      roleClassification,
      personalInfo: finalResult.personalInfo,
      workExperience: finalResult.workExperience,
      processingTime: totalDuration
    })

  } catch (error) {
    console.error('LangChain generation error:', error)


    return NextResponse.json(
      { error: 'Failed to generate customized resume', details: (error as Error).message },
      { status: 500 }
    )
  }
}