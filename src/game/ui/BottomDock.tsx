// ═══════════════════════════════════════
// 底部菜单栏（Dock）
// 常驻底部，11 个入口图标
// ═══════════════════════════════════════

import {
  MapPin,
  Package,
  ShoppingBag,
  ClipboardList,
  BookOpen,
  Trophy,
  Fish,
  Ship,
  Users,
  Star,
  Anchor,
} from 'lucide-react'
import { useUIStore } from '../store/useUIStore'
import { usePlayerStore } from '../store/usePlayerStore'
import type { PanelName } from '../types'

const DOCK_ITEMS: { key: PanelName; label: string; icon: React.ReactNode; requiresLevel?: number }[] = [
  { key: 'spot', label: '钓点', icon: <MapPin className="w-5 h-5" /> },
  { key: 'basket', label: '鱼护', icon: <Ship className="w-5 h-5" /> },
  { key: 'backpack', label: '背包', icon: <Package className="w-5 h-5" /> },
  { key: 'market', label: '商城', icon: <ShoppingBag className="w-5 h-5" /> },
  { key: 'quest', label: '委托', icon: <ClipboardList className="w-5 h-5" /> },
  { key: 'book', label: '图鉴', icon: <BookOpen className="w-5 h-5" /> },
  { key: 'rank', label: '排行', icon: <Trophy className="w-5 h-5" /> },
  { key: 'tank', label: '鱼缸', icon: <Fish className="w-5 h-5" /> },
  { key: 'guild', label: '帮派', icon: <Users className="w-5 h-5" /> },
  { key: 'active', label: '签到', icon: <Star className="w-5 h-5" /> },
  { key: 'expert', label: '专家', icon: <Anchor className="w-5 h-5" />, requiresLevel: 20 },
]

export function BottomDock() {
  const activePanel = useUIStore((s) => s.activePanel)
  const togglePanel = useUIStore((s) => s.togglePanel)
  const level = usePlayerStore((s) => s.level)

  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-30 pb-[env(safe-area-inset-bottom,4px)]"
    >
      <div className="flex items-center justify-around bg-gradient-to-t from-black/80 to-black/40 backdrop-blur-md px-1 pt-2 pb-1">
        {DOCK_ITEMS.map((item) => {
          const locked = item.requiresLevel && level < item.requiresLevel
          const isActive = activePanel === item.key

          return (
            <button
              key={item.key}
              onClick={() => !locked && togglePanel(item.key)}
              className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-lg transition-all ${
                locked
                  ? 'opacity-30 cursor-not-allowed'
                  : isActive
                  ? 'text-ocean-300 scale-110'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {item.icon}
              <span className="text-[10px] leading-tight">
                {locked ? '🔒' : item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-ocean-400" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
