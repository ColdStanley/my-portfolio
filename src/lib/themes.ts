export interface Theme {
  id: string
  name: string
  primary: string
  background: string
  accent: string
  nameGradient: string
  tabActive: string
  tabHover: string
  cardBg: string
  linkColor: string
  commentBg: string
  commentBorder: string
  commentButton: string
  commentButtonHover: string
  commentInputFocus: string
  commentInputRing: string
}

export const themes: Record<string, Theme> = {
  pink: {
    id: 'pink',
    name: 'Sweet Pink',
    primary: 'from-pink-600 to-rose-600',
    background: 'from-pink-50 via-rose-50 to-purple-50',
    accent: 'from-pink-400 to-rose-400',
    nameGradient: 'from-pink-600 via-rose-600 to-purple-600',
    tabActive: 'from-pink-400 to-rose-400',
    tabHover: 'hover:text-pink-600 hover:bg-pink-50/50',
    cardBg: 'bg-white/80',
    linkColor: 'text-pink-500 hover:text-pink-600',
    commentBg: 'bg-pink-50/70',
    commentBorder: 'border-pink-200',
    commentButton: 'bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400',
    commentButtonHover: 'hover:bg-pink-700',
    commentInputFocus: 'focus:border-pink-400',
    commentInputRing: 'focus:ring-pink-200'
  },
  blue: {
    id: 'blue',
    name: 'Ocean Blue',
    primary: 'from-blue-600 to-cyan-600',
    background: 'from-blue-50 via-sky-50 to-cyan-50',
    accent: 'from-blue-400 to-cyan-400',
    nameGradient: 'from-blue-600 via-cyan-600 to-indigo-600',
    tabActive: 'from-blue-400 to-cyan-400',
    tabHover: 'hover:text-blue-600 hover:bg-blue-50/50',
    cardBg: 'bg-white/80',
    linkColor: 'text-blue-500 hover:text-blue-600',
    commentBg: 'bg-blue-50/70',
    commentBorder: 'border-blue-200',
    commentButton: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400',
    commentButtonHover: 'hover:bg-blue-700',
    commentInputFocus: 'focus:border-blue-400',
    commentInputRing: 'focus:ring-blue-200'
  },
  purple: {
    id: 'purple',
    name: 'Royal Purple',
    primary: 'from-purple-600 to-violet-600',
    background: 'from-purple-50 via-violet-50 to-indigo-50',
    accent: 'from-purple-400 to-violet-400',
    nameGradient: 'from-purple-600 via-violet-600 to-indigo-600',
    tabActive: 'from-purple-400 to-violet-400',
    tabHover: 'hover:text-purple-600 hover:bg-purple-50/50',
    cardBg: 'bg-white/80',
    linkColor: 'text-purple-500 hover:text-purple-600',
    commentBg: 'bg-purple-50/70',
    commentBorder: 'border-purple-200',
    commentButton: 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400',
    commentButtonHover: 'hover:bg-purple-700',
    commentInputFocus: 'focus:border-purple-400',
    commentInputRing: 'focus:ring-purple-200'
  },
  green: {
    id: 'green',
    name: 'Forest Green',
    primary: 'from-emerald-500 to-teal-500',
    background: 'from-emerald-50 via-teal-50 to-cyan-50',
    accent: 'from-emerald-300 to-teal-300',
    nameGradient: 'from-emerald-500 via-teal-500 to-cyan-500',
    tabActive: 'from-emerald-300 to-teal-300',
    tabHover: 'hover:text-emerald-500 hover:bg-emerald-50/50',
    cardBg: 'bg-white/80',
    linkColor: 'text-emerald-400 hover:text-emerald-500',
    commentBg: 'bg-emerald-50/70',
    commentBorder: 'border-emerald-200',
    commentButton: 'bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400',
    commentButtonHover: 'hover:bg-emerald-700',
    commentInputFocus: 'focus:border-emerald-400',
    commentInputRing: 'focus:ring-emerald-200'
  },
  orange: {
    id: 'orange',
    name: 'Sunset Orange',
    primary: 'from-orange-400 to-amber-400',
    background: 'from-orange-50 via-amber-50 to-rose-50',
    accent: 'from-orange-300 to-amber-300',
    nameGradient: 'from-orange-400 via-amber-400 to-rose-400',
    tabActive: 'from-orange-300 to-amber-300',
    tabHover: 'hover:text-orange-400 hover:bg-orange-50/50',
    cardBg: 'bg-white/80',
    linkColor: 'text-orange-400 hover:text-orange-500',
    commentBg: 'bg-orange-50/70',
    commentBorder: 'border-orange-200',
    commentButton: 'bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400',
    commentButtonHover: 'hover:bg-orange-700',
    commentInputFocus: 'focus:border-orange-400',
    commentInputRing: 'focus:ring-orange-200'
  },
  dark: {
    id: 'dark',
    name: 'Midnight',
    primary: 'from-slate-600 to-gray-600',
    background: 'from-slate-100 via-gray-100 to-zinc-100',
    accent: 'from-slate-400 to-gray-400',
    nameGradient: 'from-slate-600 via-gray-600 to-zinc-600',
    tabActive: 'from-slate-400 to-gray-400',
    tabHover: 'hover:text-slate-600 hover:bg-slate-50/50',
    cardBg: 'bg-white/80',
    linkColor: 'text-slate-500 hover:text-slate-600',
    commentBg: 'bg-slate-50/70',
    commentBorder: 'border-slate-200',
    commentButton: 'bg-slate-600 hover:bg-slate-700 disabled:bg-slate-400',
    commentButtonHover: 'hover:bg-slate-700',
    commentInputFocus: 'focus:border-slate-400',
    commentInputRing: 'focus:ring-slate-200'
  }
}

export const getThemeClasses = (themeId: string, property: keyof Theme): string => {
  return themes[themeId]?.[property] || themes.pink[property]
}
