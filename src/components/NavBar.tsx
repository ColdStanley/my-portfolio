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
  }

  const handleToggle = () => {
    if (!hasInitiated) {
      setHasInitiated(true)
      setIsPlaying(true)
      player?.playVideo()
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
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
      {/* Left: Logo + Prompt */}
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-2xl font-extrabold text-purple-700 tracking-tight hover:text-purple-800 transition-colors duration-200"
        >
          Stanley
        </Link>

        {/* Text + Play / Pause Button */}
        <div className="hidden md:flex items-center gap-3 text-sm text-gray-800">
          <span>
            Do you like “Ella Langley (feat. Riley Green) - you look like you love me”?
          </span>

          <button
            onClick={handleToggle}
            className={clsx(
              'px-3 py-1 rounded-md text-sm transition font-medium',
              isPlaying
                ? 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            )}
          >
            {hasInitiated ? (isPlaying ? 'Pause' : 'Play') : 'Yes'}
          </button>

          {/* Animated Music Playing indicator */}
          {isPlaying && (
            <span className="text-purple-600 font-medium animate-pulse ml-2">
              🎵 Music Playing...
            </span>
          )}
        </div>

        {/* Hidden YouTube Player (audio only) */}
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
            className={`text-sm md:text-base transition-colors duration-200 font-medium ${
              pathname === item.href
                ? 'text-purple-700 font-semibold underline underline-offset-4'
                : 'text-gray-700 hover:text-purple-600 hover:underline underline-offset-4'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Mobile nav */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger>
            <Menu className="h-6 w-6 text-purple-700" />
          </SheetTrigger>
          <SheetContent side="left" className="bg-white">
            <div className="mt-8 flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`text-base transition-colors duration-200 font-medium ${
                    pathname === item.href
                      ? 'text-purple-700 font-semibold underline underline-offset-4'
                      : 'text-gray-700 hover:text-purple-600 hover:underline underline-offset-4'
                  }`}
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
