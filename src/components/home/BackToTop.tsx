import { useState, useEffect } from 'react'
import { ArrowUp } from 'lucide-react'

export function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-xl bg-[rgba(34,211,238,0.1)] border border-[rgba(34,211,238,0.2)] text-[#22D3EE] flex items-center justify-center hover:bg-[rgba(34,211,238,0.2)] backdrop-blur-sm shadow-lg shadow-[rgba(34,211,238,0.1)]"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1) translateY(0)' : 'scale(0.6) translateY(20px)',
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.35s cubic-bezier(0.34,1.56,0.64,1), transform 0.35s cubic-bezier(0.34,1.56,0.64,1), background-color 0.2s ease',
      }}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  )
}
