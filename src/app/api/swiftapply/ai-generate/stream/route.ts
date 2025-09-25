import { NextRequest } from 'next/server'
import { CLASSIFIER_PROMPT, EXPERIENCE_GENERATOR_PROMPT, REVIEWER_PROMPT } from '@/lib/swiftapply/prompts'
import { invokeSwiftApplyStream, parseAIJsonResponse } from '@/lib/swiftapply/aiService'

export async function POST(request: NextRequest) {
  try {
    const { jd, personalInfo, templates, stage, stageData } = await request.json()

    if (!jd?.title || !jd?.description) {
      return new Response('Missing JD information', { status: 400 })
    }

    if (!personalInfo) {
      return new Response('Missing personal information', { status: 400 })
    }

    if (!templates || templates.length === 0) {
      return new Response('Missing experience templates', { status: 400 })
    }

    if (!stage) {
      return new Response('Missing stage information', { status: 400 })
    }

    // Create SSE response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        const sendData = (data: any) => {
          const sseData = `data: ${JSON.stringify(data)}\n\n`
          controller.enqueue(encoder.encode(sseData))
        }

        const processStage = async () => {
          try {
            let prompt = ''

            // Prepare prompt based on stage
            switch (stage) {
              case 'classifier':
                // Extract target roles from templates to create constraint list
                const roleTypesList = templates?.map((t: any) => t.targetRole).filter(Boolean).join(', ') || 'Software Engineer'
                prompt = CLASSIFIER_PROMPT
                  .replace('{jd_title}', jd.title)
                  .replace('{jd_content}', jd.description)
                  .replace('{roleTypesList}', roleTypesList)
                break

              case 'experience':
                const classifierData = stageData?.classifier
                if (!classifierData) {
                  throw new Error('Missing classifier data for experience stage')
                }

                // Find matching template based on classified role (LangChain Agent智能匹配)
                const roleType = classifierData.role_type || classifierData.roleType
                const matchingTemplate = templates?.find((t: any) => t.targetRole === roleType)
                if (!matchingTemplate) {
                  throw new Error(`No template found for classified role: ${roleType}`)
                }

                const templateContent = `${matchingTemplate.title}:\n${matchingTemplate.content.join('\n')}`
                prompt = EXPERIENCE_GENERATOR_PROMPT
                  .replace('{role_type}', roleType || '')
                  .replace('{keywords}', classifierData.keywords?.join(', ') || '')
                  .replace('{insights}', classifierData.insights?.join(', ') || '')
                  .replace('{template_content}', templateContent)
                break

              case 'reviewer':
                const experienceData = stageData?.experience
                const classifierDataForReview = stageData?.classifier
                if (!experienceData || !classifierDataForReview) {
                  throw new Error('Missing stage data for reviewer stage')
                }
                const reviewerRoleType = classifierDataForReview.role_type || classifierDataForReview.roleType
                prompt = REVIEWER_PROMPT
                  .replace('{role_type}', reviewerRoleType || '')
                  .replace('{keywords}', classifierDataForReview.keywords?.join(', ') || '')
                  .replace('{insights}', classifierDataForReview.insights?.join(', ') || '')
                  .replace('{work_experience}', experienceData.workExperience || '')
                  .replace('{personal_info}', JSON.stringify(personalInfo, null, 2))
                break

              default:
                throw new Error(`Unknown stage: ${stage}`)
            }

            // Send stage start event
            sendData({
              type: 'stage_start',
              stage,
              timestamp: Date.now()
            })

            let fullContent = ''
            let aiResult: any = null

            // Process with real AI streaming
            try {
              aiResult = await invokeSwiftApplyStream(prompt, (chunk: string) => {
                fullContent += chunk
                sendData({
                  type: 'content_chunk',
                  stage,
                  chunk,
                  fullContent,
                  timestamp: Date.now()
                })
              }, 0.1, 4000, 'deepseek')

              // Parse result based on stage
              let parsedResult: any
              if (stage === 'classifier') {
                // For classifier, parse JSON response
                parsedResult = parseAIJsonResponse(aiResult.content)
              } else if (stage === 'experience') {
                // For experience, extract work experience
                parsedResult = { workExperience: aiResult.content.trim() }
              } else if (stage === 'reviewer') {
                // For reviewer, parse complete JSON response
                parsedResult = parseAIJsonResponse(aiResult.content)
              }

              // Send completion event
              sendData({
                type: 'stage_complete',
                stage,
                result: parsedResult,
                tokens: aiResult.tokens,
                duration: Date.now() - Date.now(), // Will be calculated properly by client
                timestamp: Date.now()
              })

            } catch (aiError) {
              console.error(`AI generation failed for stage ${stage}:`, aiError)
              throw new Error(`AI generation failed: ${aiError.message}`)
            }

            sendData({ type: 'done' })
            controller.close()

          } catch (error) {
            sendData({
              type: 'error',
              error: (error as Error).message,
              timestamp: Date.now()
            })
            controller.close()
          }
        }

        processStage()
      }
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('SwiftApply streaming error:', error)
    return new Response('Failed to process AI request', { status: 500 })
  }
}