import { useEffect, useState } from 'react'

interface Props {
  onDone: () => void
  siteMeta?: { siteName?: string } | null
}

export function LoadingScreen({ onDone, siteMeta }: Props) {
  const name = siteMeta?.siteName || 'Dynamon Gamer'
  const [out, setOut] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dur = reduced ? 400 : 2000
    const t1 = setTimeout(() => setOut(true), dur)
    const t2 = setTimeout(() => onDone(), dur + 550)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  const letters = name.split('')

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: '#05080A',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '1.75rem',
        opacity: out ? 0 : 1,
        transform: out ? 'translateY(-24px)' : 'translateY(0)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
        pointerEvents: out ? 'none' : 'all',
      }}
    >
      {/* Aurora bloom */}
      <div
        aria-hidden
        style={{
          position: 'absolute', width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(34,211,238,0.18), rgba(167,139,250,0.10) 40%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'splashPulse 3s ease-in-out infinite',
        }}
      />

      {/* Wordmark */}
      <h1
        style={{
          position: 'relative',
          fontFamily: "'Space Grotesk', sans-serif",
          fontWeight: 700,
          fontSize: 'clamp(2.2rem, 7vw, 3.4rem)',
          letterSpacing: '-0.025em',
          margin: 0,
          display: 'flex',
          gap: '0.02em',
          background: 'linear-gradient(90deg, #22D3EE 0%, #A78BFA 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
        }}
      >
        {letters.map((ch, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              opacity: 0,
              transform: 'translateY(14px)',
              animation: `splashLetter 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 40}ms forwards`,
            }}
          >
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
      </h1>

      {/* Hairline progress */}
      <div
        style={{
          position: 'relative',
          width: 180, height: 1,
          background: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, #22D3EE, #A78BFA)',
            transform: 'translateX(-100%)',
            animation: 'splashHair 1.6s cubic-bezier(0.65,0,0.35,1) 0.3s forwards',
            boxShadow: '0 0 8px rgba(34,211,238,0.5)',
          }}
        />
      </div>

      <style>{`
        @keyframes splashLetter {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashHair {
          to { transform: translateX(0); }
        }
        @keyframes splashPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
      `}</style>
    </div>
  )
}
