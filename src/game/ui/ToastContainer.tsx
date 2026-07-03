// ═══════════════════════════════════════
// Toast 通知容器
// 顶部滑入式通知
// ═══════════════════════════════════════

import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useToastStore } from '../store/useToastStore'
import type { ToastType } from '../types'

const TOAST_ICON: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-4 h-4 text-green-400" />,
  error: <XCircle className="w-4 h-4 text-red-400" />,
  info: <Info className="w-4 h-4 text-blue-400" />,
  warning: <AlertTriangle className="w-4 h-4 text-yellow-400" />,
}

const TOAST_BG: Record<ToastType, string> = {
  success: 'bg-green-900/80 border-green-500/30',
  error: 'bg-red-900/80 border-red-500/30',
  info: 'bg-blue-900/80 border-blue-500/30',
  warning: 'bg-yellow-900/80 border-yellow-500/30',
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  if (toasts.length === 0) return null

  return (
    <div className="absolute top-14 left-0 right-0 z-50 flex flex-col items-center gap-1 px-4 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`w-full max-w-sm flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-md text-white text-sm toast-enter pointer-events-auto ${TOAST_BG[toast.type]}`}
        >
          {TOAST_ICON[toast.type]}
          <span className="flex-1">{toast.message}</span>
          <button onClick={() => removeToast(toast.id)} className="shrink-0">
            <X className="w-3 h-3 text-white/50 hover:text-white" />
          </button>
        </div>
      ))}
    </div>
  )
}
