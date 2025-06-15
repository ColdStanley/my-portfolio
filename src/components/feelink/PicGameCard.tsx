'use client'

import Link from 'next/link'

interface Props {
  href: string
  title: string
  image: string
}

export default function PicGameCard({ href, title, image }: Props) {
  return (
    <Link href={href}>
      <div className="group relative w-full rounded-2xl overflow-hidden shadow-md border border-purple-100 cursor-pointer transition-transform hover:scale-105 hover:shadow-lg">
        <img src={image} alt={title} className="w-full h-auto object-cover" />
        <div className="absolute bottom-0 w-full bg-purple-800/60 text-white text-center py-2 text-sm font-medium backdrop-blur-md group-hover:bg-purple-700/70">
          {title}
        </div>
      </div>
    </Link>
  )
}
