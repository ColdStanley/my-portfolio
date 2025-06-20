'use client'

import { useEffect, useState } from 'react'
import { useTrialLimit } from './useTrialLimit'
import { useUserMembership } from './useUserMembership'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function useAccessGuard() {
  const { canUse, increaseCount } = useTrialLimit()
  const { userId, isPro, loading } = useUserMembership()
  const [canAccess, setCanAccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!userId && canUse) {
      setCanAccess(true)
    } else if (userId && (isPro || canUse)) {
      setCanAccess(true)
    } else {
      setCanAccess(false)
    }
  }, [userId, isPro, canUse, loading])

  const triggerAccessCheck = () => {
    if (loading) {
      toast.info('正在检查访问权限...')
      return false
    }

    if (!userId) {
      if (!canUse) {
        toast.error('试用次数已用完，请先登录后升级会员', {
          action: {
            label: '立即登录',
            onClick: () => router.push('/login'),
          },
        })
        return false
      }
      increaseCount()
      return true
    }

    if (!isPro) {
      toast.info('您尚未开通会员，升级后可无限使用', {
        action: {
          label: '去升级',
          onClick: () => router.push('/membership'),
        },
      })
      return false
    }

    return true
  }

  return { canAccess, triggerAccessCheck }
}
