import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { NeonSpinner } from '@/components/ui/NeonSpinner'
import { EmptyState } from '@/components/ui/EmptyState'
import { glassToast as toast } from '@/components/ui/GlassToast'
import { useMods } from '@/hooks/useDb'
import {
  useAllComments,
  useApproveComment,
  useRejectComment,
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

export function CommentsTab() {
  const { data: mods } = useMods()
  const { data: comments, isLoading } = useAllComments()
  const approve = useApproveComment()
  const reject = useRejectComment()

  const modTitleById = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of mods) map.set(m.id, m.title)
    return map
  }, [mods])

  const grouped = useMemo(() => {
    const m = new Map<string, ModeratedComment[]>()
    for (const c of comments) {
      const arr = m.get(c.modId) ?? []
      arr.push(c)
      m.set(c.modId, arr)
    }
    return m
  }, [comments])

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-[#64748b] gap-2">
        <NeonSpinner size={20} /> Loading comments…
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <EmptyState message="No comments yet." />
    )
  }

  return (
    <div className="space-y-8">
      {Array.from(grouped.entries()).map(([modId, list]) => (
        <section key={modId} className="space-y-3">
          <h3 className="text-sm font-bold text-[#00F0FF] uppercase tracking-wider">
            {modTitleById.get(modId) || modId}
            <span className="ml-2 text-[#64748b] normal-case font-medium">
              ({list.length})
            </span>
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
                  {pending && (
                    <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full bg-[rgba(148,163,184,0.12)] border border-[rgba(148,163,184,0.25)] text-[#94a3b8]">
                      Pending Review
                    </span>
                  )}
                  <div className="flex items-start gap-3 pr-28">
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
                  <div className="flex items-center justify-end gap-2 mt-4">
                    {pending && (
                      <button
                        onClick={() => handleApprove(c)}
                        disabled={approve.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.30)] text-[#22C55E] hover:bg-[rgba(34,197,94,0.18)] transition-colors disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                    )}
                    <button
                      onClick={() => handleReject(c)}
                      disabled={reject.isPending}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[rgba(239,68,68,0.10)] border border-[rgba(239,68,68,0.28)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.18)] transition-colors disabled:opacity-50"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
