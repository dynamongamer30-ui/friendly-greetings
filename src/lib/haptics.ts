/**
 * Premium haptics layer.
 * Pure navigator.vibrate(); silent on desktop / unsupported / disabled.
 */

const KEY = 'haptics_enabled'
let enabled = true
try {
  if (typeof localStorage !== 'undefined') {
    const v = localStorage.getItem(KEY)
    if (v !== null) enabled = v === 'true'
  }
} catch { /* ignore */ }

let isTouch = false
try {
  isTouch =
    typeof window !== 'undefined' &&
    ('ontouchstart' in window || (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints! > 0)
} catch { /* ignore */ }

let reduced = false
try {
  reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
} catch { /* ignore */ }

function buzz(pattern: number | number[]): void {
  if (!enabled || reduced || !isTouch) return
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(pattern)
    }
  } catch { /* silent */ }
}

export const haptics = {
  light:   () => buzz(8),
  medium:  () => buzz(15),
  heavy:   () => buzz(30),
  tick:    () => buzz(4),
  success: () => buzz([15, 25, 15]),
  error:   () => buzz([40, 50, 40]),
  swipe:   () => buzz([10, 15]),
  unlock:  () => buzz([20, 40, 20, 40, 60]),
}

export function getHapticsEnabled(): boolean {
  return enabled
}

export function toggleHaptics(): boolean {
  enabled = !enabled
  try { localStorage.setItem(KEY, String(enabled)) } catch { /* ignore */ }
  if (enabled) buzz(12) // confirmation tap
  return enabled
}

export function isHapticsSupported(): boolean {
  return isTouch && typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
}
