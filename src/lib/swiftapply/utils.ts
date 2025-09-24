/**
 * Utility functions for SwiftApply
 */

/**
 * Debounce function for text input
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * Validate required fields for PersonalInfo
 */
export function validatePersonalInfo(data: any): string[] {
  const errors: string[] = []

  if (!data.fullName?.trim()) errors.push('Full Name is required')
  if (!data.email?.trim()) errors.push('Email is required')

  return errors
}

/**
 * Parse multi-line string into array
 */
export function parseMultilineToArray(text: string): string[] {
  return text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
}

/**
 * Convert array to multi-line string
 */
export function arrayToMultiline(arr: string[]): string {
  return arr.join('\n')
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return Date.now().toString()
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Clean filename for download
 */
export function cleanFileName(text: string): string {
  return text
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .replace(/\s+/g, '_')
    .trim()
}