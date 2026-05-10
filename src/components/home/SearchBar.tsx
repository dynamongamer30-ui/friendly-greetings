import { useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { GlassSelect } from '@/components/ui/GlassSelect'

const CATEGORIES = ['All', 'Gameplay', 'Cheats', 'General'] as const

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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mb-8 space-y-4">
      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input with neon sweep */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-300"
            style={{ color: focused ? '#22D3EE' : '#475569' }}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Search mods, version..."
            className="cmt-input pl-10 w-full"
            style={{
              transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
              boxShadow: focused
                ? '0 0 0 1px rgba(34,211,238,0.5), 0 0 20px rgba(34,211,238,0.15), inset 0 0 20px rgba(34,211,238,0.03)'
                : undefined,
              borderColor: focused ? 'rgba(34,211,238,0.5)' : undefined,
              // Neon sweep via animated background-position
              backgroundImage: focused
                ? 'linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.06) 50%, transparent 100%)'
                : 'none',
              backgroundSize: '200% 100%',
              animation: focused ? 'search-sweep 1.5s ease-in-out infinite' : 'none',
            }}
          />
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
                ? '1px solid rgba(34,211,238,0.4)'
                : '1px solid rgba(255,255,255,0.08)',
              color: category === cat ? '#22D3EE' : '#94a3b8',
              background: category === cat
                ? 'rgba(34,211,238,0.12)'
                : 'rgba(255,255,255,0.04)',
              boxShadow: category === cat
                ? '0 0 14px rgba(34,211,238,0.12), inset 0 0 12px rgba(34,211,238,0.05)'
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
                  background: 'radial-gradient(circle at 50% 120%, rgba(34,211,238,0.18) 0%, transparent 70%)',
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
