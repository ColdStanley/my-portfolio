// store/useAuthStore.ts
import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

type MembershipTier = 'guest' | 'registered' | 'pro' | 'vip' | 'admin'

interface AuthState {
  user: User | null
  membershipTier: MembershipTier
  authLoaded: boolean
  setUser: (user: User | null) => void
  setMembershipTier: (tier: MembershipTier) => void
  setAuthLoaded: (loaded: boolean) => void
  resetAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  membershipTier: 'guest',
  authLoaded: false, // ✅ 默认未加载

  setUser: (user) => set({ user }),
  setMembershipTier: (tier) => set({ membershipTier: tier }),
  setAuthLoaded: (loaded) => set({ authLoaded: loaded }), // ✅ 新增 setter

  resetAuth: () =>
    set({
      user: null,
      membershipTier: 'guest',
      authLoaded: false, // ✅ 重置加载状态
    }),
}))
