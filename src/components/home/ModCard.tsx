import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Download, TrendingUp, Shield, Clock, Star, Zap, ArrowRight, Eye } from 'lucide-react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import type { Mod } from '@/types/mod'
import { sfx } from '@/lib/sound'
import { haptics } from '@/lib/haptics'
import { triggerAchievement } from '@/components/ui/AchievementToast'

interface ModCardProps { mod: Mod; index: number }

function RollingNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)
  useEffect(() => {
    const target = value
    const start = prevRef.current
    if (start === target) return
    let raf = 0
    const t0 = performance.now()
    const dur = 600
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(start + (target - start) * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
      else prevRef.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{display.toLocaleString()}</>
}

const vtClass = (s: string) =>
  s === 'clean' ? 'bdg bdg-vt-clean' :
  s === 'flagged' ? 'bdg bdg-vt-flagged' :
  'bdg bdg-vt-pending'

const statusClass = (s: string) =>
  s === 'active' || s === 'working' ? 'bdg bdg-ok' :
  s === 'testing' ? 'bdg bdg-testing' :
  'bdg bdg-broken'

function SkeletonCard() {
  return (
    <div className="glass-panel overflow-hidden">
      <div className="h-44 shimmer" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-3/4 shimmer rounded" />
        <div className="h-3 w-full shimmer rounded" />
        <div className="h-3 w-2/3 shimmer rounded" />
        <div className="flex gap-2 pt-2">
          <div className="h-5 w-16 shimmer rounded-full" />
          <div className="h-5 w-16 shimmer rounded-full" />
        </div>
      </div>
    </div>
  )
}

const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints! > 0)

export function ModCard({ mod, index: _index }: ModCardProps) {
  const navigate = useNavigate()
  const [flipped, setFlipped] = useState(false)
  const [glowing, setGlowing] = useState(false)
  const [isTouch, setIsTouch] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const foilRef = useRef<HTMLDivElement>(null)
  const hasHoveredRef = useRef(false)
  const tags = mod.tags ? mod.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  const ratingAvg = mod.ratingCount ? (mod.ratingSum || 0) / mod.ratingCount : 0

  // Swipe motion values (mobile only)
  const x = useMotionValue(0)
  const rot = useTransform(x, [-220, 0, 220], [-12, 0, 12])
  const cyanGlow = useTransform(x, [0, 100], [0, 1])
  const violetGlow = useTransform(x, [-100, 0], [1, 0])
  const rightHintOp = useTransform(x, [20, 90], [0, 1])
  const leftHintOp = useTransform(x, [-90, -20], [1, 0])
  const thresholdRef = useRef(false)

  useEffect(() => {
    setIsTouch(isTouchDevice())
  }, [])

  // Desktop tilt — write directly to DOM via rAF (no React re-render)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouch || flipped) return
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    const rx = (py - 0.5) * -10
    const ry = (px - 0.5) * 10
    if (innerRef.current) {
      innerRef.current.style.transform = `rotateY(${ry}deg) rotateX(${rx}deg)`
    }
    if (foilRef.current) {
      foilRef.current.style.background = `radial-gradient(circle at ${px * 100}% ${py * 100}%, rgba(255,255,255,0.10) 0%, rgba(255, 69, 0,0.05) 30%, rgba(245, 158, 11,0.04) 60%, transparent 80%)`
      foilRef.current.style.opacity = '1'
    }
  }

  const handleMouseEnter = () => {
    if (isTouch) return
    if (!hasHoveredRef.current) { sfx.hover(); hasHoveredRef.current = true }
    setGlowing(true)
  }
  const handleMouseLeave = () => {
    if (isTouch) return
    setGlowing(false)
    hasHoveredRef.current = false
    if (innerRef.current) innerRef.current.style.transform = ''
    if (foilRef.current) foilRef.current.style.opacity = '0'
  }

  const handleFirstDownload = () => {
    if (!localStorage.getItem('dg_first_click')) {
      localStorage.setItem('dg_first_click', '1')
      setTimeout(() => triggerAchievement({ title: 'Explorer!', desc: "You opened your first mod — let's go!" }), 400)
    }
  }

  // Swipe handlers
  const onDragStart = () => {
    sfx.lift(); haptics.light()
    thresholdRef.current = false
  }
  const onDrag = (_: unknown, info: { offset: { x: number } }) => {
    const ax = Math.abs(info.offset.x)
    if (!thresholdRef.current && ax > 60) {
      thresholdRef.current = true
      sfx.tickHigh(); haptics.tick()
    } else if (thresholdRef.current && ax < 50) {
      thresholdRef.current = false
    }
  }
  const onDragEnd = (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
    const dx = info.offset.x
    const v = info.velocity.x
    if (dx > 90 || v > 600) {
      sfx.swipeOpen(); haptics.success()
      animate(x, 400, {
        duration: 0.32,
        onComplete: () => {
          handleFirstDownload()
          navigate({ to: '/download', search: { id: mod.id } })
        },
      })
    } else if (dx < -90 || v < -600) {
      sfx.flip(); haptics.medium()
      animate(x, 0, { type: 'spring', stiffness: 380, damping: 28 })
      setFlipped(true)
    } else {
      sfx.cancel(); haptics.tick()
      animate(x, 0, { type: 'spring', stiffness: 360, damping: 26 })
    }
  }

  const dl = mod.downloads || 0
  const milestone = dl >= 1000 ? { color: '#F59E0B' } : dl >= 500 ? { color: '#F59E0B' } : dl >= 100 ? { color: '#FF4500' } : null

  return (
    <div
      ref={cardRef}
      style={{ perspective: 1000, position: 'relative' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        drag={isTouch && !flipped ? 'x' : false}
        dragElastic={0.35}
        dragConstraints={{ left: 0, right: 0 }}
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
        style={{ x, rotate: isTouch ? rot : 0, touchAction: 'pan-y' }}
      >
        {/* Swipe hint overlays (mobile only) */}
        {isTouch && !flipped && (
          <>
            <motion.div
              aria-hidden
              style={{
                position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none',
                borderRadius: 'inherit',
                boxShadow: 'inset 0 0 50px rgba(255, 69, 0,0.55)',
                opacity: cyanGlow,
              }}
            />
            <motion.div
              aria-hidden
              style={{
                position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none',
                borderRadius: 'inherit',
                boxShadow: 'inset 0 0 50px rgba(245, 158, 11,0.55)',
                opacity: violetGlow,
              }}
            />
            <motion.div
              aria-hidden
              style={{
                position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)',
                zIndex: 7, pointerEvents: 'none',
                color: '#FF4500', filter: 'drop-shadow(0 0 8px rgba(255, 69, 0,0.7))',
                opacity: rightHintOp,
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}
            >
              OPEN <ArrowRight size={14} />
            </motion.div>
            <motion.div
              aria-hidden
              style={{
                position: 'absolute', top: '50%', left: 14, transform: 'translateY(-50%)',
                zIndex: 7, pointerEvents: 'none',
                color: '#F59E0B', filter: 'drop-shadow(0 0 8px rgba(245, 158, 11,0.7))',
                opacity: leftHintOp,
                display: 'flex', alignItems: 'center', gap: 4,
                fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              }}
            >
              <Eye size={14} /> INFO
            </motion.div>
          </>
        )}

        <div
          ref={innerRef}
          style={{
            position: 'relative',
            width: '100%',
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : '',
            transition: flipped
              ? 'transform 0.5s cubic-bezier(0.4,0,0.2,1)'
              : 'transform 0.18s ease-out',
          }}
        >
          {/* ── FRONT ── */}
          <div style={{ backfaceVisibility: 'hidden' }}>
            <Link
              to="/download"
              search={{ id: mod.id }}
              onClick={handleFirstDownload}
              className="glass-panel group flex flex-col overflow-hidden contain-card"
              style={{
                boxShadow: glowing
                  ? `0 0 0 1px rgba(255, 69, 0,0.35), 0 0 30px rgba(255, 69, 0,0.14), 0 0 60px rgba(255, 69, 0,0.06)`
                  : '0 0 0 1px rgba(255,255,255,0.09)',
                borderColor: glowing ? 'rgba(255, 69, 0,0.28)' : 'rgba(255,255,255,0.09)',
                transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                position: 'relative',
              }}
            >
              <span aria-hidden="true" className="corner-accent" />

              {/* Holographic foil — direct DOM, no React re-render */}
              <div
                ref={foilRef}
                aria-hidden="true"
                style={{
                  position: 'absolute', inset: 0, zIndex: 5,
                  pointerEvents: 'none', borderRadius: 'inherit',
                  mixBlendMode: 'screen',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                }}
              />

              {/* Image */}
              <div className="relative mod-card-image overflow-hidden lqip" data-loaded="false">
                <img
                  src={mod.imageUrl || 'https://placehold.co/400x250/0a0f15/1e293b?text=No+Image'}
                  alt={mod.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                  onLoad={(e) => { (e.currentTarget.parentElement as HTMLElement | null)?.setAttribute('data-loaded', 'true') }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#05080A] via-transparent to-transparent" />

                <div className="absolute top-3 left-3 flex gap-1.5">
                  {mod.isTrending === 1 && (
                    <span className="bdg bdg-ok flex items-center gap-1 trending-badge">
                      <TrendingUp className="w-3 h-3" /> Trending
                    </span>
                  )}
                  {mod.isFeatured === 1 && (
                    <span className="bdg bdg-testing featured-badge">Featured</span>
                  )}
                </div>
                <div className="absolute top-3 right-3">
                  <span className="tag tag-v">v{mod.version}</span>
                </div>

                {!isTouch && (
                  <button
                    type="button"
                    onClick={e => { e.preventDefault(); e.stopPropagation(); setFlipped(true) }}
                    className="absolute bottom-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'rgba(255, 69, 0,0.15)', border: '1px solid rgba(255, 69, 0,0.3)' }}
                    title="See details"
                    data-no-click-sound="true"
                  >
                    <Zap size={12} color="#FF4500" />
                  </button>
                )}
              </div>

              <div className="flex flex-col flex-1 p-4 gap-2.5">
                <h3 className="text-sm font-bold text-[#E2E8F0] group-hover:text-[#FF4500] transition-colors line-clamp-2">
                  {mod.title}
                </h3>
                <p className="text-xs text-[#64748b] line-clamp-2 leading-relaxed flex-1">
                  {mod.description}
                </p>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag tag-c text-[10px]">{tag}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-3">
                    <span
                      className="flex items-center gap-1 text-[10px] font-semibold transition-all"
                      style={milestone ? { color: milestone.color, textShadow: `0 0 8px ${milestone.color}80` } : { color: '#64748b' }}
                    >
                      <Download className="w-3 h-3" />
                      <RollingNumber value={dl} />
                      {milestone && <span className="text-[9px]">🔥</span>}
                    </span>
                    <span className={vtClass(mod.virusTotalStatus || '')}>
                      <Shield className="w-3 h-3" /> {mod.virusTotalStatus || 'pending'}
                    </span>
                  </div>
                  <span className={statusClass(mod.status || '')}>
                    <Clock className="w-3 h-3" /> {mod.status || 'active'}
                  </span>
                </div>
              </div>
              {(() => {
                const next = dl < 100 ? 100 : dl < 500 ? 500 : dl < 1000 ? 1000 : 0
                const prev = dl < 100 ? 0 : dl < 500 ? 100 : dl < 1000 ? 500 : 1000
                const pct = next ? Math.min(100, Math.max(0, ((dl - prev) / (next - prev)) * 100)) : 100
                return (
                  <span aria-hidden="true" className="milestone-bar">
                    <span style={{ width: `${pct}%` }} />
                  </span>
                )
              })()}
            </Link>
          </div>

          {/* ── BACK ── */}
          <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
            <div className="glass-panel h-full flex flex-col p-5 gap-4" style={{ border: '1px solid rgba(255, 69, 0,0.2)' }}>
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-bold text-[#FF4500]">{mod.title}</h3>
                <button type="button" onClick={() => { setFlipped(false); haptics.tick() }} className="text-xs text-[#475569] hover:text-[#94a3b8] transition-colors" data-no-click-sound="true">✕</button>
              </div>
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <Download size={14} color="#FF4500" />
                  <span className="text-xs text-[#94a3b8]"><span className="font-bold text-[#e2e8f0]">{(mod.downloads || 0).toLocaleString()}</span> downloads</span>
                </div>
                {mod.ratingCount ? (
                  <div className="flex items-center gap-2">
                    <Star size={14} color="#F59E0B" />
                    <span className="text-xs text-[#94a3b8]"><span className="font-bold text-[#F59E0B]">{ratingAvg.toFixed(1)}</span> avg rating <span className="text-[#475569] ml-1">({mod.ratingCount})</span></span>
                  </div>
                ) : null}
                <div className="flex items-center gap-2">
                  <Shield size={14} color={mod.virusTotalStatus === 'clean' ? '#22c55e' : '#94a3b8'} />
                  <span className="text-xs text-[#94a3b8] capitalize">{mod.virusTotalStatus || 'pending'} scan</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#475569]">Version</span>
                  <span className="tag tag-v">v{mod.version}</span>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {tags.map(tag => <span key={tag} className="tag tag-c text-[10px]">{tag}</span>)}
                  </div>
                )}
              </div>
              <Link to="/download" search={{ id: mod.id }} onClick={handleFirstDownload} className="btn-primary w-full text-xs py-2">
                <Download size={13} /> Download
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export { SkeletonCard }
