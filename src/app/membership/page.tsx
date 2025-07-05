'use client'

import Image from 'next/image'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/store/useAuthStore'

const projectId = 'new-ielts-speaking' // ✅ 当前项目的 ID

const plans = [
  {
    title: 'Pro 用户',
    tier: 'pro',
    description: '每日 10 次定制答案额度，适合日常练习',
    priceNote: '￥90 / 1个月',
    qrImage: '/images/wechat90.png',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    features: [
      { name: 'Band 6 / 7 / 8 答案查看', included: true },
      { name: '每日定制次数上限', detail: '10 次/天', included: true },
      { name: '有效期', detail: '1 个月', included: true },
      { name: '高亮词汇卡片', included: true },
      { name: '定制答案导出（PDF / Markdown）', included: false },
      { name: '高亮词汇解释卡片', included: false },
      { name: '写作模块（尝鲜版）', included: false },
    ],
  },
  {
    title: 'VIP 用户',
    tier: 'vip',
    description: '无限次练习 + 独享导出与写作模块',
    priceNote: '￥150 / 3个月',
    qrImage: '/images/wechat150.png',
    bg: 'bg-purple-100',
    border: 'border-purple-300',
    features: [
      { name: 'Band 6 / 7 / 8 答案查看', included: true },
      { name: '每日定制次数上限', detail: '30次', included: true },
      { name: '有效期', detail: '3 个月', included: true },
      { name: '高亮词汇卡片', included: true },
      { name: '定制答案导出（PDF / Markdown）', note: '专属特权', included: true },
      { name: '高亮词汇解释卡片', note: '独有', included: true },
      { name: '写作模块（尝鲜版）', note: '独有', included: true },
    ],
  },
]

export default function MembershipPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const membershipTier = useAuthStore((s) => s.membershipTier)
  const setMembershipTier = useAuthStore((s) => s.setMembershipTier)

  useEffect(() => {
    const fetchMembership = async () => {
      if (!user) return

      const { data, error } = await supabase
        .from('user_project_membership')
        .select('membership_tier')
        .eq('user_id', user.id)
        .eq('project_id', projectId)
        .single()

      if (!error && data?.membership_tier) {
        setMembershipTier(data.membership_tier)
      }
    }

    fetchMembership()
  }, [user, setMembershipTier])

  const handleUpgradeToTier = async (tier: 'pro' | 'vip') => {
    if (!user) {
      toast.error('请先注册登录（右上角），然后再升级为 Pro / VIP', {
        duration: 8000,
      })
      return
    }

    const { error } = await supabase
      .from('user_project_membership')
      .update({ membership_tier: tier })
      .eq('user_id', user.id)
      .eq('project_id', projectId)

    if (error) {
      console.error('升级失败:', error)
      toast.error('升级失败，请联系管理员', {
        duration: 8000,
      })
    } else {
      toast.success(`升级成功！您现在是 ${tier.toUpperCase()} 用户`, {
        duration: 8000,
      })
      setMembershipTier(tier)
      router.refresh?.()
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <h1 className="text-3xl font-bold text-center text-purple-700">会员服务对比</h1>
      <p className="text-center text-gray-600">选择适合自己的练习方式，科学备考不焦虑</p>

      {membershipTier && (
        <div className="mt-6 text-center text-sm text-purple-800 bg-purple-50 border border-purple-200 py-3 px-4 rounded-xl shadow-sm">
          当前账号在本产品中的会员等级：
          <span className="font-semibold ml-1 text-purple-700">{membershipTier.toUpperCase()}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {plans.map((plan) => (
          <div
            key={plan.title}
            className={`rounded-2xl p-6 border ${plan.bg} ${plan.border} shadow-md hover:shadow-lg transition duration-300`}
          >
            <h2 className="text-xl font-semibold text-purple-800 text-center">{plan.title}</h2>
            <p className="text-center text-gray-700 mt-2 mb-4">{plan.description}</p>

            <ul className="space-y-2 text-sm text-gray-700">
              {plan.features.map((f, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  {f.included ? (
                    <Check className="text-green-600 w-4 h-4 mt-1" />
                  ) : (
                    <X className="text-red-400 w-4 h-4 mt-1" />
                  )}
                  <span>
                    <span className="font-medium">{f.name}</span>
                    {f.detail && <span className="ml-1 text-gray-500">（{f.detail}）</span>}
                    {f.note && <span className="ml-1 text-purple-500">（{f.note}）</span>}
                  </span>
                </li>
              ))}
            </ul>

            <div className="text-center mt-6">
              <p className="text-sm text-gray-500 mb-2">{plan.priceNote}</p>
              <Image
                src={plan.qrImage}
                alt={`${plan.title} 支付二维码`}
                width={120}
                height={120}
                className="mx-auto rounded border"
                unoptimized
              />
              <p className="text-xs text-gray-400 mt-2">扫码付款后请联系管理员开通权限</p>

              <button
                onClick={() => handleUpgradeToTier(plan.tier)}
                className="mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 text-sm"
              >
                我已付款，请开通 {plan.title.replace(' 用户', '')} 权限
              </button>
              <p className="text-xs text-center text-gray-500 mt-1">
                💡 请确保支付时备注了你注册用的邮箱，以便管理员确认身份
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
