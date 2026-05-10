import { useState } from 'react'
import { Gamepad2, Volume2, VolumeX, Download, Package, Clock } from 'lucide-react'
import { motion } from 'framer-motion'
import { getSoundEnabled, toggleSound, playClick } from '@/lib/sound'
import { NotificationBell } from '@/components/ui/NotificationBell'
import { AchievementHistory } from '@/components/ui/AchievementHistory'
import { useMods } from '@/hooks/useDb'
import { formatDistanceToNow } from 'date-fns'

interface HeroHeaderProps {
  siteMeta: { siteName?: string; siteTagline?: string; logoUrl?: string } | null
}

export function HeroHeader({ siteMeta }: HeroHeaderProps) {
  const title = siteMeta?.siteName || 'Dynamon Universe'
  const subtitle = siteMeta?.siteTagline || 'The Ultimate Mod of Dynamons World'
  const logoUrl = siteMeta?.logoUrl || ''
  const [imgError, setImgError] = useState(false)
  const [soundOn, setSoundOn] = useState(() => getSoundEnabled())
  const showImage = logoUrl && !imgError

  const { data: mods } = useMods()
  const totalDownloads = (mods || []).reduce((s, m) => s + (m.downloads || 0), 0)
  const totalMods = (mods || []).length
  const lastUpdate = (mods || []).reduce<number>(
    (a, m) => Math.max(a, Number(m.updatedAt) || Number(m.createdAt) || 0),
    0,
  )
  const updatedLabel = lastUpdate
    ? formatDistanceToNow(new Date(lastUpdate), { addSuffix: false }).replace('about ', '')
    : '—'

  return (
    <header className="relative flex flex-col items-center pt-12 pb-10 px-4 text-center">
      {/* Top-right glass cluster — bell · trophy · sound */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <NotificationBell />
        <AchievementHistory />
        <button
          type="button"
          onClick={() => { playClick(); setSoundOn(toggleSound()) }}
          aria-label={soundOn ? 'Mute sounds' : 'Enable sounds'}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
          style={{
            background: 'rgba(20,20,50,0.55)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(167,139,250,0.18)',
            color: '#A78BFA',
          }}
        >
          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-24 h-24 mt-6 mb-7"
      >
        <div
          aria-hidden="true"
          className="absolute -inset-3 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, #22D3EE, #A78BFA, #22D3EE)',
            mask: 'radial-gradient(circle, transparent 54%, black 56%)',
            WebkitMask: 'radial-gradient(circle, transparent 54%, black 56%)',
            animation: 'logo-ring-spin 8s linear infinite',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute -inset-6 rounded-full opacity-60 blur-2xl"
          style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.45), transparent 70%)' }}
        />
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-full overflow-hidden"
          style={{
            backgroundImage: showImage ? `url(${logoUrl})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundColor: '#0A0A1A',
            border: '1.5px solid rgba(167,139,250,0.35)',
          }}
        >
          {!showImage && <Gamepad2 className="w-10 h-10" style={{ color: '#A78BFA' }} />}
          {showImage && <img src={logoUrl} alt="" className="sr-only" onError={() => setImgError(true)} />}
        </div>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="aurora-text relative z-10 text-[44px] sm:text-6xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-3"
        style={{ fontFamily: "'Space Grotesk', 'DM Sans', sans-serif" }}
      >
        {title}
      </motion.h1>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="relative z-10 text-sm sm:text-base max-w-md leading-relaxed mb-8"
          style={{ color: '#8B92B8' }}
        >
          {subtitle}
        </motion.p>
      )}

      {/* Stat pill row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative z-10 grid grid-cols-3 gap-2 sm:gap-3 w-full max-w-md"
      >
        {[
          { icon: Download, label: 'Downloads', value: totalDownloads.toLocaleString(), color: '#22D3EE' },
          { icon: Package, label: 'Mods', value: String(totalMods), color: '#A78BFA' },
          { icon: Clock, label: 'Updated', value: updatedLabel, color: '#E8ECFF' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl px-2 py-3 flex flex-col items-center gap-1"
            style={{
              background: 'rgba(20,20,50,0.45)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(167,139,250,0.14)',
            }}
          >
            <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
            <div className="text-[15px] sm:text-base font-bold" style={{ color: s.color, fontFamily: "'Space Grotesk', sans-serif" }}>
              {s.value}
            </div>
            <div className="text-[9px] uppercase tracking-wider" style={{ color: '#8B92B8' }}>
              {s.label}
            </div>
          </div>
        ))}
      </motion.div>
    </header>
  )
}
