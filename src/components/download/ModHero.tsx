import { Download, Shield, Clock, TrendingUp, Tag, ExternalLink, Star } from 'lucide-react'
import type { Mod } from '@/types/mod'
import { StarRating } from '@/components/download/StarRating'
import { DownloadButtonWrapper } from '@/components/download/DownloadButtonWrapper'

interface ModHeroProps {
  mod: Mod
  onDownload: () => void
  isDownloading: boolean
}

export function ModHero({ mod, onDownload, isDownloading }: ModHeroProps) {
  const tags = mod.tags ? mod.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  const features = mod.features ? mod.features.split('\n').map(f => f.trim()).filter(Boolean) : []

  const vtClass =
    mod.virusTotalStatus?.toLowerCase() === 'clean' ? 'bdg bdg-vt-clean' :
    mod.virusTotalStatus?.toLowerCase() === 'flagged' ? 'bdg bdg-vt-flagged' :
    'bdg bdg-vt-pending'

  const ratingCount = mod.ratingCount || 0
  const ratingAvg = ratingCount > 0 ? (mod.ratingSum || 0) / ratingCount : 0

  return (
    <div className="glass-panel corner-deco overflow-hidden">
      {/* Hero Image */}
      <div className="relative h-56 sm:h-72 overflow-hidden">
        <img
          src={mod.imageUrl || 'https://placehold.co/800x400/0a0f15/1e293b?text=No+Image'}
          alt={mod.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#05080A] via-[rgba(5,8,10,0.4)] to-transparent" />

        {/* Overlay badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {mod.isTrending === 1 && (
            <span className="bdg bdg-ok"><TrendingUp className="w-3 h-3" /> Trending</span>
          )}
          {mod.isFeatured === 1 && (
            <span className="bdg bdg-testing">Featured</span>
          )}
          <span className="tag tag-v">v{mod.version}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 sm:p-8 space-y-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#E2E8F0]">{mod.title}</h1>

        <p className="text-sm text-[#94a3b8] leading-relaxed whitespace-pre-line">{mod.description}</p>

        {/* Star rating widget */}
        <div className="pt-1">
          <StarRating modId={mod.id} />
        </div>

        {/* Features */}
        {features.length > 0 && (
          <div className="pt-2 space-y-1.5">
            <h3 className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider mb-2">Features</h3>
            <ul className="space-y-1.5">
              {features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-[#94a3b8]">
                  <span className="text-[#00F0FF] font-bold">•</span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Tag className="w-3.5 h-3.5 text-[#475569]" />
            {tags.map(tag => (
              <span key={tag} className="tag tag-c">{tag}</span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <span className="flex items-center gap-1.5 text-xs text-[#64748b]">
            <Download className="w-3.5 h-3.5" /> {mod.downloads?.toLocaleString() || 0} downloads
          </span>
          {ratingCount > 0 && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-[rgba(255,215,0,0.10)] border border-[rgba(255,215,0,0.30)] text-[#FFD700]">
              <Star className="w-3 h-3 fill-[#FFD700]" /> {ratingAvg.toFixed(1)} ★
              <span className="text-[10px] text-[#94a3b8] font-normal ml-0.5">({ratingCount})</span>
            </span>
          )}
          <span className={vtClass}>
            <Shield className="w-3 h-3" /> {mod.virusTotalStatus?.toLowerCase() || 'pending'}
          </span>
          <span className="flex items-center gap-1.5 text-xs text-[#64748b]">
            <Clock className="w-3.5 h-3.5" /> {mod.category}
          </span>
        </div>

        {/* Changelog */}
        {mod.changelog && (
          <div className="pt-4 border-t border-[rgba(255,255,255,0.06)]">
            <h3 className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider mb-2">Changelog</h3>
            <p className="text-xs text-[#64748b] leading-relaxed whitespace-pre-line">{mod.changelog}</p>
          </div>
        )}

        {/* Video */}
        {mod.videoUrl && (
          <div className="pt-4 border-t border-[rgba(255,255,255,0.06)]">
            <h3 className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider mb-3">Preview</h3>
            <div className="video-wrap">
              <iframe
                src={`https://www.youtube.com/embed/${mod.videoUrl}`}
                title="Preview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Download button */}
        <div className="pt-4">
          <DownloadButtonWrapper downloadCount={mod.downloads || 0} isDownloading={isDownloading}>
          <button
            onClick={onDownload}
            disabled={isDownloading}
            data-downloading={isDownloading ? 'true' : 'false'}
            className={`btn-primary btn-ripple w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed dl-btn dl-btn-tier-${(() => {
              const c = mod.downloads || 0
              if (isDownloading) return 0
              if (c >= 20000) return 5
              if (c >= 5000) return 4
              if (c >= 1000) return 3
              if (c >= 250) return 2
              if (c >= 50) return 1
              return 0
            })()}`}
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-[#05080A] border-t-transparent rounded-full animate-spin" />
                Preparing...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4" />
                Download Mod
              </>
            )}
          </button>
          </DownloadButtonWrapper>
        </div>
      </div>
    </div>
  )
}
