import UnifiedCardSection from '@/components/common/UnifiedCardSection'
import PageLayout from '@/components/layout/PageLayout'
import NewNavbar from '@/components/NewNavbar'
import FooterSection from '@/components/FooterSection'

export default function KnowledgePage() {
  return (
    <>
      <NewNavbar />
      <PageLayout
        title="Knowledge"
        subtitle="Learning never stops"
        description="Documenting my continuous learning journey across various fields and sharing insights."
      >
        <UnifiedCardSection category="knowledge" />
      </PageLayout>
      <FooterSection />
    </>
  )
}
