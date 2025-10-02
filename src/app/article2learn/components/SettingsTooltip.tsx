'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { toast } from 'sonner'
import { theme } from '@/styles/theme.config'
import { ANIMATIONS } from '../utils/animations'
import { useArticleStore } from '../store/useArticleStore'

interface SettingsTooltipProps {
  show: boolean
  onClose: () => void
  buttonRef: HTMLButtonElement | null
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export default function SettingsTooltip({
  show,
  onClose,
  buttonRef,
  onMouseEnter,
  onMouseLeave,
}: SettingsTooltipProps) {
  const { setShowArticleHistoryModal } = useArticleStore()

  const menuItems = [
    {
      icon: '📚',
      label: 'Article History',
      onClick: () => {
        setShowArticleHistoryModal(true)
        onClose()
      },
    },
    {
      icon: '🔔',
      label: 'Notifications',
      onClick: () => {
        toast.info('Coming Soon')
        onClose()
      },
    },
    {
      icon: '🎨',
      label: 'Preferences',
      onClick: () => {
        toast.info('Coming Soon')
        onClose()
      },
    },
  ]

  if (!buttonRef || typeof window === 'undefined') return null

  const rect = buttonRef.getBoundingClientRect()
  const tooltipStyle = {
    position: 'fixed' as const,
    top: `${rect.bottom + 8}px`,
    right: `${window.innerWidth - rect.right}px`,
  }

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          key="settings-tooltip"
        {...ANIMATIONS.fadeIn}
        className="z-50 min-w-48 rounded-lg border bg-white shadow-lg"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          ...tooltipStyle,
          borderColor: theme.neutralDark,
        }}
      >
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-all duration-200 first:rounded-t-lg last:rounded-b-lg hover:brightness-105"
            style={{
              backgroundColor: 'transparent',
              color: theme.textPrimary,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.accent
              e.currentTarget.style.fontWeight = '500'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.fontWeight = '400'
            }}
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
