import { useEffect, useRef, useState } from 'react'
import { Trophy } from 'lucide-react'
import { playAchievement } from '@/lib/sound'

export interface AchievementDetail {
  title: string
  desc: string
}

export function triggerAchievement(detail: AchievementDetail) {
  window.dispatchEvent(new CustomEvent('dg:achievement', { detail }))
}

export function AchievementToast() {
  const [queue, setQueue] = useState<AchievementDetail[]>([])
  const [visible, setVisible] = useState<AchievementDetail | null>(null)
  const [show, setShow] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<AchievementDetail>).detail
      setQueue(q => [...q, detail])
    }
    window.addEventListener('dg:achievement', handler)
    return () => window.removeEventListener('dg:achievement', handler)
  }, [])

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setShow(false)
    setTimeout(() => setVisible(null), 400)
  }

  useEffect(() => {
    if (visible || queue.length === 0) return

    const next = queue[0]
    setQueue(q => q.slice(1))
    setVisible(next)
    setShow(false)

    requestAnimationFrame(() => requestAnimationFrame(() => setShow(true)))
    playAchievement()

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setShow(false)
      setTimeout(() => setVisible(null), 400)
    }, 3000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [queue, visible])

  if (!visible) return null

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={dismiss}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') dismiss() }}
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: show
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(-90px)',
        opacity: show ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.35s ease',
        zIndex: 99998,
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1.25rem',
        borderRadius: '1rem',
        background: 'rgba(5,8,10,0.96)',
        border: '1px solid rgba(0,240,255,0.35)',
        boxShadow: '0 0 24px rgba(0,240,255,0.12), 0 8px 32px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(16px)',
        minWidth: 220,
        maxWidth: 320,
        cursor: 'pointer',
      }}
      aria-label="Dismiss achievement"
    >
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: 'rgba(0,240,255,0.1)',
        border: '1px solid rgba(0,240,255,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        animation: 'trophyBounce 0.5s ease',
      }}>
        <Trophy size={18} color="#00F0FF" />
      </div>

      <div>
        <div style={{
          fontSize: 10, color: '#00F0FF', fontWeight: 700,
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          Achievement Unlocked
        </div>
        <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 700, marginTop: 2 }}>
          {visible.title}
        </div>
        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
          {visible.desc}
        </div>
      </div>

      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 2, borderRadius: '0 0 1rem 1rem',
        background: 'rgba(0,240,255,0.15)', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', background: '#00F0FF',
          animation: show ? 'toast-drain 3s linear forwards' : 'none',
          boxShadow: '0 0 6px #00F0FF',
        }} />
      </div>

      <style>{`
        @keyframes trophyBounce {
          0%   { transform: scale(0.4) rotate(-20deg); }
          70%  { transform: scale(1.2) rotate(6deg); }
          100% { transform: scale(1) rotate(0deg); }
        }
        @keyframes toast-drain {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  )
}
