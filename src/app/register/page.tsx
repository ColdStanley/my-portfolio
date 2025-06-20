import { Suspense } from 'react'
import RegisterPageClient from './RegisterPageClient'

export default function Page() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <RegisterPageClient />
    </Suspense>
  )
}
