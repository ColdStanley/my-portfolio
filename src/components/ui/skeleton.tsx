// src/components/ui/skeleton.tsx

import React from 'react'
import { cn } from '@/lib/utils' // 若未使用 cn，可手动拼 className

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  )
}
