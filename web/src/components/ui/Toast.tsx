import { useState, useEffect } from 'react'
import type { ToastItem } from '../../contexts/ToastContext'

interface ToastProps {
  toast: ToastItem
  onDismiss: (id: string) => void
}

const ICON: Record<ToastItem['type'], string> = {
  success: '✓',
  error: '✗',
  info: 'ℹ',
  warning: '⚠',
}

const COLORS: Record<
  ToastItem['type'],
  { icon: string; border: string; bg: string; text: string }
> = {
  success: {
    icon: 'text-green-600',
    border: 'border-green-400',
    bg: 'bg-white',
    text: 'text-gray-800',
  },
  error: {
    icon: 'text-red-500',
    border: 'border-red-400',
    bg: 'bg-white',
    text: 'text-gray-800',
  },
  info: {
    icon: 'text-blue-500',
    border: 'border-blue-400',
    bg: 'bg-white',
    text: 'text-gray-800',
  },
  warning: {
    icon: 'text-amber-500',
    border: 'border-amber-400',
    bg: 'bg-white',
    text: 'text-gray-800',
  },
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)

  // Trigger the slide-in on mount
  useEffect(() => {
    // Small rAF delay so the browser registers the initial state before transitioning
    const raf = requestAnimationFrame(() => {
      setVisible(true)
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  const { icon, border, bg, text } = COLORS[toast.type]

  return (
    <div
      role="alert"
      className={[
        'pointer-events-auto flex items-start gap-3 min-w-[280px] max-w-sm',
        'rounded-xl border shadow-lg px-4 py-3',
        bg,
        border,
        'transition-all duration-300 ease-out',
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4',
      ].join(' ')}
    >
      {/* Icon */}
      <span className={`mt-0.5 text-lg font-bold leading-none select-none ${icon}`}>
        {ICON[toast.type]}
      </span>

      {/* Message */}
      <p className={`flex-1 text-sm leading-snug ${text}`}>{toast.message}</p>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="ml-auto -mr-1 text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
      >
        ×
      </button>
    </div>
  )
}
