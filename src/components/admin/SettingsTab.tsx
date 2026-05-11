import { useState, useEffect } from 'react'
import { Loader2, Save } from 'lucide-react'
import { glassToast as toast } from '@/components/ui/GlassToast'
import { useSiteMeta, useUpdateSiteMeta } from '@/hooks/useDb'

export function SettingsTab() {
  const { data: meta, isLoading } = useSiteMeta()
  const updateMeta = useUpdateSiteMeta()

  const [siteName, setSiteName] = useState('')
  const [siteTagline, setSiteTagline] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [announcement, setAnnouncement] = useState('')
  const [announcementActive, setAnnouncementActive] = useState(false)
  const [instagramUrl, setInstagramUrl] = useState('')
  const [whatsappUrl, setWhatsappUrl] = useState('')
  const [telegramUrl, setTelegramUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')

  // Populate from DB
  useEffect(() => {
    if (!meta) return
    setSiteName(meta.siteName || '')
    setSiteTagline(meta.siteTagline || '')
    setLogoUrl(meta.logoUrl || '')
    setAnnouncement(meta.announcement || '')
    setAnnouncementActive(meta.announcementActive === 1)
    setInstagramUrl(meta.instagramUrl || '')
    setWhatsappUrl(meta.whatsappUrl || '')
    setTelegramUrl(meta.telegramUrl || '')
    setYoutubeUrl(meta.youtubeUrl || '')
  }, [meta])

  const handleSave = async () => {
    try {
      await updateMeta.mutateAsync({
        siteName,
        siteTagline,
        logoUrl,
        announcement,
        announcementActive: announcementActive ? 1 : 0,
        instagramUrl,
        whatsappUrl,
        telegramUrl,
        youtubeUrl,
      })
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    }
  }

  if (isLoading) {
    return (
      <div className="glass-panel p-5 sm:p-6 space-y-3 max-w-2xl">
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="admin-skel" />)}
      </div>
    )
  }

  return (
    <div className="glass-panel p-5 sm:p-6 space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Site Name */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Site Name</label>
          <input
            type="text"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            className="cmt-input"
            placeholder="Dynamon Gamer"
          />
        </div>

        {/* Site Tagline */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Site Tagline</label>
          <input
            type="text"
            value={siteTagline}
            onChange={(e) => setSiteTagline(e.target.value)}
            className="cmt-input"
            placeholder="The ultimate mod hub..."
          />
        </div>

        {/* Logo URL */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Logo Image URL</label>
          <input
            type="text"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            className="cmt-input"
            placeholder="https://i.imgur.com/your-logo.png"
          />
          <p className="text-[10px] text-[#475569]">
            Paste an image URL for the homepage logo. Leave empty to use the default icon.
          </p>
          {logoUrl && (
            <div className="mt-2 flex items-center gap-3">
              <div
                className="w-16 h-16 flex items-center justify-center"
                style={{ borderRadius: '9999px', overflow: 'hidden', border: '1px solid rgba(245, 158, 11,0.25)' }}
              >
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span className="text-xs text-[#64748b]">Preview</span>
            </div>
          )}
        </div>

        {/* Announcement */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Announcement</label>
          <textarea
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            className="cmt-input resize-none"
            rows={3}
            placeholder="Important message for visitors..."
          />
        </div>

        {/* Announcement Active */}
        <div className="flex items-center gap-2 sm:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={announcementActive}
              onChange={(e) => setAnnouncementActive(e.target.checked)}
              className="themed-checkbox"
            />
            <span className="text-sm text-[#E2E8F0]">Announcement Active</span>
          </label>
        </div>

        {/* Social URLs */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Instagram URL</label>
          <input
            type="text"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            className="cmt-input"
            placeholder="https://instagram.com/..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">WhatsApp URL</label>
          <input
            type="text"
            value={whatsappUrl}
            onChange={(e) => setWhatsappUrl(e.target.value)}
            className="cmt-input"
            placeholder="https://wa.me/..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Telegram URL</label>
          <input
            type="text"
            value={telegramUrl}
            onChange={(e) => setTelegramUrl(e.target.value)}
            className="cmt-input"
            placeholder="https://t.me/..."
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">YouTube URL</label>
          <input
            type="text"
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            className="cmt-input"
            placeholder="https://youtube.com/..."
          />
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={updateMeta.isPending}
        className="btn-primary btn-ripple disabled:opacity-50"
      >
        {updateMeta.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
        Save Settings
      </button>

      {/* ── Danger Zone ───────────────────────────────────────────────────── */}
      <div className="glass-panel p-4 sm:p-5 space-y-3 border border-[rgba(239,68,68,0.2)] mt-4">
        <h3 className="text-sm font-bold text-[#EF4444] uppercase tracking-wider">⚠️ Danger Zone</h3>
        <p className="text-xs text-[#94a3b8]">
          Permanently wipes <strong className="text-[#e2e8f0]">ratingSum</strong> and <strong className="text-[#e2e8f0]">ratingCount</strong> on every mod and removes all individual rating votes. Cannot be undone.
        </p>
        <ResetRatingsButton />
      </div>
    </div>
  )
}

function ResetRatingsButton() {
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleReset = async () => {
    setLoading(true)
    try {
      const { db } = await import('@/lib/firebase')
      await db.ref('/Ratings').remove()
      const modsSnap = await db.ref('/Mods').once('value')
      const mods = modsSnap.val() as Record<string, unknown> | null
      if (mods) {
        const updates: Record<string, number> = {}
        for (const id of Object.keys(mods)) {
          updates[`/Mods/${id}/ratingSum`] = 0
          updates[`/Mods/${id}/ratingCount`] = 0
        }
        await db.ref().update(updates)
      }
      const { glassToast: toast } = await import('@/components/ui/GlassToast')
      toast.success('All ratings reset successfully')
      setConfirm(false)
    } catch (err) {
      const { glassToast: toast } = await import('@/components/ui/GlassToast')
      toast.error('Failed to reset ratings')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!confirm) {
    return (
      <button
        onClick={() => setConfirm(true)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.18)] transition-colors"
      >
        Reset All Ratings
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-[#EF4444]">Are you absolutely sure? This cannot be undone.</p>
      <div className="flex gap-2">
        <button
          onClick={handleReset}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[rgba(239,68,68,0.18)] border border-[rgba(239,68,68,0.4)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.28)] transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
          {loading ? 'Resetting…' : 'Yes, Reset Everything'}
        </button>
        <button
          onClick={() => setConfirm(false)}
          className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-semibold text-[#64748b] hover:text-[#94a3b8] border border-[rgba(255,255,255,0.08)] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
