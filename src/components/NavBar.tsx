'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import YouTube from 'react-youtube'
import clsx from 'clsx'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Technology', href: '/technology' },
  { label: 'Knowledge', href: '/knowledge' },
  { label: 'Life', href: '/life' },
  { label: 'About & Contact', href: '/aboutcontact' },
]

const YOUTUBE_VIDEO_ID = 'Dm2TSMerGPQ'

export default function NavBar() {
  const pathname = usePathname()
  const [player, setPlayer] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasInitiated, setHasInitiated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const onPlayerReady = (event: any) => {
    setPlayer(event.target)
    event.target.playVideo()
  }

  const handleToggle = () => {
    if (!hasInitiated) {
      setHasInitiated(true)
      setIsPlaying(true)
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

  const checkUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUserEmail(user?.email ?? null)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUserEmail(null)
    setShowDropdown(false)
  }

  useEffect(() => {
    checkUser()
  }, [])

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

        <div className="hidden md:flex items-center gap-3 text-sm text-gray-800 dark:text-gray-200">
          <span className="whitespace-nowrap">
            “You look like you love me -Ella Langley”
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
            {hasInitiated ? (isPlaying ? 'Pause' : 'Play') : 'Play Music'}
          </button>

          {isPlaying && (
            <span className="text-purple-600 dark:text-purple-300 font-medium animate-pulse ml-2">
              🎵 Playing...
            </span>
          )}
        </div>

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
                  loop: 1,
                  playlist: YOUTUBE_VIDEO_ID
                },
              }}
              onReady={onPlayerReady}
            />
          )}
        </div>
      </div>

      {/* Desktop nav */}
      <div className="hidden md:flex gap-6 items-center">
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

        {userEmail ? (
          <div className="relative ml-4">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400"
            >
              {userEmail.split('@')[0]} ▼
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 border rounded shadow p-2 text-sm">
                <button
                  onClick={signOut}
                  className="text-left w-full text-gray-700 dark:text-gray-300 hover:text-purple-600"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/register"
            className="ml-4 text-sm md:text-base font-medium text-purple-700 dark:text-purple-400 hover:underline"
          >
            Sign in / Register
          </Link>
        )}
      </div>

      {/* Mobile nav */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger aria-label="Open menu">
            <Menu className="h-6 w-6 text-purple-700 dark:text-purple-300" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="bg-white dark:bg-black px-6 pt-10 pb-6 max-w-xs rounded-r-xl shadow-lg flex flex-col justify-between"
          >
            <div className="flex flex-col gap-6">
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

            <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-4">
              {userEmail ? (
                <div>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="text-base font-medium text-gray-700 dark:text-gray-300 hover:text-purple-600"
                  >
                    {userEmail.split('@')[0]} ▼
                  </button>
                  {showDropdown && (
                    <div className="mt-2">
                      <button
                        onClick={signOut}
                        className="text-left w-full text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/register"
                  className="text-base font-medium text-purple-700 dark:text-purple-400 hover:underline"
                >
                  Sign in / Register
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}