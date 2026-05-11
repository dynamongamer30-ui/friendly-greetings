import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { glassToast as toast } from '@/components/ui/GlassToast'
import { useTutorial, useUpdateTutorial } from '@/hooks/useDb'

export function TutorialTab() {
  const { data: tutorial, isLoading } = useTutorial()
  const updateTutorial = useUpdateTutorial()

  const [title, setTitle] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [script, setScript] = useState('')

  useEffect(() => {
    if (!tutorial) return
    setTitle(tutorial.title || '')
    // Convert videoId back to a full URL for display
    setVideoUrl(
      tutorial.videoId
        ? `https://www.youtube.com/watch?v=${tutorial.videoId}`
        : ''
    )
    setScript(tutorial.script || '')
  }, [tutorial])

  const handleSave = async () => {
    try {
      // Extract video ID from full YouTube URL
      const videoId =
        videoUrl.trim().match(
          /(?:embed\/|watch\?v=|youtu\.be\/)([^&?\s]+)/
        )?.[1] || ''

      await updateTutorial.mutateAsync({
        title,
        videoId,
        script,
      })
      toast.success('Tutorial saved')
    } catch {
      toast.error('Failed to save tutorial')
    }
  }

  if (isLoading) {
    return (
      <div className="glass-panel p-5 sm:p-6 space-y-3 max-w-2xl">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="admin-skel" />)}
      </div>
    )
  }

  return (
    <div className="glass-panel p-5 sm:p-6 space-y-6 max-w-2xl">
      {/* Title */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
          Tutorial Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="cmt-input"
          placeholder="How to install mods"
        />
      </div>

      {/* YouTube URL */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
          YouTube Video URL
        </label>
        <input
          type="text"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="cmt-input"
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p className="text-[10px] text-[#475569]">
          Paste the full YouTube URL — the video ID will be extracted automatically.
        </p>
      </div>

      {/* Script (HTML content) */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
          Tutorial Content (HTML)
        </label>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          className="cmt-input resize-none font-mono text-xs"
          rows={12}
          placeholder="<h2>Step 1</h2><p>Download the mod file...</p>"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={updateTutorial.isPending}
        className="btn-primary btn-ripple disabled:opacity-50"
      >
        {updateTutorial.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        Save Tutorial
      </button>
    </div>
  )
}
