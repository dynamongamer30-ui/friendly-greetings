import { Link } from '@tanstack/react-router'
import { MessageCircle, Send, Gamepad2 } from 'lucide-react'
import type { SiteMeta } from '@/types/mod'

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

interface FooterProps {
  siteMeta: SiteMeta | null | undefined
}

export function Footer({ siteMeta }: FooterProps) {
  const name = siteMeta?.siteName || 'Dynamon Gamer'

  return (
    <footer
      className="relative mt-20 border-t border-[rgba(34,211,238,0.18)]"
      style={{
        background: 'linear-gradient(180deg, transparent 0%, rgba(34,211,238,0.025) 100%)',
        boxShadow: '0 -1px 24px rgba(34,211,238,0.08), inset 0 1px 0 rgba(34,211,238,0.18)',
      }}
    >
      {/* Cyber grid lines */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at 50% 0%, #000 30%, transparent 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, #000 30%, transparent 70%)',
        }}
      />
      {/* Soft cyan top glow */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(34,211,238,0.6) 50%, transparent 100%)',
          boxShadow: '0 0 18px rgba(34,211,238,0.45)',
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black overflow-hidden" style={{ clipPath: 'circle(50%)' }}>
              {siteMeta?.logoUrl
                ? <img src={siteMeta.logoUrl} className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center bg-[rgba(34,211,238,0.1)]"><Gamepad2 className="w-5 h-5 text-[#22D3EE]" /></div>}
            </div>
            <span className="text-sm font-bold text-[#E2E8F0]">{name}</span>
          </div>

          <nav className="flex items-center gap-6">
            <Link to="/" className="text-xs font-medium text-[#64748b] hover:text-[#22D3EE] transition-colors">Home</Link>
            <Link to="/tutorial" className="text-xs font-medium text-[#64748b] hover:text-[#22D3EE] transition-colors">Tutorial</Link>
            <Link to="/dmca" className="text-xs font-medium text-[#64748b] hover:text-[#22D3EE] transition-colors">DMCA</Link>
          </nav>

          <div className="flex items-center gap-2">
            {siteMeta?.youtubeUrl && (
              <a href={siteMeta.youtubeUrl} target="_blank" rel="noopener noreferrer" className="social-icon soc-yt"><YoutubeIcon className="w-4 h-4" /></a>
            )}
            {siteMeta?.whatsappUrl && (
              <a href={siteMeta.whatsappUrl} target="_blank" rel="noopener noreferrer" className="social-icon soc-wa"><MessageCircle className="w-4 h-4" /></a>
            )}
            {siteMeta?.telegramUrl && (
              <a href={siteMeta.telegramUrl} target="_blank" rel="noopener noreferrer" className="social-icon soc-tg"><Send className="w-4 h-4" /></a>
            )}
            {siteMeta?.instagramUrl && (
              <a href={siteMeta.instagramUrl} target="_blank" rel="noopener noreferrer" className="social-icon soc-ig"><InstagramIcon className="w-4 h-4" /></a>
            )}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.04)] text-center">
          <p className="text-[11px] text-[#475569]">
            © {new Date().getFullYear()} {name}. All rights reserved. For educational purposes only.
          </p>
        </div>
      </div>
    </footer>
  )
}
