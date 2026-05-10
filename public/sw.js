/* Dynamon Gamer — minimal offline shell SW */
const CACHE = 'dg-shell-v1'
const ASSETS = ['/', '/index.html', '/manifest.json']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {}))
  self.skipWaiting()
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  if (url.origin !== location.origin) return

  // Network-first for navigations (HTML), cache fallback
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((res) => {
        const clone = res.clone()
        caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {})
        return res
      }).catch(() => caches.match(req).then((r) => r || caches.match('/')))
    )
    return
  }

  // Cache-first for static assets
  e.respondWith(
    caches.match(req).then((cached) =>
      cached ||
      fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const clone = res.clone()
          caches.open(CACHE).then((c) => c.put(req, clone)).catch(() => {})
        }
        return res
      }).catch(() => cached)
    )
  )
})
