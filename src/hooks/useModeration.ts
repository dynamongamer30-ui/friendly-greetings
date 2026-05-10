/**
 * Comment moderation hooks (admin-only).
 * Kept separate from useDb.ts to avoid touching existing data layer.
 */
import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { db, auth } from '@/lib/firebase'
import type { Comment, Reply } from '@/types/mod'

export type ModeratedComment = Comment & { modId: string }

/** Admin: real-time list of ALL comments (approved + pending) across every mod */
export function useAllComments() {
  const [data, setData] = useState<ModeratedComment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const ref = db.ref('/Comments')
    const handler = ref.on('value', (snap) => {
      const raw = snap.val() as Record<string, Record<string, Comment>> | null
      if (!raw) { setData([]); setIsLoading(false); return }
      const out: ModeratedComment[] = []
      for (const [modId, byId] of Object.entries(raw)) {
        for (const c of Object.values(byId)) {
          out.push({ ...(c as Comment), modId })
        }
      }
      out.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
      setData(out)
      setIsLoading(false)
    })
    return () => ref.off('value', handler)
  }, [])

  return { data, isLoading }
}

/** Admin: approve a pending comment (sets approved: true) */
export function useApproveComment() {
  return useMutation({
    mutationFn: async ({ modId, commentId }: { modId: string; commentId: string }) => {
      if (!auth.currentUser) throw new Error('Not authenticated')
      await db.ref(`/Comments/${modId}/${commentId}`).update({ approved: true })
    },
  })
}

/** Admin: reject — deletes the comment document */
export function useRejectComment() {
  return useMutation({
    mutationFn: async ({ modId, commentId }: { modId: string; commentId: string }) => {
      if (!auth.currentUser) throw new Error('Not authenticated')
      await db.ref(`/Comments/${modId}/${commentId}`).remove()
    },
  })
}

/** Admin: hard delete a comment regardless of approval state */
export function useDeleteComment() {
  return useMutation({
    mutationFn: async ({ modId, commentId }: { modId: string; commentId: string }) => {
      if (!auth.currentUser) throw new Error('Not authenticated')
      await db.ref(`/Comments/${modId}/${commentId}`).remove()
    },
  })
}

/** Real-time list of replies for a single comment */
export function useReplies(modId: string | undefined, commentId: string | undefined) {
  const [data, setData] = useState<Reply[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!modId || !commentId) { setIsLoading(false); return }
    const ref = db.ref(`/Comments/${modId}/${commentId}/replies`)
    const handler = ref.on('value', (snap) => {
      const raw = snap.val() as Record<string, Reply> | null
      const list: Reply[] = raw ? Object.values(raw) : []
      list.sort((a, b) => (a.createdAt ?? '').localeCompare(b.createdAt ?? ''))
      setData(list)
      setIsLoading(false)
    })
    return () => ref.off('value', handler)
  }, [modId, commentId])

  return { data, isLoading }
}

/** Admin-only: post a reply to a comment (auto-ID via push) */
export function useAddReply() {
  return useMutation({
    mutationFn: async ({ modId, commentId, content }: { modId: string; commentId: string; content: string }) => {
      if (!auth.currentUser) throw new Error('Not authenticated')
      const ref = db.ref(`/Comments/${modId}/${commentId}/replies`).push()
      const id = ref.key as string
      const reply: Reply = {
        id,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      }
      await ref.set(reply)
      return reply
    },
  })
}

/** Admin-only: delete a reply from a comment */
export function useDeleteReply() {
  return useMutation({
    mutationFn: async ({ modId, commentId, replyId }: { modId: string; commentId: string; replyId: string }) => {
      if (!auth.currentUser) throw new Error('Not authenticated')
      await db.ref(`/Comments/${modId}/${commentId}/replies/${replyId}`).remove()
    },
  })
}
