'use client'

import AICardStudio from './components/AICardStudio'
import NewNavbar from '@/components/NewNavbar'
import FooterSection from '@/components/FooterSection'
import PageTransition from '@/components/PageTransition'

export default function AICardStudioPage() {
  return (
    <>
      {/* Hide global navbar/footer */}
      <style jsx global>{`
        nav[role="banner"], 
        footer[role="contentinfo"],
        .navbar,
        .footer {
          display: none !important;
        }
      `}</style>
      
      <NewNavbar />
      
      <PageTransition>
        <div className="pt-16 min-h-screen">
          <AICardStudio />
        </div>
        
        <FooterSection />
      </PageTransition>
    </>
  )
}