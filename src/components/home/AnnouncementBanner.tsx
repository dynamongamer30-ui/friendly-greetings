import { X, Megaphone } from 'lucide-react'

interface AnnouncementBannerProps {
  message: string
  onDismiss: () => void
}

export function AnnouncementBanner({ message, onDismiss }: AnnouncementBannerProps) {
  return (
    <div className="announce-pulse-border relative w-full bg-gradient-to-r from-[rgba(0,240,255,0.08)] via-[rgba(123,47,255,0.06)] to-[rgba(0,240,255,0.08)] border-b border-[rgba(0,240,255,0.12)]">
      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3">
        <Megaphone className="w-4 h-4 text-[#00F0FF] shrink-0" />
        <div className="marquee">
          <div className="marquee-track text-xs sm:text-sm font-medium text-[#E2E8F0]">
            <span>{message}</span>
            <span aria-hidden="true">{message}</span>
            <span aria-hidden="true">{message}</span>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 p-1 rounded-lg hover:bg-[rgba(255,255,255,0.06)] transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5 text-[#64748b] hover:text-[#E2E8F0]" />
        </button>
      </div>
    </div>
  )
}
