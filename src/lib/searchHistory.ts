/** Last-5 search history persisted to localStorage. */

const KEY = 'dg_search_history'
const MAX = 5

export function getSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function pushSearchTerm(term: string) {
  const t = term.trim()
  if (!t) return
  try {
    const list = getSearchHistory().filter(x => x.toLowerCase() !== t.toLowerCase())
    list.unshift(t)
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)))
  } catch { /* ignore */ }
}

export function clearSearchHistory() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
}
