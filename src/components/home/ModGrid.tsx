import { useRef, useEffect, useState } from 'react'
import { Download, Package, RefreshCw } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { ModCard, SkeletonCard } from '@/components/home/ModCard'
import type { Mod } from '@/types/mod'

interface ModGridProps {
  mods: Mod[]
  isLoading: boolean
  isError?: boolean
}

// Animated counting number
function CountUp({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [val, setVal] = useState(0)
  const startedRef = useRef(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (target === 0 || startedRef.current) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      startedRef.current = true
      observer.disconnect()
      const steps = 40
      let step = 0
      const id = setInterval(() => {
        step++
        setVal(Math.round((target * step) / steps))
        if (step >= steps) { clearInterval(id); setVal(target) }
      }, duration / steps)
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{val.toLocaleString()}</span>
}

// Scroll-reveal wrapper
function RevealCard({ children, delay }: { children: React.ReactNode; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect() }
    }, { threshold: 0.08 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(28px) scale(0.97)',
        transition: `opacity 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export function ModGrid({ mods, isLoading, isError }: ModGridProps) {
  // Stats
  const totalDownloads = mods.reduce((sum, m) => sum + (m.downloads || 0), 0)
  const totalMods = mods.length
  const lastUpdated = mods.length > 0
    ? new Date(Math.max(...mods.map(m => new Date(m.createdAt || 0).getTime()))).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : '—'

  if (isLoading) {
    return (
      <div className="px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-sm text-[#EF4444]">Failed to load mods. Check your Firebase rules or connection.</p>
      </div>
    )
  }

  if (mods.length === 0) {
    return <EmptyState title="No Mods Found" message="Try adjusting your search or filters." />
  }

  return (
    <div className="px-4 max-w-6xl mx-auto space-y-6">
      {/* Stats Bar */}
      <div
        className="grid grid-cols-3 gap-3 rounded-2xl p-4"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(167,139,250,0.1)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5 text-[#A78BFA]">
            <Download className="w-3.5 h-3.5" />
            <span className="text-base font-extrabold tracking-tight">
              <CountUp target={totalDownloads} />
            </span>
          </div>
          <span className="text-[10px] text-[#475569] font-semibold uppercase tracking-wider">Downloads</span>
        </div>
        <div className="flex flex-col items-center gap-1 border-x border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-1.5 text-[#a78bfa]">
            <Package className="w-3.5 h-3.5" />
            <span className="text-base font-extrabold tracking-tight">
              <CountUp target={totalMods} />
            </span>
          </div>
          <span className="text-[10px] text-[#475569] font-semibold uppercase tracking-wider">Mods</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-1.5 text-[#22D3EE]">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="text-base font-extrabold tracking-tight">{lastUpdated}</span>
          </div>
          <span className="text-[10px] text-[#475569] font-semibold uppercase tracking-wider">Updated</span>
        </div>
      </div>

      {/* Mod Cards with scroll reveal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {mods.map((mod, i) => (
          <RevealCard key={mod.id} delay={Math.min(i * 60, 300)}>
            <ModCard mod={mod} index={i} />
          </RevealCard>
        ))}
      </div>
    </div>
  )
}
