import { useEffect, useRef } from 'react'

interface TrailDot {
  x: number; y: number; life: number; maxLife: number; size: number; color: string
}

const TRAIL_COLORS = ['#22D3EE', '#33f3ff', '#a855f7', '#818cf8', '#22D3EE']

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const trailRef = useRef<TrailDot[]>([])
  const mouseRef = useRef({ x: -200, y: -200, tx: -200, ty: -200 })
  const rafRef = useRef(0)
  const colorIdxRef = useRef(0)

  useEffect(() => {
    // Create canvas for trail
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9997;'
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    document.body.appendChild(canvas)
    canvasRef.current = canvas
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', resize)

    const el = glowRef.current
    let x = window.innerWidth / 2
    let y = window.innerHeight / 2

    const onMove = (e: MouseEvent) => {
      mouseRef.current.tx = e.clientX
      mouseRef.current.ty = e.clientY

      // Spawn trail dot every move
      colorIdxRef.current = (colorIdxRef.current + 1) % TRAIL_COLORS.length
      trailRef.current.push({
        x: e.clientX, y: e.clientY,
        life: 1, maxLife: 1,
        size: 3 + Math.random() * 3,
        color: TRAIL_COLORS[colorIdxRef.current],
      })
      if (trailRef.current.length > 30) trailRef.current.shift()
    }

    const tick = () => {
      // Smooth glow follow
      x += (mouseRef.current.tx - x) * 0.14
      y += (mouseRef.current.ty - y) * 0.14
      if (el) el.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`

      // Draw trail
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      trailRef.current = trailRef.current.filter(d => d.life > 0.01)
      trailRef.current.forEach(d => {
        d.life -= 0.06
        const a = Math.max(0, d.life)
        const r = d.size * a
        const grad = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, r * 3)
        grad.addColorStop(0, d.color + Math.floor(a * 200).toString(16).padStart(2, '0'))
        grad.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(d.x, d.y, r * 3, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

        // Core dot
        ctx.beginPath()
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2)
        ctx.fillStyle = d.color
        ctx.globalAlpha = a * 0.9
        ctx.fill()
        ctx.globalAlpha = 1
      })

      rafRef.current = requestAnimationFrame(tick)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('resize', resize)
      canvas.remove()
    }
  }, [])

  return (
    <div
      ref={glowRef}
      className="cursor-glow"
      aria-hidden="true"
      style={{ zIndex: 9996 }}
    />
  )
}
