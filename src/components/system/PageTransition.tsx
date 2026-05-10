import { motion, AnimatePresence } from 'framer-motion'
import { useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'

/**
 * Fade + 12px slide-up page transitions on every route change.
 * 300ms ease, respects prefers-reduced-motion via Framer.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const location = useRouterState({ select: (s) => s.location })
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname + location.searchStr}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
