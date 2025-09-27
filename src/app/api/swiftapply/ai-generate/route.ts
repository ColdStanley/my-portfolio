import { NextRequest, NextResponse } from 'next/server'
import { fetchPromptFromNotion } from '@/app/api/jd2cv-full/langchain-generate/utils/promptFetcher'

// Mock AI processing - in real implementation, this would call actual AI APIs
async function mockAICall(prompt: string, delay: number = 2000): Promise<any> {
  await new Promise(resolve => setTimeout(resolve, delay))

  // Mock responses based on prompt type
  if (prompt.includes('job description analyzer')) {
    return {
      roleType: "Software Engineer",
      keywords: ["React", "TypeScript", "Node.js", "API Development", "Agile"],
      insights: [
        "Strong emphasis on full-stack development capabilities",
        "Frontend framework experience is crucial",
        "API design and backend integration skills required",
        "Team collaboration and agile methodologies important"
      ]
    }
  }

  if (prompt.includes('resume writer')) {
    return `**Senior Software Developer | TechCorp Inc. | 2021-2024**
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
  }

  if (prompt.includes('resume reviewer')) {
    return `WORK_EXPERIENCE:
**Senior Software Developer | TechCorp Inc. | 2021-2024**
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
• Developed reusable component library, improving development velocity by 30%

PERSONAL_INFO:
{
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
}`
  }

  return "Mock AI response"
}

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { jd, personalInfo, templates } = await request.json()

    if (!jd?.title || !jd?.description) {
      return NextResponse.json({ error: 'Missing JD information' }, { status: 400 })
    }

    if (!personalInfo) {
      return NextResponse.json({ error: 'Missing personal information' }, { status: 400 })
    }

    if (!templates || templates.length === 0) {
      return NextResponse.json({ error: 'Missing experience templates' }, { status: 400 })
    }

    // Stage 1: Classifier
    const classifierPromptTemplate = await fetchPromptFromNotion('SwiftApply', 'Classifier', 'SwiftApplyAPI')
    const classifierPrompt = classifierPromptTemplate.replace('{jd_content}', jd.description)
    console.log('🎯 Running Classifier Agent...')
    const classifierResult = await mockAICall(classifierPrompt, 3000)

    // Stage 2: Experience Generator
    const templatesText = templates.map((t: any) => `${t.title}:\n${t.content.join('\n')}`).join('\n\n')
    const experiencePromptTemplate = await fetchPromptFromNotion('SwiftApply', 'Experience Generator', 'SwiftApplyAPI')
    const experiencePrompt = experiencePromptTemplate
      .replace('{role_type}', classifierResult.roleType)
      .replace('{keywords}', classifierResult.keywords.join(', '))
      .replace('{jd_content}', jd.description)
      .replace('{experience_templates}', templatesText)
      .replace('{personal_info}', JSON.stringify(personalInfo, null, 2))

    console.log('💼 Running Experience Generator Agent...')
    const experienceResult = await mockAICall(experiencePrompt, 4000)

    // Stage 3: Reviewer
    const reviewerPromptTemplate = await fetchPromptFromNotion('SwiftApply', 'Reviewer', 'SwiftApplyAPI')
    const reviewerPrompt = reviewerPromptTemplate
      .replace('{role_type}', classifierResult.roleType)
      .replace('{keywords}', classifierResult.keywords.join(', '))
      .replace('{work_experience}', experienceResult)
      .replace('{personal_info}', JSON.stringify(personalInfo, null, 2))

    console.log('🔍 Running Reviewer Agent...')
    const reviewerResult = await mockAICall(reviewerPrompt, 3000)

    // Parse reviewer result
    const workExperienceMatch = reviewerResult.match(/WORK_EXPERIENCE:\s*([\s\S]*?)\s*PERSONAL_INFO:/);
    const personalInfoMatch = reviewerResult.match(/PERSONAL_INFO:\s*([\s\S]*?)$/);

    const finalWorkExperience = workExperienceMatch ? workExperienceMatch[1].trim() : experienceResult
    let finalPersonalInfo = personalInfo

    try {
      if (personalInfoMatch) {
        finalPersonalInfo = JSON.parse(personalInfoMatch[1].trim())
      }
    } catch (e) {
      console.warn('Failed to parse reviewer personal info, using original')
    }

    return NextResponse.json({
      success: true,
      processingTime: Date.now() - startTime,
      steps: {
        classifier: {
          roleType: classifierResult.roleType,
          keywords: classifierResult.keywords,
          insights: classifierResult.insights,
          tokens: { prompt: 150, completion: 80, total: 230 },
          duration: 3000
        },
        experience: {
          workExperience: experienceResult,
          tokens: { prompt: 300, completion: 200, total: 500 },
          duration: 4000
        },
        reviewer: {
          workExperience: finalWorkExperience,
          personalInfo: finalPersonalInfo,
          tokens: { prompt: 250, completion: 180, total: 430 },
          duration: 3000
        }
      },
      workExperience: finalWorkExperience,
      personalInfo: finalPersonalInfo,
      roleClassification: classifierResult.roleType
    })

  } catch (error) {
    console.error('SwiftApply AI generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate AI resume', details: (error as Error).message },
      { status: 500 }
    )
  }
}