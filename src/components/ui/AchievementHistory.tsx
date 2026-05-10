import { useState } from 'react'
import { Trophy, X, Lock } from 'lucide-react'
import { ACHIEVEMENTS, getUnlocked } from '@/lib/achievements'
import { format } from 'date-fns'

export function AchievementHistory() {
  const [open, setOpen] = useState(false)
  const unlocked = getUnlocked()

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Achievements"
        className="fixed top-4 right-4 z-[9989] w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
        style={{ background: 'rgba(10,2,30,0.7)', border: '1px solid rgba(255,215,0,0.3)', color: '#FFD700' }}
      >
        <Trophy className="w-4 h-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[10001] flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.25s ease both' }}
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md max-h-[80vh] overflow-y-auto rounded-2xl p-5"
            style={{
              background: 'rgba(5,8,10,0.98)',
              border: '1px solid rgba(255,215,0,0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7), 0 0 30px rgba(255,215,0,0.15)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-[#FFD700] flex items-center gap-2">
                <Trophy className="w-5 h-5" /> Achievements
              </h2>
              <button onClick={() => setOpen(false)} className="text-[#64748b] hover:text-[#94a3b8]" data-no-click-sound="true">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-[11px] text-[#64748b] mb-4">
              {Object.keys(unlocked).length} / {ACHIEVEMENTS.length} unlocked
            </p>
            <ul className="space-y-2.5">
              {ACHIEVEMENTS.map(a => {
                const u = unlocked[a.id]
                const isLocked = !u
                return (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{
                      background: isLocked ? 'rgba(255,255,255,0.02)' : 'rgba(255,215,0,0.05)',
                      border: `1px solid ${isLocked ? 'rgba(255,255,255,0.06)' : 'rgba(255,215,0,0.2)'}`,
                      opacity: isLocked ? 0.55 : 1,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: isLocked ? 'rgba(255,255,255,0.04)' : 'rgba(255,215,0,0.15)',
                        border: `1px solid ${isLocked ? 'rgba(255,255,255,0.08)' : 'rgba(255,215,0,0.3)'}`,
                      }}
                    >
                      {isLocked
                        ? <Lock className="w-4 h-4 text-[#64748b]" />
                        : <Trophy className="w-4 h-4 text-[#FFD700]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-[#E2E8F0]" style={isLocked ? { filter: 'blur(0.4px)' } : undefined}>
                        {isLocked ? '???' : a.title}
                      </div>
                      <div className="text-[11px] text-[#94a3b8] mt-0.5">
                        {isLocked ? 'Locked — keep exploring to unlock.' : a.desc}
                      </div>
                      {!isLocked && (
                        <div className="text-[10px] text-[#FFD700] mt-1 font-mono">
                          {format(new Date(u.unlockedAt), 'MMM d, yyyy · h:mm a')}
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
