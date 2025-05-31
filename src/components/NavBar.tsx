'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu } from 'lucide-react'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'Technology', href: '/tech-career' },
  { label: 'Knowledge', href: '/tutor' },
  { label: 'Life', href: '/projects' },
  { label: 'Contact', href: '/contact' },
  { label: 'About', href: '/about' },
]

export default function NavBar() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
      {/* Logo */}
      <Link
        href="/"
        className="text-2xl font-extrabold text-purple-700 tracking-tight hover:text-purple-800 transition-colors duration-200"
      >
        Stanley
      </Link>

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
