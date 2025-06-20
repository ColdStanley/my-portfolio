'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleRegister = async () => {
    setLoading(true)
    setMessage('')

    // 1️⃣ 注册 + 自动登录
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    })

    if (signUpError) {
      setMessage(`注册失败：${signUpError.message}`)
      setLoading(false)
      return
    }

    const userId = signUpData.user?.id
    if (!userId) {
      setMessage('注册成功，但用户 ID 获取失败')
      setLoading(false)
      return
    }

    // ✅ 注册成功，自动登录状态已建立
    setMessage('注册成功，欢迎加入！即将进入首页...')
    setTimeout(() => {
      router.push('/')
    }, 1500)

    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">注册账户</h1>

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
        {loading ? '注册中…' : '立即注册'}
      </button>

      {message && <p className="mt-4 text-sm text-center text-gray-700">{message}</p>}
    </div>
  )
}
