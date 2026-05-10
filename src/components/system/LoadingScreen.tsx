import { useEffect, useState } from 'react'
import { Gamepad2 } from 'lucide-react'

interface Props { onDone: () => void }

export function LoadingScreen({ onDone }: Props) {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out'>('in')

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('hold'), 400)
    const t2 = setTimeout(() => setPhase('out'), 1800)
    const t3 = setTimeout(() => onDone(), 2300)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [onDone])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: '#05080A',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '1.5rem',
        opacity: phase === 'out' ? 0 : 1,
        transition: 'opacity 0.5s ease',
        pointerEvents: phase === 'out' ? 'none' : 'all',
      }}
    >
      {/* Logo ring */}
      <div style={{ position: 'relative', width: 100, height: 100 }}>
        {/* Spinning ring */}
        <div style={{
          position: 'absolute', inset: 0,
          borderRadius: '50%',
          border: '2px solid transparent',
          borderTopColor: '#00F0FF',
          borderRightColor: 'rgba(0,240,255,0.3)',
          animation: 'spin 1s linear infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 6,
          borderRadius: '50%',
          border: '2px solid transparent',
          borderBottomColor: '#a855f7',
          borderLeftColor: 'rgba(168,85,247,0.3)',
          animation: 'spin 1.5s linear infinite reverse',
        }} />
        {/* Icon center */}
        <div style={{
          position: 'absolute', inset: 14,
          borderRadius: '50%',
          background: 'rgba(0,240,255,0.08)',
          border: '1px solid rgba(0,240,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(0,240,255,0.3)',
        }}>
          <Gamepad2 size={28} color="#00F0FF" />
        </div>
      </div>

      {/* Site name */}
      <div style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: '1.4rem',
        fontWeight: 800,
        background: 'linear-gradient(90deg, #00F0FF, #a855f7)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        opacity: phase === 'in' ? 0 : 1,
        transform: phase === 'in' ? 'translateY(8px)' : 'translateY(0)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}>
        Dynamon Gamer
      </div>

      {/* Loading bar */}
      <div style={{
        width: 180, height: 2,
        background: 'rgba(255,255,255,0.06)',
        borderRadius: 999, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #00F0FF, #a855f7)',
          borderRadius: 999,
          animation: 'loadBar 1.6s ease forwards',
          boxShadow: '0 0 8px rgba(0,240,255,0.6)',
        }} />
      </div>

      <style>{`
        @keyframes loadBar { from { width: 0% } to { width: 100% } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
