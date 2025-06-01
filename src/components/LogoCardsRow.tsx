'use client'

import Image from 'next/image'

export default function LogoCardsRow() {
  // 每个卡片中的图片数组，最大 9 张，可按需调整
  const logoGroups = [
    [
      '/images/NCS.png',
      '/images/IceKredit.png',
      '/images/Huawei.png',
      '/images/Diebold.png',
      '/images/Fuji Xerox.png',
    ],
    [
      '/images/Carleton.png',
    ],
    [
      '/images/Montreal.png',
      '/images/TW.png',
    ],
  ]

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 mb-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {logoGroups.map((logos, index) => (
          <div
            key={index}
            className="h-56 rounded-2xl shadow-md bg-white border border-purple-100 p-3"
          >
            <div className="grid grid-cols-3 grid-rows-3 gap-2 w-full h-full">
              {logos.map((src, i) => (
                <div
                  key={i}
                  className="flex items-center justify-center p-1 bg-gray-50 rounded"
                >
                  <Image
                    src={src}
                    alt={`Logo ${i}`}
                    width={80}
                    height={80}
                    className="object-contain max-w-full max-h-full"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
