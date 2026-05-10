/**
 * Tiny Web Audio API sound system.
 * No audio files, no external libs. Silent fallback if Web Audio is unavailable.
 */

type W = typeof window & { webkitAudioContext?: typeof AudioContext }

let ctx: AudioContext | null = null
function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (ctx) return ctx
  try {
    const Ctor = (window as W).AudioContext || (window as W).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
    return ctx
  } catch {
    return null
  }
}

const STORAGE_KEY = 'sound_enabled'
let isSoundEnabled = true
try {
  if (typeof localStorage !== 'undefined') {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v !== null) isSoundEnabled = v === 'true'
  }
} catch {
  /* ignore */
}

export function getSoundEnabled(): boolean {
  return isSoundEnabled
}

export function toggleSound(): boolean {
  isSoundEnabled = !isSoundEnabled
  try { localStorage.setItem(STORAGE_KEY, String(isSoundEnabled)) } catch { /* ignore */ }
  return isSoundEnabled
}

/** Schedule a single sine tone */
function tone(freq: number, durationMs: number, gainValue: number, startOffsetMs = 0, endFreq?: number, type: OscillatorType = 'sine') {
  const ac = getCtx()
  if (!ac) return
  try {
    if (ac.state === 'suspended') ac.resume().catch(() => {})
    const start = ac.currentTime + startOffsetMs / 1000
    const end = start + durationMs / 1000
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, start)
    if (endFreq != null) osc.frequency.linearRampToValueAtTime(endFreq, end)
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(gainValue, start + 0.005)
    gain.gain.linearRampToValueAtTime(0, end)
    osc.connect(gain).connect(ac.destination)
    osc.start(start)
    osc.stop(end + 0.02)
  } catch {
    /* silent */
  }
}

export function playClick(): void {
  if (!isSoundEnabled) return
  tone(440, 8, 0.15)
}

export function playSuccess(): void {
  if (!isSoundEnabled) return
  tone(523, 80, 0.12, 0)
  tone(659, 80, 0.12, 110)
  tone(784, 80, 0.12, 220)
}

export function playError(): void {
  if (!isSoundEnabled) return
  tone(220, 150, 0.18, 0, 180)
}

/** Feature 9: Subtle hover sound for mod cards */
export function playHover(): void {
  if (!isSoundEnabled) return
  tone(880, 30, 0.04, 0, 920)
}

/** Feature 14: Achievement unlock fanfare */
export function playAchievement(): void {
  if (!isSoundEnabled) return
  // Rising arpeggio: G5, B5, D6, G6
  tone(784, 100, 0.10, 0)
  tone(988, 100, 0.10, 100)
  tone(1175, 100, 0.10, 200)
  tone(1568, 180, 0.12, 300)
}

/** Feature 5: Star rating burst */
export function playStarBurst(): void {
  if (!isSoundEnabled) return
  tone(659, 60, 0.10, 0)
  tone(784, 60, 0.10, 60)
  tone(1047, 120, 0.12, 120, 1200)
}
