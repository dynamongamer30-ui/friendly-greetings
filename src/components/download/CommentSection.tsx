import { useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import { glassToast as toast } from '@/components/ui/GlassToast'
import { useAddComment } from '@/hooks/useDb'
import { RepliesBlock } from '@/components/comments/RepliesBlock'
import { NeonSpinner } from '@/components/ui/NeonSpinner'
import { EmptyState } from '@/components/ui/EmptyState'

interface CommentSectionProps {
  modId: string
  comments: Array<{
    id: string
    author: string
    content: string
    avatarSeed: string
    createdAt: string
    approved?: boolean
  }>
  isLoading: boolean
}

/* ── Avatar colors derived from initial ──────────────────────────────────── */
const AVATAR_COLORS = [
  'rgba(255, 69, 0,0.18)',   // cyan
  'rgba(245, 158, 11,0.18)',  // purple
  'rgba(34,197,94,0.18)',   // green
  'rgba(251,146,60,0.18)',  // orange
  'rgba(244,63,94,0.18)',   // rose
  'rgba(56,189,248,0.18)',  // sky
]

function avatarColor(seed: string) {
  const code = (seed || 'A').charCodeAt(0)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

/* ════════════════════════════════════════════════════════════════════════════ */

export function CommentSection({ modId, comments, isLoading }: CommentSectionProps) {
  const visibleComments = comments.filter((c) => c.approved === true)
  const [author, setAuthor] = useState(() => localStorage.getItem('dg_cmt_name') || '')
  const [content, setContent] = useState('')
  const addComment = useAddComment()

  const handleSubmit = async () => {
    const trimmedContent = content.trim()
    if (!trimmedContent) {
      toast.error('Comment cannot be empty')
      return
    }

    try {
      await addComment.mutateAsync({
        modId,
        author: author.trim() || 'Anonymous',
        content: trimmedContent,
      })
      if (author.trim()) localStorage.setItem('dg_cmt_name', author.trim())
      setContent('')
      toast.success('Comment posted!')
    } catch {
      toast.error('Failed to post comment')
    }
  }

  return (
    <section className="space-y-5">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm font-semibold text-[#FF4500] uppercase tracking-wider">
        <MessageSquare className="w-4 h-4" />
        Comments
        {visibleComments.length > 0 && (
          <span className="tag tag-c ml-1">{visibleComments.length}</span>
        )}
      </div>

      {/* ── Compose ───────────────────────────────────────────────────────── */}
      <div className="glass-panel p-4 sm:p-5 space-y-3">
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Your name (optional)"
          className="cmt-input"
          maxLength={40}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts…"
          rows={3}
          className="cmt-input resize-none"
          maxLength={500}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-[#475569]">
            {content.length}/500
          </span>
          <button
            onClick={handleSubmit}
            disabled={addComment.isPending || !content.trim()}
            className="btn-primary btn-ripple px-5 py-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {addComment.isPending ? (
              <NeonSpinner size={14} />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            Post
          </button>
        </div>
      </div>

      {/* ── Comment list ──────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="shimmer w-9 h-9 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="shimmer h-3 w-24 rounded" />
                <div className="shimmer h-3 w-full rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : visibleComments.length === 0 ? (
        <EmptyState
          message={
            <>
              No comments yet — be the first!
              <span className="block mt-2 text-[10px] text-[#475569]">
                New comments are reviewed before appearing.
              </span>
            </>
          }
        />
      ) : (
        <div className="space-y-1">
          {visibleComments.map((cmt, idx) => (
            <motion.div
              key={cmt.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.03] transition-colors"
            >
              {/* Avatar initial */}
              <div
                className="cmt-avatar w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border border-white/10"
                style={{ background: avatarColor(cmt.avatarSeed) }}
              >
                <span className="text-white/80">{cmt.avatarSeed || '?'}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white">{cmt.author}</span>
                  <span className="text-[10px] text-[#475569] font-mono">
                    {relativeTime(cmt.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-[#94a3b8] mt-0.5 break-words leading-relaxed">
                  {cmt.content}
                </p>
                <RepliesBlock modId={modId} commentId={cmt.id} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
