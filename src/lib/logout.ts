import { supabase } from './supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'
import { redirect } from 'next/navigation'

export async function logout(redirectTo: string = '/login') {
  // 清空 Supabase 会话
  await supabase.auth.signOut()

  // 清空 Zustand 用户状态
  const resetAuth = useAuthStore.getState().resetAuth
  resetAuth()

  // 重定向到登录页（仅在客户端中执行时有效）
  if (typeof window !== 'undefined') {
    window.location.href = redirectTo
  } else {
    redirect(redirectTo) // App Router 环境中 SSR 使用
  }
}
