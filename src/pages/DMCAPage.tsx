import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Shield, Loader2, CheckCircle2 } from 'lucide-react'
import { glassToast as toast } from '@/components/ui/GlassToast'
import { useSubmitDmca } from '@/hooks/useDb'

export default function DMCAPage() {
  const submitDmca = useSubmitDmca()
  const [submitted, setSubmitted] = useState(false)

  const [name, setName] = useState('')
  const [email] = useState('yugvadecha30@gmail.com')
  const [modId, setModId] = useState('')
  const [reason, setReason] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !reason.trim()) {
      toast.error('Please fill in all required fields.')
      return
    }

    try {
      await submitDmca.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        modId: modId.trim(),
        reason: reason.trim(),
      })
      setSubmitted(true)
    } catch {
      toast.error('Failed to submit DMCA request.')
    }
  }

  return (
    <div className="min-h-screen relative">
      <div className="bg-glow-top" />
      <div className="cyber-grid" />

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 relative z-10">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#64748b] hover:text-[#00F0FF] transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.15)] flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#EF4444]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#E2E8F0]">DMCA Takedown</h1>
        </div>

        {submitted ? (
          <div className="glass-panel p-10 text-center space-y-4 animate-fade-in">
            <CheckCircle2 className="w-12 h-12 text-[#22C55E] mx-auto" />
            <h2 className="text-lg font-bold text-[#E2E8F0]">Request Submitted</h2>
            <p className="text-sm text-[#64748b]">
              Your DMCA takedown request has been received. We will review it and respond within 48 hours.
            </p>
            <Link to="/" className="btn-ghost inline-flex text-xs mt-4">
              Return Home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 space-y-5">
            <p className="text-sm text-[#94a3b8]">
              If you believe any content on this site infringes your copyright, please fill out the form below.
            </p>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Full Name <span className="text-[#EF4444]">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="cmt-input"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email — pre-filled, hidden from public */}

            {/* Mod ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Mod ID <span className="text-[#475569]">(optional)</span>
              </label>
              <input
                type="text"
                value={modId}
                onChange={(e) => setModId(e.target.value)}
                className="cmt-input"
                placeholder="e.g. mod_abc123"
              />
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Reason <span className="text-[#EF4444]">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="cmt-input resize-none"
                rows={5}
                placeholder="Describe which content infringes and why..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitDmca.isPending}
              className="btn-primary btn-ripple w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitDmca.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                'Submit DMCA Request'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
