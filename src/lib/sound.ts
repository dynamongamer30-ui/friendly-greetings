/**
 * Premium Web Audio sound palette.
 * Warm, layered voices with reverb / detune / shaped envelopes.
 * No assets — fully synthesized. Silent fallback.
 *
 * Public API kept backwards compatible: legacy export names still work.
 */

type W = typeof window & { webkitAudioContext?: typeof AudioContext }

let ctx: AudioContext | null = null
let masterIn: GainNode | null = null     // dry input bus
let convolver: ConvolverNode | null = null
let wetGain: GainNode | null = null
let masterOut: GainNode | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (ctx) return ctx
  try {
    const Ctor = (window as W).AudioContext || (window as W).webkitAudioContext
    if (!Ctor) return null
    ctx = new Ctor()
    return ctx
  } catch { return null }
}

/** Build a 1.2 s exponential-decay impulse response in memory. */
function makeImpulse(ac: AudioContext, durationSec = 1.2, decay = 3.2): AudioBuffer {
  const rate = ac.sampleRate
  const len = Math.max(1, Math.floor(rate * durationSec))
  const buf = ac.createBuffer(2, len, rate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
    }
  }
  return buf
}

function getGraph(ac: AudioContext): GainNode {
  if (masterIn) return masterIn
  try {
    // Master bus: input → low-shelf warmth → high-shelf de-edge → masterOut → destination
    const inp = ac.createGain()
    inp.gain.value = 1

    const lowShelf = ac.createBiquadFilter()
    lowShelf.type = 'lowshelf'
    lowShelf.frequency.value = 200
    lowShelf.gain.value = 2

    const highShelf = ac.createBiquadFilter()
    highShelf.type = 'highshelf'
    highShelf.frequency.value = 7000
    highShelf.gain.value = -3

    const out = ac.createGain()
    out.gain.value = 0.6

    // Reverb send (parallel)
    const conv = ac.createConvolver()
    conv.buffer = makeImpulse(ac, 1.2, 3.4)
    const wet = ac.createGain()
    wet.gain.value = 0.18

    inp.connect(lowShelf).connect(highShelf).connect(out).connect(ac.destination)
    inp.connect(conv).connect(wet).connect(out)

    masterIn = inp
    masterOut = out
    convolver = conv
    wetGain = wet
    return inp
  } catch {
    masterIn = ac.createGain()
    masterIn.connect(ac.destination)
    return masterIn
  }
}

/* ── Settings ───────────────────────────────────────── */
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
} catch { /* ignore */ }

export function getSoundEnabled(): boolean { return isSoundEnabled }
export function toggleSound(): boolean {
  isSoundEnabled = !isSoundEnabled
  try { localStorage.setItem(STORAGE_KEY, String(isSoundEnabled)) } catch { /* ignore */ }
  return isSoundEnabled
}
export function getAmbientEnabled(): boolean { return isAmbientEnabled }

/* ── Throttle ───────────────────────────────────────── */
const lastPlayedAt = new Map<string, number>()
function shouldPlay(token: string, minGapMs = 30): boolean {
  if (!isSoundEnabled) return false
  if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return false
  const now = performance.now()
  const last = lastPlayedAt.get(token) || 0
  if (now - last < minGapMs) return false
  lastPlayedAt.set(token, now)
  return true
}

/* ── Voice helper ───────────────────────────────────── */
interface VoiceOpts {
  freq: number
  type?: OscillatorType
  durationMs: number
  attackMs?: number
  releaseMs?: number
  gain?: number
  detuneCents?: number   // ± cents → 2 detuned oscillators
  endFreq?: number
  startOffsetMs?: number
  pan?: number           // -1..1
}

function voice(opts: VoiceOpts) {
  const ac = getCtx()
  if (!ac) return
  try {
    if (ac.state === 'suspended') ac.resume().catch(() => {})
    const dst = getGraph(ac)
    const start = ac.currentTime + (opts.startOffsetMs || 0) / 1000
    const dur = opts.durationMs / 1000
    const attack = Math.max(0.002, (opts.attackMs ?? 6) / 1000)
    const release = Math.max(0.01, (opts.releaseMs ?? Math.min(opts.durationMs, 220)) / 1000)
    const peak = opts.gain ?? 0.12

    const g = ac.createGain()
    g.gain.setValueAtTime(0.0001, start)
    g.gain.exponentialRampToValueAtTime(peak, start + attack)
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur + release)

    const pan = ac.createStereoPanner ? ac.createStereoPanner() : null
    if (pan && opts.pan != null) pan.pan.value = Math.max(-1, Math.min(1, opts.pan))

    const detune = opts.detuneCents ?? 0
    const oscs: OscillatorNode[] = []
    const make = (cents: number) => {
      const o = ac.createOscillator()
      o.type = opts.type || 'sine'
      o.frequency.setValueAtTime(opts.freq, start)
      if (opts.endFreq != null) o.frequency.exponentialRampToValueAtTime(Math.max(40, opts.endFreq), start + dur)
      o.detune.value = cents
      o.connect(g)
      oscs.push(o)
    }
    make(0)
    if (detune > 0) { make(+detune); make(-detune) }

    if (pan) g.connect(pan).connect(dst)
    else g.connect(dst)

    const stopAt = start + dur + release + 0.05
    oscs.forEach(o => { o.start(start); o.stop(stopAt) })
  } catch { /* silent */ }
}

/* ── Filtered noise burst ───────────────────────────── */
function burst(opts: {
  durationMs: number
  gain?: number
  type?: 'lowpass' | 'highpass' | 'bandpass'
  startFreq?: number
  endFreq?: number
  startOffsetMs?: number
  pan?: number
}) {
  const ac = getCtx()
  if (!ac) return
  try {
    if (ac.state === 'suspended') ac.resume().catch(() => {})
    const dst = getGraph(ac)
    const start = ac.currentTime + (opts.startOffsetMs || 0) / 1000
    const dur = opts.durationMs / 1000
    const len = Math.max(1, Math.floor(ac.sampleRate * dur))
    const buf = ac.createBuffer(1, len, ac.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len)
    const src = ac.createBufferSource()
    src.buffer = buf

    const filter = ac.createBiquadFilter()
    filter.type = opts.type || 'lowpass'
    filter.Q.value = 0.8
    filter.frequency.setValueAtTime(opts.startFreq ?? 1500, start)
    if (opts.endFreq != null) filter.frequency.exponentialRampToValueAtTime(Math.max(60, opts.endFreq), start + dur)

    const g = ac.createGain()
    const peak = opts.gain ?? 0.06
    g.gain.setValueAtTime(0.0001, start)
    g.gain.exponentialRampToValueAtTime(peak, start + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, start + dur)

    const pan = ac.createStereoPanner ? ac.createStereoPanner() : null
    if (pan && opts.pan != null) pan.pan.value = Math.max(-1, Math.min(1, opts.pan))

    src.connect(filter).connect(g)
    if (pan) g.connect(pan).connect(dst)
    else g.connect(dst)
    src.start(start)
    src.stop(start + dur + 0.05)
  } catch { /* silent */ }
}

/* ──────────────────────────────────────────────────────
   Sound vocabulary (sfx.*)
   ────────────────────────────────────────────────────── */
function tap() {
  if (!shouldPlay('tap', 35)) return
  voice({ freq: 320, type: 'triangle', durationMs: 35, attackMs: 2, releaseMs: 70, gain: 0.07 })
  voice({ freq: 80,  type: 'sine',     durationMs: 50, attackMs: 2, releaseMs: 80, gain: 0.05 })
}
function tapHigh() {
  if (!shouldPlay('tapHigh', 35)) return
  voice({ freq: 660, type: 'triangle', durationMs: 40, attackMs: 2, releaseMs: 80, gain: 0.08, detuneCents: 6 })
  voice({ freq: 220, type: 'sine',     durationMs: 60, attackMs: 2, releaseMs: 120, gain: 0.05 })
}
function lift() {
  if (!shouldPlay('lift', 60)) return
  voice({ freq: 440, type: 'sine',     durationMs: 90, attackMs: 12, releaseMs: 160, gain: 0.06, detuneCents: 8 })
  voice({ freq: 660, type: 'triangle', durationMs: 90, attackMs: 12, releaseMs: 160, gain: 0.04, startOffsetMs: 8 })
}
function tickHigh() {
  if (!shouldPlay('tickHigh', 25)) return
  burst({ durationMs: 22, gain: 0.05, type: 'highpass', startFreq: 4500, endFreq: 6000 })
  voice({ freq: 1800, type: 'sine', durationMs: 18, attackMs: 1, releaseMs: 40, gain: 0.03 })
}
function tickLow() {
  if (!shouldPlay('tickLow', 25)) return
  burst({ durationMs: 22, gain: 0.05, type: 'highpass', startFreq: 2200, endFreq: 3000 })
  voice({ freq: 900, type: 'sine', durationMs: 16, attackMs: 1, releaseMs: 30, gain: 0.025 })
}
function swipeOpen() {
  if (!shouldPlay('swipeOpen', 80)) return
  burst({ durationMs: 220, gain: 0.05, type: 'bandpass', startFreq: 400, endFreq: 4500, pan: 0.4 })
  voice({ freq: 659, type: 'sine', durationMs: 160, attackMs: 4, releaseMs: 260, gain: 0.07, startOffsetMs: 50, pan: 0.4 })
  voice({ freq: 988, type: 'sine', durationMs: 180, attackMs: 4, releaseMs: 280, gain: 0.05, startOffsetMs: 70, pan: 0.5 })
}
function flip() {
  if (!shouldPlay('flip', 80)) return
  burst({ durationMs: 120, gain: 0.05, type: 'bandpass', startFreq: 2200, endFreq: 600, pan: -0.3 })
  voice({ freq: 220, type: 'triangle', durationMs: 120, attackMs: 2, releaseMs: 180, gain: 0.06, pan: -0.3 })
}
function cancel() {
  if (!shouldPlay('cancel', 60)) return
  voice({ freq: 520, type: 'sine', durationMs: 70,  attackMs: 2, releaseMs: 120, gain: 0.06 })
  voice({ freq: 440, type: 'sine', durationMs: 90,  attackMs: 2, releaseMs: 140, gain: 0.06, startOffsetMs: 60 })
}
function success() {
  if (!shouldPlay('success', 100)) return
  // Warm bell triad C-E-G with reverb tail
  voice({ freq: 523, type: 'sine', durationMs: 220, attackMs: 4, releaseMs: 380, gain: 0.08, detuneCents: 5 })
  voice({ freq: 659, type: 'sine', durationMs: 240, attackMs: 4, releaseMs: 420, gain: 0.07, detuneCents: 5, startOffsetMs: 40 })
  voice({ freq: 784, type: 'sine', durationMs: 280, attackMs: 4, releaseMs: 480, gain: 0.06, detuneCents: 5, startOffsetMs: 80 })
}
function error() {
  if (!shouldPlay('error', 100)) return
  voice({ freq: 280, type: 'square',   durationMs: 120, attackMs: 2, releaseMs: 200, gain: 0.05, detuneCents: 14 })
  voice({ freq: 220, type: 'triangle', durationMs: 160, attackMs: 2, releaseMs: 240, gain: 0.06, startOffsetMs: 90 })
}
function achievement() {
  if (!shouldPlay('achievement', 200)) return
  const notes = [659, 784, 988, 1318]
  notes.forEach((f, i) => voice({
    freq: f, type: 'sine', durationMs: 200, attackMs: 4, releaseMs: 380,
    gain: 0.08 - i * 0.005, detuneCents: 5, startOffsetMs: i * 110,
  }))
  burst({ durationMs: 260, gain: 0.04, type: 'highpass', startFreq: 5000, endFreq: 9000, startOffsetMs: 360 })
}
function confirm() {
  if (!shouldPlay('confirm', 60)) return
  voice({ freq: 220, type: 'triangle', durationMs: 100, attackMs: 3, releaseMs: 200, gain: 0.07, detuneCents: 6 })
  voice({ freq: 440, type: 'sine',     durationMs: 80,  attackMs: 3, releaseMs: 160, gain: 0.04 })
}
function notify() {
  if (!shouldPlay('notify', 100)) return
  voice({ freq: 880, type: 'sine', durationMs: 120, attackMs: 4, releaseMs: 220, gain: 0.06 })
  voice({ freq: 1175, type: 'sine', durationMs: 160, attackMs: 4, releaseMs: 280, gain: 0.05, startOffsetMs: 80 })
}
function hover() {
  if (!shouldPlay('hover', 120)) return
  voice({ freq: 1320, type: 'sine', durationMs: 14, attackMs: 1, releaseMs: 28, gain: 0.022 })
}
function typewriter() {
  if (!shouldPlay('typewriter', 50)) return
  const j = (Math.random() - 0.5) * 0.2
  burst({ durationMs: 10, gain: 0.025, type: 'highpass', startFreq: 4500 * (1 + j), endFreq: 6500 })
}
function unlockProgress(step = 0) {
  if (!shouldPlay('unlockProgress', 60)) return
  const base = 440 + step * 80
  voice({ freq: base, type: 'sine', durationMs: 90, attackMs: 3, releaseMs: 160, gain: 0.06 })
  voice({ freq: base * 1.5, type: 'sine', durationMs: 70, attackMs: 3, releaseMs: 140, gain: 0.04, startOffsetMs: 30 })
}
function unlockComplete() {
  if (!shouldPlay('unlockComplete', 200)) return
  voice({ freq: 261, type: 'sine', durationMs: 380, attackMs: 6, releaseMs: 600, gain: 0.10, detuneCents: 6 })
  voice({ freq: 392, type: 'sine', durationMs: 380, attackMs: 6, releaseMs: 600, gain: 0.08, detuneCents: 6, startOffsetMs: 80 })
  voice({ freq: 523, type: 'sine', durationMs: 420, attackMs: 6, releaseMs: 700, gain: 0.07, detuneCents: 6, startOffsetMs: 160 })
  voice({ freq: 65,  type: 'sine', durationMs: 280, attackMs: 8, releaseMs: 400, gain: 0.06 })
  burst({ durationMs: 260, gain: 0.05, type: 'highpass', startFreq: 5500, endFreq: 9500, startOffsetMs: 240 })
}

export const sfx = {
  tap, tapHigh, lift, tickHigh, tickLow, swipeOpen, flip, cancel,
  success, error, achievement, confirm, notify, hover, typewriter,
  unlockProgress, unlockComplete,
}

/* ──────────────────────────────────────────────────────
   Backwards-compatible legacy exports
   ────────────────────────────────────────────────────── */
export const playClick           = tap
export const playSuccess         = success
export const playError           = error
export const playHover           = hover
export const playAchievement     = achievement
export const playStarBurst       = success
export const playWhoosh          = lift
export const playTick            = tickLow
export const playKeystroke       = typewriter
export const playDownloadFanfare = unlockComplete
export const playSwoosh          = flip
export const playToggle          = confirm
export const playOpen            = tapHigh
export const playClose           = cancel

/* ── Ambient drone (LFO-modulated lowpass) ──────────── */
let ambientNodes: { osc1: OscillatorNode; osc2: OscillatorNode; osc3: OscillatorNode; gain: GainNode; lfo: OscillatorNode } | null = null

function startAmbient() {
  const ac = getCtx()
  if (!ac || ambientNodes) return
  try {
    if (ac.state === 'suspended') ac.resume().catch(() => {})
    const gain = ac.createGain()
    gain.gain.value = 0
    gain.gain.linearRampToValueAtTime(0.018, ac.currentTime + 1.4)

    const lp = ac.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 350

    const lfo = ac.createOscillator()
    lfo.frequency.value = 0.05
    const lfoGain = ac.createGain()
    lfoGain.gain.value = 150
    lfo.connect(lfoGain).connect(lp.frequency)
    lfo.start()

    const make = (f: number) => {
      const o = ac.createOscillator()
      o.type = 'sine'
      o.frequency.value = f
      o.connect(lp)
      o.start()
      return o
    }
    const osc1 = make(55)
    const osc2 = make(82.5)
    const osc3 = make(110)

    lp.connect(gain).connect(ac.destination)
    ambientNodes = { osc1, osc2, osc3, gain, lfo }
  } catch { /* silent */ }
}

function stopAmbient() {
  const ac = getCtx()
  if (!ac || !ambientNodes) return
  try {
    const { osc1, osc2, osc3, gain, lfo } = ambientNodes
    gain.gain.linearRampToValueAtTime(0, ac.currentTime + 0.6)
    setTimeout(() => {
      try { osc1.stop(); osc2.stop(); osc3.stop(); lfo.stop() } catch { /* ignore */ }
    }, 700)
    ambientNodes = null
  } catch { /* silent */ }
}

export function toggleAmbient(): boolean {
  isAmbientEnabled = !isAmbientEnabled
  try { localStorage.setItem(AMBIENT_KEY, String(isAmbientEnabled)) } catch { /* ignore */ }
  if (isAmbientEnabled) startAmbient()
  else stopAmbient()
  return isAmbientEnabled
}

export function tryResumeAmbient() {
  if (isAmbientEnabled && !ambientNodes) startAmbient()
}

// Touch refs to avoid "unused" warnings if minified incorrectly
void convolver; void wetGain; void masterOut
