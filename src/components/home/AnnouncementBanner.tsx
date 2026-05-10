import { X, Megaphone } from 'lucide-react'

interface AnnouncementBannerProps {
  message: string
  onDismiss: () => void
}

export function AnnouncementBanner({ message, onDismiss }: AnnouncementBannerProps) {
  return (
    <div className="relative w-full bg-[rgba(8,12,20,0.85)] border-b border-[rgba(34,211,238,0.10)] backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-3 py-2 flex items-center gap-2.5">
        <Megaphone className="w-3.5 h-3.5 text-[#22D3EE] shrink-0 opacity-80" />
        <div className="marquee flex-1 min-w-0">
          <div className="marquee-track text-[11px] sm:text-xs font-medium text-[#cbd5e1]">
            <span>{message}</span>
            <span aria-hidden="true">{message}</span>
            <span aria-hidden="true">{message}</span>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="shrink-0 p-1 rounded-md hover:bg-[rgba(255,255,255,0.06)] transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3 h-3 text-[#64748b] hover:text-[#E2E8F0]" />
        </button>
      </div>
    </div>
  )
}
