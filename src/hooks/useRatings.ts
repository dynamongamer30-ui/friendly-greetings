/**
 * Public star-rating hooks for /Ratings/{modId}/{fingerprintHash}
 * Atomically updates /Mods/{modId}/ratingSum and /Mods/{modId}/ratingCount
 * via Firebase Realtime DB transactions (project uses RTDB, not Firestore).
 */
import { useMutation } from '@tanstack/react-query'
import { db } from '@/lib/firebase'

interface SubmitArgs {
  modId: string
  fingerprintHash: string
  rating: number
}

export function useSubmitRating() {
  return useMutation({
    mutationFn: async ({ modId, fingerprintHash, rating }: SubmitArgs) => {
      const r = Math.max(1, Math.min(5, Math.round(rating)))
      // 1) Write the per-fingerprint rating doc
      await db.ref(`/Ratings/${modId}/${fingerprintHash}`).set({
        rating: r,
        submittedAt: new Date().toISOString(),
      })
      // 2) Atomic increments via transactions
      await db.ref(`/Mods/${modId}/ratingSum`).transaction(
        (cur: number | null) => (cur || 0) + r
      )
      await db.ref(`/Mods/${modId}/ratingCount`).transaction(
        (cur: number | null) => (cur || 0) + 1
      )
      return r
    },
  })
}
