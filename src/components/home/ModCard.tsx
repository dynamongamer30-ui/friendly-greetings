import { useState, useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { Download, TrendingUp, Shield, Clock, Star, Zap } from 'lucide-react'
import type { Mod } from '@/types/mod'
import { playHover } from '@/lib/sound'
import { triggerAchievement } from '@/components/ui/AchievementToast'

interface ModCardProps { mod: Mod; index: number }

function RollingNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)
  useEffect(() => {
    const target = value
    const start = prevRef.current
    if (start === target) return
    const diff = target - start
    const steps = 30
    let step = 0
    const id = setInterval(() => {
      step++
      setDisplay(Math.round(start + (diff * step) / steps))
      if (step >= steps) { clearInterval(id); prevRef.current = target }
    }, 18)
    return () => clearInterval(id)
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

export function ModCard({ mod, index: _index }: ModCardProps) {
  const [flipped, setFlipped] = useState(false)
  const [glowing, setGlowing] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 })
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])
  const cardRef = useRef<HTMLDivElement>(null)
  const hasHoveredRef = useRef(false)
  const tags = mod.tags ? mod.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  const ratingAvg = mod.ratingCount ? (mod.ratingSum || 0) / mod.ratingCount : 0

  // Holographic tilt tracking
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }

  const handleMouseEnter = () => {
    if (!hasHoveredRef.current) { playHover(); hasHoveredRef.current = true }
    setGlowing(true)
  }
  const handleMouseLeave = () => {
    setGlowing(false)
    setMousePos({ x: 0.5, y: 0.5 })
    hasHoveredRef.current = false
  }

  // Download ripple
  const handleDownloadClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()
    setRipples(r => [...r, { id, x, y }])
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700)
  }

  const handleFirstDownload = () => {
    if (!localStorage.getItem('dg_first_click')) {
      localStorage.setItem('dg_first_click', '1')
      setTimeout(() => triggerAchievement({ title: 'Explorer!', desc: "You opened your first mod — let's go!" }), 400)
    }
  }

  // Holographic shimmer values
  const rotX = glowing ? (mousePos.y - 0.5) * -14 : 0
  const rotY = glowing ? (mousePos.x - 0.5) * 14 : 0
  const shimmerX = mousePos.x * 100
  const shimmerY = mousePos.y * 100

  // Download milestone glow
  const dl = mod.downloads || 0
  const milestone = dl >= 1000 ? { color: '#a855f7' } : dl >= 500 ? { color: '#A78BFA' } : dl >= 100 ? { color: '#22D3EE' } : null

  return (
    <div
      ref={cardRef}
      style={{ perspective: 1000 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          transformStyle: 'preserve-3d',
          transform: flipped
            ? 'rotateY(180deg)'
            : `rotateY(${rotY}deg) rotateX(${rotX}deg)`,
          transition: flipped
            ? 'transform 0.5s cubic-bezier(0.4,0,0.2,1)'
            : 'transform 0.15s ease-out',
        }}
      >
        {/* ── FRONT ── */}
        <div style={{ backfaceVisibility: 'hidden' }}>
          <Link
            to="/download"
            search={{ id: mod.id }}
            onClick={(e) => { handleDownloadClick(e as unknown as React.MouseEvent<HTMLAnchorElement>); handleFirstDownload() }}
            className="glass-panel group flex flex-col overflow-hidden contain-card"
            style={{
              boxShadow: glowing
                ? `0 0 0 1px rgba(34,211,238,0.35), 0 0 30px rgba(34,211,238,0.14), 0 0 60px rgba(34,211,238,0.06)`
                : '0 0 0 1px rgba(255,255,255,0.09)',
              borderColor: glowing ? 'rgba(34,211,238,0.28)' : 'rgba(255,255,255,0.09)',
              transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
              position: 'relative',
            }}
          >
            {/* Gradient corner accent */}
            <span aria-hidden="true" className="corner-accent" />

            {/* Holographic foil overlay */}
            {glowing && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 5,
                  pointerEvents: 'none',
                  borderRadius: 'inherit',
                  background: `radial-gradient(circle at ${shimmerX}% ${shimmerY}%, rgba(255,255,255,0.12) 0%, rgba(34,211,238,0.06) 30%, rgba(167,139,250,0.05) 60%, transparent 80%)`,
                  mixBlendMode: 'screen',
                  transition: 'background 0.08s ease',
                }}
              />
            )}

            {/* Download ripples */}
            {ripples.map(r => (
              <span
                key={r.id}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  left: r.x, top: r.y,
                  width: 8, height: 8,
                  marginLeft: -4, marginTop: -4,
                  borderRadius: '50%',
                  background: 'rgba(34,211,238,0.4)',
                  zIndex: 10,
                  pointerEvents: 'none',
                  animation: 'download-ripple 0.7s ease-out forwards',
                }}
              />
            ))}

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

              {/* Badges */}
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

              {/* Flip hint */}
              <button
                type="button"
                onClick={e => { e.preventDefault(); e.stopPropagation(); setFlipped(true) }}
                className="absolute bottom-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.3)' }}
                title="See details"
                data-no-click-sound="true"
              >
                <Zap size={12} color="#22D3EE" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-4 gap-2.5">
              <h3 className="text-sm font-bold text-[#E2E8F0] group-hover:text-[#22D3EE] transition-colors line-clamp-2">
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
          </Link>
        </div>

        {/* ── BACK ── */}
        <div style={{ position: 'absolute', inset: 0, backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
          <div className="glass-panel h-full flex flex-col p-5 gap-4" style={{ border: '1px solid rgba(34,211,238,0.2)' }}>
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-bold text-[#22D3EE]">{mod.title}</h3>
              <button type="button" onClick={() => setFlipped(false)} className="text-xs text-[#475569] hover:text-[#94a3b8] transition-colors" data-no-click-sound="true">✕</button>
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex items-center gap-2">
                <Download size={14} color="#22D3EE" />
                <span className="text-xs text-[#94a3b8]"><span className="font-bold text-[#e2e8f0]">{(mod.downloads || 0).toLocaleString()}</span> downloads</span>
              </div>
              {mod.ratingCount ? (
                <div className="flex items-center gap-2">
                  <Star size={14} color="#A78BFA" />
                  <span className="text-xs text-[#94a3b8]"><span className="font-bold text-[#A78BFA]">{ratingAvg.toFixed(1)}</span> avg rating <span className="text-[#475569] ml-1">({mod.ratingCount})</span></span>
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
    </div>
  )
}

export { SkeletonCard }
