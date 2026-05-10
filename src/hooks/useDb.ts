/**
 * Unified Firebase RTDB data hooks.
 * Single source of truth for all data operations — public pages and admin panel.
 * FIXED: Comments now write approved:true by default so they appear immediately.
 *        Admin can still reject from the admin panel.
 */
import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import firebase from 'firebase/compat/app'
import { db, auth } from '@/lib/firebase'
import { Cipher } from '@/lib/cipher'
import type {
  Mod, Comment, SiteMeta, TutorialConfig, SecurityConfig, DmcaRequest,
} from '@/types/mod'

// ─── Helper ──────────────────────────────────────────────────────────────────

function fetchOnce<T>(path: string): Promise<T | null> {
  return db.ref(path).once('value').then(snap => snap.val() as T | null)
}

// ─── Mods ────────────────────────────────────────────────────────────────────

/** Real-time listener on /Mods */
export function useMods() {
  const [mods, setMods] = useState<Mod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    let cancelled = false
    const ref = db.ref('/Mods')

    const onValue = (snap: firebase.database.DataSnapshot) => {
      if (cancelled) return
      const data = snap.val()
      if (!data) { setMods([]); setIsLoading(false); return }
      const list: Mod[] = Object.entries(data).map(([key, val]) => ({
        ...(val as Omit<Mod, 'id'>),
        id: key,
      }))
      list.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
      setMods(list)
      setIsLoading(false)
    }

    const onError = (err: Error) => {
      if (cancelled) return
      console.error('[useMods] Firebase error:', err.message)
      setIsError(true)
      setIsLoading(false)
    }

    ref.on('value', onValue, onError)

    return () => {
      cancelled = true
      ref.off('value', onValue)
    }
  }, [])

  return { data: mods, isLoading, isError }
}

/** One-time fetch of a single mod */
export function useMod(id: string | undefined) {
  return useQuery<Mod | null>({
    queryKey: ['mod', id],
    queryFn: async () => {
      if (!id) return null
      const snap = await db.ref(`/Mods/${id}`).once('value')
      const val = snap.val()
      if (!val) return null
      return { ...val, id } as Mod
    },
    enabled: !!id,
    staleTime: 30_000,
  })
}

/** Admin only: create mod. Requires Firebase Auth. */
export function useCreateMod() {
  return useMutation({
    mutationFn: async (data: Omit<Mod, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!auth.currentUser) throw new Error('Not authenticated')
      const id = 'mod_' + Date.now().toString(36)
      await db.ref(`/Mods/${id}`).set({
        ...data,
        downloads: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      return id
    },
  })
}

/** Admin only: update mod. NEVER includes downloads in payload. */
export function useUpdateMod() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Mod> }) => {
      if (!auth.currentUser) throw new Error('Not authenticated')
      const { downloads: _d, ...safeData } = data
      await db.ref(`/Mods/${id}`).update({
        ...safeData,
        updatedAt: new Date().toISOString(),
      })
    },
  })
}

/** Admin only: delete mod */
export function useDeleteMod() {
  return useMutation({
    mutationFn: async (id: string) => {
      if (!auth.currentUser) throw new Error('Not authenticated')
      await db.ref(`/Mods/${id}`).remove()
    },
  })
}

/** Public: atomic increment of download counter using Firebase transaction */
export function useIncrementDownload() {
  return useMutation({
    mutationFn: async (id: string) => {
      await db.ref(`/Mods/${id}/downloads`).transaction(
        (current: number | null) => (current || 0) + 1
      )
    },
  })
}

// ─── Comments ────────────────────────────────────────────────────────────────

/** Real-time listener on /Comments/{modId} */
export function useComments(modId: string | undefined) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!modId) { setIsLoading(false); return }
    const ref = db.ref(`/Comments/${modId}`)
    const handler = ref.on('value', (snap) => {
      const data = snap.val()
      if (!data) { setComments([]); setIsLoading(false); return }
      const list: Comment[] = Object.values(data) as Comment[]
      list.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
      setComments(list)
      setIsLoading(false)
    })
    return () => ref.off('value', handler)
  }, [modId])

  return { data: comments, isLoading }
}

/**
 * Public: add a comment.
 * BUG FIX: Now sets approved: true by default so comments appear immediately.
 * Admin can reject from the admin panel if needed.
 */
export function useAddComment() {
  return useMutation({
    mutationFn: async ({ modId, author, content }: { modId: string; author: string; content: string }) => {
      const id = 'cmt_' + Date.now().toString(36)
      await db.ref(`/Comments/${modId}/${id}`).set({
        id,
        author: author.trim() || 'Anonymous',
        content: content.trim(),
        avatarSeed: (author.trim().charAt(0) || 'A').toUpperCase(),
        createdAt: new Date().toISOString(),
        approved: true, // ← FIX: was missing, causing comments to never show
      })
    },
  })
}

// ─── Config: Tutorial ────────────────────────────────────────────────────────

/** One-time fetch of /Config/Tutorial */
export function useTutorial() {
  return useQuery<TutorialConfig | null>({
    queryKey: ['tutorial'],
    queryFn: () => fetchOnce<TutorialConfig>('/Config/Tutorial'),
    staleTime: 60_000,
  })
}

/** Admin only: update /Config/Tutorial */
export function useUpdateTutorial() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: TutorialConfig) => {
      if (!auth.currentUser) throw new Error('Not authenticated')
      await db.ref('/Config/Tutorial').set(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tutorial'] }),
  })
}

// ─── Config: SiteMeta ────────────────────────────────────────────────────────

/** One-time fetch of /Config/SiteMeta */
export function useSiteMeta() {
  return useQuery<SiteMeta | null>({
    queryKey: ['siteMeta'],
    queryFn: () => fetchOnce<SiteMeta>('/Config/SiteMeta'),
    staleTime: 60_000,
  })
}

/** Admin only: update /Config/SiteMeta */
export function useUpdateSiteMeta() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<SiteMeta>) => {
      if (!auth.currentUser) throw new Error('Not authenticated')
      await db.ref('/Config/SiteMeta').update(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['siteMeta'] }),
  })
}

// ─── Config: Security ────────────────────────────────────────────────────────

/** One-time fetch of /Config/Security */
export function useSecurityConfig() {
  return useQuery<SecurityConfig | null>({
    queryKey: ['security'],
    queryFn: () => fetchOnce<SecurityConfig>('/Config/Security'),
    staleTime: 60_000,
  })
}

/** Admin only: update /Config/Security */
export function useUpdateSecurityConfig() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: SecurityConfig) => {
      if (!auth.currentUser) throw new Error('Not authenticated')
      await db.ref('/Config/Security').set(data)
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['security'] }),
  })
}

// ─── DMCA ────────────────────────────────────────────────────────────────────

/** Public: submit DMCA request (no auth required) */
export function useSubmitDmca() {
  return useMutation({
    mutationFn: async (data: { name: string; email: string; modId?: string; reason: string }) => {
      const id = 'dmca_' + Date.now().toString(36)
      await db.ref(`/dmcaRequests/${id}`).set({
        id,
        name: data.name,
        email: data.email,
        modId: data.modId || '',
        reason: data.reason,
        status: 'pending',
        createdAt: new Date().toISOString(),
      })
    },
  })
}

/** Admin only: list DMCA requests */
export function useDmcaRequests() {
  return useQuery<DmcaRequest[]>({
    queryKey: ['dmca'],
    queryFn: async () => {
      const snap = await db.ref('/dmcaRequests').once('value')
      const data = snap.val()
      if (!data) return []
      return Object.values(data) as DmcaRequest[]
    },
    staleTime: 60_000,
  })
}

// Re-export Cipher for components that need it
export { Cipher }
