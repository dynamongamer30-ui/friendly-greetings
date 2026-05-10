import { useState, useEffect, useRef } from 'react'
import { Gamepad2, Volume2, VolumeX } from 'lucide-react'
import { getSoundEnabled, toggleSound, playClick } from '@/lib/sound'

interface HeroHeaderProps {
  siteMeta: { siteName?: string; siteTagline?: string; logoUrl?: string } | null
}

export function HeroHeader({ siteMeta }: HeroHeaderProps) {
  const title = siteMeta?.siteName || 'Dynamon Universe'
  const subtitle = siteMeta?.siteTagline || ''
  const logoUrl = siteMeta?.logoUrl || ''
  const [imgError, setImgError] = useState(false)
  const [soundOn, setSoundOn] = useState(() => getSoundEnabled())
  const [typed, setTyped] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)

  const showImage = logoUrl && !imgError

  // Typewriter
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setTyped(title); return }
    setTyped('')
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setTyped(title.slice(0, i))
      if (i >= title.length) window.clearInterval(id)
    }, 60)
    return () => window.clearInterval(id)
  }, [title])

  // Magic particles canvas inside hero only
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    type MP = { x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string; life: number; maxLife: number }
    const COLORS = ['#FFD700', '#FFA500', '#a855f7', '#00F0FF', '#fff8dc']
    const particles: MP[] = []

    const spawn = () => {
      const x = Math.random() * canvas.width
      const y = canvas.height + 4
      particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -(0.4 + Math.random() * 0.8),
        size: 1 + Math.random() * 2.5,
        opacity: 0.5 + Math.random() * 0.5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        life: 0,
        maxLife: 120 + Math.random() * 80,
      })
    }

    let frame = 0
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++
      if (frame % 4 === 0) spawn()

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.life++
        const fade = 1 - p.life / p.maxLife
        ctx.globalAlpha = p.opacity * fade
        // Glow halo
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 5)
        g.addColorStop(0, p.color)
        g.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 5, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
        // Core dot
        ctx.globalAlpha = p.opacity * fade
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
        ctx.globalAlpha = 1
        if (p.life >= p.maxLife) particles.splice(i, 1)
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [])

  return (
    <header className="relative flex flex-col items-center pt-16 pb-0 px-4 text-center overflow-hidden">
      {/* ── Epic fantasy background ── */}
      {/* Deep dark sky base */}
      <div className="absolute inset-0 z-0" style={{
        background: 'linear-gradient(180deg, #03010d 0%, #0a0220 40%, #060118 100%)',
      }} />

      {/* Aurora bands — layered slow-wave gradients */}
      <div className="fantasy-aurora-1 absolute inset-0 z-0 pointer-events-none" />
      <div className="fantasy-aurora-2 absolute inset-0 z-0 pointer-events-none" />
      <div className="fantasy-aurora-3 absolute inset-0 z-0 pointer-events-none" />

      {/* Star field — pure CSS dots */}
      <div className="fantasy-stars absolute inset-0 z-0 pointer-events-none" />
      <div className="fantasy-stars-2 absolute inset-0 z-0 pointer-events-none" />

      {/* God rays — diagonal light beams from top center */}
      <div className="fantasy-rays absolute inset-0 z-0 pointer-events-none" />

      {/* Magic particles canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none w-full h-full"
        aria-hidden="true"
      />

      {/* Mountain silhouette at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-1 pointer-events-none" style={{ height: 80 }}>
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
          <path
            d="M0,80 L0,55 L80,30 L160,50 L260,10 L340,40 L420,20 L500,45 L580,15 L680,38 L760,5 L840,35 L920,18 L1020,42 L1100,22 L1200,48 L1300,28 L1380,50 L1440,35 L1440,80 Z"
            fill="rgba(10,2,30,0.85)"
          />
          <path
            d="M0,80 L0,65 L100,45 L200,60 L300,38 L400,55 L500,42 L600,58 L700,40 L800,62 L900,44 L1000,60 L1100,42 L1200,58 L1300,45 L1440,55 L1440,80 Z"
            fill="rgba(5,1,18,0.95)"
          />
        </svg>
      </div>

      {/* Sound toggle */}
      <button
        type="button"
        onClick={() => { playClick(); setSoundOn(toggleSound()) }}
        className="absolute top-4 right-4 z-20 w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
        style={{ background: 'rgba(10,2,30,0.7)', border: '1px solid rgba(255,215,0,0.2)', color: '#FFD700' }}
        aria-label={soundOn ? 'Mute sounds' : 'Enable sounds'}
      >
        {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>

      {/* Logo */}
      <div className="relative z-10 w-24 h-24 mb-8">
        <div className="logo-aura" />
        <div className="logo-ring" />
        <div className="logo-ring-2" />
        <div className="logo-ring-3" />
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-full overflow-hidden"
          style={{
            backgroundImage: showImage ? `url(${logoUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#000',
            clipPath: 'circle(50%)',
          }}
        >
          {!showImage && <Gamepad2 className="w-10 h-10" style={{ color: '#FFD700' }} />}
          {showImage && (
            <img src={logoUrl} alt="" className="sr-only" onError={() => setImgError(true)} />
          )}
        </div>
      </div>

      {/* Title with golden shimmer */}
      <h1
        className="hero-title-fantasy relative z-10 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        {typed}
        {typed.length < title.length && <span className="typewriter-caret" aria-hidden="true">&nbsp;</span>}
      </h1>

      {subtitle && (
        <p className="relative z-10 text-sm sm:text-base max-w-md leading-relaxed mb-2" style={{ color: 'rgba(255,220,150,0.7)' }}>
          {subtitle}
        </p>
      )}

      {/* Fog/mist divider — bottom fade into main bg */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none" style={{
        height: 60,
        background: 'linear-gradient(to bottom, transparent 0%, #05080A 100%)',
      }} />

      {/* Spacer so content below clears the mountains */}
      <div className="relative z-10" style={{ height: 60 }} />
    </header>
  )
}
