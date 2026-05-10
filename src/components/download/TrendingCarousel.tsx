import { useMemo } from 'react'
import { TrendingUp, Download } from 'lucide-react'
import { useMods } from '@/hooks/useDb'

interface TrendingCarouselProps {
  currentModId?: string
}

/* ════════════════════════════════════════════════════════════════════════════ */

export function TrendingCarousel({ currentModId }: TrendingCarouselProps) {
  const { data: mods, isLoading } = useMods()

  const trending = useMemo(() => {
    return mods
      .filter((m) => m.id !== currentModId)
      .sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))
      .slice(0, 12)
  }, [mods, currentModId])

  if (isLoading) {
    return (
      <section className="space-y-4">
        <Header />
        <div className="carousel px-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="carousel-item w-44">
              <div className="shimmer h-44 w-44 rounded-2xl" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (trending.length === 0) return null

  return (
    <section className="space-y-4">
      <Header />

      <div className="carousel px-1">
        {trending.map((mod) => (
          <a
            key={mod.id}
            href={`/download?id=${mod.id}`}
            className="carousel-item group w-40 sm:w-44"
          >
            <div className="glass-panel overflow-hidden transition-all duration-300 group-hover:border-[#00f0ff]/30 group-hover:shadow-[0_0_20px_rgba(0,240,255,0.08)]">
              {/* Image */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={mod.imageUrl}
                  alt={mod.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#05080a] via-transparent to-transparent" />
              </div>

              {/* Info */}
              <div className="p-3 space-y-1.5">
                <h3 className="text-sm font-semibold text-white truncate leading-tight group-hover:text-[#00f0ff] transition-colors">
                  {mod.title}
                </h3>

                <div className="flex items-center justify-between">
                  <span className="tag text-[10px]">{mod.category}</span>
                  <span className="flex items-center gap-1 text-[10px] text-[#94a3b8] font-mono">
                    <Download className="w-3 h-3" />
                    {(mod.downloads ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}

/* ── Section header ──────────────────────────────────────────────────────── */
function Header() {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-[#00f0ff] uppercase tracking-wider">
      <TrendingUp className="w-4 h-4" />
      Trending Mods
    </div>
  )
}
