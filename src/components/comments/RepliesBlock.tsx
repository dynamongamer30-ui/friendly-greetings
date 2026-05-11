import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Reply as ReplyIcon, Trash2 } from 'lucide-react'
import { auth } from '@/lib/firebase'
import { glassToast as toast } from '@/components/ui/GlassToast'
import { useReplies, useAddReply, useDeleteReply } from '@/hooks/useModeration'

interface RepliesBlockProps {
  modId: string
  commentId: string
}

function formatDate(iso: string) {
  try { return new Date(iso).toLocaleString() } catch { return iso }
}

export function RepliesBlock({ modId, commentId }: RepliesBlockProps) {
  const { data: replies } = useReplies(modId, commentId)
  const addReply = useAddReply()
  const deleteReply = useDeleteReply()
  const [content, setContent] = useState('')
  const [showInput, setShowInput] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const isAdmin = !!auth.currentUser

  const handleSubmit = async () => {
    const trimmed = content.trim()
    if (!trimmed) return
    try {
      await addReply.mutateAsync({ modId, commentId, content: trimmed })
      setContent('')
      setShowInput(false)
      toast.success('Reply posted')
    } catch {
      toast.error('Failed to post reply')
    }
  }

  const handleDelete = async (replyId: string) => {
    setDeletingId(replyId)
    try {
      await deleteReply.mutateAsync({ modId, commentId, replyId })
      toast.success('Reply deleted')
    } catch {
      toast.error('Failed to delete reply')
    } finally {
      setDeletingId(null)
    }
  }

  if (replies.length === 0 && !isAdmin) return null

  return (
    <div className="reply-block mt-3 ml-4 pl-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <AnimatePresence initial={false}>
        {replies.map((r) => (
          <motion.div
            key={r.id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="py-2">
              <div className="flex items-center gap-2 mb-1 justify-between">
                <div className="flex items-center gap-2">
                  <span className="reply-admin-badge text-[10px] font-bold uppercase tracking-wider">
                    Admin
                  </span>
                  <span className="text-[10px] text-[#475569] font-mono">{formatDate(r.createdAt)}</span>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(r.id)}
                    disabled={deletingId === r.id}
                    title="Delete reply"
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#EF4444] hover:text-[#f87171] transition-colors disabled:opacity-40 px-1.5 py-0.5 rounded-md hover:bg-[rgba(239,68,68,0.1)]"
                  >
                    {deletingId === r.id
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <Trash2 className="w-3 h-3" />}
                    Delete Reply
                  </button>
                )}
              </div>
              <p className="text-xs text-[#94a3b8] break-words leading-relaxed">{r.content}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {isAdmin && (
        <div className="pt-2">
          {!showInput ? (
            <button
              onClick={() => setShowInput(true)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#FF4500] hover:text-[#F59E0B] transition-colors"
            >
              <ReplyIcon className="w-3 h-3" /> Reply as Admin
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
                placeholder="Write a reply…"
                className="cmt-input flex-1 text-xs"
                maxLength={400}
              />
              <button
                onClick={handleSubmit}
                disabled={addReply.isPending || !content.trim()}
                className="btn-primary px-3 py-2 text-[11px] disabled:opacity-40"
              >
                {addReply.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                Submit
              </button>
              <button
                onClick={() => { setShowInput(false); setContent('') }}
                className="btn-ghost px-2 py-2 text-[11px]"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
