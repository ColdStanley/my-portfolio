import UnifiedCardSection from '@/components/common/UnifiedCardSection'
import PageLayout from '@/components/layout/PageLayout'

export default function LifePage() {
  return (
    <PageLayout
      title="Life"
      subtitle="Small moments, stories, and experiments"
      description="A space for reflection and curiosity — from quiet routines to unexpected ideas. Here I share things that may not be polished, but they are real. 📓✨"
    >
      <UnifiedCardSection category="life" />
    </PageLayout>
  )
}
