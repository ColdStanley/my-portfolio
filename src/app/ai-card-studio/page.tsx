'use client'

import AICardStudio from './components/AICardStudio'
import PageTransition from '@/components/PageTransition'

export default function AICardStudioPage() {
  return (
    <>
      {/* Hide global navbar/footer for clean fullscreen experience */}
      <style jsx global>{`
        nav[role="banner"], 
        footer[role="contentinfo"],
        .navbar,
        .footer {
          display: none !important;
        }
      `}</style>
      
      <PageTransition>
        <div className="min-h-screen">
          <AICardStudio />
        </div>
      </PageTransition>
    </>
  )
}