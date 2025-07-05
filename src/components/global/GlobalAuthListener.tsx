'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'

interface Props {
  projectId: string
}

export default function GlobalAuthListener({ projectId }: Props) {
  const setUser = useAuthStore((s) => s.setUser)
  const setMembershipTier = useAuthStore((s) => s.setMembershipTier)
  const setAuthLoaded = useAuthStore((s) => s.setAuthLoaded) // ✅ 新增
  const resetAuth = useAuthStore((s) => s.resetAuth)

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (user) {
        setUser(user)

        const { data, error } = await supabase
          .from('user_product_membership')
          .select('membership_tier')
          .eq('user_id', user.id)
          .eq('product_id', projectId)
          .single()

        if (data?.membership_tier) {
          setMembershipTier(data.membership_tier)
        } else {
          setMembershipTier('registered') // 默认值（可自定义）
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
          .eq('product_id', projectId)
          .single()
          .then(({ data }) => {
            if (data?.membership_tier) {
              setMembershipTier(data.membership_tier)
            } else {
              setMembershipTier('registered')
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
  }, [projectId, setUser, setMembershipTier, setAuthLoaded, resetAuth])

  return null
}
