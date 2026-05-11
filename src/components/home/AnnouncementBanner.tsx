import { X, Megaphone } from 'lucide-react'

interface AnnouncementBannerProps {
  message: string
  onDismiss: () => void
}

export function AnnouncementBanner({ message, onDismiss }: AnnouncementBannerProps) {
  return (
    <div
      className="relative w-full"
      style={{
        background: 'rgba(20,20,50,0.55)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        borderBottom: '1px solid rgba(245, 158, 11,0.14)',
      }}
    >
      <div className="max-w-6xl mx-auto px-3 h-9 flex items-center gap-2.5">
        <Megaphone className="w-3.5 h-3.5 shrink-0" style={{ color: '#F59E0B' }} />
        <div className="marquee flex-1 min-w-0 overflow-hidden">
          <div className="marquee-track text-[11px] sm:text-xs font-medium" style={{ color: '#E8ECFF' }}>
            <span>{message}</span>
            <span aria-hidden="true">{message}</span>
            <span aria-hidden="true">{message}</span>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 p-1 rounded-md transition-colors hover:bg-white/5"
          aria-label="Dismiss"
          style={{ color: '#8B92B8' }}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  )
}
