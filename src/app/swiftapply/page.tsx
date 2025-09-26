import { Metadata } from 'next'
import SwiftApplyClient from '@/components/swiftapply/SwiftApplyClient'

export const metadata: Metadata = {
  title: 'SwiftApply | StanleyHi',
  description: 'AI-powered resume customization tool by Stanley'
}

export default function SwiftApplyPage() {
  return (
    <div className="theme-swiftapply">
      <SwiftApplyClient />
    </div>
  )
}