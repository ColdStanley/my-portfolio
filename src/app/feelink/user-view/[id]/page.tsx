// src/app/feelink/user-view/[id]/page.tsx
import PicGameDisplayuser from '@/components/feelink/upload/PicGameDisplayuser'

// ✅ 用于 SEO metadata 设置
export async function generateMetadata({ params }: { params: { id: string } }) {
  const res = await fetch(
    `https://www.stanleyhi.com/api/feelink/get-one-from-notion?id=${params.id}`,
    { cache: 'no-store' }
  )
  const data = await res.json()

  return {
    title: `${data.quotes} – Feelink`,
    description: data.description,
    openGraph: {
      title: `${data.quotes} – Feelink`,
      description: data.description,
      images: [
        {
          url: data.imageUrl,
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${data.quotes} – Feelink`,
      description: data.description,
      images: [data.imageUrl],
    },
  }
}

// ✅ 正常页面组件（传参给客户端组件）
export default async function PicGameUserViewPage({
  params,
}: {
  params: { id: string }
}) {
  const res = await fetch(
    `https://www.stanleyhi.com/api/feelink/get-one-from-notion?id=${params.id}`,
    { cache: 'no-store' }
  )
  const data = await res.json()

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
