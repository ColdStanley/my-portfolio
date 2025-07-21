'use client'

import { ReactNode } from 'react'

// 简化后不再需要GlobalAuthListener，认证逻辑直接在组件中处理
export default function CestLaVieLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
