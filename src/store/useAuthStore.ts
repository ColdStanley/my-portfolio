import { create } from 'zustand'
import { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  membershipTier: string | null
  setUser: (user: User | null) => void
  setMembershipTier: (tier: string | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  membershipTier: null,
  setUser: (user) => set({ user }),
  setMembershipTier: (tier) => set({ membershipTier: tier }),
}))