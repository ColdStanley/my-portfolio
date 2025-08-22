import UnifiedCardSection from '@/components/common/UnifiedCardSection'
import PageLayout from '@/components/layout/PageLayout'
import NewNavbar from '@/components/NewNavbar'
import FooterSection from '@/components/FooterSection'

export default function TechnologyPage() {
  return (
    <>
      <NewNavbar />
      <PageLayout
        title="Technology"
        subtitle="Building the future with code"
        description="Exploring cutting-edge technologies, sharing development insights, and creating solutions that matter."
      >
        <UnifiedCardSection category="technology" />
      </PageLayout>
      <FooterSection />
    </>
  )
}
