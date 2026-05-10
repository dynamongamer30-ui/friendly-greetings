import { useEffect } from 'react'
import { X } from 'lucide-react'

interface LightboxProps {
  src: string
  alt?: string
  onClose: () => void
}

export function Lightbox({ src, alt, onClose }: LightboxProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[10002] flex items-center justify-center p-4 cursor-zoom-out"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.25s ease both' }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
      <img
        src={src}
        alt={alt || ''}
        onClick={e => e.stopPropagation()}
        className="max-w-full max-h-full object-contain rounded-lg cursor-default"
        style={{ boxShadow: '0 20px 60px rgba(34,211,238,0.2)' }}
      />
    </div>
  )
}
