'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

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
      <Link
        href="/"
        className="text-2xl font-extrabold text-purple-700 tracking-tight hover:text-purple-800 transition-colors duration-200"
      >
        Stanley
      </Link>
      <div className="flex gap-6">
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
    </nav>
  )
}
