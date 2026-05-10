import { ShieldCheck, Fingerprint, ArrowRight, Key, Settings2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'

export default function KeysPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="bg-glow-top" />
      <div className="relative z-10 w-full max-w-sm space-y-8 text-center">

        {/* Icon + heading */}
        <div className="space-y-3">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[rgba(0,240,255,0.08)] border border-[rgba(0,240,255,0.15)] flex items-center justify-center">
            <Key className="w-8 h-8 text-[#00F0FF]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#E2E8F0] tracking-tight">
            Key System
          </h1>
          <p className="text-sm text-[#64748b]">
            Manage keys &amp; devices, or generate a new access key
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-3 text-left">

          {/* Key Admin Panel — static HTML */}
          <a
            href="/main.html"
            className="flex items-center justify-between w-full glass-panel px-5 py-4 hover:border-[rgba(0,240,255,0.25)] transition-all group"
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
            <ArrowRight className="w-4 h-4 text-[#475569] group-hover:text-[#00F0FF] transition-colors" />
          </a>

          {/* Key Generator — static HTML */}
          <a
            href="/generator.html"
            className="flex items-center justify-between w-full glass-panel px-5 py-4 hover:border-[rgba(0,240,255,0.25)] transition-all group"
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
            <ArrowRight className="w-4 h-4 text-[#475569] group-hover:text-[#00F0FF] transition-colors" />
          </a>

          {/* Site Admin — React route */}
          <Link
            to="/admin"
            className="flex items-center justify-between w-full glass-panel px-5 py-4 hover:border-[rgba(0,240,255,0.25)] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[rgba(123,47,255,0.1)] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#7B2FFF]" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#E2E8F0]">Site Admin</div>
                <div className="text-xs text-[#64748b]">Mods, settings &amp; security</div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[#475569] group-hover:text-[#00F0FF] transition-colors" />
          </Link>

        </div>

        <p className="text-[0.6rem] text-[#334155] uppercase tracking-widest">
          Dynamon Gamer · Secure Key System
        </p>
      </div>
    </div>
  )
}
