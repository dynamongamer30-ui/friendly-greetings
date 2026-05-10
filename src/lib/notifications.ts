/**
 * In-app notifications log (sessionStorage, last 10).
 */

export interface Notif {
  id: string
  kind: 'achievement' | 'info' | 'success'
  title: string
  body?: string
  ts: number
  read?: boolean
}

const KEY = 'dg_notifs'
const UNREAD_KEY = 'dg_notifs_unread'

export function readNotifs(): Notif[] {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function pushNotif(n: Omit<Notif, 'id' | 'read'>) {
  try {
    const list = readNotifs()
    const id = `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    list.unshift({ ...n, id, read: false })
    sessionStorage.setItem(KEY, JSON.stringify(list.slice(0, 10)))
    sessionStorage.setItem(UNREAD_KEY, String(getUnread() + 1))
    window.dispatchEvent(new CustomEvent('dg:notif-changed'))
  } catch { /* ignore */ }
}

export function getUnread(): number {
  try {
    const raw = sessionStorage.getItem(UNREAD_KEY)
    return raw ? parseInt(raw, 10) || 0 : 0
  } catch { return 0 }
}

export function clearUnread() {
  try {
    sessionStorage.setItem(UNREAD_KEY, '0')
    window.dispatchEvent(new CustomEvent('dg:notif-changed'))
  } catch { /* ignore */ }
}
