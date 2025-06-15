'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import PicGameDisplayuser from '@/components/feelink/upload/PicGameDisplayuser'

console.log('✅ 成功进入 user-view 页面组件')
interface PicGameData {
  id: string
  imageUrl: string
  description: string
  quotes: string
  type?: string
}

export default function PicGameUserViewPage() {
  const { id } = useParams()
  const [data, setData] = useState<PicGameData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!id || typeof id !== 'string') return

      try {
        const res = await fetch(`/api/feelink/get-one-from-notion?id=${id}`)
        const json = await res.json()
        console.log('🟡 get-one-from-notion 返回数据:', json)  // ←✅ 就加这一行

        setData(json)
      } catch (error) {
        console.error('获取数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  if (loading) {
    return <div className="p-6 text-gray-500 text-sm">加载中...</div>
  }

  if (!data) {
    return <div className="p-6 text-red-500 text-sm">未找到内容</div>
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PicGameDisplayuser
  imageUrl={data.imageUrl}
  description={data.description}
  quotes={data.quotes}
/>

    </div>
  )
}
