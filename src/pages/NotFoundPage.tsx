import { Link } from '@tanstack/react-router'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0A0A1A] px-4">
      {/* Aurora layers (same technique as Step 5) */}
      <div className="nf-aurora nf-aurora-1" aria-hidden />
      <div className="nf-aurora nf-aurora-2" aria-hidden />

      <div className="relative z-10 text-center">
        <h1 className="nf-glitch text-[110px] md:text-[160px] font-extrabold leading-none" data-text="404">
          404
        </h1>
        <p className="mt-2 text-lg text-[#94a3b8] font-medium" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          You&apos;ve drifted off the grid.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-xl font-semibold text-[#05080A] active:scale-95 transition-transform"
          style={{ background: 'linear-gradient(135deg,#00F0FF,#7B2FFF)', boxShadow: '0 0 24px rgba(0,240,255,0.35)' }}
        >
          <Home className="w-4 h-4" />
          Go Home
        </Link>
      </div>
    </div>
  )
}