import {
  createRouter,
  createRootRoute,
  createRoute,
  Outlet,
  RouterProvider,
  useRouterState,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { GlassToaster } from './components/ui/GlassToast'
import CursorGlow from './components/system/CursorGlow'
import PageTransition from './components/system/PageTransition'
import AuroraOrb from './components/system/AuroraOrb'
import { ScrollProgress } from './components/ui/ScrollProgress'
import { LoadingScreen } from './components/system/LoadingScreen'
import { AchievementToast } from './components/ui/AchievementToast'
import { useEffect, useRef, useState } from 'react'
import { playClick, playWhoosh, tryResumeAmbient } from './lib/sound'

import HomePage from './pages/HomePage'
import DownloadPage from './pages/DownloadPage'
import UnlockPage from './pages/UnlockPage'
import TutorialPage from './pages/TutorialPage'
import DMCAPage from './pages/DMCAPage'
import AdminPage from './pages/AdminPage'
import KeysPage from './pages/KeysPage'
import NotFoundPage from './pages/NotFoundPage'

const rootRoute = createRootRoute({
  component: RootShell,
  notFoundComponent: NotFoundPage,
})

function RouteSoundEffect() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const prev = useRef<string | null>(null)
  useEffect(() => {
    if (prev.current !== null && prev.current !== pathname) {
      playWhoosh()
    }
    prev.current = pathname
  }, [pathname])
  return null
}

// Bell + Achievements now live inside HeroHeader top-right cluster on home.


function RootShell() {
  const [loaded, setLoaded] = useState(false)

  // Global click sound
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target) return
      const btn = target.closest('button') as HTMLButtonElement | null
      if (!btn) return
      if (btn.disabled) return
      if (btn.dataset.noClickSound === 'true') return
      if (btn.dataset.downloading === 'true') return
      playClick()
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  // Resume ambient drone after first user gesture
  useEffect(() => {
    const resume = () => { tryResumeAmbient(); document.removeEventListener('pointerdown', resume) }
    document.addEventListener('pointerdown', resume, { once: true })
    return () => document.removeEventListener('pointerdown', resume)
  }, [])

  // Global touch ripple
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const spawnRipple = (clientX: number, clientY: number, target: EventTarget | null) => {
      const el = (target as HTMLElement | null)?.closest('button, [role="button"], a') as HTMLElement | null
      if (!el) return
      if ((el as HTMLButtonElement).disabled) return
      const rect = el.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height) * 0.9
      const x = clientX - rect.left - size / 2
      const y = clientY - rect.top - size / 2
      const prevPos = getComputedStyle(el).position
      if (prevPos === 'static') el.style.position = 'relative'
      const prevOverflow = getComputedStyle(el).overflow
      if (prevOverflow === 'visible') el.style.overflow = 'hidden'
      const ripple = document.createElement('span')
      ripple.className = 'lov-ripple'
      ripple.style.width = `${size}px`
      ripple.style.height = `${size}px`
      ripple.style.left = `${x}px`
      ripple.style.top = `${y}px`
      el.appendChild(ripple)
      window.setTimeout(() => ripple.remove(), 450)
    }

    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      spawnRipple(t.clientX, t.clientY, e.target)
    }
    document.addEventListener('touchstart', onTouch, { passive: true, capture: true })
    return () => document.removeEventListener('touchstart', onTouch, true)
  }, [])

  return (
    <>
      {!loaded && <LoadingScreen onDone={() => setLoaded(true)} />}
      <AuroraOrb />
      <ScrollProgress />
      <CursorGlow />
      <RouteSoundEffect />
      <AchievementToast />
      <GlassToaster />
      <PageTransition>
        <Outlet />
      </PageTransition>
    </>
  )
}

const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage })
const indexAliasRoute = createRoute({ getParentRoute: () => rootRoute, path: '/index', component: HomePage })
const downloadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/download',
  validateSearch: (search: Record<string, unknown>) => ({ id: (search.id as string) || undefined }),
  component: DownloadPage,
})
const unlockRoute = createRoute({ getParentRoute: () => rootRoute, path: '/unlock', component: UnlockPage })
const tutorialRoute = createRoute({ getParentRoute: () => rootRoute, path: '/tutorial', component: TutorialPage })
const dmcaRoute = createRoute({ getParentRoute: () => rootRoute, path: '/dmca', component: DMCAPage })
const adminRoute = createRoute({ getParentRoute: () => rootRoute, path: '/admin', component: AdminPage })
const keysRoute = createRoute({ getParentRoute: () => rootRoute, path: '/keys', component: KeysPage })

const routeTree = rootRoute.addChildren([homeRoute, indexAliasRoute, downloadRoute, unlockRoute, tutorialRoute, dmcaRoute, adminRoute, keysRoute])

const router = createRouter({ routeTree, defaultNotFoundComponent: NotFoundPage })
const queryClient = new QueryClient()

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
