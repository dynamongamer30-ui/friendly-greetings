import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { readNotifs, getUnread, clearUnread, type Notif } from '@/lib/notifications'
import { formatDistanceToNow } from 'date-fns'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const refresh = () => {
      setNotifs(readNotifs())
      setUnread(getUnread())
    }
    refresh()
    const onNotify = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail) {
        const list = readNotifs()
        const id = `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
        list.unshift({ ...detail, id, read: false })
        sessionStorage.setItem('dg_notifs', JSON.stringify(list.slice(0, 10)))
        sessionStorage.setItem('dg_notifs_unread', String(getUnread() + 1))
      }
      refresh()
    }
    window.addEventListener('dg:notify', onNotify)
    window.addEventListener('dg:notif-changed', refresh)
    return () => {
      window.removeEventListener('dg:notify', onNotify)
      window.removeEventListener('dg:notif-changed', refresh)
    }
  }, [])

  const toggle = () => {
    if (!open) clearUnread()
    setOpen(o => !o)
    setUnread(0)
  }

  return (
    <div className="fixed top-4 left-4 z-[9990]">
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
        style={{ background: 'rgba(10,2,30,0.7)', border: '1px solid rgba(0,240,255,0.25)', color: '#00F0FF' }}
      >
        <Bell className="w-4 h-4" />
        {unread > 0 && (
          <span
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
            style={{ background: '#00F0FF', color: '#03010d', boxShadow: '0 0 8px #00F0FF' }}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute top-12 right-0 w-72 max-h-[60vh] overflow-y-auto rounded-2xl"
          style={{
            background: 'rgba(5,8,10,0.96)',
            border: '1px solid rgba(0,240,255,0.25)',
            boxShadow: '0 12px 36px rgba(0,0,0,0.55), 0 0 24px rgba(0,240,255,0.12)',
            backdropFilter: 'blur(16px)',
            animation: 'glassDropdownIn 0.22s cubic-bezier(0.16,1,0.3,1) both',
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
            <span className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider">Notifications</span>
            <button onClick={() => setOpen(false)} className="text-[#475569] hover:text-[#94a3b8]" data-no-click-sound="true">
              <X className="w-4 h-4" />
            </button>
          </div>
          {notifs.length === 0 ? (
            <div className="px-4 py-8 text-center text-xs text-[#64748b]">
              No notifications yet.
            </div>
          ) : (
            <ul>
              {notifs.map(n => (
                <li key={n.id} className="px-4 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-b-0">
                  <div className="text-[12px] font-semibold text-[#E2E8F0]">{n.title}</div>
                  {n.body && <div className="text-[11px] text-[#94a3b8] mt-0.5">{n.body}</div>}
                  <div className="text-[10px] text-[#475569] mt-1">
                    {formatDistanceToNow(new Date(n.ts), { addSuffix: true })}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
