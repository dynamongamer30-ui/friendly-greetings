import { ShieldCheck, Fingerprint, ArrowRight, Key, Settings2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export default function KeysPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="bg-glow-top" />
      <div className="relative z-10 w-full max-w-sm space-y-8 text-center">

        {/* Icon + heading */}
        <div className="space-y-3">
          <div className="relative w-20 h-20 mx-auto">
            <div
              aria-hidden
              className="absolute -inset-4 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(34,211,238,0.35), rgba(167,139,250,0.20) 50%, transparent 75%)',
                filter: 'blur(18px)',
              }}
            />
            <svg viewBox="0 0 80 80" className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="keysRing" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22D3EE" />
                  <stop offset="50%" stopColor="#A78BFA" />
                  <stop offset="100%" stopColor="#22D3EE" />
                </linearGradient>
              </defs>
              <g style={{ transformOrigin: '40px 40px', animation: 'heroRingSpin 8s linear infinite' }}>
                <circle cx="40" cy="40" r="37" fill="none" stroke="url(#keysRing)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="180 60" />
              </g>
            </svg>
            <div className="absolute inset-3 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(34,211,238,0.12), rgba(167,139,250,0.12))',
                border: '1px solid rgba(167,139,250,0.25)',
                boxShadow: 'inset 0 0 12px rgba(10,10,26,0.4)',
              }}>
              <Key className="w-7 h-7 text-[#22D3EE]" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold aurora-text tracking-tight">
            Key System
          </h1>
          <p className="text-sm text-[#8B92B8]">
            Manage keys &amp; devices, or generate a new access key
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-3 text-left">

          {/* Key Admin Panel — static HTML */}
          <a
            href="/main.html"
            className="flex items-center justify-between w-full glass-panel px-5 py-4 hover:border-[rgba(34,211,238,0.25)] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(34,197,94,0.1)] flex items-center justify-center shrink-0">
                <Settings2 className="w-5 h-5 text-[#22C55E]" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#E2E8F0]">Key Admin Panel</div>
                <div className="text-xs text-[#64748b]">Manage keys, devices &amp; config</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#475569] group-hover:text-[#22D3EE] transition-colors" />
          </a>

          {/* Key Generator — static HTML */}
          <a
            href="/generator.html"
            className="flex items-center justify-between w-full glass-panel px-5 py-4 hover:border-[rgba(34,211,238,0.25)] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(56,189,248,0.1)] flex items-center justify-center shrink-0">
                <Fingerprint className="w-5 h-5 text-[#38BDF8]" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#E2E8F0]">Key Generator</div>
                <div className="text-xs text-[#64748b]">Shortlink-gated · 10 min expiry</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#475569] group-hover:text-[#22D3EE] transition-colors" />
          </a>

          {/* Site Admin — React route */}
          <Link
            to="/admin"
            className="flex items-center justify-between w-full glass-panel px-5 py-4 hover:border-[rgba(34,211,238,0.25)] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(167,139,250,0.1)] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#A78BFA]" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#E2E8F0]">Site Admin</div>
                <div className="text-xs text-[#64748b]">Mods, settings &amp; security</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#475569] group-hover:text-[#22D3EE] transition-colors" />
          </Link>

        </div>

        <p className="text-[0.6rem] text-[#334155] uppercase tracking-widest">
          Dynamon Gamer · Secure Key System
        </p>
      </div>
    </div>
  )
}
