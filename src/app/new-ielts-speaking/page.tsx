import { Toaster } from 'sonner'
import TabContent from './components/TabContent'
import PageTransition from '@/components/PageTransition'

export default function NewIELTSSpeakingPage() {
  return (
    <>
      <Toaster />
      <PageTransition>
        <TabContent />
      </PageTransition>
    </>
  )
}
