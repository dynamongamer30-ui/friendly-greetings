/**
 * Tiny Web Audio API sound system.
 * No audio files, no external libs. Silent fallback if Web Audio is unavailable.
 */

type W = typeof window & { webkitAudioContext?: typeof AudioContext }

let ctx: AudioContext | null = null
let outputNode: AudioNode | null = null
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
/** Shared warm output chain: lowpass + master gain → destination. Cached. */
function getOutput(ac: AudioContext): AudioNode {
  if (outputNode) return outputNode
  try {
    const lp = ac.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 3200
    lp.Q.value = 0.4
    const master = ac.createGain()
    master.gain.value = 0.85
    lp.connect(master).connect(ac.destination)
    outputNode = lp
    return lp
  } catch {
    outputNode = ac.destination
    return ac.destination
  }
}

const STORAGE_KEY = 'sound_enabled'
const AMBIENT_KEY = 'ambient_enabled'
let isSoundEnabled = true
let isAmbientEnabled = false
try {
  if (typeof localStorage !== 'undefined') {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v !== null) isSoundEnabled = v === 'true'
    const a = localStorage.getItem(AMBIENT_KEY)
    if (a !== null) isAmbientEnabled = a === 'true'
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

export function getAmbientEnabled(): boolean {
  return isAmbientEnabled
}

/** Schedule a single tone */
function tone(
  freq: number,
  durationMs: number,
  gainValue: number,
  startOffsetMs = 0,
  endFreq?: number,
  type: OscillatorType = 'sine'
) {
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
    osc.connect(gain).connect(getOutput(ac))
    osc.start(start)
    osc.stop(end + 0.02)
  } catch {
    /* silent */
  }
}

/** Play short noise burst via filtered buffer (for whoosh / swoosh) */
function noise(durationMs: number, gainValue: number, lowpass = 1200) {
  const ac = getCtx()
  if (!ac) return
  try {
    if (ac.state === 'suspended') ac.resume().catch(() => {})
    const buf = ac.createBuffer(1, ac.sampleRate * (durationMs / 1000), ac.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length)
    const src = ac.createBufferSource()
    src.buffer = buf
    const filter = ac.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = lowpass
    const gain = ac.createGain()
    gain.gain.value = gainValue
    src.connect(filter).connect(gain).connect(getOutput(ac))
    src.start()
  } catch {
    /* silent */
  }
}

export function playClick(): void {
  if (!isSoundEnabled) return
  tone(520, 14, 0.09, 0, 420, 'sine')
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

export function playHover(): void {
  if (!isSoundEnabled) return
  tone(880, 30, 0.04, 0, 920)
}

export function playAchievement(): void {
  if (!isSoundEnabled) return
  tone(784, 100, 0.10, 0)
  tone(988, 100, 0.10, 100)
  tone(1175, 100, 0.10, 200)
  tone(1568, 180, 0.12, 300)
}

export function playStarBurst(): void {
  if (!isSoundEnabled) return
  tone(659, 60, 0.10, 0)
  tone(784, 60, 0.10, 60)
  tone(1047, 120, 0.12, 120, 1200)
}

/** Soft whoosh on route navigation */
export function playWhoosh(): void {
  if (!isSoundEnabled) return
  noise(220, 0.06, 1400)
  tone(420, 140, 0.05, 0, 220, 'sine')
}

/** Tick on category pill switch */
export function playTick(): void {
  if (!isSoundEnabled) return
  tone(1200, 14, 0.07, 0, 900, 'square')
}

/** Throttled keystroke tick */
let _lastKey = 0
export function playKeystroke(): void {
  if (!isSoundEnabled) return
  const now = performance.now()
  if (now - _lastKey < 80) return
  _lastKey = now
  tone(2000, 6, 0.04, 0, 1500, 'square')
}

/** 4-tone descending fanfare for download success */
export function playDownloadFanfare(): void {
  if (!isSoundEnabled) return
  tone(1568, 110, 0.11, 0)
  tone(1318, 110, 0.11, 110)
  tone(1047, 110, 0.11, 220)
  tone(784, 200, 0.13, 330)
}

/** Soft swoosh for banner dismiss */
export function playSwoosh(): void {
  if (!isSoundEnabled) return
  noise(180, 0.05, 800)
}

/* ── Ambient drone ───────────────────────────────────────── */
let ambientNodes: { osc1: OscillatorNode; osc2: OscillatorNode; gain: GainNode } | null = null

function startAmbient() {
  const ac = getCtx()
  if (!ac || ambientNodes) return
  try {
    if (ac.state === 'suspended') ac.resume().catch(() => {})
    const gain = ac.createGain()
    gain.gain.value = 0
    gain.gain.linearRampToValueAtTime(0.025, ac.currentTime + 1.2)
    const osc1 = ac.createOscillator()
    osc1.type = 'sine'
    osc1.frequency.value = 55
    const osc2 = ac.createOscillator()
    osc2.type = 'sine'
    osc2.frequency.value = 82.5
    const filter = ac.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 600
    osc1.connect(filter)
    osc2.connect(filter)
    filter.connect(gain).connect(ac.destination)
    osc1.start()
    osc2.start()
    ambientNodes = { osc1, osc2, gain }
  } catch {
    /* silent */
  }
}

function stopAmbient() {
  const ac = getCtx()
  if (!ac || !ambientNodes) return
  try {
    const { osc1, osc2, gain } = ambientNodes
    gain.gain.linearRampToValueAtTime(0, ac.currentTime + 0.6)
    setTimeout(() => {
      try { osc1.stop(); osc2.stop() } catch { /* ignore */ }
    }, 700)
    ambientNodes = null
  } catch {
    /* silent */
  }
}

export function toggleAmbient(): boolean {
  isAmbientEnabled = !isAmbientEnabled
  try { localStorage.setItem(AMBIENT_KEY, String(isAmbientEnabled)) } catch { /* ignore */ }
  if (isAmbientEnabled) startAmbient()
  else stopAmbient()
  return isAmbientEnabled
}

/** Auto-resume ambient if previously enabled (call after first user gesture) */
export function tryResumeAmbient() {
  if (isAmbientEnabled && !ambientNodes) startAmbient()
}
