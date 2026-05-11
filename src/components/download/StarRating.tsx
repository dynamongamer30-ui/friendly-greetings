import { useEffect, useMemo, useState } from 'react'
import { Lock } from 'lucide-react'
import confetti from 'canvas-confetti'
import { glassToast as toast } from '@/components/ui/GlassToast'
import { getFingerprint } from '@/lib/fingerprint'
import { useSubmitRating } from '@/hooks/useRatings'
import { playStarBurst } from '@/lib/sound'
import { triggerAchievement } from '@/components/ui/AchievementToast'

interface StarRatingProps { modId: string }

const LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

export function StarRating({ modId }: StarRatingProps) {
  const storageKey = `rating_${modId}`
  const [locked, setLocked] = useState<boolean>(() => !!localStorage.getItem(storageKey))
  const [savedRating, setSavedRating] = useState<number>(() => {
    const v = localStorage.getItem(storageKey)
    return v ? Number(v) || 0 : 0
  })
  const [hover, setHover] = useState(0)
  const [burst, setBurst] = useState(false)
  // Confirmation dialog state
  const [pendingRating, setPendingRating] = useState<number | null>(null)
  const submit = useSubmitRating()

  useEffect(() => {
    setLocked(!!localStorage.getItem(storageKey))
    const v = localStorage.getItem(storageKey)
    setSavedRating(v ? Number(v) || 0 : 0)
  }, [storageKey])

  const displayRating = pendingRating ?? (locked ? savedRating : hover)
  const fillPct = useMemo(() => {
    return (Math.max(0, Math.min(5, displayRating)) / 5) * 100
  }, [displayRating])

  // Handle star tap/click — open confirmation instead of submitting directly
  const handleClick = (rating: number) => {
    if (locked || submit.isPending) return
    if (localStorage.getItem(storageKey)) { setLocked(true); return }
    setPendingRating(rating)
    setHover(rating)
  }

  const handleConfirm = async () => {
    if (!pendingRating || locked) return
    const rating = pendingRating
    setPendingRating(null)
    try {
      const fp = getFingerprint()
      await submit.mutateAsync({ modId, fingerprintHash: fp, rating })
      localStorage.setItem(storageKey, String(rating))
      setSavedRating(rating)
      setLocked(true)
      setHover(0)

      setBurst(true)
      setTimeout(() => setBurst(false), 600)
      playStarBurst()
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#FF4500', '#F59E0B', '#fff'],
        scalar: 0.8,
        gravity: 1.2,
      })

      if (rating === 5) {
        triggerAchievement({ title: 'Perfect Rating!', desc: 'You gave this mod 5 stars ⭐' })
      } else {
        triggerAchievement({ title: 'Thanks for Rating!', desc: `You rated this mod ${rating} stars` })
      }

      toast.success(`Rated ${rating} ★`)
    } catch {
      toast.error('Failed to submit rating')
    }
  }

  const handleCancel = () => {
    setPendingRating(null)
    setHover(0)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {/* Stars: each star is a large touch-friendly button */}
        <div
          className="flex items-center gap-1"
          style={{
            transform: burst ? 'scale(1.18)' : 'scale(1)',
            transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }}
          role="radiogroup"
          aria-label="Rate this mod"
        >
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = n <= displayRating
            return (
              <button
                key={n}
                type="button"
                disabled={locked || submit.isPending}
                onMouseEnter={() => !locked && !pendingRating && setHover(n)}
                onMouseLeave={() => !pendingRating && setHover(0)}
                onFocus={() => !locked && !pendingRating && setHover(n)}
                onBlur={() => !pendingRating && setHover(0)}
                onClick={() => handleClick(n)}
                aria-label={`${n} star${n === 1 ? '' : 's'}`}
                aria-checked={savedRating === n}
                role="radio"
                style={{
                  // Large touch target — 44px minimum for each star
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: locked ? 'default' : 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <svg viewBox="0 0 24 24" style={{ width: 28, height: 28 }} aria-hidden="true">
                  <path
                    d="M12 2.5l2.95 5.97 6.6.96-4.78 4.65 1.13 6.57L12 17.55l-5.9 3.1 1.13-6.57L2.45 9.43l6.6-.96L12 2.5z"
                    fill={filled ? '#F59E0B' : 'none'}
                    stroke={filled ? '#F59E0B' : 'rgba(245, 158, 11,0.45)'}
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                    style={{ transition: 'fill 0.15s, stroke 0.15s' }}
                  />
                </svg>
              </button>
            )
          })}
        </div>

        {locked ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#94a3b8]">
            <Lock className="w-3.5 h-3.5" /> Your rating: {savedRating} ★
          </span>
        ) : pendingRating ? (
          <span className="text-xs text-[#F59E0B] font-semibold">{LABELS[pendingRating]}</span>
        ) : (
          <span className="text-xs text-[#64748b]">
            {hover ? LABELS[hover] : 'Tap a star to rate'}
          </span>
        )}
      </div>

      {/* Confirmation dialog */}
      {pendingRating !== null && (
        <div
          className="glass-panel p-4 space-y-3 border"
          style={{ borderColor: 'rgba(245, 158, 11,0.25)', borderRadius: 14 }}
        >
          <div className="text-sm font-semibold text-[#E2E8F0] leading-snug">
            {pendingRating === 5
              ? '🌟 You\'re giving 5 stars — amazing! Ready to submit?'
              : pendingRating === 4
              ? '⭐ 4 stars — great choice! Sure you don\'t want to go 5?'
              : `⭐ ${pendingRating} stars selected. Are you sure?`}
          </div>
          <p className="text-xs text-[#64748b]">
            Rating is permanent and can't be changed later.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirm}
              disabled={submit.isPending}
              className="btn-primary text-xs px-4 py-2 disabled:opacity-50"
            >
              {submit.isPending ? 'Submitting…' : `Yes, submit ${pendingRating} ★`}
            </button>
            <button
              onClick={handleCancel}
              className="btn-ghost text-xs px-4 py-2"
            >
              Change
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
