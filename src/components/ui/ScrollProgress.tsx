import { useEffect, useState } from 'react'

export function ScrollProgress() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement
      const scrolled = el.scrollTop
      const total = el.scrollHeight - el.clientHeight
      setPct(total > 0 ? (scrolled / total) * 100 : 0)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] transition-all duration-75"
      style={{
        width: `${pct}%`,
        background: 'linear-gradient(90deg, #00F0FF, #a855f7, #00F0FF)',
        backgroundSize: '200% 100%',
        animation: 'gradientShift 2s linear infinite',
        boxShadow: '0 0 10px rgba(0,240,255,0.8), 0 0 20px rgba(168,85,247,0.4)',
      }}
    />
  )
}
