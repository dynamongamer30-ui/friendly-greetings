import { useState, useEffect, useCallback, useRef } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { playSuccess, playError } from '@/lib/sound'

/* ─── Types ──────────────────────────────────────────────────────────────── */
type ToastType = 'success' | 'error' | 'warning' | 'info'
export type ToastPosition = 'top-center' | 'bottom-center' | 'bottom-right'

interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
  exiting?: boolean
}

const POS_KEY = 'dg_toast_pos'
const MAX_STACK = 3

function readPos(): ToastPosition {
  try {
    const v = localStorage.getItem(POS_KEY)
    if (v === 'top-center' || v === 'bottom-center' || v === 'bottom-right') return v
  } catch { /* ignore */ }
  return 'top-center'
}

export function setToastPosition(pos: ToastPosition) {
  try { localStorage.setItem(POS_KEY, pos) } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('dg:toast-pos', { detail: pos }))
}

export function getToastPosition(): ToastPosition {
  return readPos()
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
  // Cap to MAX_STACK — drop oldest
  while (toastQueue.length > MAX_STACK) {
    toastQueue.shift()
  }
  if (type === 'success') playSuccess()
  else if (type === 'error') playError()
  emit()
}

function removeToast(id: string) {
  toastQueue = toastQueue.map((t) => (t.id === id ? { ...t, exiting: true } : t))
  emit()
  setTimeout(() => {
    toastQueue = toastQueue.filter((t) => t.id !== id)
    emit()
  }, 280)
}

/* ─── Public API ─────────────────────────────────────────────────────── */
export const glassToast = {
  success: (msg: string) => addToast(msg, 'success'),
  error: (msg: string) => addToast(msg, 'error'),
  warning: (msg: string) => addToast(msg, 'warning'),
  info: (msg: string) => addToast(msg, 'info'),
}

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 className="w-[18px] h-[18px] shrink-0" />,
  error: <XCircle className="w-[18px] h-[18px] shrink-0" />,
  warning: <AlertTriangle className="w-[18px] h-[18px] shrink-0" />,
  info: <Info className="w-[18px] h-[18px] shrink-0" />,
}

const COLOR: Record<ToastType, { icon: string; border: string; glow: string; bar: string }> = {
  success: { icon: '#00F0FF', border: 'rgba(0, 240, 255, 0.28)', glow: 'rgba(0, 240, 255, 0.12)', bar: '#00F0FF' },
  error:   { icon: '#EF4444', border: 'rgba(239, 68, 68, 0.28)', glow: 'rgba(239, 68, 68, 0.12)', bar: '#EF4444' },
  warning: { icon: '#EAB308', border: 'rgba(234, 179, 8, 0.28)', glow: 'rgba(234, 179, 8, 0.12)', bar: '#EAB308' },
  info:    { icon: '#7B2FFF', border: 'rgba(123, 47, 255, 0.28)', glow: 'rgba(123, 47, 255, 0.12)', bar: '#7B2FFF' },
}

/* ─── Single Toast Item with swipe-to-dismiss ─────────────────────── */
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const c = COLOR[toast.type]
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const [dragX, setDragX] = useState(0)
  const startXRef = useRef<number | null>(null)

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(toast.id), toast.duration)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [toast.id, toast.duration, onDismiss])

  const onTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX
  }
  const onTouchMove = (e: React.TouchEvent) => {
    if (startXRef.current == null) return
    setDragX(e.touches[0].clientX - startXRef.current)
  }
  const onTouchEnd = () => {
    if (Math.abs(dragX) > 80) {
      onDismiss(toast.id)
    } else {
      setDragX(0)
    }
    startXRef.current = null
  }

  const opacity = Math.max(0, 1 - Math.abs(dragX) / 200)

  return (
    <div
      className={`glass-toast-item ${toast.exiting ? 'glass-toast-exit' : 'glass-toast-enter'}`}
      style={{
        borderColor: c.border,
        boxShadow: `0 8px 32px rgba(0,0,0,0.55), 0 0 24px ${c.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
        transform: `translateX(${dragX}px)`,
        opacity,
        transition: startXRef.current == null ? 'transform 0.25s ease, opacity 0.25s ease' : undefined,
        touchAction: 'pan-y',
      }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <span style={{ color: c.icon }}>{ICONS[toast.type]}</span>

      <span className="flex-1 text-[13px] font-semibold text-[#E2E8F0] leading-snug">
        {toast.message}
      </span>

      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-0.5 rounded-md text-[#475569] hover:text-[#94a3b8] hover:bg-[rgba(255,255,255,0.06)] transition-colors"
        data-no-click-sound="true"
      >
        <X className="w-3.5 h-3.5" />
      </button>

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

/* ─── Toast Container ────────────────────────────────────────────────── */
export function GlassToaster() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [pos, setPos] = useState<ToastPosition>(readPos())

  useEffect(() => {
    listeners.push(setToasts)
    const onPos = (e: Event) => setPos((e as CustomEvent<ToastPosition>).detail)
    window.addEventListener('dg:toast-pos', onPos)
    return () => {
      listeners = listeners.filter((fn) => fn !== setToasts)
      window.removeEventListener('dg:toast-pos', onPos)
    }
  }, [])

  const handleDismiss = useCallback((id: string) => removeToast(id), [])

  if (toasts.length === 0) return null

  const containerCls =
    pos === 'bottom-right' ? 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 w-[calc(100%-2rem)] max-w-[420px] pointer-events-none'
    : pos === 'bottom-center' ? 'fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2.5 w-[calc(100%-2rem)] max-w-[420px] pointer-events-none'
    : 'fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2.5 w-[calc(100%-2rem)] max-w-[420px] pointer-events-none'

  return (
    <div className={containerCls}>
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onDismiss={handleDismiss} />
        </div>
      ))}
    </div>
  )
}
