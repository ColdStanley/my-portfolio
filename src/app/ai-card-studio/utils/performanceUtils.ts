/**
 * Performance optimization utilities for AI Card Studio
 */

/**
 * Throttle function to limit execution frequency
 * @param func - The function to throttle
 * @param delay - The delay in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => void>(
  func: T, 
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = new Date().getTime();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}