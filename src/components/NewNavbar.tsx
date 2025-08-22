'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSimplifiedAuth } from '@/hooks/useSimplifiedAuth'
import { supabase } from '@/lib/supabaseClient'

export default function NewNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const pathname = usePathname()
  const { user, profile, isAdmin } = useSimplifiedAuth()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.dropdown-container')) {
        setOpenDropdown(null)
        setShowUserDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navItems = [
    {
      name: 'Life Assistant',
      type: 'dropdown',
      items: [
        { name: "C'est La Vie", href: '/cestlavie' }
      ]
    },
    {
      name: 'Career Tools',
      type: 'dropdown',
      items: [
        { name: 'JD2CV', href: '/jd2cv' }
      ]
    },
    {
      name: 'Learning Hub',
      type: 'dropdown',
      items: [
        { name: 'Readlingua', href: '/readlingua' },
        { name: 'IELTS Speaking', href: '/ai-agent-gala' }
      ]
    },
    {
      name: 'AI Lab',
      type: 'dropdown',
      items: [
        { name: 'AI Agent Gala', href: '/ai-agent-gala' },
        { name: 'Webhook Tester', href: '/ai-agent-gala' }
      ]
    },
    { name: 'Portfolio', href: '/original', type: 'link' },
    {
      name: 'About',
      type: 'dropdown',
      items: [
        { name: 'Contact Me', href: '/aboutcontact' },
        { name: 'Partnership', href: '/aboutcontact#partnership' }
      ]
    }
  ]

  const scrollToSection = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.getElementById(href.slice(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
    setMobileMenuOpen(false)
  }

  const exploreProjects = () => {
    if (pathname === '/') {
      // If on homepage, scroll to projects section
      const element = document.getElementById('solutions')
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      // If on other pages, go to homepage first then scroll
      window.location.href = '/#solutions'
    }
  }

  const isActiveDropdown = (item: any) => {
    if (item.type !== 'dropdown') return false
    return item.items.some((subItem: any) => pathname === subItem.href)
  }

  const handleLogout = async () => {
    try {
      console.log('开始logout...')
      
      // 清除所有Supabase session
      const { error } = await supabase.auth.signOut({ scope: 'global' })
      if (error) {
        console.error('SignOut error:', error)
      } else {
        console.log('Supabase signOut 完成')
      }
      
      // 清除所有本地存储
      localStorage.clear()
      sessionStorage.clear()
      
      // 清除所有cookies（可选）
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      })
      
      console.log('清理完成，准备重定向')
      
      // 使用replace而不是href，避免浏览器后退
      window.location.replace('/')
      
    } catch (error) {
      console.error('Logout错误:', error)
      // 即使出错也尝试重定向
      window.location.replace('/')
    }
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.span
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
            >
              Stanly Hi
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <div key={item.name} className="relative dropdown-container">
                {item.type === 'dropdown' ? (
                  <div
                    onMouseEnter={() => setOpenDropdown(item.name)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`font-medium transition-all duration-200 flex items-center gap-1 ${
                        isActiveDropdown(item)
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      {item.name}
                      <motion.svg
                        animate={{ rotate: openDropdown === item.name ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="w-4 h-4 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </motion.svg>
                    </motion.button>

                    <AnimatePresence>
                      {openDropdown === item.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                        >
                          {item.items.map((subItem) => (
                            <Link key={subItem.name} href={subItem.href} prefetch={true}>
                              <motion.div
                                whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
                                className="px-4 py-3 text-gray-700 hover:text-purple-600 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                              >
                                {subItem.name}
                              </motion.div>
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link href={item.href} prefetch={true}>
                    <motion.span
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`font-medium transition-colors duration-200 ${
                        pathname === item.href 
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      {item.name}
                    </motion.span>
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* CTA & User Authentication */}
          <div className="hidden md:flex items-center gap-4">
            <motion.button
              onClick={exploreProjects}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              Explore Projects
            </motion.button>
            
            {user ? (
              <div className="relative dropdown-container">
                <motion.button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-purple-600 rounded-lg font-medium border border-purple-200 transition-all duration-300"
                >
                  <span className="text-sm">{user.email?.split('@')[0]}</span>
                  <motion.svg
                    animate={{ rotate: showUserDropdown ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </motion.button>

                <AnimatePresence>
                  {showUserDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-56 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <p className="text-sm text-gray-600 mb-1">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        <p className="text-xs text-purple-600 mt-1">
                          {profile?.role?.toUpperCase() || 'USER'}
                        </p>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          href="/membership"
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-purple-50/50 hover:text-purple-600 transition-colors duration-200"
                          onClick={() => setShowUserDropdown(false)}
                        >
                          My Membership
                        </Link>
                        <button
                          onClick={() => {
                            setShowUserDropdown(false)
                            handleLogout()
                          }}
                          className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50/50 hover:text-red-700 transition-colors duration-200"
                        >
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent hover:from-purple-700 hover:to-indigo-700 transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-purple-600 rounded-lg font-medium border border-purple-200 transition-all duration-300 text-sm"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center text-gray-600 hover:text-purple-600 transition-colors duration-200"
          >
            <div className="w-5 h-5 flex flex-col justify-center items-center">
              <motion.span
                animate={mobileMenuOpen ? { rotate: 45, y: 2 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-current transform transition-all duration-200 origin-center"
              />
              <motion.span
                animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-full h-0.5 bg-current mt-1 transition-opacity duration-200"
              />
              <motion.span
                animate={mobileMenuOpen ? { rotate: -45, y: -2 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-current mt-1 transform transition-all duration-200 origin-center"
              />
            </div>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-white/95 backdrop-blur-md rounded-xl mx-4 mb-4 shadow-xl border border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-4 space-y-4">
                {navItems.map((item) => (
                  <div key={item.name}>
                    {item.type === 'dropdown' ? (
                      <div>
                        <div className={`font-medium py-2 ${
                          isActiveDropdown(item)
                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'
                            : 'text-gray-800'
                        }`}>
                          {item.name}
                        </div>
                        <div className="ml-4 space-y-2">
                          {item.items.map((subItem) => (
                            <Link key={subItem.name} href={subItem.href} prefetch={true} onClick={() => setMobileMenuOpen(false)}>
                              <div className="py-2 text-gray-600 hover:text-purple-600 transition-colors duration-200">
                                {subItem.name}
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Link href={item.href} prefetch={true} onClick={() => setMobileMenuOpen(false)}>
                        <motion.span
                          whileTap={{ scale: 0.95 }}
                          className={`block font-medium py-2 transition-colors duration-200 ${
                            pathname === item.href 
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent'
                              : 'text-gray-600 hover:text-purple-600'
                          }`}
                        >
                          {item.name}
                        </motion.span>
                      </Link>
                    )}
                  </div>
                ))}
                
                {/* Mobile User Authentication */}
                <div className="pt-4 border-t border-gray-200 space-y-3">
                  {user ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-purple-50/50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Signed in as</p>
                        <p className="text-sm font-medium text-gray-900">{user.email}</p>
                        <p className="text-xs text-purple-600 mt-1">
                          {profile?.role?.toUpperCase() || 'USER'}
                        </p>
                      </div>
                      <Link
                        href="/membership"
                        className="block w-full py-2 text-sm text-purple-600 hover:text-purple-700 transition-colors duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        My Membership
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false)
                          handleLogout()
                        }}
                        className="w-full py-2 text-sm text-red-600 hover:text-red-700 transition-colors duration-200 text-left"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Link
                        href="/auth/login"
                        className="block w-full py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        className="block w-full px-4 py-2 bg-white/70 backdrop-blur-sm text-purple-600 rounded-lg font-medium border border-purple-200 transition-all duration-300 text-sm text-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </div>
                  )}
                  
                  <motion.button
                    onClick={() => {
                      setMobileMenuOpen(false)
                      exploreProjects()
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium transition-all duration-300 shadow-lg"
                  >
                    Explore Projects
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  )
}