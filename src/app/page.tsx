import { useHomepageContent } from '@/hooks/useHomepageContent'
import HomePageClient from '@/components/HomePageClient'

// ISR Configuration
export const revalidate = 300 // Revalidate every 5 minutes

async function getHomepageContent() {
  console.log('🔧 Using hardcoded data for testing')

  // 临时硬编码数据
  return {
    status: 'success',
    hero: {
      title: 'Transform Your Workflow with AI-Powered Tools',
      subtitle: 'Discover innovative solutions designed to enhance productivity and streamline your daily tasks.',
      background_video: '',
      primary_button_text: 'Explore Solutions',
      primary_button_href: '#solutions',
      secondary_button_text: 'Learn More',
      secondary_button_href: '/about',
      gradient_text: 'AI-Powered'
    },
    projects: [
      {
        title: 'AI Agent Gala',
        description: 'Comprehensive platform for AI agent development and testing.',
        benefits: [
          'Advanced agent configuration',
          'Real-time testing environment',
          'Performance analytics',
          'Seamless deployment'
        ],
        button_text: 'Explore Platform',
        href: '/ai-agent-gala',
        gradient: 'from-blue-500 to-purple-600',
        project_images: [],
        project_video: '',
        reverse: false
      },
      {
        title: "C'est La Vie",
        description: 'Smart life management tools for modern productivity.',
        benefits: [
          'Task automation',
          'Schedule optimization',
          'Goal tracking',
          'Progress insights'
        ],
        button_text: 'Start Managing',
        href: '/cestlavie',
        gradient: 'from-green-500 to-teal-600',
        project_images: [],
        project_video: '',
        reverse: true
      },
      {
        title: 'ReadLingua',
        description: 'Intelligent reading comprehension and language learning platform.',
        benefits: [
          'Adaptive difficulty',
          'Progress tracking',
          'Multilingual support',
          'Interactive exercises'
        ],
        button_text: 'Learn More',
        href: '/readlingua',
        gradient: 'from-purple-500 to-pink-600',
        project_images: [],
        project_video: '',
        reverse: false
      }
    ],
    more_projects: [
      {
        title: 'JD2CV Full',
        subtitle: 'Career Tools',
        description: 'Convert job descriptions to tailored CVs instantly.',
        tech: 'AI, NLP, Document Processing',
        href: '/jd2cv-full'
      },
      {
        title: 'IELTS Speaking',
        subtitle: 'Learning Hub',
        description: 'AI-powered IELTS speaking practice platform.',
        tech: 'Speech Recognition, AI Feedback',
        href: '/ielts-speaking'
      },
      {
        title: 'AI Studio Card',
        subtitle: 'Creative Tools',
        description: 'Generate stunning cards with AI assistance.',
        tech: 'Image Generation, Design AI',
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