'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)


export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleRegister = async () => {
    setLoading(true)
    setMessage('')

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

    // 查询产品 ID
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .in('name', ['ielts-speaking', 'feelink'])

    if (!products || products.length !== 2) {
      setMessage('找不到产品信息，无法写入会员记录')
      setLoading(false)
      return
    }

    // 为两个产品分别插入 basic 等级记录
    const inserts = products.map((product) => ({
      user_id: userId,
      product_id: product.id,
      membership_tier: 'basic',
      invite_code: inviteCode || null
    }))

    const { error: insertError } = await supabase
      .from('user_product_membership')
      .insert(inserts)

    if (insertError) {
      setMessage(`注册成功，但会员记录写入失败：${insertError.message}`)
    } else {
      setMessage('注册成功，欢迎加入！请前往邮箱激活账户')
    }

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

      {message && <p className="mt-4 text-sm text-center">{message}</p>}
    </div>
  )
}
