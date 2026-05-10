import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
)

/* ── PWA service worker registration (production hosts only) ── */
function isInIframe() {
  try { return window.self !== window.top } catch { return true }
}

const host = window.location.hostname
const isPreviewHost =
  host.includes('lovable.app') ||
  host.includes('lovableproject.com') ||
  host.includes('localhost') ||
  host === '127.0.0.1' ||
  host.endsWith('.local')

if (!isPreviewHost && !isInIframe() && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
} else if ('serviceWorker' in navigator) {
  // Defensive: unregister any stale SW that may have been cached in the iframe
  navigator.serviceWorker.getRegistrations().then(
    (regs) => regs.forEach((r) => r.unregister()),
  ).catch(() => {})
}
