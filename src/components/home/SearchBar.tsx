import { useEffect, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { GlassSelect } from '@/components/ui/GlassSelect'

const CATEGORIES = ['All', 'Gameplay', 'Cheats', 'General'] as const

const PLACEHOLDERS = [
  "Search mods, version…",
  "Try 'Unlimited Coins'…",
  "Try 'God Mode'…",
  "Try 'Dynamons World'…",
  "Try 'Latest Update'…",
]

interface SearchBarProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
  sortBy: string
  setSortBy: (value: string) => void
  category: string
  setCategory: (value: string) => void
}

export function SearchBar({
  searchTerm, setSearchTerm,
  sortBy, setSortBy,
  category, setCategory,
}: SearchBarProps) {
  const [focused, setFocused] = useState(false)
  const [phIdx, setPhIdx] = useState(0)

  useEffect(() => {
    if (focused || searchTerm) return
    const id = setInterval(() => setPhIdx(i => (i + 1) % PLACEHOLDERS.length), 3200)
    return () => clearInterval(id)
  }, [focused, searchTerm])

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-8 space-y-4">
      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input with neon sweep */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-all duration-300"
            style={{
              color: focused ? '#FF4500' : '#475569',
              filter: focused ? 'drop-shadow(0 0 6px rgba(255, 69, 0,0.6))' : 'none',
            }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder={PLACEHOLDERS[phIdx]}
            className="cmt-input pl-10 pr-10 w-full"
            style={{
              transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
              boxShadow: focused
                ? '0 0 0 1px rgba(255, 69, 0,0.5), 0 0 20px rgba(255, 69, 0,0.15), inset 0 0 20px rgba(255, 69, 0,0.03)'
                : undefined,
              borderColor: focused ? 'rgba(255, 69, 0,0.5)' : undefined,
              backgroundImage: focused
                ? 'linear-gradient(90deg, transparent 0%, rgba(255, 69, 0,0.06) 50%, transparent 100%)'
                : 'none',
              backgroundSize: '200% 100%',
              animation: focused ? 'search-sweep 1.5s ease-in-out infinite' : 'none',
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/10 transition-all"
              style={{ color: '#94a3b8', animation: 'trophyBounce 0.3s var(--ease-spring)' }}
              data-no-click-sound="true"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="relative shrink-0 min-w-[180px]">
          <GlassSelect
            value={sortBy}
            onChange={(val) => setSortBy(val)}
            options={[
              { value: 'newest', label: 'Newest Arrivals' },
              { value: 'trending', label: 'Trending Now' },
            ]}
            icon={<SlidersHorizontal className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Liquid fill category pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="liquid-filter-btn"
            data-active={category === cat ? 'true' : 'false'}
            style={{
              position: 'relative',
              overflow: 'hidden',
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.375rem 0.875rem',
              fontSize: '0.8125rem',
              fontWeight: 600,
              borderRadius: 999,
              cursor: 'pointer',
              border: category === cat
                ? '1px solid rgba(255, 69, 0,0.4)'
                : '1px solid rgba(255,255,255,0.08)',
              color: category === cat ? '#FF4500' : '#94a3b8',
              background: category === cat
                ? 'rgba(255, 69, 0,0.12)'
                : 'rgba(255,255,255,0.04)',
              boxShadow: category === cat
                ? '0 0 14px rgba(255, 69, 0,0.12), inset 0 0 12px rgba(255, 69, 0,0.05)'
                : 'none',
              transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
              whiteSpace: 'nowrap',
            }}
          >
            {/* Liquid fill ripple on active */}
            {category === cat && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'radial-gradient(circle at 50% 120%, rgba(255, 69, 0,0.18) 0%, transparent 70%)',
                  animation: 'liquid-fill 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
                  pointerEvents: 'none',
                }}
              />
            )}
            {cat}
          </button>
        ))}
      </div>
    </div>
  )
}
