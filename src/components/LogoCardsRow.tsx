'use client'

import Image from 'next/image'

export default function LogoCardsRow() {
  const logoGroups = {
    Technology: [
      '/images/Technology-NCS.png',
      '/images/Technology-Huawei.png',
      '/images/Technology-IceKredit.png',
      '/images/Technology-Diebold.png',
      '/images/Technology-FujiXerox.png',
    ],
    Knowledge: [
      '/images/Knowledge-Carleton.png',
      '/images/Knowledge-Bologna.png',
    ],
    Life: [
      '/images/Life-Montreal.png',
      '/images/Life-TW.png',
    ],
  }

  const titles = ['Technology', 'Knowledge', 'Life']

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {titles.map((category) => (
          <div
            key={category}
            className="h-72 rounded-2xl shadow-md bg-white border border-purple-100 p-4"
          >
            <h3 className="text-center text-sm font-semibold text-purple-700 mb-3">{category}</h3>

            <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-full">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="relative aspect-square bg-gray-50 rounded border border-gray-200 overflow-hidden"
                >
                  {logoGroups[category][i] && (
                    <Image
                      src={logoGroups[category][i]}
                      alt={`${category} Logo ${i}`}
                      fill
                      sizes="100%"
                      className="object-contain p-1 scale-105 transition-transform duration-300"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
