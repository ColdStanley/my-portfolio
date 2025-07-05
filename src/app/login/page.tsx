'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'

const projectId = 'new-ielts-speaking' // ✅ 当前项目 ID（便于权限查询）

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams?.get('redirect') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const setUser = useAuthStore((s) => s.setUser)
  const setMembershipTier = useAuthStore((s) => s.setMembershipTier)

  const handleLogin = async () => {
    setLoading(true)
    setMessage('')

    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setMessage('登录失败：' + error.message)
      setLoading(false)
      return
    }

    const user = signInData.user
    if (!user) {
      setMessage('登录成功，但未能获取用户信息')
      setLoading(false)
      return
    }

    // ✅ 写入 Zustand 状态
    setUser(user)

    // ✅ 查询权限等级（可选，GlobalAuthListener 已会处理，但这里可冗余写入）
    const { data, error: tierError } = await supabase
      .from('user_project_membership')
      .select('membership_tier')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .single()

    if (data?.membership_tier) {
      setMembershipTier(data.membership_tier)
    } else {
      setMembershipTier('registered') // 默认值
    }

    setMessage('登录成功，正在跳转...')
    setTimeout(() => {
      router.push(redirectPath)
    }, 1000)

    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white dark:bg-black rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h1 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-gray-100">登录账号</h1>

      <input
        type="email"
        placeholder="邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded mb-4 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
      />
      <input
        type="password"
        placeholder="密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded mb-4 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 rounded transition duration-200"
      >
        {loading ? '登录中...' : '立即登录'}
      </button>

      {message && <p className="text-sm text-center text-red-600 dark:text-red-400 mt-4">{message}</p>}

      <p className="text-center text-sm mt-6 text-gray-600 dark:text-gray-400">
        还没有账号？{' '}
        <a href="/register" className="text-purple-600 hover:underline">立即注册</a>
      </p>
    </div>
  )
}
