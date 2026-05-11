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
      {/* Top-right glass cluster — bell · trophy · sound (single pill) */}
      <div
        className="absolute top-4 right-4 z-20 flex items-center gap-1 p-1.5 rounded-full"
        style={{
          background: 'rgba(20,20,50,0.55)',
          backdropFilter: 'blur(16px) saturate(140%)',
          WebkitBackdropFilter: 'blur(16px) saturate(140%)',
          border: '1px solid rgba(167,139,250,0.18)',
          boxShadow: '0 4px 18px rgba(0,0,0,0.35)',
        }}
      >
        <NotificationBell bare />
        <AchievementHistory bare />
        <button
          type="button"
          onClick={() => { playClick(); setSoundOn(toggleSound()) }}
          aria-label={soundOn ? 'Mute sounds' : 'Enable sounds'}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-white/5"
          style={{ color: '#A78BFA' }}
        >
          {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      {/* Logo — liquid gradient ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-28 h-28 mt-6 mb-7 rounded-full"
        style={{ animation: 'heroLogoFloat 6s ease-in-out infinite' }}
      >
        {/* Outer bloom */}
        <div
          aria-hidden="true"
          className="absolute -inset-8 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(34,211,238,0.45), rgba(167,139,250,0.25) 45%, transparent 70%)',
            filter: 'blur(20px)',
            animation: 'heroLogoBloom 4s ease-in-out infinite',
          }}
        />

        {/* SVG liquid ring — guaranteed perfect circle */}
        <svg
          aria-hidden="true"
          viewBox="0 0 120 120"
          className="absolute inset-0 w-full h-full"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="auroraRing" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="50%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#22D3EE" />
            </linearGradient>
          </defs>
          <g style={{ transformOrigin: '60px 60px', animation: 'heroRingSpin 8s linear infinite' }}>
            <circle
              cx="60" cy="60" r="56"
              fill="none"
              stroke="url(#auroraRing)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="280 80"
            />
          </g>
        </svg>

        {/* Avatar — perfect circle, image fully covers, no masks */}
        <div
          className="absolute inset-2 z-10 flex items-center justify-center"
          style={{
            width: 'calc(100% - 16px)',
            height: 'calc(100% - 16px)',
            borderRadius: '9999px',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(34,211,238,0.10), rgba(167,139,250,0.10))',
          }}
        >
          {showImage ? (
            <img
              src={logoUrl}
              alt=""
              onError={() => setImgError(true)}
              draggable={false}
              style={{
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
          ) : (
            <Gamepad2 className="w-10 h-10" style={{ color: '#A78BFA' }} />
          )}
        </div>
        {/* Soft inner edge (above image, doesn't clip) */}
        <div
          aria-hidden="true"
          className="absolute inset-2 z-20 pointer-events-none rounded-full"
          style={{
            boxShadow: 'inset 0 0 18px rgba(10,10,26,0.45), inset 0 0 0 1px rgba(167,139,250,0.22)',
          }}
        />

        <style>{`
          @keyframes heroRingSpin { to { transform: rotate(360deg); } }
          @keyframes heroLogoFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes heroLogoBloom {
            0%, 100% { opacity: 0.55; transform: scale(1); }
            50% { opacity: 0.85; transform: scale(1.08); }
          }
        `}</style>
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
          { icon: Download, label: 'Downloads', value: totalDownloads.toLocaleString(), color: '#22D3EE', dot: false },
          { icon: Package, label: 'Mods', value: String(totalMods), color: '#A78BFA', dot: false },
          { icon: Clock, label: 'Updated', value: updatedLabel, color: '#E8ECFF', dot: true },
        ].map((s) => (
          <div
            key={s.label}
            className="stat-pill rounded-2xl px-2 py-3 flex flex-col items-center gap-1"
            style={{
              background: 'rgba(20,20,50,0.45)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid rgba(167,139,250,0.14)',
            }}
          >
            <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
            <div className="text-[15px] sm:text-base font-bold num-tab" style={{ color: s.color, fontFamily: "'Space Grotesk', sans-serif" }}>
              {s.value}
            </div>
            <div className="text-[9px] uppercase tracking-wider flex items-center gap-1" style={{ color: '#8B92B8' }}>
              {s.dot && <span className="pulse-dot" aria-hidden />}
              {s.label}
            </div>
          </div>
        ))}
      </motion.div>
    </header>
  )
}
