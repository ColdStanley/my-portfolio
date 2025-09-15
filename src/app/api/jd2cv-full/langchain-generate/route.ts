import { NextRequest, NextResponse } from 'next/server'
import { parentAgent } from './agents/parentAgent'
import { roleExpertAgent } from './agents/roleExpertAgent'
import { nonWorkExpertAgent } from './agents/nonWorkExpertAgent'
import { reviewerAgent } from './agents/reviewerAgent'
import { updateProgress } from '../progress/[requestId]/route'

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

    // Initialize progress tracking
    updateProgress(requestId, {
      type: 'step_start',
      step: 0,
      stepName: 'Initialization',
      message: 'Starting LangChain AI workflow...'
    })

    // Step 1: Parent Agent - Role Classification
    const step1Start = Date.now()
    updateProgress(requestId, {
      type: 'step_start',
      step: 1,
      stepName: 'Role Classification',
      message: `Analyzing JD: "${jd.title}"...`
    })

    console.log('Step 1: Classifying JD role...')
    const parentResult = await parentAgent(jd)
    const roleClassification = parentResult.classification
    console.log('Role classified as:', roleClassification)

    updateProgress(requestId, {
      type: 'step_complete',
      step: 1,
      stepName: 'Role Classification',
      message: `Classified as: ${roleClassification}`,
      duration: Date.now() - step1Start,
      data: { roleClassification, tokens: parentResult.tokens }
    })

    // Step 2: Parallel processing - Role Expert + Non-Work Expert
    const step2Start = Date.now()
    updateProgress(requestId, {
      type: 'step_start',
      step: 2,
      stepName: 'Content Customization',
      message: 'Customizing work experience and personal information...'
    })

    console.log('Step 2: Processing work experience and personal info...')
    const [roleExpertResult, nonWorkExpertResult] = await Promise.all([
      roleExpertAgent(jd, personalInfo, roleClassification),
      nonWorkExpertAgent(jd, personalInfo)
    ])

    const customizedWorkExperience = roleExpertResult.content
    const customizedPersonalInfo = nonWorkExpertResult.content

    // Calculate combined tokens for step 2
    const step2Tokens = {
      prompt: roleExpertResult.tokens.prompt + nonWorkExpertResult.tokens.prompt,
      completion: roleExpertResult.tokens.completion + nonWorkExpertResult.tokens.completion,
      total: roleExpertResult.tokens.total + nonWorkExpertResult.tokens.total
    }

    updateProgress(requestId, {
      type: 'step_complete',
      step: 2,
      stepName: 'Content Customization',
      message: 'Work experience and personal info customized',
      duration: Date.now() - step2Start,
      data: { tokens: step2Tokens }
    })

    // Step 3: Reviewer Agent - Style unification and final formatting
    const step3Start = Date.now()
    updateProgress(requestId, {
      type: 'step_start',
      step: 3,
      stepName: 'Quality Review',
      message: 'Reviewing and unifying content style...'
    })

    console.log('Step 3: Reviewing and finalizing...')
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

    updateProgress(requestId, {
      type: 'step_complete',
      step: 3,
      stepName: 'Quality Review',
      message: 'Content reviewed and finalized',
      duration: Date.now() - step3Start,
      data: { tokens: reviewerResult.tokens }
    })

    // Final completion
    const totalDuration = Date.now() - startTime

    // Calculate total tokens consumed across all steps
    const totalTokens = {
      prompt: parentResult.tokens.prompt + step2Tokens.prompt + reviewerResult.tokens.prompt,
      completion: parentResult.tokens.completion + step2Tokens.completion + reviewerResult.tokens.completion,
      total: parentResult.tokens.total + step2Tokens.total + reviewerResult.tokens.total
    }

    updateProgress(requestId, {
      type: 'completed',
      message: `LangChain processing completed successfully in ${Math.round(totalDuration / 1000)}s`,
      duration: totalDuration,
      data: {
        roleClassification,
        totalSteps: 3,
        totalDuration,
        totalTokens
      }
    })

    console.log('LangChain processing completed successfully')

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

    if (requestId) {
      updateProgress(requestId, {
        type: 'error',
        message: `Error: ${error.message}`,
        data: { error: error.message }
      })
    }

    return NextResponse.json(
      { error: 'Failed to generate customized resume', details: error.message },
      { status: 500 }
    )
  }
}