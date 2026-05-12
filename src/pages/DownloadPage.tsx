import { useState, useCallback } from 'react'
import { useSearch } from '@tanstack/react-router'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { glassToast as toast } from '@/components/ui/GlassToast'
import { useMod, useComments, useIncrementDownload } from '@/hooks/useDb'
import { db } from '@/lib/firebase'
import { Cipher } from '@/lib/cipher'
import { ModHero } from '@/components/download/ModHero'
import { CommentSection } from '@/components/download/CommentSection'
import { TrendingCarousel } from '@/components/download/TrendingCarousel'

import { getFingerprint, generateUUID } from '@/lib/fingerprint'

const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000

function isValidUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str)
}

export default function DownloadPage() {
  const { id } = useSearch({ from: '/download' })
  const { data: mod, isLoading } = useMod(id)
  const { data: comments, isLoading: commentsLoading } = useComments(id)
  const incrementDownload = useIncrementDownload()
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = useCallback(async () => {
    if (!mod || !id) return
    setIsDownloading(true)

    try {
      // 1. Generate fingerprint
      const fingerprint = getFingerprint()
      const now = Date.now()

      // 2. Get own stored token (to exclude it from active session check)
      let ownToken: string | null = null
      const existingRaw = localStorage.getItem('dg_token')
      if (existingRaw) {
        try {
          const decrypted = Cipher.decrypt(existingRaw)
          if (decrypted && isValidUUID(decrypted)) ownToken = decrypted
        } catch {
          // corrupted token — ignore
        }
      }

      // 3. Run all read checks in parallel (banned + rate limit + active sessions + hourly cap)
      const [bannedSnap, rlSnap, activeSnap, hourSnap] = await Promise.all([
        db.ref(`/Config/Banned/${fingerprint}`).once('value'),
        db.ref(`/RateLimit/${fingerprint}_${id}`).once('value'),
        db.ref('/SecureSessions').orderByChild('fingerprint').equalTo(fingerprint).once('value').catch(() => null),
        db.ref('/Stats/hourlyDownloads').once('value').catch(() => null),
      ])

      // 3a. Banned check
      if (bannedSnap.exists()) {
        toast.error('Your device has been blocked. Contact support.')
        setIsDownloading(false)
        return
      }

      // 3b. Rate limit check
      const rlKey = `${fingerprint}_${id}`
      const rlData = rlSnap.val() as { timestamps?: number[] } | null
      const timestamps: number[] = (rlData?.timestamps || []).filter(
        (t: number) => now - t < RATE_WINDOW_MS
      )
      if (timestamps.length >= RATE_LIMIT) {
        const oldest = Math.min(...timestamps)
        const resetIn = Math.ceil((oldest + RATE_WINDOW_MS - now) / 60000)
        toast.error(`Rate limit reached. Try again in ${resetIn} minute${resetIn !== 1 ? 's' : ''}.`)
        setIsDownloading(false)
        return
      }

      // 3c. Active session check — exclude own previous token
      if (activeSnap) {
        const active = activeSnap.val()
        if (active) {
          const hasActive = Object.entries(active as Record<string, any>).some(
            ([tokenId, s]: [string, any]) =>
              tokenId !== ownToken &&
              s.used === false &&
              (now - s.timestamp) / 1000 < 900
          )
          if (hasActive) {
            toast.error('An active session already exists. Please wait before retrying.')
            setIsDownloading(false)
            return
          }
        }
      }

      // 3d. Hourly download cap
      if (hourSnap) {
        const hourlyData = hourSnap.val() as { count: number; resetAt: number } | null
        const hourlyCount = hourlyData && now < hourlyData.resetAt ? hourlyData.count : 0
        if (hourlyCount >= 500) {
          toast.error('Server busy. Please try again later.')
          setIsDownloading(false)
          return
        }
        await db.ref('/Stats/hourlyDownloads').set({
          count: hourlyCount + 1,
          resetAt: hourlyData && now < hourlyData.resetAt ? hourlyData.resetAt : now + 3600000,
        }).catch(() => {})
      }

      // 4. Attempt count (local)
      const attemptKey = `dg_attempts_${fingerprint}`
      const attemptRaw = localStorage.getItem(attemptKey)
      const attemptData = attemptRaw ? JSON.parse(attemptRaw) : { count: 0, resetAt: now + 3600000 }
      if (now > attemptData.resetAt) {
        attemptData.count = 0
        attemptData.resetAt = now + 3600000
      }
      if (attemptData.count >= 10) {
        toast.error('Too many attempts. Try again in 1 hour.')
        setIsDownloading(false)
        return
      }
      attemptData.count++
      localStorage.setItem(attemptKey, JSON.stringify(attemptData))

      // 5. Delete own old session from Firebase (now safe — check already passed)
      if (ownToken) {
        db.ref(`/SecureSessions/${ownToken}`).remove().catch(() => {})
      }

      // 6. Generate new token and store locally
      const token = generateUUID()
      localStorage.setItem('dg_token', Cipher.encrypt(token))

      // 7. Write new session + update rate limit in parallel
      await Promise.all([
        db.ref(`/SecureSessions/${token}`).set({
          fingerprint,
          megaLink: mod.megaUrl || mod.downloadUrl,
          timestamp: now,
          used: false,
          modId: id,
          modVersion: mod.version,
        }),
        db.ref(`/RateLimit/${rlKey}`).set({
          timestamps: [...timestamps, now],
        }),
      ])

      // 8. Increment download counter
      await incrementDownload.mutateAsync(id)

      // 9. Redirect
      window.location.href = mod.shortnerlink || `/unlock?v=${mod.version}&t=${Date.now()}`

    } catch {
      toast.error('Failed to prepare download. Try again.')
      setIsDownloading(false)
    }
  }, [mod, id, incrementDownload])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#FF4500] animate-spin" />
      </div>
    )
  }

  if (!mod) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <h2 className="text-xl font-bold text-[#E2E8F0]">Mod Not Found</h2>
        <p className="text-sm text-[#64748b]">The requested mod does not exist.</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      <div className="bg-glow-top" />
      <div className="cyber-grid" />
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 relative z-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748b] hover:text-[#FF4500] transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <ModHero mod={mod} onDownload={handleDownload} isDownloading={isDownloading} />
        <CommentSection modId={id!} comments={comments ?? []} isLoading={commentsLoading} />
        <TrendingCarousel currentModId={id} />
      </div>
    </div>
  )
}
