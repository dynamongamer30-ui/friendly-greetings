import { useState, useEffect } from 'react'
import { Loader2, Trash2, Plus, Save } from 'lucide-react'
import { glassToast as toast } from '@/components/ui/GlassToast'
import { GlassSelect } from '@/components/ui/GlassSelect'
import { useMods, useCreateMod, useUpdateMod, useDeleteMod, Cipher } from '@/hooks/useDb'
import type { Mod } from '@/types/mod'

const EMPTY: Partial<Mod> = {
  title: '',
  gameName: '',
  version: '',
  category: 'general',
  status: 'active',
  virusTotalStatus: 'pending',
  virustotalUrl: '',
  imageUrl: '',
  videoUrl: '',
  downloadUrl: '',
  megaUrl: '',
  shortnerlink: '',
  tags: '',
  isTrending: 0,
  isFeatured: 0,
  description: '',
  changelog: '',
}

export function ModsTab() {
  const { data: mods } = useMods()
  const createMod = useCreateMod()
  const updateMod = useUpdateMod()
  const deleteMod = useDeleteMod()

  const [selectedId, setSelectedId] = useState<string>('new')
  const [form, setForm] = useState<Partial<Mod>>({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (selectedId === 'new') {
      setForm({ ...EMPTY })
      return
    }
    const mod = mods.find((m) => m.id === selectedId)
    if (mod) {
      let plainMega = ''
      try {
        plainMega = mod.megaUrl ? Cipher.decrypt(mod.megaUrl) : ''
      } catch {
        plainMega = mod.megaUrl || ''
      }
      setForm({ ...mod, megaUrl: plainMega })
    }
  }, [selectedId, mods])

  const set = (key: keyof Mod, val: string | number) =>
    setForm((prev) => ({ ...prev, [key]: val }))

  const handleSave = async () => {
    if (!form.title?.trim()) {
      toast.error('Title is required')
      return
    }
    setSaving(true)
    try {
      const encryptedMega = form.megaUrl?.trim()
        ? Cipher.encrypt(form.megaUrl.trim())
        : ''

      const payload = {
        title: form.title.trim(),
        gameName: form.gameName || '',
        description: form.description || '',
        category: form.category || 'general',
        imageUrl: form.imageUrl || '',
        downloadUrl: encryptedMega,
        megaUrl: encryptedMega,
        shortnerlink: form.shortnerlink || '',
        version: form.version || '',
        isTrending: form.isTrending ?? 0,
        isFeatured: form.isFeatured ?? 0,
        status: form.status || 'working',
        virusTotalStatus: form.virusTotalStatus || 'pending',
        virustotalUrl: form.virustotalUrl || '',
        tags: form.tags || '',
        videoUrl: form.videoUrl || '',
        changelog: form.changelog || '',
        features: form.features || '',
      }

      if (selectedId === 'new') {
        const id = await createMod.mutateAsync({ ...payload, downloads: 0 })
        setSelectedId(id)
        toast.success('Mod created')
      } else {
        await updateMod.mutateAsync({ id: selectedId, data: payload })
        toast.success('Mod updated')
      }
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (selectedId === 'new') return
    if (!confirm('Delete this mod permanently?')) return
    setDeleting(true)
    try {
      await deleteMod.mutateAsync(selectedId)
      setSelectedId('new')
      toast.success('Mod deleted')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="glass-panel p-5 sm:p-6 space-y-6 max-w-3xl">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
          Select Mod
        </label>
        <GlassSelect
          value={selectedId}
          onChange={(val) => setSelectedId(val)}
          options={[
            { value: 'new', label: '+ New Module' },
            ...mods.map((m) => ({ value: m.id, label: `${m.title} — ${m.version || 'no version'}` })),
          ]}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Title */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
            Title <span className="text-[#EF4444]">*</span>
          </label>
          <input
            type="text"
            value={form.title || ''}
            onChange={(e) => set('title', e.target.value)}
            className="cmt-input"
            placeholder="Mod title"
          />
        </div>

        {/* Game Name */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Game Name</label>
          <input
            type="text"
            value={form.gameName || ''}
            onChange={(e) => set('gameName', e.target.value)}
            className="cmt-input"
            placeholder="Dynamons World"
          />
        </div>

        {/* Version */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Version</label>
          <input
            type="text"
            value={form.version || ''}
            onChange={(e) => set('version', e.target.value)}
            className="cmt-input"
            placeholder="1.0.0"
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Category</label>
          <GlassSelect
            value={form.category || 'general'}
            onChange={(val) => set('category', val)}
            options={[
              { value: 'gameplay', label: 'Gameplay' },
              { value: 'cheats', label: 'Cheats' },
              { value: 'general', label: 'General' },
            ]}
          />
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Status</label>
          <GlassSelect
            value={form.status || 'working'}
            onChange={(val) => set('status', val)}
            options={[
              { value: 'working', label: 'Working' },
              { value: 'testing', label: 'Testing' },
              { value: 'broken', label: 'Broken' },
            ]}
          />
        </div>

        {/* VirusTotal Status */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
            VirusTotal Status
          </label>
          <GlassSelect
            value={form.virusTotalStatus || 'pending'}
            onChange={(val) => set('virusTotalStatus', val)}
            options={[
              { value: 'clean', label: 'Clean' },
              { value: 'flagged', label: 'Flagged' },
              { value: 'pending', label: 'Pending' },
            ]}
          />
        </div>

        {/* VirusTotal Report URL */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
            VirusTotal Report URL
          </label>
          <input
            type="text"
            value={form.virustotalUrl || ''}
            onChange={(e) => set('virustotalUrl', e.target.value)}
            className="cmt-input"
            placeholder="https://www.virustotal.com/gui/file/..."
          />
        </div>

        {/* Image URL */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Image URL</label>
          <input
            type="text"
            value={form.imageUrl || ''}
            onChange={(e) => set('imageUrl', e.target.value)}
            className="cmt-input"
            placeholder="https://..."
          />
        </div>

        {/* YouTube Video ID */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
            YouTube Video ID
          </label>
          <input
            type="text"
            value={form.videoUrl || ''}
            onChange={(e) => set('videoUrl', e.target.value)}
            className="cmt-input"
            placeholder="e.g. 9lJUtO8a47E"
          />
        </div>

        {/* Mega URL */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
            Mega URL
          </label>
          <input
            type="text"
            value={form.megaUrl || ''}
            onChange={(e) => set('megaUrl', e.target.value)}
            className="cmt-input"
            placeholder="https://mega.nz/..."
          />
          <p className="text-[10px] text-[#475569]">
            Raw Mega link — will be AES encrypted on save.
          </p>
        </div>

        {/* Shortener Link */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
            Shortener Link
          </label>
          <input
            type="text"
            value={form.shortnerlink || ''}
            onChange={(e) => set('shortnerlink', e.target.value)}
            className="cmt-input"
            placeholder="https://sub2unlock.com/..."
          />
          <p className="text-[10px] text-[#475569]">
            First shortener link (sub2unlock). Not encrypted.
          </p>
        </div>

        {/* Tags */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={form.tags || ''}
            onChange={(e) => set('tags', e.target.value)}
            className="cmt-input"
            placeholder="unlimited coins, god mode, no ads"
          />
        </div>

        {/* Trending + Featured */}
        <div className="flex items-center gap-6 sm:col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isTrending === 1}
              onChange={(e) => set('isTrending', e.target.checked ? 1 : 0)}
              className="themed-checkbox"
            />
            <span className="text-sm text-[#E2E8F0]">Trending</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured === 1}
              onChange={(e) => set('isFeatured', e.target.checked ? 1 : 0)}
              className="themed-checkbox"
            />
            <span className="text-sm text-[#E2E8F0]">Featured</span>
          </label>
        </div>

        {/* Description */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Description</label>
          <textarea
            value={form.description || ''}
            onChange={(e) => set('description', e.target.value)}
            className="cmt-input resize-none"
            rows={4}
            placeholder="Mod description..."
          />
        </div>

        {/* Changelog */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">Changelog</label>
          <textarea
            value={form.changelog || ''}
            onChange={(e) => set('changelog', e.target.value)}
            className="cmt-input resize-none"
            rows={3}
            placeholder="What changed in this version..."
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary btn-ripple disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {selectedId === 'new' ? 'Create Mod' : 'Save Changes'}
        </button>

        {selectedId !== 'new' && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-ghost text-[#EF4444] border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.08)] hover:border-[rgba(239,68,68,0.3)]"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        )}

        {selectedId === 'new' && (
          <button
            onClick={() => setForm({ ...EMPTY })}
            className="btn-ghost text-xs"
          >
            <Plus className="w-4 h-4" />
            Reset Form
          </button>
        )}
      </div>
    </div>
  )
}