'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User } from '@supabase/supabase-js'
import { UserProfile } from '@/lib/getSimplifiedUserConfig'

interface AuthState {
  user: User | null
  profile: UserProfile | null
  isAdmin: boolean
  loading: boolean
  notionConfig: {
    hasApiKey: boolean
    hasTasksDb: boolean
    hasStrategyDb: boolean
    hasPlanDb: boolean
  }
}

export function useSimplifiedAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  const fetchUserAndProfile = async () => {
    try {
      // 获取用户
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      setUser(user)

      if (userError || !user) {
        setProfile(null)
        setLoading(false)
        return
      }

      // 获取用户档案
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        // 没有档案记录，创建默认档案
        const defaultProfile = {
          user_id: user.id,
          role: user.email === 'stanleytonight@hotmail.com' ? 'admin' : 'user'
        }

        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert(defaultProfile)
          .select()
          .single()

        setProfile(newProfile || defaultProfile as UserProfile)
      } else if (!profileError) {
        setProfile(profile)
      } else {
        console.error('Error fetching profile:', profileError)
        setProfile(null)
      }

    } catch (error) {
      console.error('Error in fetchUserAndProfile:', error)
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserAndProfile()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null)
        setProfile(null)
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchUserAndProfile()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return {
    user,
    profile,
    isAdmin: profile?.role === 'admin',
    loading,
    notionConfig: {
      hasApiKey: !!profile?.notion_api_key,
      hasTasksDb: !!profile?.notion_tasks_db_id,
      hasStrategyDb: !!profile?.notion_strategy_db_id,
      hasPlanDb: !!profile?.notion_plan_db_id
    }
  }
}