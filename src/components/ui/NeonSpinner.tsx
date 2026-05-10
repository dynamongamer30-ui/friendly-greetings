import { CSSProperties } from 'react'

interface NeonSpinnerProps {
  size?: number
  className?: string
}

/**
 * Branded neon ring spinner — Step 12.
 * Pure CSS: 3px transparent border, top=cyan, right=purple, 800ms linear spin.
 */
export function NeonSpinner({ size = 16, className = '' }: NeonSpinnerProps) {
  const style: CSSProperties = { width: size, height: size }
  return <span className={`neon-spinner ${className}`} style={style} aria-label="Loading" />
}

export default NeonSpinner