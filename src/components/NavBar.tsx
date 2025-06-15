'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import YouTube from 'react-youtube'
import clsx from 'clsx'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Technology', href: '/technology' },
  { label: 'Knowledge', href: '/knowledge' },
  { label: 'Life', href: '/life' },
  { label: 'Contact', href: '/contact' },
  { label: 'About', href: '/about' },
]

const YOUTUBE_VIDEO_ID = 'Dm2TSMerGPQ'

export default function NavBar() {
  const pathname = usePathname()
  const [player, setPlayer] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasInitiated, setHasInitiated] = useState(false)

  const onPlayerReady = (event: any) => {
    setPlayer(event.target)
    event.target.playVideo()
  }

  const handleToggle = () => {
    if (!hasInitiated) {
      setHasInitiated(true)
      setIsPlaying(true)
      // 播放将在 onReady 中执行
    } else {
      if (isPlaying) {
        player?.pauseVideo()
        setIsPlaying(false)
      } else {
        player?.playVideo()
        setIsPlaying(true)
      }
    }
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 dark:bg-black/80 backdrop-blur border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center shadow-sm transition-colors">
      {/* Left: Logo + Music Prompt */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-2xl font-extrabold text-purple-700 dark:text-purple-400 tracking-tight hover:text-purple-800 dark:hover:text-purple-300 transition-colors duration-200"
        >
          StanleyHi
        </Link>

        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-800 dark:text-gray-200">
          <span className="whitespace-nowrap">
            Do you like “Ella Langley - you look like you love me”?
          </span>

          <button
            onClick={handleToggle}
            className={clsx(
              'px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200',
              isPlaying
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-400'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            )}
          >
            {hasInitiated ? (isPlaying ? 'Pause' : 'Play') : 'Yes'}
          </button>

          {isPlaying && (
            <span className="text-purple-600 dark:text-purple-300 font-medium animate-pulse ml-2">
              🎵 Playing...
            </span>
          )}
        </div>

        {/* Hidden YouTube Player */}
        <div className="absolute opacity-0 pointer-events-none">
          {hasInitiated && (
            <YouTube
              videoId={YOUTUBE_VIDEO_ID}
              opts={{
                height: '1',
                width: '1',
                playerVars: {
                  autoplay: 1,
                  mute: 0,
                  loop: 1, // ✅ 启用循环播放
                  playlist: YOUTUBE_VIDEO_ID // ✅ 必须加这个才能 loop 生效
                },
              }}
              onReady={onPlayerReady}
            />
          )}
        </div>
      </div>

      {/* Desktop nav */}
      <div className="hidden md:flex gap-6">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={clsx(
              'text-sm md:text-base font-medium transition-colors duration-200 underline-offset-4',
              pathname === item.href
                ? 'text-purple-700 dark:text-purple-400 underline'
                : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:underline'
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Mobile nav */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger aria-label="Open menu">
            <Menu className="h-6 w-6 text-purple-700 dark:text-purple-300" />
          </SheetTrigger>
          <SheetContent side="left" className="bg-white dark:bg-black">
            <div className="mt-8 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={clsx(
                    'text-base font-medium transition-colors duration-200 underline-offset-4',
                    pathname === item.href
                      ? 'text-purple-700 dark:text-purple-400 underline'
                      : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:underline'
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
