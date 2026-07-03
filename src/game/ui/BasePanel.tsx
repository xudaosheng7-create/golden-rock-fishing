// ═══════════════════════════════════════
// 通用面板壳
// 标题栏 + 关闭按钮 + 滚动内容区
// ═══════════════════════════════════════

import { X } from 'lucide-react'
import type { ReactNode } from 'react'

interface BasePanelProps {
  title: string
  onClose: () => void
  children: ReactNode
  /** 面板高度：'half' | 'full' */
  height?: 'half' | 'full'
  className?: string
}

export function BasePanel({ title, onClose, children, height = 'full', className = '' }: BasePanelProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/50" onClick={onClose}>
      <div
        className={`w-full max-w-[430px] bg-gradient-to-b from-gray-900 to-gray-950 rounded-t-2xl flex flex-col panel-enter ${
          height === 'half' ? 'h-[55%]' : 'h-[90%]'
        } ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-y-auto px-4 py-3">{children}</div>

        {/* 底部安全区 */}
        <div className="h-[env(safe-area-inset-bottom,8px)]" />
      </div>
    </div>
  )
}
