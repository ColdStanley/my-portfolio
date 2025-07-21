'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { PROJECT_CONFIG } from '@/config/projectConfig'

export function useUserMembership() {
  const pathname = usePathname()
  const supabase = createClientComponentClient()
  const [userId, setUserId] = useState<string | null>(null)
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkMembership = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setUserId(null)
        setIsPro(false)
        setLoading(false)
        return
      }

      setUserId(user.id)

      const productId = PROJECT_CONFIG.getProductIdFromPath(pathname)
      const { data, error } = await supabase
        .from('user_product_membership')
        .select('membership_tier')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .maybeSingle()

      if (error) {
        console.error('Membership query error:', error)
        setIsPro(false)
      } else {
        setIsPro(data?.membership_tier === 'pro')
      }

      setLoading(false)
    }

    checkMembership()
  }, [supabase, pathname])

  return { userId, isPro, loading }
}
