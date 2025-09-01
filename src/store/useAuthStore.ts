import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  membershipTier: string | null
  authLoaded: boolean
  setUser: (user: User | null) => void
  setMembershipTier: (tier: string | null) => void
  setAuthLoaded: (loaded: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  membershipTier: null,
  authLoaded: false,
  setUser: (user) => set({ user }),
  setMembershipTier: (tier) => set({ membershipTier: tier }),
  setAuthLoaded: (loaded) => set({ authLoaded: loaded }),
}))