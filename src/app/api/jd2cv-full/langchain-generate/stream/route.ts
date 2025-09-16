import { NextRequest } from 'next/server'
import { runLangchainWorkflow, StepUpdate } from '../utils/runWorkflow'

export const runtime = 'nodejs'

const encoder = new TextEncoder()

export async function POST(request: NextRequest) {
  const { jd, personalInfo, requestId: clientRequestId } = await request.json()
  const requestId = clientRequestId || Date.now().toString()

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: any) => {
        controller.enqueue(encoder.encode(`event: ${event}\n`))
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        if (!jd?.title || !jd?.full_job_description) {
          sendEvent('error', { message: 'Missing JD information' })
          controller.close()
          return
        }
        if (!personalInfo) {
          sendEvent('error', { message: 'Missing personal information' })
          controller.close()
          return
        }

        sendEvent('start', { requestId })

        const workflowResult = await runLangchainWorkflow({
          jd,
          personalInfo,
          onStep: async (update: StepUpdate) => {
            sendEvent(update.stage, update)
          }
        })

        sendEvent('done', {
          requestId,
          roleClassification: workflowResult.roleClassification,
          personalInfo: workflowResult.personalInfo,
          workExperience: workflowResult.workExperience,
          processingTime: workflowResult.processingTime,
          steps: workflowResult.stepDetails,
          tokenUsage: workflowResult.tokenUsage
        })
      } catch (error: any) {
        console.error('LangChain SSE error:', error)
        sendEvent('error', { message: error?.message || 'Unknown error' })
      } finally {
        controller.close()
      }
    },
    cancel() {
      // no-op; workflow already resolves sequentially
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  })
}
