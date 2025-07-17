'use client'

import { motion } from 'framer-motion'

interface IntroSectionProps {
  title: string
  subtitle: string
  description: string
  linkText: string
  href: string
  className?: string
}

export function IntroSection({ 
  title, 
  subtitle, 
  description, 
  linkText, 
  href, 
  className = '' 
}: IntroSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`text-center py-16 px-6 max-w-4xl mx-auto ${className}`}
    >
      <h1 className="text-4xl md:text-5xl font-bold text-purple-700 dark:text-purple-300 mb-6">
        {title}
      </h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-4">
        {subtitle}
      </p>
      <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
        {description}
      </p>
      <motion.a
        href={href}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-block bg-purple-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-purple-700 transition-colors"
      >
        {linkText}
      </motion.a>
    </motion.section>
  )
}

// 预设配置
export const TechnologyIntro = () => (
  <IntroSection
    title="Technology"
    subtitle="Building the future with code"
    description="Exploring cutting-edge technologies, sharing development insights, and creating solutions that matter. From web development to AI applications, discover my journey in the world of technology."
    linkText="Explore Tech Projects"
    href="#projects"
  />
)

export const KnowledgeIntro = () => (
  <IntroSection
    title="Knowledge"
    subtitle="Learning never stops"
    description="Documenting my continuous learning journey across various fields. From technical skills to personal development, sharing knowledge and insights that might help others on their path."
    linkText="Browse Knowledge Base"
    href="#knowledge"
  />
)