'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useAnimation, useMotionValue, useSpring } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import NewNavbar from '@/components/NewNavbar'
import FooterSection from '@/components/FooterSection'
import PageTransition from '@/components/PageTransition'
import GlobalLoader from '@/components/GlobalLoader'
import { PageSkeleton } from '@/components/SkeletonLoaders'

interface HomePageClientProps {
  initialContent: any
}

export default function HomePageClient({ initialContent }: HomePageClientProps) {
  // Use only static content from server-side
  const displayContent = initialContent

  // Show skeleton if no content available
  if (!displayContent) {
    return (
      <>
        <GlobalLoader />
        <PageTransition>
          <PageSkeleton />
        </PageTransition>
      </>
    )
  }

  return (
    <>
      <GlobalLoader />
      <PageTransition>
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 relative overflow-hidden">
        {/* Background Effects */}
        <GridBackground />
        <WorkflowNetwork />
        <LightSculpture />

        {/* Custom Navigation for new homepage */}
        <NewNavbar />

        {/* Hero Section */}
        {displayContent?.hero && <HeroSection hero={displayContent.hero} />}

      {/* Dynamic Projects Section */}
      <div id="solutions">
        {displayContent?.projects && displayContent.projects.map((project, index) => (
          <ProjectSection
            key={project.href}
            title={project.title}
            description={project.description}
            benefits={project.benefits}
            buttonText={project.button_text}
            href={project.href}
            gradient={project.gradient}
            project_images={project.project_images}
            project_video={project.project_video}
            index={index}
            reverse={project.reverse}
          />
        ))}
      </div>

      {/* More Projects Section */}
      {displayContent?.more_projects && (
        <MoreProjectsSection projects={displayContent.more_projects} />
      )}

      {/* About Section (Footer) */}
      <div id="about">
        <FooterSection />
      </div>
    </main>
      </PageTransition>
    </>
  )
}

interface HeroProps {
  hero: {
    title: string
    subtitle: string
    background_video: string
    primary_button_text: string
    primary_button_href: string
    secondary_button_text: string
    secondary_button_href: string
    gradient_text: string
  }
}

function HeroSection({ hero }: HeroProps) {
  const [scrollY, setScrollY] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const playCountRef = useRef(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      const handleLoadedData = () => {
        video.playbackRate = 0.3
      }

      const handleEnded = () => {
        playCountRef.current += 1
        if (playCountRef.current < 2) {
          // 播放第2次
          video.currentTime = 0
          video.play()
        }
        // 播放2次后自动停止，定格在最后一帧
      }

      video.addEventListener('loadeddata', handleLoadedData)
      video.addEventListener('ended', handleEnded)

      return () => {
        video.removeEventListener('loadeddata', handleLoadedData)
        video.removeEventListener('ended', handleEnded)
      }
    }
  }, [])

  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-16 relative overflow-hidden">
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-40 z-0"
      >
        <source src={hero.background_video} type="video/mp4" />
      </video>

      {/* Video Overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/10 to-purple-900/20 z-10" />

      <motion.div
        className="max-w-4xl mx-auto text-center relative z-20"
        style={{ y: scrollY * 0.3 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            {hero.gradient_text && hero.gradient_text !== hero.title ? (
              <>
                {hero.title.split(hero.gradient_text)[0]}
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {hero.gradient_text}
                </span>
                {hero.title.split(hero.gradient_text)[1]}
              </>
            ) : (
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {hero.title}
              </span>
            )}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed"
          >
            {hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-wrap justify-center gap-4"
          >
            {hero.primary_button_href.startsWith('#') ? (
              <ScrollToSection targetId={hero.primary_button_href.slice(1)} className="w-40 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105">
                {hero.primary_button_text}
              </ScrollToSection>
            ) : (
              <Link href={hero.primary_button_href} className="w-40 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 text-center">
                {hero.primary_button_text}
              </Link>
            )}
            {hero.secondary_button_text && (
              <Link href={hero.secondary_button_href} className="w-40 px-6 py-3 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-purple-600 rounded-lg font-medium border border-purple-200 transition-all duration-300 hover:shadow-lg hover:scale-105 text-center">
                {hero.secondary_button_text}
              </Link>
            )}
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}

interface ProjectSectionProps {
  title: string
  description: string
  benefits: string[]
  buttonText: string
  href: string
  gradient: string
  index: number
  reverse?: boolean
  project_images?: string[]
  project_video?: string
}

function ProjectSection({ title, description, benefits, buttonText, href, gradient, index, reverse = false, project_images = [], project_video }: ProjectSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const controls = useAnimation()

  // 3D Tilt Effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  // Image Carousel State
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setMousePosition({ x, y })
  }

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  // Auto-rotate images if multiple images exist
  useEffect(() => {
    if (project_images && project_images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          (prevIndex + 1) % project_images.length
        )
      }, 3000) // Change image every 3 seconds

      return () => clearInterval(interval)
    }
  }, [project_images])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <section
      id={href.slice(1)}
      className="min-h-screen flex items-center px-6 py-20"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${reverse ? 'lg:grid-flow-col-dense' : ''}`}
        >
          {/* Content */}
          <motion.div
            variants={itemVariants}
            className={`space-y-8 ${reverse ? 'lg:col-start-2' : ''}`}
          >
            <div>
              <motion.h2
                variants={itemVariants}
                className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight"
              >
                {title}
              </motion.h2>

              <motion.p
                variants={itemVariants}
                className="text-lg md:text-xl text-gray-600 leading-relaxed mb-8"
              >
                {description}
              </motion.p>
            </div>

            <motion.div variants={itemVariants} className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Core Benefits:</h3>
              <ul className="space-y-3">
                {benefits.map((benefit, idx) => (
                  <motion.li
                    key={idx}
                    variants={itemVariants}
                    className="flex items-start gap-3 text-gray-600"
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="leading-relaxed">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Link
                href={href}
                className="inline-block w-40 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-xl hover:scale-105 text-center"
              >
                {buttonText}
              </Link>
            </motion.div>
          </motion.div>

          {/* Visual Element */}
          <motion.div
            variants={itemVariants}
            className={`${reverse ? 'lg:col-start-1' : ''}`}
          >
            <div className="relative">
              <motion.div
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                animate={{
                  rotateX: isHovering ? (mousePosition.y - 0.5) * 10 : 0,
                  rotateY: isHovering ? (mousePosition.x - 0.5) * 10 : 0,
                  scale: isHovering ? 1.02 : 1
                }}
                transition={{ duration: 0.3 }}
                className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 relative overflow-hidden"
                style={{
                  boxShadow: '0 25px 50px rgba(139, 92, 246, 0.15), 0 10px 30px rgba(0, 0, 0, 0.1)',
                  transformStyle: 'preserve-3d'
                }}
              >

                {project_video ? (
                  // Display video taking full space
                  <video
                    src={project_video}
                    autoPlay
                    muted
                    loop
                    className="w-full h-80 object-cover rounded-xl"
                  />
                ) : project_images && project_images.length > 0 ? (
                  // Display image(s) with sliding animation
                  <div className="relative overflow-hidden rounded-xl">
                    <div
                      className="flex transition-transform duration-700 ease-in-out"
                      style={{
                        transform: `translateX(-${currentImageIndex * 100}%)`,
                        width: `${project_images.length * 100}%`
                      }}
                    >
                      {project_images.map((imageUrl, idx) => (
                        <div key={idx} className="w-full flex-shrink-0 relative">
                          <Image
                            src={imageUrl}
                            alt={`${title} - Image ${idx + 1}`}
                            width={800}
                            height={320}
                            className="w-full h-80 object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
                            priority={idx === 0}
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                          />
                        </div>
                      ))}
                    </div>
                    {project_images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {project_images.map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                              idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Fallback with gradient background and number
                  <>
                    <div className={`w-full h-64 bg-gradient-to-br ${gradient} rounded-xl mb-6 flex items-center justify-center relative z-10`}>
                      <div className="text-white text-6xl font-bold opacity-20">
                        {index + 1}
                      </div>
                    </div>
                    <div className="space-y-3 relative z-10">
                      <div className="h-4 bg-gray-200 rounded-full"></div>
                      <div className="h-4 bg-gray-200 rounded-full w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded-full w-1/2"></div>
                    </div>
                  </>
                )}
              </motion.div>

              {/* Floating elements for depth */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, 1, 0]
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full opacity-20"
              />
              <motion.div
                animate={{
                  y: [0, 15, 0],
                  rotate: [0, -1, 0]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute -bottom-6 -left-6 w-12 h-12 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full opacity-15"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

interface MoreProjectsSectionProps {
  projects: Array<{
    title: string
    subtitle: string
    description: string
    tech: string
    href: string
  }>
}

function MoreProjectsSection({ projects }: MoreProjectsSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const controls = useAnimation()

  // Mouse tracking for 3D effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    }
  }, [isInView, controls])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  return (
    <section className="py-20 px-6" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            More <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Projects</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover additional tools and platforms designed to enhance your productivity and learning experience.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.href}
              variants={itemVariants}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = (e.clientX - rect.left) / rect.width
                const y = (e.clientY - rect.top) / rect.height
                setMousePosition({ x, y })
              }}
              className="group relative"
            >
              <motion.div
                whileHover={{
                  scale: 1.02,
                  rotateX: (mousePosition.y - 0.5) * 5,
                  rotateY: (mousePosition.x - 0.5) * 5
                }}
                transition={{ duration: 0.3 }}
                className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-6 border border-white/20 h-full flex flex-col relative overflow-hidden"
                style={{
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Background gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative z-10 flex-1 flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                      {project.title}
                    </h3>
                    <p className="text-sm text-purple-600 mb-3 font-medium">
                      {project.subtitle}
                    </p>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {project.description}
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      {project.tech}
                    </p>
                  </div>

                  <Link
                    href={project.href}
                    className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 text-center"
                  >
                    Explore Project
                  </Link>
                </div>

                {/* Floating decoration */}
                <motion.div
                  animate={{
                    y: [0, -8, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute top-4 right-4 w-3 h-3 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full opacity-30"
                />
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// Helper Components
function ScrollToSection({ targetId, className, children }: { targetId: string; className: string; children: React.ReactNode }) {
  const handleClick = () => {
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <button onClick={handleClick} className={className}>
      {children}
    </button>
  )
}

function GridBackground() {
  return (
    <div className="absolute inset-0 opacity-[0.015]">
      <div className="absolute inset-0" style={{
        backgroundImage: `
          radial-gradient(circle at 1px 1px, rgba(139, 92, 246, 0.8) 1px, transparent 0)
        `,
        backgroundSize: '24px 24px'
      }} />
    </div>
  )
}

function WorkflowNetwork() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="workflow-grid" width="120" height="120" patternUnits="userSpaceOnUse">
            <circle cx="60" cy="60" r="1.5" fill="rgba(139, 92, 246, 0.1)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#workflow-grid)" />

        {/* Animated connection lines */}
        <motion.path
          d="M 100 200 Q 400 100 700 250 Q 900 350 1200 200"
          stroke="rgba(139, 92, 246, 0.1)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
        />
        <motion.path
          d="M 200 600 Q 500 400 800 700 Q 1000 800 1300 600"
          stroke="rgba(79, 70, 229, 0.08)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, ease: "easeInOut", repeat: Infinity, repeatType: "reverse", delay: 1 }}
        />
      </svg>
    </div>
  )
}

function LightSculpture() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(0, { stiffness: 100, damping: 30 })
  const rotateY = useSpring(0, { stiffness: 100, damping: 30 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window

      x.set((clientX / innerWidth) * 100)
      y.set((clientY / innerHeight) * 100)
      rotateX.set((clientY / innerHeight - 0.5) * 20)
      rotateY.set((clientX / innerWidth - 0.5) * 20)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [x, y, rotateX, rotateY])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          left: `${x.get()}%`,
          top: `${y.get()}%`,
          transform: 'translate(-50%, -50%)',
          rotateX,
          rotateY
        }}
      />
      <motion.div
        className="absolute w-64 h-64 rounded-full opacity-10"
        style={{
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.2) 0%, transparent 70%)',
          left: `${100 - x.get()}%`,
          top: `${100 - y.get()}%`,
          transform: 'translate(-50%, -50%)',
          rotateX: rotateX.get() * -0.5,
          rotateY: rotateY.get() * -0.5
        }}
      />
    </div>
  )
}