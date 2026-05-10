import { useEffect, useRef } from 'react'

interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number; opacity: number
  color: string
  baseX: number; baseY: number
}

// Pure cyan/white — matches site theme exactly
const COLORS = ['#00F0FF', '#00d4e0', '#80f8ff', '#ffffff', '#b0f0ff']
const COUNT = 40

export function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const rafRef = useRef(0)
  const sizeRef = useRef({ w: 0, h: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const w = document.documentElement.clientWidth
      const h = document.documentElement.clientHeight
      sizeRef.current = { w, h }
      canvas.width = w
      canvas.height = h
      particlesRef.current.forEach(p => {
        p.x = Math.min(p.x, w)
        p.y = Math.min(p.y, h)
        p.baseX = Math.min(p.baseX, w)
        p.baseY = Math.min(p.baseY, h)
      })
    }
    resize()
    window.addEventListener('resize', resize)

    particlesRef.current = Array.from({ length: COUNT }, () => {
      const x = Math.random() * sizeRef.current.w
      const y = Math.random() * sizeRef.current.h
      return {
        x, y, baseX: x, baseY: y,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: 1 + Math.random() * 2,
        opacity: 0.08 + Math.random() * 0.25,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      }
    })

    const draw = () => {
      const { w, h } = sizeRef.current
      ctx.clearRect(0, 0, w, h)

      particlesRef.current.forEach(p => {
        p.vx += (p.baseX - p.x) * 0.002
        p.vy += (p.baseY - p.y) * 0.002
        p.vx *= 0.94
        p.vy *= 0.94
        p.x += p.vx
        p.y += p.vy

        // Soft glow — no connection lines
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6)
        grad.addColorStop(0, p.color + '40')
        grad.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.globalAlpha = p.opacity * 0.4
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.fill()
        ctx.globalAlpha = 1
      })

      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.6,
        maxWidth: '100vw',
      }}
      aria-hidden="true"
    />
  )
}
