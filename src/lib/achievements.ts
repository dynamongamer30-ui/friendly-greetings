/**
 * Achievement registry + persistence.
 * Stored as { id: { unlockedAt: ISO } } in localStorage under `dg_achievements`.
 */
import { triggerAchievement } from '@/components/ui/AchievementToast'

export interface AchievementDef {
  id: string
  title: string
  desc: string
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_click', title: 'Explorer!', desc: "You opened your first mod — let's go!" },
  { id: 'first_rating', title: 'Critic!', desc: 'You rated your first mod.' },
  { id: 'tutorial_visited', title: 'Student!', desc: 'You read the tutorial.' },
  { id: 'explorer_pro', title: 'Explorer Pro!', desc: 'You browsed 3 different mods.' },
  { id: 'sharer', title: 'Sharer!', desc: 'You shared a mod with the world.' },
  { id: 'conversationalist', title: 'Conversationalist!', desc: 'You posted your first comment.' },
  { id: 'popular_taste', title: 'Popular Taste!', desc: 'You visited a mod with 1000+ downloads.' },
]

const STORE = 'dg_achievements'

type Store = Record<string, { unlockedAt: string }>

function readStore(): Store {
  try {
    const raw = localStorage.getItem(STORE)
    if (!raw) return {}
    return JSON.parse(raw) || {}
  } catch {
    return {}
  }
}

function writeStore(s: Store) {
  try { localStorage.setItem(STORE, JSON.stringify(s)) } catch { /* ignore */ }
}

export function getUnlocked(): Store {
  return readStore()
}

export function isUnlocked(id: string): boolean {
  return !!readStore()[id]
}

export function unlock(id: string): boolean {
  const def = ACHIEVEMENTS.find(a => a.id === id)
  if (!def) return false
  const store = readStore()
  if (store[id]) return false
  store[id] = { unlockedAt: new Date().toISOString() }
  writeStore(store)
  triggerAchievement({ title: def.title, desc: def.desc })
  // Push into notification log
  try {
    window.dispatchEvent(new CustomEvent('dg:notify', {
      detail: { kind: 'achievement', title: `Unlocked: ${def.title}`, body: def.desc, ts: Date.now() }
    }))
  } catch { /* ignore */ }
  return true
}

/** Track distinct mod visits for explorer_pro */
export function trackModVisit(modId: string) {
  try {
    const key = 'dg_visited_mods'
    const raw = localStorage.getItem(key)
    const set: string[] = raw ? JSON.parse(raw) : []
    if (!set.includes(modId)) {
      set.push(modId)
      localStorage.setItem(key, JSON.stringify(set))
    }
    if (set.length >= 3) unlock('explorer_pro')
  } catch { /* ignore */ }
}
