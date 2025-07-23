// Toronto timezone utility functions

/**
 * Get current Toronto time in ISO format with timezone
 * @returns string like "2025-07-23T01:20:30-04:00"
 */
export const getCurrentTorontoTime = (): string => {
  const now = new Date()
  return now.getFullYear() + '-' +
         String(now.getMonth() + 1).padStart(2, '0') + '-' +
         String(now.getDate()).padStart(2, '0') + 'T' +
         String(now.getHours()).padStart(2, '0') + ':' +
         String(now.getMinutes()).padStart(2, '0') + ':' +
         String(now.getSeconds()).padStart(2, '0') + '-04:00'
}

/**
 * Convert datetime-local input to Toronto timezone format
 * @param datetimeLocal string like "2025-07-23T01:20"
 * @returns string like "2025-07-23T01:20:00-04:00"
 */
export const addTorontoTimezone = (datetimeLocal: string): string => {
  if (!datetimeLocal) return ''
  return `${datetimeLocal}:00-04:00`
}

/**
 * Convert Toronto timezone format back to datetime-local display
 * @param torontoTime string like "2025-07-23T01:20:00-04:00"
 * @returns string like "2025-07-23T01:20"
 */
export const toDatetimeLocal = (torontoTime: string): string => {
  if (!torontoTime) return ''
  
  // Remove timezone and seconds for datetime-local input
  const cleanString = torontoTime.replace(/-04:00$/, '').split('.')[0]
  return cleanString.substring(0, 16)
}

/**
 * Extract time part from Toronto timezone format
 * @param torontoTime string like "2025-07-23T01:20:00-04:00" 
 * @returns string like "01:20"
 */
export const extractTimeOnly = (torontoTime: string): string => {
  if (!torontoTime) return ''
  
  // Extract time part: "2025-07-23T01:20:00-04:00" -> "01:20:00" -> "01:20"
  const timePart = torontoTime.split('T')[1]
  if (!timePart) return ''
  
  // Remove timezone and get just HH:MM
  const timeOnly = timePart.replace(/-04:00$/, '')
  return timeOnly.substring(0, 5) // "01:20"
}

/**
 * Extract date part from Toronto timezone format  
 * @param torontoTime string like "2025-07-23T01:20:00-04:00"
 * @returns string like "2025-07-23"
 */
export const extractDateOnly = (torontoTime: string): string => {
  if (!torontoTime) return ''
  return torontoTime.split('T')[0] // "2025-07-23"
}