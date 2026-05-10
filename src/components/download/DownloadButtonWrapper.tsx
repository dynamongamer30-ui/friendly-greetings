import { useMemo, type ReactNode } from 'react'

const TIERS = [
  { min: 0,     max: 49,     id: 0 },
  { min: 50,    max: 249,    id: 1 },
  { min: 250,   max: 999,    id: 2 },
  { min: 1000,  max: 4999,   id: 3 },
  { min: 5000,  max: 19999,  id: 4 },
  { min: 20000, max: Infinity, id: 5 },
] as const

function tierFor(count: number): number {
  for (const t of TIERS) if (count >= t.min && count <= t.max) return t.id
  return 0
}

interface Props {
  downloadCount: number
  isDownloading: boolean
  children: ReactNode
}

export function DownloadButtonWrapper({ downloadCount, isDownloading, children }: Props) {
  const tier = useMemo(() => tierFor(downloadCount || 0), [downloadCount])
  // When downloading, suppress all tier effects
  const activeTier = isDownloading ? 0 : tier

  // 6–8 sparks for tier 3+, 10–12 gold particles for tier 5
  const sparks = activeTier >= 3 ? Array.from({ length: 7 }, (_, i) => i) : []
  const goldRain = activeTier >= 5 ? Array.from({ length: 11 }, (_, i) => i) : []

  return (
    <div className={`dl-wrap dl-tier-${activeTier}`}>
      {/* Tier 4+ legendary count badge */}
      {activeTier === 4 && (
        <div className="dl-badge dl-badge-fire">
          🔥 {downloadCount.toLocaleString()} Downloads
        </div>
      )}
      {activeTier === 5 && (
        <div className="dl-badge dl-badge-legendary">
          ⚡ LEGENDARY
        </div>
      )}

      <div className="dl-stage">
        {/* Shimmer sweep for tier 3+ */}
        {activeTier >= 3 && <span className="dl-shimmer" aria-hidden="true" />}

        {/* Floating sparks for tier 3+ */}
        {sparks.map((i) => (
          <span
            key={`s${i}`}
            className="dl-spark"
            style={{
              left: `${10 + (i * 13) % 80}%`,
              animationDelay: `${(i * 0.35) % 2.4}s`,
              animationDuration: `${2 + (i % 3) * 0.6}s`,
            }}
            aria-hidden="true"
          />
        ))}

        {/* Gold particle rain for tier 5 */}
        {goldRain.map((i) => (
          <span
            key={`g${i}`}
            className="dl-gold"
            style={{
              left: `${(i * 9 + 4) % 96}%`,
              animationDelay: `${(i * 0.27) % 2.5}s`,
              animationDuration: `${1.6 + (i % 4) * 0.4}s`,
            }}
            aria-hidden="true"
          />
        ))}

        {/* The actual button — unchanged */}
        <div className="dl-btn-slot">{children}</div>
      </div>
    </div>
  )
}
