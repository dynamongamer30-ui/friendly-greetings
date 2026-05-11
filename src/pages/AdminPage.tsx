import { useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import { glassToast as toast } from '@/components/ui/GlassToast'
import {
  Loader2,
  LogOut,
  Package,
  Settings,
  BookOpen,
  ShieldCheck,
  FileWarning,
  Gamepad2,
  MessageSquare,
} from 'lucide-react'
import { ModsTab } from '@/components/admin/ModsTab'
import { SettingsTab } from '@/components/admin/SettingsTab'
import { TutorialTab } from '@/components/admin/TutorialTab'
import { SecurityTab } from '@/components/admin/SecurityTab'
import { DMCATab } from '@/components/admin/DMCATab'
import { CommentsTab } from '@/components/admin/CommentsTab'

const TABS = [
  { id: 'mods', label: 'Mods', icon: <Package className="w-5 h-5" /> },
  { id: 'comments', label: 'Comments', icon: <MessageSquare className="w-5 h-5" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  { id: 'tutorial', label: 'Tutorial', icon: <BookOpen className="w-5 h-5" /> },
  { id: 'security', label: 'Security', icon: <ShieldCheck className="w-5 h-5" /> },
  { id: 'dmca', label: 'DMCA', icon: <FileWarning className="w-5 h-5" /> },
] as const

type TabId = (typeof TABS)[number]['id']

export default function AdminPage() {
  const [isAuthed, setIsAuthed] = useState(
    () => sessionStorage.getItem('dg_admin') === '1'
  )
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('mods')

  // On mount — check Firebase Auth state
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user && isAuthed) {
        // Session says authed but Firebase says not — clear
        sessionStorage.removeItem('dg_admin')
        setIsAuthed(false)
      }
    })
    return () => unsub()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoggingIn(true)
    try {
      await auth.signInWithEmailAndPassword(loginEmail, loginPassword)
      sessionStorage.setItem('dg_admin', '1')
      setIsAuthed(true)
      toast.success('Logged in')
    } catch {
      toast.error('Authentication failed')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = async () => {
    sessionStorage.removeItem('dg_admin')
    await auth.signOut()
    setIsAuthed(false)
    toast.success('Logged out')
  }

  /* ── Login screen ───────────────────────────────────────────────────── */
  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-glow-top" />
        <form
          onSubmit={handleLogin}
          className="glass-panel p-8 w-full max-w-sm space-y-6 relative z-10"
        >
          <div className="text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[rgba(255, 69, 0,0.08)] border border-[rgba(255, 69, 0,0.15)] flex items-center justify-center">
              <Gamepad2 className="w-7 h-7 text-[#FF4500]" />
            </div>
            <h1 className="text-xl font-bold text-[#E2E8F0]">Admin Login</h1>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="cmt-input"
                placeholder="admin@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="cmt-input"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loggingIn}
            className="btn-primary btn-ripple w-full disabled:opacity-50"
          >
            {loggingIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    )
  }

  /* ── Dashboard ──────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ position: 'relative', zIndex: 1 }}>
      {/* Sidebar */}
      <aside
        className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r"
        style={{
          background: 'rgba(20,20,50,0.55)',
          backdropFilter: 'blur(22px) saturate(140%)',
          WebkitBackdropFilter: 'blur(22px) saturate(140%)',
          borderColor: 'rgba(245, 158, 11,0.14)',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div className="flex items-center gap-2 px-5 py-4 border-b border-[rgba(245, 158, 11,0.14)]">
          <Gamepad2 className="w-5 h-5 text-[#FF4500]" />
          <span className="text-sm font-bold aurora-text">Admin Panel</span>
        </div>
        <nav className="flex md:flex-col p-2 gap-1 overflow-x-auto md:overflow-x-visible scrollbar-none" style={{ WebkitOverflowScrolling: 'touch' }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 md:flex-shrink"
                style={
                  active
                    ? {
                        background: 'linear-gradient(135deg, rgba(255, 69, 0,0.18), rgba(245, 158, 11,0.18))',
                        color: '#FF4500',
                        border: '1px solid rgba(255, 69, 0,0.32)',
                        boxShadow: '0 0 18px rgba(255, 69, 0,0.18), inset 0 1px 0 rgba(255,255,255,0.06)',
                      }
                    : {
                        color: '#94a3b8',
                        background: 'transparent',
                        border: '1px solid transparent',
                      }
                }
              >
                {tab.icon}
                <span className="hidden xs:inline md:inline">{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 min-h-0" style={{ position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <header
          className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[rgba(255,255,255,0.06)] gap-4"
          style={{
            background: 'rgba(5,8,10,0.6)',
            backdropFilter: 'blur(16px) saturate(140%)',
            WebkitBackdropFilter: 'blur(16px) saturate(140%)',
          }}
        >
          <h2 className="text-base sm:text-lg font-bold text-[#E2E8F0] capitalize truncate">{activeTab}</h2>
          <button
            onClick={handleLogout}
            className="btn-ghost text-xs flex items-center gap-1.5 shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        <div
          className="p-4 sm:p-6 overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 65px)', position: 'relative', zIndex: 2 }}
        >
          <div
            style={{
              background: 'rgba(5, 8, 10, 0.6)',
              backdropFilter: 'blur(20px) saturate(140%)',
              WebkitBackdropFilter: 'blur(20px) saturate(140%)',
              border: '1px solid rgba(0,240,255,0.15)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.4)',
              position: 'relative',
              zIndex: 2,
            }}
          >
            {activeTab === 'mods' && <ModsTab />}
            {activeTab === 'comments' && <CommentsTab />}
            {activeTab === 'settings' && <SettingsTab />}
            {activeTab === 'tutorial' && <TutorialTab />}
            {activeTab === 'security' && <SecurityTab />}
            {activeTab === 'dmca' && <DMCATab />}
          </div>
        </div>
      </main>
    </div>
  )
}
