import { NextRequest, NextResponse } from 'next/server'
import { runLangchainWorkflow } from './utils/runWorkflow'

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


    const workflowResult = await runLangchainWorkflow({ jd, personalInfo })

    console.log('🎯 Classifier Agent - Role Type:', workflowResult.roleClassification)
    console.log('💼 Experience Generator - Work Experience Preview:', workflowResult.workExperience.slice(0, 120))

    return NextResponse.json({
      success: true,
      requestId,
      roleClassification: workflowResult.roleClassification,
      personalInfo: workflowResult.personalInfo,
      workExperience: workflowResult.workExperience,
      processingTime: workflowResult.processingTime,
      steps: workflowResult.stepDetails,
      tokenUsage: workflowResult.tokenUsage
    })

  } catch (error) {
    console.error('LangChain generation error:', error)


    return NextResponse.json(
      { error: 'Failed to generate customized resume', details: (error as Error).message },
      { status: 500 }
    )
  }
}
