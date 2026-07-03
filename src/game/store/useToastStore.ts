import { create } from 'zustand'
import type { Toast, ToastType } from '../types'

interface ToastState {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

let toastCounter = 0

export const useToastStore = create<ToastState>()((set) => ({
  toasts: [],

  addToast: (message, type = 'info', duration = 3000) => {
    const id = `toast_${++toastCounter}_${Date.now()}`
    set((s) => ({
      toasts: [...s.toasts, { id, message, type, duration }],
    }))
    // 自动移除
    if (duration > 0) {
      setTimeout(() => {
        set((s) => ({
          toasts: s.toasts.filter((t) => t.id !== id),
        }))
      }, duration)
    }
  },

  removeToast: (id) =>
    set((s) => ({
      toasts: s.toasts.filter((t) => t.id !== id),
    })),
}))
