import { useState, useEffect, useCallback, useRef } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { playSuccess, playError } from '@/lib/sound'

/* ─── Types ──────────────────────────────────────────────────────────────── */
type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
  exiting?: boolean
}

/* ─── Global State (singleton) ────────────────────────────────────────── */
let listeners: Array<(toasts: Toast[]) => void> = []
let toastQueue: Toast[] = []
let counter = 0

function emit() {
  listeners.forEach((fn) => fn([...toastQueue]))
}

function addToast(message: string, type: ToastType, duration = 3500) {
  const id = `gt_${++counter}_${Date.now()}`
  toastQueue.push({ id, message, type, duration })
  if (type === 'success') playSuccess()
  else if (type === 'error') playError()
  emit()
}

function removeToast(id: string) {
  // Mark as exiting for animation
  toastQueue = toastQueue.map((t) => (t.id === id ? { ...t, exiting: true } : t))
  emit()
  setTimeout(() => {
    toastQueue = toastQueue.filter((t) => t.id !== id)
    emit()
  }, 280)
}

/* ─── Public API (drop-in for react-hot-toast) ──────────────────────── */
export const glassToast = {
  success: (msg: string) => addToast(msg, 'success'),
  error: (msg: string) => addToast(msg, 'error'),
  warning: (msg: string) => addToast(msg, 'warning'),
  info: (msg: string) => addToast(msg, 'info'),
}

/* ─── Icon Map ───────────────────────────────────────────────────────── */
const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-[18px] h-[18px] shrink-0" />,
  error: <XCircle className="w-[18px] h-[18px] shrink-0" />,
  warning: <AlertTriangle className="w-[18px] h-[18px] shrink-0" />,
  info: <Info className="w-[18px] h-[18px] shrink-0" />,
}

const COLOR: Record<ToastType, { icon: string; border: string; glow: string; bar: string }> = {
  success: {
    icon: '#00F0FF',
    border: 'rgba(0, 240, 255, 0.28)',
    glow: 'rgba(0, 240, 255, 0.12)',
    bar: '#00F0FF',
  },
  error: {
    icon: '#EF4444',
    border: 'rgba(239, 68, 68, 0.28)',
    glow: 'rgba(239, 68, 68, 0.12)',
    bar: '#EF4444',
  },
  warning: {
    icon: '#EAB308',
    border: 'rgba(234, 179, 8, 0.28)',
    glow: 'rgba(234, 179, 8, 0.12)',
    bar: '#EAB308',
  },
  info: {
    icon: '#7B2FFF',
    border: 'rgba(123, 47, 255, 0.28)',
    glow: 'rgba(123, 47, 255, 0.12)',
    bar: '#7B2FFF',
  },
}

/* ─── Single Toast Item ─────────────────────────────────────────────── */
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const c = COLOR[toast.type]
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(toast.id), toast.duration)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [toast.id, toast.duration, onDismiss])

  return (
    <div
      className={`glass-toast-item ${toast.exiting ? 'glass-toast-exit' : 'glass-toast-enter'}`}
      style={{
        borderColor: c.border,
        boxShadow: `0 8px 32px rgba(0,0,0,0.55), 0 0 24px ${c.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {/* Icon */}
      <span style={{ color: c.icon }}>{ICONS[toast.type]}</span>

      {/* Message */}
      <span className="flex-1 text-[13px] font-semibold text-[#E2E8F0] leading-snug">
        {toast.message}
      </span>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-0.5 rounded-md text-[#475569] hover:text-[#94a3b8] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-[2px] rounded-b-[14px]"
        style={{
          background: c.bar,
          animation: `glass-toast-progress ${toast.duration}ms linear forwards`,
        }}
      />
    </div>
  )
}

/* ─── Toast Container (mount once in App) ───────────────────────────── */
export function GlassToaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    listeners.push(setToasts)
    return () => {
      listeners = listeners.filter((fn) => fn !== setToasts)
    }
  }, [])

  const handleDismiss = useCallback((id: string) => removeToast(id), [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2.5 w-[calc(100%-2rem)] max-w-[420px] pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={handleDismiss} />
        </div>
      ))}
    </div>
  )
}
