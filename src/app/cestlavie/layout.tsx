'use client'

import { ReactNode } from 'react'
import GlobalAuthListener from '@/components/global/GlobalAuthListener'

export default function JobApplicationLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <GlobalAuthListener projectId="cv-builder" />
      {children}
    </>
  )
}
