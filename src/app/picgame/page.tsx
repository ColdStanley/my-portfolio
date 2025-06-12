'use client'

import Link from 'next/link'
import Image from 'next/image'

const picgames = [
  {
  id: 'stanleymontreal',
  title: '蒙特利尔滑冰乱纪实',
  image: '/images/picgamenms.png',
},
  {
    id: 'picgame01',
    title: '猫系少女',
    image: '/images/picgame01.png',
  },
  {
    id: 'picgame02',
    title: '异次元电竞歌姬',
    image: '/images/picgame02.png',
  },
  {
    id: 'picgame03',
    title: '真实的Miku Cosplay',
    image: '/images/picgame03.png',
  },
  {
    id: 'picgame04',
    title: '办公室狗狗老板',
    image: '/images/picgame04.png',
  },
  {
    id: 'picgame05',
    title: '猫娘在家',
    image: '/images/picgame05.png',
  },
  {
    id: 'picgame06',
    title: '初音未来 本体驾到！',
    image: '/images/picgame06.png',
  },
  {
  id: 'stanleyemmanuel',
  title: '篮球双雄出征',
  image: '/images/picgamestanleyemmanuel.png',
},
]

export default function PicGameGalleryPage() {
  return (
    <div className="min-h-screen py-10 px-4 sm:px-10 bg-gradient-to-b from-white to-purple-50">
      <h1 className="text-3xl sm:text-4xl font-bold text-purple-600 text-center mb-10">
        🎮 PicGame Gallery
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {picgames.map((item) => (
          <Link
            key={item.id}
            href={`/picgame/${item.id}`}
            className="group rounded-2xl border border-purple-100 shadow-md hover:shadow-2xl overflow-hidden transition relative bg-white"
          >
            <div className="w-full h-60 relative">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="px-4 py-3 bg-white text-purple-700 text-sm font-medium group-hover:bg-purple-50 transition">
              {item.title}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
