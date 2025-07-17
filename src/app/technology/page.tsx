import UnifiedCardSection from '@/components/common/UnifiedCardSection'
import PageLayout from '@/components/layout/PageLayout'

export default function TechnologyPage() {
  return (
    <PageLayout
      title="Technology"
      subtitle="Building the future with code"
      description="Exploring cutting-edge technologies, sharing development insights, and creating solutions that matter."
    >
      <UnifiedCardSection category="technology" />
    </PageLayout>
  )
}
