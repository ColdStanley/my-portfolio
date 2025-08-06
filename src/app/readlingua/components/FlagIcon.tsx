'use client'

interface FlagIconProps {
  language: string
  size?: number
}

export default function FlagIcon({ language, size = 16 }: FlagIconProps) {
  const flags: Record<string, JSX.Element> = {
    english: (
      <svg width={size} height={size} viewBox="0 0 32 32" className="rounded-sm">
        <rect width="32" height="32" fill="#B22234"/>
        <rect width="32" height="2.46" y="2.46" fill="#FFFFFF"/>
        <rect width="32" height="2.46" y="7.38" fill="#FFFFFF"/>
        <rect width="32" height="2.46" y="12.31" fill="#FFFFFF"/>
        <rect width="32" height="2.46" y="17.23" fill="#FFFFFF"/>
        <rect width="32" height="2.46" y="22.15" fill="#FFFFFF"/>
        <rect width="32" height="2.46" y="27.08" fill="#FFFFFF"/>
        <rect width="12.8" height="17.23" fill="#3C3B6E"/>
      </svg>
    ),
    chinese: (
      <svg width={size} height={size} viewBox="0 0 32 32" className="rounded-sm">
        <rect width="32" height="32" fill="#DE2910"/>
        <polygon points="6.4,4.8 9.6,8 6.4,11.2 3.2,8" fill="#FFDE00"/>
        <polygon points="12.8,3.2 14.4,6.4 12.8,9.6 11.2,6.4" fill="#FFDE00"/>
        <polygon points="12.8,11.2 14.4,14.4 12.8,17.6 11.2,14.4" fill="#FFDE00"/>
        <polygon points="9.6,14.4 11.2,17.6 9.6,20.8 8,17.6" fill="#FFDE00"/>
        <polygon points="6.4,17.6 8,20.8 6.4,24 4.8,20.8" fill="#FFDE00"/>
      </svg>
    ),
    french: (
      <svg width={size} height={size} viewBox="0 0 32 32" className="rounded-sm">
        <rect width="10.67" height="32" fill="#002395"/>
        <rect width="10.67" height="32" x="10.67" fill="#FFFFFF"/>
        <rect width="10.67" height="32" x="21.33" fill="#ED2939"/>
      </svg>
    ),
    japanese: (
      <svg width={size} height={size} viewBox="0 0 32 32" className="rounded-sm">
        <rect width="32" height="32" fill="#FFFFFF"/>
        <circle cx="16" cy="16" r="9.6" fill="#BC002D"/>
      </svg>
    ),
    korean: (
      <svg width={size} height={size} viewBox="0 0 32 32" className="rounded-sm">
        <rect width="32" height="32" fill="#FFFFFF"/>
        <circle cx="16" cy="16" r="5.33" fill="#C60C30"/>
        <circle cx="16" cy="16" r="2.67" fill="#003478"/>
        <rect width="8" height="1.33" x="6.4" y="6.4" fill="#000000" transform="rotate(26.57 10.4 7.07)"/>
        <rect width="8" height="1.33" x="17.6" y="24.27" fill="#000000" transform="rotate(26.57 21.6 24.93)"/>
      </svg>
    ),
    russian: (
      <svg width={size} height={size} viewBox="0 0 32 32" className="rounded-sm">
        <rect width="32" height="10.67" fill="#FFFFFF"/>
        <rect width="32" height="10.67" y="10.67" fill="#0039A6"/>
        <rect width="32" height="10.67" y="21.33" fill="#D52B1E"/>
      </svg>
    ),
    spanish: (
      <svg width={size} height={size} viewBox="0 0 32 32" className="rounded-sm">
        <rect width="32" height="8" fill="#AA151B"/>
        <rect width="32" height="16" y="8" fill="#F1BF00"/>
        <rect width="32" height="8" y="24" fill="#AA151B"/>
      </svg>
    ),
    arabic: (
      <svg width={size} height={size} viewBox="0 0 32 32" className="rounded-sm">
        <rect width="32" height="32" fill="#006C35"/>
        <rect width="32" height="32" fill="#FFFFFF"/>
        <text x="16" y="20" textAnchor="middle" fontSize="12" fill="#006C35">🕌</text>
      </svg>
    )
  }

  return flags[language] || (
    <div 
      className="rounded-sm bg-gray-200 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: size * 0.5 }}>?</span>
    </div>
  )
}