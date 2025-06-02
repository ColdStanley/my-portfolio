'use client'

import Image from 'next/image'

export default function LogoCarouselRow() {
  const baseLogos = {
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
      '/images/Knowledge-Queensland.png',
      '/images/Knowledge-Deakin.png',
      '/images/Knowledge-Toronto.png',
    ],
    Life: [
      '/images/Life-Montreal.png',
      '/images/Life-TaiWan.png',
      '/images/Life-Niagara.png',
    ],
  }

  const repeatLogos = (arr: string[], times: number) =>
    Array.from({ length: times }).flatMap(() => arr)

  const getDurationSeconds = (count: number) => count * 2

  return (
    <div className="max-w-7xl mx-auto px-6 mt-10 space-y-10">
      <style>
        {`
          @keyframes scroll-left {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {(['Technology', 'Knowledge', 'Life'] as const).map((category) => {
          const repeated = repeatLogos(baseLogos[category], 10)
          const duration = getDurationSeconds(repeated.length)

          return (
            <div key={category}>
              <div className="overflow-hidden">
                <div
                  className="flex gap-4 animate-[scroll-left] w-fit"
                  style={{
                    minWidth: '200%',
                    animationDuration: `${duration}s`,
                    animationTimingFunction: 'linear',
                    animationIterationCount: 'infinite',
                  }}
                >
                  {repeated.map((src, i) => (
                    <div
                      key={`${category}-${i}`}
                      className="w-[100px] h-[60px] flex items-center justify-center"
                    >
                      <Image
                        src={src}
                        alt={`${category} logo ${i}`}
                        width={100}
                        height={60}
                        className="object-contain max-w-full max-h-full"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
