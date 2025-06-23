'use client'

import { ReactNode } from 'react'

export default function CardWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="image-card bg-white shadow-md rounded-xl p-4 border border-gray-200">
      {children}
    </div>
  )
}
