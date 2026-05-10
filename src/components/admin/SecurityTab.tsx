import { useState, useEffect } from 'react'
import { Loader2, Save, Trash2 } from 'lucide-react'
import { glassToast as toast } from '@/components/ui/GlassToast'
import { useSecurityConfig, useUpdateSecurityConfig } from '@/hooks/useDb'
import { db } from '@/lib/firebase'

export function SecurityTab() {
  const { data: config, isLoading } = useSecurityConfig()
  const updateConfig = useUpdateSecurityConfig()

  const [timer, setTimer] = useState(900)
  const [minTimer, setMinTimer] = useState(45)
  const [fingerprint, setFingerprint] = useState('')
  const [resetting, setResetting] = useState(false)
  const [banFingerprint, setBanFingerprint] = useState('')
  const [banning, setBanning] = useState(false)

  useEffect(() => {
    if (config) {
      setTimer(config.timer ?? 900)
      setMinTimer(config.minTimer ?? 45)
    }
  }, [config])

  const handleSave = async () => {
    try {
      await updateConfig.mutateAsync({ timer, minTimer })
      toast.success('Security config saved')
    } catch {
      toast.error('Failed to save security config')
    }
  }

  const handleBan = async () => {
    if (!banFingerprint.trim()) { toast.error('Enter a fingerprint to ban'); return }
    setBanning(true)
    try {
      await db.ref(`/Config/Banned/${banFingerprint.trim()}`).set(true)
      toast.success('Device banned')
      setBanFingerprint('')
    } catch { toast.error('Failed to ban device') }
    finally { setBanning(false) }
  }

  const handleUnban = async () => {
    if (!banFingerprint.trim()) { toast.error('Enter a fingerprint to unban'); return }
    setBanning(true)
    try {
      await db.ref(`/Config/Banned/${banFingerprint.trim()}`).remove()
      toast.success('Device unbanned')
      setBanFingerprint('')
    } catch { toast.error('Failed to unban device') }
    finally { setBanning(false) }
  }

  const handleResetRateLimit = async () => {
    if (!fingerprint.trim()) {
      toast.error('Enter a fingerprint to reset')
      return
    }
    setResetting(true)
    try {
      // Try both formats — with and without modId suffix
      await db.ref(`/RateLimit/${fingerprint.trim()}`).remove()
      // Also try to remove all keys starting with this fingerprint
      const snap = await db.ref('/RateLimit').once('value')
      const all = snap.val() as Record<string, unknown> | null
      if (all) {
        const deletions = Object.keys(all)
          .filter(k => k.startsWith(fingerprint.trim()))
          .map(k => db.ref(`/RateLimit/${k}`).remove())
        await Promise.all(deletions)
      }
      toast.success('Rate limit reset successfully')
      setFingerprint('')
    } catch {
      toast.error('Failed to reset rate limit')
    } finally {
      setResetting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-[#22D3EE] animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-md">
      {/* Timer */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
          Unlock Timer (seconds)
        </label>
        <input
          type="number"
          value={timer}
          onChange={(e) => setTimer(parseInt(e.target.value, 10) || 0)}
          className="cmt-input"
          min={1}
          max={1200}
        />
        <p className="text-[10px] text-[#475569]">
          How long users have to complete all shorteners and reach the unlock page. 900 = 15 mins.
        </p>
      </div>

      {/* Min Timer */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
          Minimum Unlock Time (seconds)
        </label>
        <input
          type="number"
          value={minTimer}
          onChange={(e) => setMinTimer(parseInt(e.target.value, 10) || 0)}
          className="cmt-input"
          min={0}
          max={300}
        />
        <p className="text-[10px] text-[#475569]">
          Minimum seconds user must take before unlock is allowed. Blocks shortener skippers. Default: 45.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={updateConfig.isPending}
        className="btn-primary btn-ripple disabled:opacity-50"
      >
        {updateConfig.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Security Config
      </button>

      {/* Rate limit reset */}
      <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] space-y-3">
        <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
          Reset Device Rate Limit
        </label>
        <input
          type="text"
          value={fingerprint}
          onChange={(e) => setFingerprint(e.target.value)}
          className="cmt-input"
          placeholder="Paste device fingerprint..."
        />
        <p className="text-[10px] text-[#475569]">
          Paste a device fingerprint to reset their download limit. Use when a genuine user is wrongly blocked.
        </p>
        <button
          onClick={handleResetRateLimit}
          disabled={resetting}
          className="btn-ghost text-[#EF4444] border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.08)]"
        >
          {resetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Reset Rate Limit
        </button>
      </div>

      {/* Ban Device */}
      <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] space-y-3">
        <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
          Ban Device
        </label>
        <input
          type="text"
          value={banFingerprint}
          onChange={(e) => setBanFingerprint(e.target.value)}
          className="cmt-input"
          placeholder="Paste device fingerprint to ban..."
        />
        <p className="text-[10px] text-[#475569]">
          Permanently blocks a device fingerprint from downloading. Use for abuse or bots.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleBan}
            disabled={banning}
            className="btn-ghost text-[#EF4444] border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.08)]"
          >
            {banning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Ban Device
          </button>
          <button
            onClick={handleUnban}
            disabled={banning}
            className="btn-ghost"
          >
            Unban Device
          </button>
        </div>
      </div>
    </div>
  )
}