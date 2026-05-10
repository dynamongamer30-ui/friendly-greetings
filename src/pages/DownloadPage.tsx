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

      // 2a. Check if fingerprint is banned
      const bannedSnap = await db.ref(`/Config/Banned/${fingerprint}`).once('value')
      if (bannedSnap.exists()) {
        toast.error('Your device has been blocked. Contact support.')
        setIsDownloading(false)
        return
      }

      // 2b. Check rate limit per mod per device
      const rlKey = `${fingerprint}_${id}`
      const rlSnap = await db.ref(`/RateLimit/${rlKey}`).once('value')
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

      // 3. Delete any existing active session for this device
      const existingRaw = localStorage.getItem('dg_token')
      if (existingRaw) {
        try {
          const existingToken = Cipher.decrypt(existingRaw)
          if (existingToken && isValidUUID(existingToken)) {
            await db.ref(`/SecureSessions/${existingToken}`).remove()
          }
        } catch {
          // ignore if already deleted
        }
      }

      // Also block if fingerprint already has an active session in Firebase
      try {
        const activeSessions = await db.ref('/SecureSessions').orderByChild('fingerprint').equalTo(fingerprint).once('value')
        const active = activeSessions.val()
        if (active) {
          const hasActive = Object.values(active as Record<string, any>).some(
            (s: any) => s.used === false && (Date.now() - s.timestamp) / 1000 < 900
          )
          if (hasActive) {
            toast.error('An active session already exists. Please wait before retrying.')
            setIsDownloading(false)
            return
          }
        }
      } catch {
        // index not configured — skip this check
      }

      // 4a. Global hourly download cap
      try {
        const hourSnap = await db.ref('/Stats/hourlyDownloads').once('value')
        const hourlyData = hourSnap.val() as { count: number; resetAt: number } | null
        const hourlyCount = hourlyData && now < hourlyData.resetAt ? hourlyData.count : 0
        if (hourlyCount >= 500) {
          toast.error('Server busy. Please try again later.')
          setIsDownloading(false)
          return
        }
        await db.ref('/Stats/hourlyDownloads').set({
          count: hourlyCount + 1,
          resetAt: hourlyData && now < hourlyData.resetAt ? hourlyData.resetAt : now + 3600000
        })
      } catch {
        // Stats not configured — skip
      }

      // 4c. Check unlock attempt count
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

      // 4d. Generate new UUID token
      const token = generateUUID()

      // 5. Store token + fingerprint in browser
      localStorage.setItem('dg_token', Cipher.encrypt(token))

      // 6. Write new SecureSession
      await db.ref(`/SecureSessions/${token}`).set({
        fingerprint,
        megaLink: mod.megaUrl || mod.downloadUrl,
        timestamp: now,
        used: false,
        modId: id,
        modVersion: mod.version,
      })

      // 7. Update rate limit timestamps
      await db.ref(`/RateLimit/${rlKey}`).set({
        timestamps: [...timestamps, now],
      })

      // 8. Increment download counter
      await incrementDownload.mutateAsync(id)

      // 9. Redirect to shortener
      window.location.href = mod.shortnerlink || `/unlock?v=${mod.version}&t=${Date.now()}`

    } catch {
      toast.error('Failed to prepare download. Try again.')
      setIsDownloading(false)
    }
  }, [mod, id, incrementDownload])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00F0FF] animate-spin" />
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
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748b] hover:text-[#00F0FF] transition-colors uppercase tracking-wider"
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
