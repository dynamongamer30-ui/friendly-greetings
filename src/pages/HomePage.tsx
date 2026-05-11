import { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { useMods, useSiteMeta } from '@/hooks/useDb'
import { AnnouncementBanner } from '@/components/home/AnnouncementBanner'
import { HeroHeader } from '@/components/home/HeroHeader'
import { SearchBar } from '@/components/home/SearchBar'
import { ModGrid } from '@/components/home/ModGrid'
import { Footer } from '@/components/home/Footer'
import { BackToTop } from '@/components/home/BackToTop'


export default function HomePage() {
  const { data: modsData, isLoading, isError, isFetching } = useMods()
  const mods = modsData ?? []
  const queryClient = useQueryClient()
  const { data: siteMeta } = useSiteMeta()

  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [category, setCategory] = useState('All')
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('announcement_dismissed') === (siteMeta?.announcement ?? '')
  )

  const showAnnouncement =
    !dismissed &&
    siteMeta?.announcementActive === 1 &&
    !!siteMeta?.announcement

  const filtered = useMemo(() => {
    let list = [...mods]

    // Search filter (title + tags)
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase()
      list = list.filter(
        (m) =>
          (m.title || '').toLowerCase().includes(q) ||
          (m.tags && m.tags.toLowerCase().includes(q)) ||
          (m.version && m.version.toLowerCase().includes(q))
      )
    }

    /* NOTE: Firebase — How to add features per mod
      In your Admin Panel -> Mods Tab -> edit mod -> add a `features` field with each feature on a new line:
      Unlimited Coins
      Unlimited Dust
      All Dynamons
      All Emojis
      All Maps
    */

    // Category filter
    if (category !== 'All') {
      list = list.filter(
        (m) => (m.category || '').toLowerCase() === category.toLowerCase()
      )
    }

    // Sort
    if (sortBy === 'trending') {
      list.sort((a, b) => (b.downloads ?? 0) - (a.downloads ?? 0))
    } else if (sortBy === 'featured') {
      list.sort((a, b) => (b.isFeatured ?? 0) - (a.isFeatured ?? 0))
    }
    // default: newest — already sorted by createdAt desc from useMods

    return list
  }, [mods, searchTerm, category, sortBy])

  return (
    <div className="min-h-screen relative" style={{ position: 'relative', zIndex: 1 }}>
      {/* Background is global AuroraOrb in App.tsx */}

      {/* Announcement banner */}
      {showAnnouncement && (
        <AnnouncementBanner
          message={siteMeta!.announcement}
          onDismiss={() => {
            localStorage.setItem('announcement_dismissed', siteMeta!.announcement)
            setDismissed(true)
          }}
        />
      )}

      {/* Hero */}
      <HeroHeader siteMeta={siteMeta ?? null} />

      {/* Search + Filters */}
      <SearchBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        category={category}
        setCategory={setCategory}
      />

      {/* Mod Grid */}
      <section className="pb-10">
        <ModGrid mods={filtered} isLoading={isLoading} isError={isError} />
      </section>

      {/* Footer */}
      <Footer siteMeta={siteMeta ?? null} />

      {/* Back to top */}
      <BackToTop />

    </div>
  )
}
