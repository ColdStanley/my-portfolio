import { NextRequest } from 'next/server'
import { CLASSIFIER_PROMPT, EXPERIENCE_GENERATOR_PROMPT, REVIEWER_PROMPT } from '@/lib/swiftapply/prompts'

// Mock streaming AI call
async function mockStreamingAICall(prompt: string, onChunk: (chunk: string) => void): Promise<any> {
  // Mock responses based on prompt type
  let response: any = ''
  let chunks: string[] = []

  if (prompt.includes('enterprise resume strategist')) {
    response = {
      role_type: "Software Engineer",
      keywords: ["React", "TypeScript", "Node.js", "API Development", "Agile"],
      insights: [
        "Strong emphasis on full-stack development capabilities",
        "Frontend framework experience is crucial",
        "API design and backend integration skills required",
        "Team collaboration and agile methodologies important"
      ]
    }
    chunks = [
      '{"role_type": "Software Engineer"',
      ', "keywords": ["React", "TypeScript", "Node.js"',
      ', "API Development", "Agile"], "insights": [',
      '"Strong emphasis on full-stack development capabilities",',
      '"Frontend framework experience is crucial",',
      '"API design and backend integration skills required",',
      '"Team collaboration and agile methodologies important"]}'
    ]
  } else if (prompt.includes('resume strategist specializing')) {
    const workExperience = `**Senior Software Developer | TechCorp Inc. | 2021-2024**
• Developed and maintained 15+ React applications serving 100K+ daily active users
• Built RESTful APIs using Node.js and TypeScript, improving response times by 40%
• Collaborated with cross-functional teams in Agile environment to deliver features on time
• Implemented automated testing strategies, reducing production bugs by 60%
• Mentored 3 junior developers and led code review processes

**Frontend Developer | StartupXYZ | 2019-2021**
• Created responsive web applications using React and TypeScript
• Optimized application performance, achieving 95+ Lighthouse scores
• Integrated third-party APIs and payment systems for e-commerce platform
• Participated in daily standups and sprint planning sessions
• Contributed to design system and component library development`

    response = { workExperience }

    chunks = [
      '{"workExperience": "**Senior Software Developer | TechCorp Inc. | 2021-2024**\\n',
      '• Developed and maintained 15+ React applications serving 100K+ daily active users\\n',
      '• Built RESTful APIs using Node.js and TypeScript, improving response times by 40%\\n',
      '• Collaborated with cross-functional teams in Agile environment to deliver features on time\\n',
      '• Implemented automated testing strategies, reducing production bugs by 60%\\n',
      '• Mentored 3 junior developers and led code review processes\\n\\n',
      '**Frontend Developer | StartupXYZ | 2019-2021**\\n',
      '• Created responsive web applications using React and TypeScript\\n',
      '• Optimized application performance, achieving 95+ Lighthouse scores\\n',
      '• Integrated third-party APIs and payment systems for e-commerce platform\\n',
      '• Participated in daily standups and sprint planning sessions\\n',
      '• Contributed to design system and component library development"}'
    ]
  } else if (prompt.includes('resume optimization specialist')) {
    const reviewerWorkExperience = `**Senior Software Developer | TechCorp Inc. | 2021-2024**
• Architected and delivered 15+ production React applications with TypeScript, serving 100K+ daily active users
• Engineered high-performance RESTful APIs using Node.js, achieving 40% improvement in response times
• Led cross-functional Agile teams to deliver critical features on schedule with zero critical bugs
• Implemented comprehensive testing framework (Jest, Cypress), reducing production incidents by 60%
• Mentored 3 junior developers and established code review best practices

**Frontend Developer | StartupXYZ | 2019-2021**
• Built responsive, mobile-first web applications using React and TypeScript
• Optimized web performance achieving 95+ Google Lighthouse scores across all metrics
• Integrated complex third-party APIs and payment gateways for high-volume e-commerce platform
• Actively participated in Agile ceremonies and contributed to sprint planning and retrospectives
• Developed reusable component library, improving development velocity by 30%`

    response = {
      personalInfo: {
        "fullName": "John Developer",
        "email": "john@example.com",
        "phone": "+1 (555) 123-4567",
        "location": "San Francisco, CA",
        "linkedin": "linkedin.com/in/johndeveloper",
        "website": "johndeveloper.dev",
        "summary": [
          "Full-stack software engineer with 5+ years experience building scalable web applications",
          "Expertise in React, TypeScript, Node.js, and modern development practices",
          "Proven track record of delivering high-quality software in fast-paced environments",
          "Strong collaborator with experience mentoring junior developers"
        ],
        "technicalSkills": ["React", "TypeScript", "Node.js", "JavaScript", "API Development", "Agile", "Jest", "Cypress"],
        "languages": ["English (Native)"],
        "education": [],
        "certificates": [],
        "customModules": [],
        "format": "A4"
      },
      workExperience: reviewerWorkExperience
    }

    chunks = [
      '{"personalInfo": {"fullName": "John Developer", "email": "john@example.com",',
      '"phone": "+1 (555) 123-4567", "location": "San Francisco, CA",',
      '"linkedin": "linkedin.com/in/johndeveloper", "website": "johndeveloper.dev",',
      '"summary": ["Full-stack software engineer with 5+ years experience", "Expertise in React, TypeScript, Node.js"],',
      '"technicalSkills": ["React", "TypeScript", "Node.js", "API Development", "Agile"],',
      '"languages": ["English (Native)"], "education": [], "certificates": [], "customModules": [], "format": "A4"},',
      '"workExperience": "**Senior Software Developer | TechCorp Inc. | 2021-2024**\\n',
      '• Architected and delivered 15+ production React applications with TypeScript\\n',
      '• Engineered high-performance RESTful APIs using Node.js\\n',
      '**Frontend Developer | StartupXYZ | 2019-2021**\\n',
      '• Built responsive web applications using React and TypeScript"}'
    ]
  } else {
    chunks = ['Mock AI response chunk']
    response = 'Mock AI response'
  }

  // Simulate streaming with delays
  for (const chunk of chunks) {
    await new Promise(resolve => setTimeout(resolve, 100))
    onChunk(chunk)
  }

  return response
}

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
                const matchingTemplate = templates?.find((t: any) => t.targetRole === classifierData.roleType)
                if (!matchingTemplate) {
                  throw new Error(`No template found for classified role: ${classifierData.roleType}`)
                }

                const templateContent = `${matchingTemplate.title}:\n${matchingTemplate.content.join('\n')}`
                prompt = EXPERIENCE_GENERATOR_PROMPT
                  .replace('{role_type}', classifierData.roleType || '')
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
                prompt = REVIEWER_PROMPT
                  .replace('{role_type}', classifierDataForReview.roleType || '')
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

            // Process with streaming
            const result = await mockStreamingAICall(prompt, (chunk: string) => {
              fullContent += chunk
              sendData({
                type: 'content_chunk',
                stage,
                chunk,
                fullContent,
                timestamp: Date.now()
              })
            })

            // Send completion event
            sendData({
              type: 'stage_complete',
              stage,
              result: stage === 'classifier' ? result : fullContent,
              tokens: { prompt: 150, completion: 80, total: 230 },
              duration: 3000,
              timestamp: Date.now()
            })

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