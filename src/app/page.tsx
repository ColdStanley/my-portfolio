import { useHomepageContent } from '@/hooks/useHomepageContent'
import HomePageClient from '@/components/HomePageClient'

// ISR Configuration
export const revalidate = 300 // Revalidate every 5 minutes

async function getHomepageContent() {
  console.log('🔧 Using hardcoded data for testing')

  // 完整硬编码数据 - 包含所有字段
  return {
    status: 'success',
    hero: {
      title: 'Transform Your Workflow with AI-Powered Tools',
      subtitle: 'Discover innovative solutions designed to enhance productivity and streamline your daily tasks with cutting-edge artificial intelligence.',
      background_video: 'https://files.slack.com/files-pri/T04L95WFDNX-F084LRJAP9S/ezgif-5-6d2cf9fabb.mp4',
      primary_button_text: 'Explore Solutions',
      primary_button_href: '#solutions',
      secondary_button_text: 'Learn More',
      secondary_button_href: '/about',
      gradient_text: 'AI-Powered'
    },
    projects: [
      {
        title: 'AI Agent Gala',
        description: 'Comprehensive platform for AI agent development, testing, and deployment with advanced analytics.',
        benefits: [
          'Advanced agent configuration with custom prompts',
          'Real-time testing environment with live feedback',
          'Performance analytics and optimization tools',
          'Seamless deployment to production environments'
        ],
        button_text: 'Explore Platform',
        href: '/ai-agent-gala',
        gradient: 'from-blue-500 to-purple-600',
        project_images: [
          'https://files.slack.com/files-pri/T04L95WFDNX-F084M0XQZR6/screenshot_2024-12-19_at_5.22.57_pm.png',
          'https://files.slack.com/files-pri/T04L95WFDNX-F084LRKE1LX/screenshot_2024-12-19_at_5.23.15_pm.png'
        ],
        project_video: '',
        reverse: false
      },
      {
        title: "C'est La Vie",
        description: 'Smart life management ecosystem for modern productivity with AI-powered task automation.',
        benefits: [
          'Intelligent task automation and scheduling',
          'AI-powered schedule optimization algorithms',
          'Comprehensive goal tracking with progress analytics',
          'Real-time productivity insights and recommendations'
        ],
        button_text: 'Start Managing',
        href: '/cestlavie',
        gradient: 'from-green-500 to-teal-600',
        project_images: [
          'https://files.slack.com/files-pri/T04L95WFDNX-F084M175KGZ/screenshot_2024-12-19_at_5.24.33_pm.png',
          'https://files.slack.com/files-pri/T04L95WFDNX-F084LRKKEBX/screenshot_2024-12-19_at_5.24.45_pm.png'
        ],
        project_video: '',
        reverse: true
      },
      {
        title: 'ReadLingua',
        description: 'Intelligent reading comprehension and language learning platform powered by advanced NLP.',
        benefits: [
          'Adaptive difficulty adjustment based on user performance',
          'Comprehensive progress tracking across multiple languages',
          'Multilingual support with native speaker audio',
          'Interactive exercises with real-time feedback'
        ],
        button_text: 'Learn More',
        href: '/readlingua',
        gradient: 'from-purple-500 to-pink-600',
        project_images: [
          'https://files.slack.com/files-pri/T04L95WFDNX-F084M1K9Z8D/screenshot_2024-12-19_at_5.25.12_pm.png'
        ],
        project_video: '',
        reverse: false
      }
    ],
    more_projects: [
      {
        title: 'JD2CV Full',
        subtitle: 'Career Tools',
        description: 'Convert job descriptions to tailored CVs instantly using advanced AI and natural language processing.',
        tech: 'Next.js, OpenAI GPT, NLP, PDF Generation, Document Processing',
        href: '/jd2cv-full'
      },
      {
        title: 'IELTS Speaking',
        subtitle: 'Learning Hub',
        description: 'AI-powered IELTS speaking practice platform with real-time feedback and scoring.',
        tech: 'Speech Recognition, AI Feedback, Audio Processing, Score Analytics',
        href: '/ielts-speaking'
      },
      {
        title: 'AI Studio Card',
        subtitle: 'Creative Tools',
        description: 'Generate stunning business cards and design materials with AI assistance and templates.',
        tech: 'Image Generation, Design AI, Canvas API, Template Engine',
        href: '/ai-studio-card'
      }
    ]
  }
}

export default async function HomePage() {
  // Get static content at build time
  const staticContent = await getHomepageContent()

  return <HomePageClient initialContent={staticContent} />
}