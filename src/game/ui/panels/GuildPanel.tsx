import { BasePanel } from '../BasePanel'
import { Users, Ship } from 'lucide-react'

interface GuildPanelProps {
  onClose: () => void
}

export function GuildPanel({ onClose }: GuildPanelProps) {
  return (
    <BasePanel title="帮派" onClose={onClose}>
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {/* 装饰图标 */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-b from-cyan-900/40 to-blue-900/40 border border-cyan-500/20 flex items-center justify-center">
            <Users className="w-12 h-12 text-cyan-400/60" />
          </div>
          <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Ship className="w-5 h-5 text-blue-300" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">帮派系统</h3>
        <p className="text-sm text-white/40 mb-8 max-w-[240px]">
          与好友一起组建帮派，共同征战四海
        </p>

        {/* 即将上线标签 */}
        <div className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-900/30 via-blue-900/30 to-purple-900/30 border border-cyan-500/20">
          <span className="text-lg font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
            即将上线
          </span>
        </div>

        {/* 预告功能列表 */}
        <div className="mt-8 space-y-2 text-xs text-white/30">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
            帮派据点战
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
            帮派渔场共享
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
            帮派排行榜
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
            帮派商店
          </div>
        </div>
      </div>
    </BasePanel>
  )
}
