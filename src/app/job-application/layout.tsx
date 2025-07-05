// src/app/job-application/layout.tsx

'use client'

import { ReactNode } from 'react'
import GlobalAuthListener from '@/components/global/GlobalAuthListener'

export default function JobApplicationLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* 注入权限监听器（自动写入 useAuthStore） */}
      <GlobalAuthListener projectId="cv-builder" />
      {children}
    </>
  )
}
