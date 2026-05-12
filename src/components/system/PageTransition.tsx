import { motion, AnimatePresence } from 'framer-motion'
import { useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'

/**
 * Per-route page transition variants.
 *  - /              → fade + scale
 *  - /download      → slide-left
 *  - /unlock        → zoom-in
 *  - everything else → fade + slide-up (default)
 */
const variantsFor = (pathname: string) => {
  if (pathname === '/') {
    return {
      initial: { opacity: 0, scale: 0.985 },
      animate: { opacity: 1, scale: 1 },
      exit:    { opacity: 0, scale: 1.01 },
      transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
    }
  }
  if (pathname.startsWith('/download')) {
    return {
      initial: { opacity: 0, x: 40 },
      animate: { opacity: 1, x: 0 },
      exit:    { opacity: 0, x: -20 },
      transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
    }
  }
  if (pathname.startsWith('/unlock')) {
    return {
      initial: { opacity: 0, scale: 0.92 },
      animate: { opacity: 1, scale: 1 },
      exit:    { opacity: 0, scale: 1.03 },
      transition: { duration: 0.18, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] },
    }
  }
  return {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: -4 },
    transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
  }
}

export default function PageTransition({ children }: { children: ReactNode }) {
  const location = useRouterState({ select: (s) => s.location })
  if (location.pathname.startsWith('/unlock') || location.pathname.startsWith('/admin')) {
    return <>{children}</>
  }
  const v = variantsFor(location.pathname)
  return (
    <AnimatePresence mode="sync" initial={false}>
      <motion.div
        key={location.pathname + location.searchStr}
        initial={v.initial}
        animate={v.animate}
        exit={v.exit}
        transition={v.transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}