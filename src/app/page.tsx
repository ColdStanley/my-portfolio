'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useAnimation, useMotionValue, useSpring } from 'framer-motion'
import Link from 'next/link'
import NewNavbar from '@/components/NewNavbar'
import FooterSection from '@/components/FooterSection'
import PageTransition from '@/components/PageTransition'
import GlobalLoader from '@/components/GlobalLoader'

export default function HomePage() {
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
        <HeroSection />
      
      {/* Solutions Section */}
      <div id="solutions">
        <ProjectSection
          title="AI Agent Applications Platform"
          description="Comprehensive AI agent ecosystem for various professional and educational applications. IELTS Speaking Practice is our flagship demonstration of AI-powered learning."
          benefits={[
            "Reduce manual effort with intelligent automation",
            "Get instant expert-level feedback and guidance",
            "Scale personalized learning and professional development",
            "Access advanced AI capabilities without technical complexity"
          ]}
          buttonText="Explore AI Agents"
          href="/ai-agent-gala"
          gradient="from-purple-600 to-indigo-600"
          index={0}
        />
      </div>
      
      {/* JD2CV Section */}
      <ProjectSection
        title="Resume Automation Engine"
        description="Intelligent resume generation that automatically analyzes job requirements and creates perfectly tailored professional documents."
        benefits={[
          "Eliminate hours of manual resume customization",
          "Guarantee perfect job-requirement alignment", 
          "Generate multiple variations instantly",
          "Maintain professional formatting consistency"
        ]}
        buttonText="Automate Resume"
        href="/jd2cv"
        gradient="from-indigo-600 to-purple-600"
        index={1}
        reverse
      />
      
      {/* Readlingua Section */}
      <ProjectSection
        title="42-Language Learning Platform"
        description="Advanced language learning system supporting 42 languages with AI tutoring, pronunciation tools, and adaptive learning paths."
        benefits={[
          "Master any of 42 languages efficiently",
          "Get personalized AI explanations in your native language",
          "Practice pronunciation with real-time feedback", 
          "Track learning progress with detailed analytics"
        ]}
        buttonText="Start Learning"
        href="/readlingua"
        gradient="from-purple-600 to-violet-600"
        index={2}
      />
      
      {/* More Projects Section */}
      <MoreProjectsSection />
      
      {/* About Section (Footer) */}
      <div id="about">
        <FooterSection />
      </div>
    </main>
      </PageTransition>
    </>
  )
}

function HeroSection() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-16 relative">
      <motion.div 
        className="max-w-4xl mx-auto text-center"
        style={{ y: scrollY * 0.3 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Smart Solutions for{' '}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Every Part of Life
            </span>
          </h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed"
          >
            Life Management, Career Growth, and Learning - Powered by AI, All in One Place
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="flex flex-wrap justify-center gap-4"
          >
            <ScrollToSection targetId="solutions" className="w-40 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105">
              Explore Solutions
            </ScrollToSection>
            <Link href="/original" className="w-40 px-6 py-3 bg-white/70 backdrop-blur-sm hover:bg-white/90 text-purple-600 rounded-lg font-medium border border-purple-200 transition-all duration-300 hover:shadow-lg hover:scale-105 text-center">
              View Portfolio
            </Link>
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
}

function ProjectSection({ title, description, benefits, buttonText, href, gradient, index, reverse = false }: ProjectSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const controls = useAnimation()
  
  // 3D Tilt Effect
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

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
                className="absolute -top-6 -right-6 w-12 h-12 bg-purple-400/20 rounded-full backdrop-blur-sm"
              />
              
              <motion.div
                animate={{
                  y: [0, 10, 0],
                  rotate: [0, -1, 0]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
                className="absolute -bottom-4 -left-4 w-8 h-8 bg-indigo-400/20 rounded-full backdrop-blur-sm"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

function MoreProjectsSection() {
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

  const projects = [
    {
      title: "C'est La Vie",
      subtitle: "Life Management System",
      description: "Complete life organization with Strategy, Plan, and Task management integrated with Notion for seamless productivity.",
      tech: "Notion API • Task Automation • Strategy Planning",
      href: "/cestlavie"
    },
    {
      title: "Feelink",
      subtitle: "Social Emotion Platform",
      description: "Express emotions through AI-generated photos. Connect socially with meaningful visual communication that speaks louder than words.",
      tech: "Photo AI • Emotion Recognition • Social Features",
      href: "/feelink"
    },
    {
      title: "New IELTS Speaking",
      subtitle: "Advanced Speaking Training",
      description: "Professional IELTS speaking preparation with AI-powered feedback, personalized learning paths, and comprehensive practice modules.",
      tech: "Voice AI • Learning Analytics • Personalized Training",
      href: "/new-ielts-speaking"
    }
  ]

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
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            More Projects
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Exploring different domains with specialized solutions for productivity, communication, and learning
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={controls}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {projects.map((project, index) => {
            const [cardMousePos, setCardMousePos] = useState({ x: 0, y: 0 })
            const [isCardHovering, setIsCardHovering] = useState(false)

            const handleCardMouseMove = (e: React.MouseEvent) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = (e.clientX - rect.left) / rect.width
              const y = (e.clientY - rect.top) / rect.height
              setCardMousePos({ x, y })
            }

            return (
              <motion.div
                key={project.title}
                variants={itemVariants}
                animate={{
                  rotateX: isCardHovering ? (cardMousePos.y - 0.5) * 8 : 0,
                  rotateY: isCardHovering ? (cardMousePos.x - 0.5) * 8 : 0,
                  y: isCardHovering ? -5 : 0,
                  scale: isCardHovering ? 1.02 : 1
                }}
                transition={{ duration: 0.3 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Link href={project.href}>
                  <div 
                    className="bg-white/90 backdrop-blur-md rounded-xl shadow-xl border border-white/20 p-6 h-full hover:shadow-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
                    onMouseMove={handleCardMouseMove}
                    onMouseEnter={() => setIsCardHovering(true)}
                    onMouseLeave={() => setIsCardHovering(false)}
                  >
                    {/* Subtle Code Background */}
                    <div className="absolute inset-0 opacity-5">
                      <motion.div
                        animate={{ y: ['0%', '50%'] }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        className="text-xs font-mono text-purple-600 whitespace-pre-line leading-6"
                      >
                        {index === 0 ? `// Life Management\nconst plan = strategy.execute();\nconst tasks = plan.breakdown();\nnotion.sync(tasks);` :
                         index === 1 ? `// Social Connection\nconst emotion = ai.analyze(photo);\nconst response = generate(emotion);\nshare(response);` :
                         `// Learning Assistant\nconst progress = track(user.study);\nconst feedback = ai.evaluate(speech);\noptimize(learning.path);`}
                      </motion.div>
                    </div>

                    {/* Content with z-index */}
                    <div className="relative z-10">
                      {/* Title Only */}
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-200">
                          {project.title}
                        </h3>
                        <p className="text-sm text-gray-500">{project.subtitle}</p>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 leading-relaxed mb-4">
                        {project.description}
                      </p>

                      {/* Tech Stack */}
                      <div className="mt-auto">
                        <p className="text-xs text-gray-500 mb-3">
                          {project.tech}
                        </p>
                        
                        {/* CTA */}
                        <div className="flex items-center text-purple-600 group-hover:text-purple-700 transition-colors duration-200">
                          <span className="text-sm font-medium">Explore Project</span>
                          <motion.span
                            className="ml-2 text-lg"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            →
                          </motion.span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// Background Grid Effect
function GridBackground() {
  return (
    <div className="fixed inset-0 opacity-30 pointer-events-none">
      <motion.div
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%']
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear'
        }}
        className="w-full h-full"
        style={{
          backgroundImage: `
            linear-gradient(rgba(139, 92, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 92, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      />
    </div>
  )
}

// Workflow Network Effect
function WorkflowNetwork() {
  const nodes = [
    { id: 'life', x: 15, y: 20, name: 'Life Assistant' },
    { id: 'career', x: 85, y: 25, name: 'Career Tools' },
    { id: 'learning', x: 20, y: 75, name: 'Learning Hub' },
    { id: 'ai', x: 80, y: 70, name: 'AI Lab' }
  ]

  return (
    <div className="fixed inset-0 pointer-events-none opacity-40">
      {/* Connection Lines */}
      <svg className="w-full h-full absolute inset-0">
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="rgb(99, 102, 241)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="rgb(139, 92, 246)" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        
        {/* Connecting paths */}
        <motion.path
          d={`M ${nodes[0].x}% ${nodes[0].y}% Q 50% 30% ${nodes[1].x}% ${nodes[1].y}%`}
          stroke="url(#lineGradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.path
          d={`M ${nodes[0].x}% ${nodes[0].y}% Q 30% 50% ${nodes[2].x}% ${nodes[2].y}%`}
          stroke="url(#lineGradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 0.5, ease: "easeInOut" }}
        />
        <motion.path
          d={`M ${nodes[1].x}% ${nodes[1].y}% Q 70% 50% ${nodes[3].x}% ${nodes[3].y}%`}
          stroke="url(#lineGradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
        />
        <motion.path
          d={`M ${nodes[2].x}% ${nodes[2].y}% Q 50% 80% ${nodes[3].x}% ${nodes[3].y}%`}
          stroke="url(#lineGradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, delay: 1.5, ease: "easeInOut" }}
        />
      </svg>

      {/* Data Flow Particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-purple-400 rounded-full"
          animate={{
            x: ['15%', '85%', '80%', '20%', '15%'],
            y: ['20%', '25%', '70%', '75%', '20%']
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            delay: i * 2,
            ease: 'linear'
          }}
        />
      ))}


      {/* Node Indicators */}
      {nodes.map((node) => (
        <motion.div
          key={node.id}
          className="absolute w-4 h-4 bg-purple-500 rounded-full"
          style={{ 
            left: `${node.x}%`, 
            top: `${node.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: node.id === 'life' ? 0 : node.id === 'career' ? 0.5 : node.id === 'learning' ? 1 : 1.5
          }}
        >
          <div className="absolute inset-0 bg-purple-400 rounded-full animate-ping opacity-30" />
        </motion.div>
      ))}
    </div>
  )
}

// Light Sculpture Effect
function LightSculpture() {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div 
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ 
        perspective: '1000px',
        zIndex: -1
      }}
    >
      {/* Light Ribbons */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: '400px',
            height: '2px',
            background: `linear-gradient(90deg, 
              transparent, 
              rgba(139, 92, 246, ${0.1 + (i * 0.02)}), 
              rgba(99, 102, 241, ${0.15 + (i * 0.02)}), 
              rgba(139, 92, 246, ${0.1 + (i * 0.02)}), 
              transparent
            )`,
            borderRadius: '1px',
            transformStyle: 'preserve-3d'
          }}
          animate={{
            x: ['-50%', '150%'],
            y: ['20%', '80%'],
            rotateX: [0, 360],
            rotateY: [0, 180],
            rotateZ: [0, 360]
          }}
          transition={{
            duration: 20 + (i * 3),
            repeat: Infinity,
            ease: 'linear',
            delay: i * 2
          }}
        />
      ))}

      {/* Flowing Light Streams */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`stream-${i}`}
          className="absolute"
          style={{
            width: '1px',
            height: '300px',
            background: `linear-gradient(180deg, 
              transparent, 
              rgba(139, 92, 246, 0.2), 
              rgba(99, 102, 241, 0.3), 
              rgba(139, 92, 246, 0.2), 
              transparent
            )`,
            transformStyle: 'preserve-3d'
          }}
          animate={{
            x: ['10%', '90%'],
            y: ['0%', '100%'],
            rotateX: mousePosition.y * 45 - 22.5,
            rotateY: mousePosition.x * 45 - 22.5,
            scaleY: [0.5, 1.5, 0.5]
          }}
          transition={{
            x: { duration: 15 + (i * 2), repeat: Infinity, ease: 'easeInOut' },
            y: { duration: 12 + (i * 1.5), repeat: Infinity, ease: 'easeInOut' },
            scaleY: { duration: 8, repeat: Infinity, ease: 'easeInOut' },
            rotateX: { duration: 0.1 },
            rotateY: { duration: 0.1 }
          }}
        />
      ))}

      {/* Floating Light Orbs */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`orb-${i}`}
          className="absolute rounded-full"
          style={{
            width: `${10 + (i * 3)}px`,
            height: `${10 + (i * 3)}px`,
            background: `radial-gradient(circle, 
              rgba(139, 92, 246, ${0.15 - (i * 0.01)}), 
              rgba(99, 102, 241, ${0.1 - (i * 0.005)}), 
              transparent
            )`,
            filter: 'blur(1px)',
            transformStyle: 'preserve-3d'
          }}
          animate={{
            x: ['5%', '95%'],
            y: ['10%', '90%'],
            z: [0, 100, 0],
            rotateX: [0, 360],
            rotateY: [0, 360],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{
            duration: 25 + (i * 2),
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 1.5
          }}
        />
      ))}

      {/* Central Art Piece */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{
          rotateX: [0, 360],
          rotateY: [0, 360],
          scale: [0.8, 1.1, 0.8]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      >
        {/* Rotating Light Ring */}
        <motion.div
          className="w-32 h-32 rounded-full border border-purple-300/20"
          style={{
            background: 'conic-gradient(from 0deg, transparent, rgba(139, 92, 246, 0.1), transparent)',
            transformStyle: 'preserve-3d'
          }}
          animate={{
            rotateZ: [0, 360]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        
        {/* Inner Flowing Elements */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`inner-${i}`}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            style={{
              width: '2px',
              height: '60px',
              background: `linear-gradient(180deg, 
                transparent, 
                rgba(99, 102, 241, 0.3), 
                transparent
              )`,
              transformOrigin: 'center bottom',
              transformStyle: 'preserve-3d'
            }}
            animate={{
              rotateZ: [0, 360],
              scaleY: [0.5, 1, 0.5]
            }}
            transition={{
              rotateZ: { duration: 15, repeat: Infinity, ease: 'linear', delay: i * 2.5 },
              scaleY: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }
            }}
          />
        ))}
      </motion.div>

      {/* Ambient Glow */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, 
            rgba(139, 92, 246, 0.05) 0%, 
            transparent 70%
          )`
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  )
}

function ScrollToSection({ targetId, children, className }: { targetId: string; children: React.ReactNode; className: string }) {
  const scrollToSection = () => {
    const element = document.getElementById(targetId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <button onClick={scrollToSection} className={className}>
      {children}
    </button>
  )
}