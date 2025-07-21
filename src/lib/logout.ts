import { supabase } from './supabaseClient'

export async function logout(redirectTo: string = '/login') {
  try {
    // 清空 Supabase 会话
    await supabase.auth.signOut()
    
    // 重定向到指定页面
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo
    }
  } catch (error) {
    console.error('Logout error:', error)
    // 即使logout失败，也尝试重定向
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo
    }
  }
}
