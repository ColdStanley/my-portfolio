import FeelinkDisplayUser from '@/components/feelink/upload/FeelinkDisplayUser'

// ✅ 用于 SEO metadata 设置
export async function generateMetadata({ params }: { params: { id: string } }) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/feelink/get-from-supabase?id=${params.id}`,
      { cache: 'no-store' }
    )
    
    if (!res.ok) {
      throw new Error('Failed to fetch data')
    }
    
    const data = await res.json()
    
    // 确保图片URL是完整的
    const imageUrl = data.imageUrl?.startsWith('http') 
      ? data.imageUrl 
      : `https://${data.imageUrl}`
    
    // 创建更好的标题和描述
    const title = `${data.description || 'A Beautiful Feelink'} – Share Your Feelings`
    const description = data.description 
      ? `"${data.description}" - Express your feelings through beautiful images and meaningful quotes. Create your own Feelink today.`
      : 'Express your feelings through beautiful images and meaningful quotes. Create your own Feelink today.'
    
    // 当前页面URL
    const currentUrl = `https://www.stanleyhi.com/feelink/user-view/${params.id}`
    
    return {
      title,
      description,
      keywords: ['feelink', 'quotes', 'feelings', 'emotions', 'share', 'images', 'love', 'gratitude', 'blessing'],
      authors: [{ name: 'Stanley Hi', url: 'https://www.stanleyhi.com' }],
      creator: 'Stanley Hi',
      publisher: 'Stanley Hi',
      robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
      
      // Open Graph for Facebook & Instagram
      openGraph: {
        type: 'article',
        title,
        description,
        url: currentUrl,
        siteName: 'Feelink by Stanley Hi',
        locale: 'en_US',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: data.description || 'Feelink - Express your feelings',
            type: 'image/jpeg',
          },
          {
            url: imageUrl,
            width: 1200,
            height: 1200,
            alt: data.description || 'Feelink - Express your feelings',
            type: 'image/jpeg',
          },
          {
            url: imageUrl,
            width: 800,
            height: 600,
            alt: data.description || 'Feelink - Express your feelings',
            type: 'image/jpeg',
          }
        ],
      },
      
      // Twitter Cards
      twitter: {
        card: 'summary_large_image',
        site: '@stanleyhi',
        creator: '@stanleyhi',
        title,
        description,
        images: {
          url: imageUrl,
          alt: data.description || 'Feelink - Express your feelings',
        },
      },
      
      // Additional meta tags
      other: {
        'fb:app_id': 'YOUR_FACEBOOK_APP_ID', // 替换为实际的Facebook App ID
        'og:image:secure_url': imageUrl,
        'og:image:type': 'image/jpeg',
        'og:image:width': '1200',
        'og:image:height': '630',
        'twitter:image:src': imageUrl,
        'twitter:domain': 'stanleyhi.com',
        'pinterest-rich-pin': 'true',
        'article:author': 'Stanley Hi',
        'article:section': 'Feelings & Quotes',
        'article:tag': 'feelink,quotes,emotions,sharing',
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    
    // 默认元数据
    return {
      title: 'Beautiful Feelink – Share Your Feelings',
      description: 'Express your feelings through beautiful images and meaningful quotes. Create your own Feelink today.',
      openGraph: {
        title: 'Beautiful Feelink – Share Your Feelings',
        description: 'Express your feelings through beautiful images and meaningful quotes.',
        images: [
          {
            url: 'https://www.stanleyhi.com/og/feelink-cover.png',
            width: 1200,
            height: 630,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Beautiful Feelink – Share Your Feelings',
        description: 'Express your feelings through beautiful images and meaningful quotes.',
        images: ['https://www.stanleyhi.com/og/feelink-cover.png'],
      },
    }
  }
}

// ✅ 正常页面组件（传参给客户端组件）
export default async function PicGameUserViewPage({
  params,
}: {
  params: { id: string }
}) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/feelink/get-from-supabase?id=${params.id}`,
      { cache: 'no-store' }
    )
    
    if (!res.ok) {
      throw new Error('Failed to fetch data')
    }
    
    const data = await res.json()
    
    // 确保图片URL是完整的
    const imageUrl = data.imageUrl?.startsWith('http') 
      ? data.imageUrl 
      : `https://${data.imageUrl}`
    
    // 结构化数据 (JSON-LD) for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "name": data.description || "A Beautiful Feelink",
      "description": `"${data.description}" - Express your feelings through beautiful images and meaningful quotes.`,
      "image": imageUrl,
      "url": `https://www.stanleyhi.com/feelink/user-view/${params.id}`,
      "author": {
        "@type": "Person",
        "name": "Stanley Hi",
        "url": "https://www.stanleyhi.com"
      },
      "publisher": {
        "@type": "Organization",
        "name": "Stanley Hi",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.stanleyhi.com/logo.png"
        }
      },
      "dateCreated": new Date().toISOString(),
      "genre": "Feelings & Emotions",
      "keywords": "feelink, quotes, feelings, emotions, share, images",
      "inLanguage": "en-US",
      "isAccessibleForFree": true,
      "license": "https://creativecommons.org/licenses/by/4.0/"
    }

    return (
      <>
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        
        <div className="p-6 max-w-4xl mx-auto">
          <FeelinkDisplayUser
            imageUrl={data.imageUrl}
            description={data.description}
            quotes={data.quotes}
          />
        </div>
      </>
    )
  } catch (error) {
    console.error('Error loading Feelink:', error)
    
    return (
      <div className="p-6 max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Feelink Not Found</h1>
        <p className="text-gray-600 mb-6">Sorry, this Feelink could not be loaded.</p>
        <a 
          href="/feelink" 
          className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Create Your Own Feelink
        </a>
      </div>
    )
  }
}
