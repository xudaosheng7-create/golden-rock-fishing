import { create } from 'zustand'
import type { PanelName } from '../types'

interface UIState {
  activePanel: PanelName
  openPanel: (panel: PanelName) => void
  closePanel: () => void
  togglePanel: (panel: PanelName) => void
}

export const useUIStore = create<UIState>()((set, get) => ({
  activePanel: null,

  openPanel: (panel) => set({ activePanel: panel }),
  closePanel: () => set({ activePanel: null }),
  togglePanel: (panel) => {
    const current = get().activePanel
    set({ activePanel: current === panel ? null : panel })
  },
}))
