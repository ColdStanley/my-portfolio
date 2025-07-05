'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'

const projectId = 'cv-builder'

function RegisterPageInner() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const setUser = useAuthStore((s) => s.setUser)
  const setMembershipTier = useAuthStore((s) => s.setMembershipTier)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams?.get('redirect') || '/'

  const handleRegister = async () => {
    setLoading(true)
    setMessage('')

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setMessage(`注册失败：${signUpError.message}`)
      setLoading(false)
      return
    }

    const user = signUpData.user
    if (!user) {
      setMessage('注册成功，但未能获取用户 ID')
      setLoading(false)
      return
    }

    const { error: insertError } = await supabase.from('user_product_membership').insert([
      {
        user_id: user.id,
        product_id: projectId,
        membership_tier: 'registered',
        invite_code: inviteCode || null,
        joined_at: new Date().toISOString(),
      },
    ])

    if (insertError) {
      console.error('权限插入失败:', insertError)
      setMessage(`注册成功，但添加权限失败：${insertError.message}`)
      setLoading(false)
      return
    }

    setUser(user)
    setMembershipTier('registered')

    setMessage('注册成功！即将跳转...')
    setTimeout(() => {
      router.push(redirectPath)
    }, 1200)

    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">创建账号</h1>

      <input
        type="email"
        placeholder="邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border p-2 mb-3 rounded"
      />
      <input
        type="password"
        placeholder="密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border p-2 mb-3 rounded"
      />
      <input
        type="text"
        placeholder="邀请码（可选）"
        value={inviteCode}
        onChange={(e) => setInviteCode(e.target.value)}
        className="w-full border p-2 mb-3 rounded"
      />

      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
      >
        {loading ? '注册中...' : '立即注册'}
      </button>

      {message && <p className="mt-4 text-sm text-center text-gray-700">{message}</p>}
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center text-sm text-gray-500 mt-20">正在加载注册页面...</div>}>
      <RegisterPageInner />
    </Suspense>
  )
}
