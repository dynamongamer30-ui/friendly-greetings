import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface EmptyStateProps {
  title?: string
  message: ReactNode
  className?: string
}

/**
 * Branded empty state with looping cyan/purple animated illustration.
 */
export function EmptyState({ title, message, className = '' }: EmptyStateProps) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      <motion.div
        className="empty-illustration mx-auto mb-4"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ width: 96, height: 96 }}
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

          {/* Pulsing aura */}
          <circle cx="60" cy="60" r="50" fill="url(#es-g2)">
            <animate attributeName="r" values="46;54;46" dur="3.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.7;1;0.7" dur="3.2s" repeatCount="indefinite" />
          </circle>

          {/* Orbiting ring */}
          <g style={{ transformOrigin: '60px 60px', animation: 'es-spin 9s linear infinite' }}>
            <circle cx="40" cy="50" r="10" stroke="url(#es-g1)" strokeWidth="2" />
          </g>

          {/* Rotating square */}
          <g style={{ transformOrigin: '73px 53px', animation: 'es-spin-rev 11s linear infinite' }}>
            <rect x="62" y="42" width="22" height="22" rx="5" stroke="#7B2FFF" strokeWidth="2" />
          </g>

          {/* Floating triangle */}
          <g style={{ animation: 'es-float 3.6s ease-in-out infinite' }}>
            <path d="M30 80 L50 70 L48 92 Z" stroke="#00F0FF" strokeWidth="2" strokeLinejoin="round" />
          </g>

          {/* Pulsing dot */}
          <circle cx="80" cy="80" r="6" fill="#00F0FF" fillOpacity="0.5">
            <animate attributeName="r" values="5;9;5" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="fillOpacity" values="0.3;0.7;0.3" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </svg>
      </motion.div>
      {title && <h3 className="empty-title mb-1">{title}</h3>}
      <p className="empty-caption">{message}</p>

      <style>{`
        @keyframes es-spin { to { transform: rotate(360deg) } }
        @keyframes es-spin-rev { to { transform: rotate(-360deg) } }
        @keyframes es-float {
          0%,100% { transform: translateY(0) }
          50%     { transform: translateY(-6px) }
        }
      `}</style>
    </div>
  )
}

export default EmptyState
