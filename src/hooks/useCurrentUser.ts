'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'
import { useAuthStore } from '@/store/useAuthStore'
import { PROJECT_CONFIG } from '@/config/projectConfig'

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const supabase = createClientComponentClient()
  
  // 获取全局store的setters
  const setGlobalUser = useAuthStore((state) => state.setUser)
  const setMembershipTier = useAuthStore((state) => state.setMembershipTier)
  const setAuthLoaded = useAuthStore((state) => state.setAuthLoaded)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        // 同步更新全局store
        setGlobalUser(user)
        
        if (user) {
          // 获取当前路径对应的产品ID
          const productId = PROJECT_CONFIG.getProductIdFromPath(pathname)
          
          // 获取用户会员等级
          const { data: membership } = await supabase
            .from('user_product_membership')
            .select('membership_tier')
            .eq('user_id', user.id)
            .eq('product_id', productId)
            .maybeSingle()
          
          const tier = membership?.membership_tier || PROJECT_CONFIG.DEFAULT_MEMBERSHIP_TIER
          setMembershipTier(tier)
        } else {
          setMembershipTier('guest')
        }
        
        setAuthLoaded(true)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching user:', error)
        setUser(null)
        setGlobalUser(null)
        setMembershipTier('guest')
        setAuthLoaded(true)
        setLoading(false)
      }
    }
    
    fetchUser()
    
    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null)
        setGlobalUser(null)
        setMembershipTier('guest')
      } else if (session?.user) {
        setUser(session.user)
        setGlobalUser(session.user)
        // 重新获取会员等级
        fetchUser()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, setGlobalUser, setMembershipTier, setAuthLoaded])

  return { user, loading }
}
