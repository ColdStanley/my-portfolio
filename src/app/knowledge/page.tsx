import UnifiedCardSection from '@/components/common/UnifiedCardSection'
import PageLayout from '@/components/layout/PageLayout'

export default function KnowledgePage() {
  return (
    <PageLayout
      title="Knowledge"
      subtitle="Learning never stops"
      description="Documenting my continuous learning journey across various fields and sharing insights."
    >
      <UnifiedCardSection category="knowledge" />
    </PageLayout>
  )
}
