export interface CookiePreferences {
  necessary: boolean
  analytics: boolean
  marketing: boolean
}

export const COOKIE_CONSENT_KEY = 'cookie-consent'

export function getCookieConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null
  
  const stored = localStorage.getItem(COOKIE_CONSENT_KEY)
  return stored ? JSON.parse(stored) : null
}

export function setCookieConsent(preferences: CookiePreferences) {
  if (typeof window === 'undefined') return
  
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
    ...preferences,
    timestamp: Date.now()
  }))
  
  // 触发Google Analytics等
  if (preferences.analytics) {
    enableAnalytics()
  } else {
    disableAnalytics()
  }
}

function enableAnalytics() {
  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      analytics_storage: 'granted'
    })
  }
}

function disableAnalytics() {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('consent', 'update', {
      analytics_storage: 'denied'
    })
  }
}

export function hasConsented(): boolean {
  const consent = getCookieConsent()
  return consent !== null
}