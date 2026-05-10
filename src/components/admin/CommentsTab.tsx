import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Trash2 } from 'lucide-react'
import { NeonSpinner } from '@/components/ui/NeonSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { glassToast as toast } from '@/components/ui/GlassToast'
import { useMods } from '@/hooks/useDb'
import {
  useAllComments,
  useApproveComment,
  useRejectComment,
  useDeleteComment,
  type ModeratedComment,
} from '@/hooks/useModeration'
import { RepliesBlock } from '@/components/comments/RepliesBlock'

const AVATAR_COLORS = [
  'rgba(0,240,255,0.18)',
  'rgba(123,47,255,0.18)',
  'rgba(34,197,94,0.18)',
  'rgba(251,146,60,0.18)',
  'rgba(244,63,94,0.18)',
  'rgba(56,189,248,0.18)',
]
function avatarColor(seed: string) {
  const code = (seed || 'A').charCodeAt(0)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}
function formatDate(iso: string) {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

type FilterId = 'pending' | 'approved' | 'all'

export function CommentsTab() {
  const { data: mods } = useMods()
  const { data: comments, isLoading } = useAllComments()
  const approve = useApproveComment()
  const reject = useRejectComment()
  const del = useDeleteComment()
  const [filter, setFilter] = useState<FilterId>('pending')

  const modTitleById = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of mods) map.set(m.id, m.title)
    return map
  }, [mods])

  const counts = useMemo(() => {
    let pending = 0, approved = 0
    for (const c of comments) {
      if (c.approved === true) approved++
      else pending++
    }
    return { pending, approved, all: comments.length }
  }, [comments])

  const filtered = useMemo(() => {
    if (filter === 'pending') return comments.filter((c) => c.approved !== true)
    if (filter === 'approved') return comments.filter((c) => c.approved === true)
    return comments
  }, [comments, filter])

  const grouped = useMemo(() => {
    const m = new Map<string, ModeratedComment[]>()
    for (const c of filtered) {
      const arr = m.get(c.modId) ?? []
      arr.push(c)
      m.set(c.modId, arr)
    }
    return m
  }, [filtered])

  const handleApprove = async (c: ModeratedComment) => {
    try {
      await approve.mutateAsync({ modId: c.modId, commentId: c.id })
      toast.success('Comment approved')
    } catch { toast.error('Failed to approve') }
  }

  const handleReject = async (c: ModeratedComment) => {
    try {
      await reject.mutateAsync({ modId: c.modId, commentId: c.id })
      toast.success('Comment rejected')
    } catch { toast.error('Failed to reject') }
  }

  const handleDelete = async (c: ModeratedComment) => {
    if (!window.confirm('Permanently delete this comment? This cannot be undone.')) return
    try {
      await del.mutateAsync({ modId: c.modId, commentId: c.id })
      toast.success('Comment deleted')
    } catch { toast.error('Failed to delete') }
  }

  const TABS: { id: FilterId; label: string; count: number }[] = [
    { id: 'pending', label: 'Pending', count: counts.pending },
    { id: 'approved', label: 'Approved', count: counts.approved },
    { id: 'all', label: 'All', count: counts.all },
  ]

  return (
    <div className="space-y-6">
      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {TABS.map((t) => {
          const active = filter === t.id
          return (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                active
                  ? 'bg-[rgba(0,240,255,0.12)] text-[#00F0FF] border border-[rgba(0,240,255,0.35)] shadow-[0_0_12px_rgba(0,240,255,0.18)]'
                  : 'bg-[rgba(255,255,255,0.03)] text-[#94a3b8] border border-[rgba(255,255,255,0.06)] hover:text-[#E2E8F0]'
              }`}
            >
              {t.label}
              <span className={`text-[10px] px-1.5 rounded-full ${active ? 'bg-[rgba(0,240,255,0.18)] text-[#00F0FF]' : 'bg-[rgba(255,255,255,0.06)] text-[#64748b]'}`}>
                {t.count}
              </span>
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-[#64748b] gap-2">
          <NeonSpinner size={20} /> Loading comments…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState message={
          filter === 'pending' ? 'No comments awaiting review.'
          : filter === 'approved' ? 'No approved comments yet.'
          : 'No comments yet.'
        } />
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([modId, list]) => (
            <section key={modId} className="space-y-3">
              <h3 className="text-sm font-bold text-[#00F0FF] uppercase tracking-wider">
                {modTitleById.get(modId) || modId}
                <span className="ml-2 text-[#64748b] normal-case font-medium">({list.length})</span>
              </h3>
              <div className="space-y-3">
                {list.map((c, idx) => {
                  const pending = c.approved !== true
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                      className="glass-panel relative p-4 sm:p-5"
                    >
                      <span
                        className={`absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full border ${
                          pending
                            ? 'bg-[rgba(148,163,184,0.10)] border-[rgba(148,163,184,0.25)] text-[#94a3b8]'
                            : 'bg-[rgba(34,197,94,0.10)] border-[rgba(34,197,94,0.25)] text-[#22C55E]'
                        }`}
                      >
                        {pending ? 'Pending' : 'Approved'}
                      </span>
                      <div className="flex items-start gap-3 pr-24">
                        <div
                          className="cmt-avatar w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border border-white/10"
                          style={{ background: avatarColor(c.avatarSeed) }}
                        >
                          <span className="text-white/85">{(c.avatarSeed || c.author?.[0] || '?').toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-[#E2E8F0]">{c.author}</span>
                            <span className="text-[10px] text-[#64748b] font-mono">{formatDate(c.createdAt)}</span>
                          </div>
                          <p className="text-sm text-[#94a3b8] mt-1 break-words leading-relaxed">{c.content}</p>
                          <RepliesBlock modId={c.modId} commentId={c.id} />
                        </div>
                      </div>
                      <div className="flex items-center justify-end gap-2 mt-4 flex-wrap">
                        {pending && (
                          <>
                            <button
                              onClick={() => handleApprove(c)}
                              disabled={approve.isPending}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.30)] text-[#22C55E] hover:bg-[rgba(34,197,94,0.18)] transition-colors disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(c)}
                              disabled={reject.isPending}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[rgba(148,163,184,0.10)] border border-[rgba(148,163,184,0.25)] text-[#94a3b8] hover:bg-[rgba(148,163,184,0.18)] transition-colors disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(c)}
                          disabled={del.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[rgba(239,68,68,0.10)] border border-[rgba(239,68,68,0.30)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.18)] transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
