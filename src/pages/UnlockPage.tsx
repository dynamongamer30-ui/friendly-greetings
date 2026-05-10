import { useState, useEffect, useRef, useCallback } from 'react'
import { Loader2, CheckCircle2, XCircle, Lock, ShieldCheck, Fingerprint, Timer, Cpu, Unlock } from 'lucide-react'
import confetti from 'canvas-confetti'
import { db } from '@/lib/firebase'
import { Cipher } from '@/lib/cipher'
import { getFingerprint } from '@/lib/fingerprint'
import type { SecureSession } from '@/types/mod'

interface Stage {
  label: string
  icon: React.ReactNode
  status: 'pending' | 'running' | 'done' | 'error'
  error?: string
}

const INITIAL_STAGES: Stage[] = [
  { label: 'Initialize Secure Channel', icon: <Lock className="w-4 h-4" />, status: 'pending' },
  { label: 'Fetch Security Config', icon: <Timer className="w-4 h-4" />, status: 'pending' },
  { label: 'Verify Session Token', icon: <ShieldCheck className="w-4 h-4" />, status: 'pending' },
  { label: 'Check Device Fingerprint', icon: <Fingerprint className="w-4 h-4" />, status: 'pending' },
  { label: 'Validate Timestamp', icon: <Cpu className="w-4 h-4" />, status: 'pending' },
  { label: 'Decrypt Payload', icon: <Unlock className="w-4 h-4" />, status: 'pending' },
]

function isValidUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)
}

function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*'
    const fontSize = 14
    let columns: number
    let drops: number[]
    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
      columns = Math.floor(canvas!.width / fontSize)
      drops = Array(columns).fill(1)
    }
    resize()
    window.addEventListener('resize', resize)
    const interval = setInterval(() => {
      ctx.fillStyle = 'rgba(5, 8, 10, 0.08)'
      ctx.fillRect(0, 0, canvas!.width, canvas!.height)
      ctx.fillStyle = 'rgba(34, 211, 238, 0.35)'
      ctx.font = `${fontSize}px JetBrains Mono, monospace`
      for (let i = 0; i < columns; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(text, i * fontSize, drops[i] * fontSize)
        if (drops[i] * fontSize > canvas!.height && Math.random() > 0.975) drops[i] = 0
        drops[i]++
      }
    }, 45)
    return () => { clearInterval(interval); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />
}

/* ─── Aurora background — pure CSS layers behind the MatrixRain canvas ── */
function AuroraLayers() {
  return (
    <div className="aurora-bg" aria-hidden="true">
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
    </div>
  )
}

/* ─── Circular progress ring ─────────────────────────────────────────── */
function ProgressRing({ value }: { value: number }) {
  const size = 84
  const stroke = 6
  const r = (size - stroke) / 2
  const C = 2 * Math.PI * r
  const offset = C * (1 - Math.max(0, Math.min(100, value)) / 100)
  return (
    <div className="relative w-[84px] h-[84px] mx-auto">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(10,15,30,0.9)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="#22D3EE" strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 500ms ease', filter: 'drop-shadow(0 0 6px rgba(34,211,238,0.6))' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-[#22D3EE]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          {Math.round(value)}%
        </span>
      </div>
    </div>
  )
}

export default function UnlockPage() {
  const [stages, setStages] = useState<Stage[]>(() => INITIAL_STAGES.map((s) => ({ ...s })))
  const [started, setStarted] = useState(false)
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(null)

  const update = useCallback(
    (idx: number, patch: Partial<Stage>) =>
      setStages((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s))),
    []
  )

  const completedCount = stages.filter((s) => s.status === 'done').length
  const progress = (completedCount / stages.length) * 100
  const allDone = completedCount === stages.length

  // Confetti burst when all stages complete
  const confettiFiredRef = useRef(false)
  useEffect(() => {
    if (!allDone || confettiFiredRef.current) return
    confettiFiredRef.current = true
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    confetti({
      particleCount: 120,
      spread: 75,
      origin: { y: 0.5 },
      colors: ['#22D3EE', '#A78BFA'],
      disableForReducedMotion: true,
    })
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: ['#22D3EE', '#A78BFA'],
        disableForReducedMotion: true,
      })
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: ['#22D3EE', '#A78BFA'],
        disableForReducedMotion: true,
      })
    }, 200)
  }, [allDone])

  useEffect(() => {
    if (started) return
    setStarted(true)

    const run = async () => {
      const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

      try {
        // Stage 0: Initialize Secure Channel
        update(0, { status: 'running' })
        await delay(600)
        const raw = localStorage.getItem('dg_token')
        if (!raw) throw { stage: 0, msg: 'No session token found.' }
        const token = Cipher.decrypt(raw)
        if (!token) throw { stage: 0, msg: 'Failed to read session token.' }
        if (!isValidUUID(token)) throw { stage: 0, msg: 'Invalid session token format.' }
        update(0, { status: 'done' })

        // Stage 1: Fetch Security Config
        update(1, { status: 'running' })
        await delay(500)
        const configSnap = await db.ref('/Config/Security').once('value')
        const config = configSnap.val() as { timer?: number; minTimer?: number } | null
        const timerSec = config?.timer ?? 900
        const minTimerSec = config?.minTimer ?? 45
        update(1, { status: 'done' })

        // Stage 2: Verify Session Token
        update(2, { status: 'running' })
        await delay(400)
        const sessionSnap = await db.ref(`/SecureSessions/${token}`).once('value')
        const session = sessionSnap.val() as SecureSession | null
        if (!session) throw { stage: 2, msg: 'Session token not found.' }
        if (session.used === true) throw { stage: 2, msg: 'Token already used.' }
        const urlVersion = new URLSearchParams(window.location.search).get('v') ?? null
        if (urlVersion && session.modVersion !== urlVersion)
          throw { stage: 2, msg: 'Session version mismatch.' }
        update(2, { status: 'done' })

        // Stage 3: Check Device Fingerprint
        update(3, { status: 'running' })
        await delay(500)
        const fp = getFingerprint()
        if (fp !== session.fingerprint)
          throw { stage: 3, msg: 'Device fingerprint mismatch.' }

        update(3, { status: 'done' })

        // Stage 4: Validate Timestamp
        update(4, { status: 'running' })
        await delay(400)
        const serverTimeSnap = await db.ref('/.info/serverTimeOffset').once('value')
        const offset = serverTimeSnap.val() as number ?? 0
        const serverNow = Date.now() + offset
        const elapsed = (serverNow - session.timestamp) / 1000
        if (elapsed > timerSec)
          throw { stage: 4, msg: 'Session expired. Please try again.' }
        if (elapsed < minTimerSec)
          throw { stage: 4, msg: 'Verification too fast. Please complete all steps.' }
        update(4, { status: 'done' })

        // Stage 5: Decrypt Payload
        update(5, { status: 'running' })
        await delay(600)
        const url = Cipher.decrypt(session.megaLink)
        if (!url) throw { stage: 5, msg: 'Decryption failed — invalid payload.' }
        update(5, { status: 'done' })

        // Mark session as used then delete after 5 seconds
        await db.ref(`/SecureSessions/${token}`).update({ used: true })
        localStorage.removeItem('dg_token')

        // Clean up expired sessions older than 24 hours
        try {
          const allSnap = await db.ref('/SecureSessions').once('value')
          const allSessions = allSnap.val() as Record<string, SecureSession> | null
          if (allSessions) {
            const cutoff = Date.now() - 24 * 60 * 60 * 1000
            const deletions = Object.entries(allSessions)
              .filter(([, s]) => s.timestamp < cutoff || s.used === true)
              .map(([key]) => db.ref(`/SecureSessions/${key}`).remove())
            await Promise.all(deletions)
          }
        } catch {
          // cleanup failure is non-critical
        }

        setDecryptedUrl(url)
        await delay(2000)
        window.location.href = url

      } catch (err: unknown) {
        const e = err as { stage?: number; msg?: string }
        const idx = typeof e?.stage === 'number' ? e.stage : stages.length - 1
        update(idx, { status: 'error', error: e?.msg || 'Unknown error.' })
      }
    }

    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen relative flex items-center justify-center">
      <AuroraLayers />
      <MatrixRain />
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="glass-panel p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <ProgressRing value={progress} />
            <h1
              className="text-2xl font-extrabold unlock-title"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Secure Verification
            </h1>
            <p className="text-xs text-[#64748b]">Verifying your download session…</p>
          </div>

          <div className="w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#22D3EE] to-[#A78BFA] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>

          <ul className="space-y-3">
            {stages.map((s, i) => (
              <li key={i} className={`stage-row relative flex items-center gap-3 pl-3 ${s.status === 'done' ? 'stage-done' : ''}`}>
                <span className="stage-fill" aria-hidden="true" />
                <div className="shrink-0">
                  {s.status === 'pending' && (
                    <div className="w-6 h-6 rounded-full bg-[rgba(255,255,255,0.04)] flex items-center justify-center text-[#475569]">
                      {s.icon}
                    </div>
                  )}
                  {s.status === 'running' && <Loader2 className="w-5 h-5 text-[#22D3EE] animate-spin" />}
                  {s.status === 'done' && <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />}
                  {s.status === 'error' && <XCircle className="w-5 h-5 text-[#EF4444]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif" }} className={`text-sm font-medium ${
                    s.status === 'done' ? 'text-[#22C55E]' :
                    s.status === 'error' ? 'text-[#EF4444]' :
                    s.status === 'running' ? 'text-[#22D3EE]' : 'text-[#475569]'
                  }`}>
                    {s.label}
                  </span>
                  {s.error && <p className="text-xs text-[#EF4444] mt-0.5">{s.error}</p>}
                </div>
              </li>
            ))}
          </ul>

          {decryptedUrl && (
            <div className="text-center pt-2 space-y-2 animate-fade-in">
              <p className="text-sm font-semibold text-[#22C55E]">Verification Complete!</p>
              <p className="text-xs text-[#64748b]">Redirecting to download in 2 seconds…</p>
              <a href={decryptedUrl} className="btn-primary btn-ripple inline-flex text-xs">
                Download Now
              </a>
            </div>
          )}

          {stages.some((s) => s.status === 'error') && (
            <div className="text-center pt-2">
              <a href="/" className="btn-ghost text-xs">Return Home</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}