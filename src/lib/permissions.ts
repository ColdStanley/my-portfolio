// lib/permissions.ts

import { useAuthStore } from '@/store/useAuthStore'

const tierRanks = ['guest', 'registered', 'pro', 'vip', 'admin']

export function hasTier(required: 'registered' | 'pro' | 'vip' | 'admin'): boolean {
  const current = useAuthStore.getState().membershipTier
  return tierRanks.indexOf(current) >= tierRanks.indexOf(required)
}
