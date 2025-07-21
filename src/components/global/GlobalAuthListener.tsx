'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'
import { PROJECT_CONFIG } from '@/config/projectConfig'

interface Props {
  projectId?: string // 现在变为可选，优先使用路径推断
}

export default function GlobalAuthListener({ projectId }: Props) {
  const pathname = usePathname()
  const setUser = useAuthStore((s) => s.setUser)
  const setMembershipTier = useAuthStore((s) => s.setMembershipTier)
  const setAuthLoaded = useAuthStore((s) => s.setAuthLoaded)
  const resetAuth = useAuthStore((s) => s.resetAuth)
  
  // 动态获取产品ID：优先使用传入的projectId，否则从路径推断
  const currentProjectId = projectId || PROJECT_CONFIG.getProductIdFromPath(pathname)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (user) {
        setUser(user)

        const { data, error } = await supabase
          .from('user_product_membership')
          .select('membership_tier')
          .eq('user_id', user.id)
          .eq('product_id', currentProjectId)
          .maybeSingle()

        if (data?.membership_tier) {
          setMembershipTier(data.membership_tier)
        } else {
          setMembershipTier(PROJECT_CONFIG.DEFAULT_MEMBERSHIP_TIER)
        }
      } else {
        resetAuth()
      }

      setAuthLoaded(true) // ✅ 不论成功失败，加载完毕
    }

    // 初次加载
    fetchCurrentUser()

    // 监听状态变化
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session?.user) {
        setUser(session.user)

        supabase
          .from('user_product_membership')
          .select('membership_tier')
          .eq('user_id', session.user.id)
          .eq('product_id', currentProjectId)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.membership_tier) {
              setMembershipTier(data.membership_tier)
            } else {
              setMembershipTier(PROJECT_CONFIG.DEFAULT_MEMBERSHIP_TIER)
            }
          })
      } else {
        resetAuth()
      }

      setAuthLoaded(true) // ✅ 无论何种状态变更，标记为加载完成
    })

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [currentProjectId, setUser, setMembershipTier, setAuthLoaded, resetAuth])

  return null
}
