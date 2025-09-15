import { NextRequest } from 'next/server'

// Global progress storage (in production, use Redis or database)
const progressStore = new Map<string, any[]>()

export async function GET(
  request: NextRequest,
  { params }: { params: { requestId: string } }
) {
  const requestId = params.requestId

  // Set up SSE headers
  const headers = new Headers({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  })

  // Create readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const data = JSON.stringify({
        type: 'connected',
        message: 'SSE connection established',
        timestamp: new Date().toISOString()
      })
      controller.enqueue(`data: ${data}\n\n`)

      // Function to send progress updates
      const sendProgress = () => {
        const progress = progressStore.get(requestId) || []
        if (progress.length > 0) {
          const latestProgress = progress[progress.length - 1]
          const data = JSON.stringify(latestProgress)
          controller.enqueue(`data: ${data}\n\n`)

          // If completed, close the stream
          if (latestProgress.type === 'completed' || latestProgress.type === 'error') {
            // Clean up and close after a short delay
            setTimeout(() => {
              progressStore.delete(requestId)
              controller.close()
            }, 1000)
            return
          }
        }

        // Continue polling for updates every 500ms
        setTimeout(sendProgress, 500)
      }

      // Start sending progress updates
      sendProgress()
    },

    cancel() {
      // Clean up when client disconnects
      progressStore.delete(requestId)
    }
  })

  return new Response(stream, { headers })
}

// Helper function to update progress (used by other API endpoints)
export function updateProgress(requestId: string, progress: {
  type: 'step_start' | 'step_complete' | 'step_error' | 'completed' | 'error'
  step?: number
  stepName?: string
  message: string
  timestamp?: string
  duration?: number
  data?: any
}) {
  const currentProgress = progressStore.get(requestId) || []
  const progressUpdate = {
    ...progress,
    timestamp: progress.timestamp || new Date().toISOString()
  }

  currentProgress.push(progressUpdate)
  progressStore.set(requestId, currentProgress)

  console.log(`[SSE Progress] ${requestId}:`, progressUpdate)
}