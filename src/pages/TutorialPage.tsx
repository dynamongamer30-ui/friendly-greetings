import { Link } from '@tanstack/react-router'
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react'
import DOMPurify from 'dompurify'
import { useTutorial } from '@/hooks/useDb'

export default function TutorialPage() {
  const { data: tutorial, isLoading } = useTutorial()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00F0FF] animate-spin" />
      </div>
    )
  }

  const title = tutorial?.title || 'Tutorial'
  const videoId = tutorial?.videoId || ''
  const script = tutorial?.script || ''

  return (
    <div className="min-h-screen relative">
      <div className="bg-glow-top" />
      <div className="cyber-grid" />

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 relative z-10">
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
          <div className="w-10 h-10 rounded-xl bg-[rgba(0,240,255,0.08)] border border-[rgba(0,240,255,0.15)] flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-[#00F0FF]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#E2E8F0]">{title}</h1>
        </div>

        {/* Video embed */}
        {videoId && (
          <div className="glass-panel overflow-hidden">
            <div className="video-wrap">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Written guide */}
        {script && (
          <div className="glass-panel p-6 sm:p-8">
            <h2 className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider mb-4">
              Written Guide
            </h2>
            <div
              className="prose prose-invert prose-sm max-w-none text-[#94a3b8] [&_a]:text-[#00F0FF] [&_a]:underline [&_h1]:text-[#E2E8F0] [&_h2]:text-[#E2E8F0] [&_h3]:text-[#E2E8F0] [&_strong]:text-[#E2E8F0] [&_code]:text-[#00F0FF] [&_code]:bg-[rgba(0,240,255,0.08)] [&_code]:px-1 [&_code]:rounded"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(script),
              }}
            />
          </div>
        )}

        {/* Empty state */}
        {!videoId && !script && (
          <div className="glass-panel p-12 text-center">
            <BookOpen className="w-10 h-10 text-[#475569] mx-auto mb-3" />
            <p className="text-sm text-[#64748b]">No tutorial content available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
