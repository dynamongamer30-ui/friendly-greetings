import { useEffect, useRef, useState } from 'react'

export function ScrollProgress() {
  const [pct, setPct] = useState(0)
  const [scrolling, setScrolling] = useState(false)
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setPct(total > 0 ? (scrolled / total) * 100 : 0)
      setScrolling(true)
      if (stopTimer.current) clearTimeout(stopTimer.current)
      stopTimer.current = setTimeout(() => setScrolling(false), 220)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (stopTimer.current) clearTimeout(stopTimer.current)
    }
  }, [])

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] transition-all duration-75"
      style={{
        width: `${pct}%`,
        background: 'linear-gradient(90deg, #22D3EE, #a855f7, #22D3EE)',
        backgroundSize: '200% 100%',
        animation: scrolling ? 'gradientShift 2s linear infinite' : 'none',
        boxShadow: '0 0 10px rgba(34,211,238,0.8), 0 0 20px rgba(168,85,247,0.4)',
      }}
    />
  )
}
