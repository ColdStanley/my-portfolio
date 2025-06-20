'use client'

import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function showAccessToast({
  type,
  message,
  actionLabel,
  actionHref,
}: {
  type: 'info' | 'error' | 'success'
  message: string
  actionLabel?: string
  actionHref?: string
}) {
  const router = typeof window !== 'undefined' ? require('next/navigation').useRouter() : null

  toast[type](message, {
    action: actionLabel && actionHref
      ? {
          label: actionLabel,
          onClick: () => {
            router?.push(actionHref)
          },
        }
      : undefined,
  })
}
