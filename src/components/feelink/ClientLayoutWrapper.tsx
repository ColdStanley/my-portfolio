'use client'

import React from 'react'
import GlobalAuthListener from '@/components/global/GlobalAuthListener'

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <GlobalAuthListener projectId="feelink" />
      {children}
    </>
  )
}
