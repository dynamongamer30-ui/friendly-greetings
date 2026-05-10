import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { db } from '@/lib/firebase'

export function VisitorCounter() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const ref = db.ref('Stats/totalVisitors')

    // Increment only once per browser session
    if (!sessionStorage.getItem('dg_visited')) {
      ref.transaction((cur: number | null) => (cur || 0) + 1)
      sessionStorage.setItem('dg_visited', '1')
    }

    // Live listener
    ref.on('value', (snap) => setCount(snap.val() || 0))
    return () => ref.off()
  }, [])

  if (count === null) return null

  return (
    <div
      className="fixed bottom-20 right-4 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-sm"
      style={{
        background: 'rgba(10,15,20,0.85)',
        border: '1px solid rgba(0,240,255,0.15)',
        fontSize: 11,
      }}
    >
      <span style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span style={{
          position: 'absolute',
          width: 6, height: 6,
          borderRadius: '50%',
          background: '#22c55e',
          boxShadow: '0 0 6px #22c55e',
          animation: 'pulse 2s ease infinite',
        }} />
        <Users size={12} color="#00F0FF" style={{ marginLeft: 10 }} />
      </span>
      <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{count.toLocaleString()}</span>
      <span style={{ color: '#64748b' }}>visitors</span>
    </div>
  )
}
