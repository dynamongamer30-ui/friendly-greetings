import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface EmptyStateProps {
  title?: string
  message: ReactNode
  className?: string
}

/**
 * Branded empty state — Step 12.
 * Inline SVG (floating geometric shapes), float animation, Space Grotesk caption.
 */
export function EmptyState({ title, message, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <motion.div
        className="empty-illustration mx-auto mb-4"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <svg viewBox="0 0 120 120" width="96" height="96" fill="none">
          <defs>
            <linearGradient id="es-g1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#7B2FFF" stopOpacity="0.85" />
            </linearGradient>
            <radialGradient id="es-g2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00F0FF" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="60" cy="60" r="50" fill="url(#es-g2)" />
          <circle cx="40" cy="50" r="10" stroke="url(#es-g1)" strokeWidth="2" />
          <rect x="62" y="42" width="22" height="22" rx="5" stroke="#7B2FFF" strokeWidth="2" transform="rotate(15 73 53)" />
          <path d="M30 80 L50 70 L48 92 Z" stroke="#00F0FF" strokeWidth="2" strokeLinejoin="round" />
          <circle cx="80" cy="80" r="6" fill="#00F0FF" fillOpacity="0.5" />
        </svg>
      </motion.div>
      {title && <h3 className="empty-title mb-1">{title}</h3>}
      <p className="empty-caption">{message}</p>
    </div>
  )
}

export default EmptyState