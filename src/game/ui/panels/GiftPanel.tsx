import { useState } from 'react'
import { usePlayerStore } from '../../store/usePlayerStore'
import { BasePanel } from '../BasePanel'
import { Gift, TicketCheck, Sparkles, CheckCircle2, XCircle } from 'lucide-react'

interface GiftPanelProps {
  onClose: () => void
}

export function GiftPanel({ onClose }: GiftPanelProps) {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleRedeem = () => {
    if (!code.trim()) return

    // 占位: 实际应调用后端兑换接口
    if (code.trim().toUpperCase() === 'VIP888') {
      setStatus('success')
      usePlayerStore.getState().addGold(5000)
      usePlayerStore.getState().addDiamond(50)
      setTimeout(() => setStatus('idle'), 3000)
    } else {
      setStatus('error')
      setTimeout(() => setStatus('idle'), 2000)
    }
  }

  return (
    <BasePanel title="礼包码" onClose={onClose}>
      {/* 兑换输入 */}
      <div className="bg-gray-800/50 rounded-xl border border-white/10 p-5 mb-4">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <TicketCheck className="w-4 h-4 text-cyan-400" />
          兑换礼包码
        </h3>

        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="输入礼包码"
            maxLength={20}
            className="flex-1 bg-gray-700/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-cyan-500/50 transition-colors"
          />
          <button
            onClick={handleRedeem}
            disabled={!code.trim()}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
              code.trim()
                ? 'bg-cyan-600/30 text-cyan-300 hover:bg-cyan-600/40 border border-cyan-500/30'
                : 'bg-gray-700/50 text-white/30 cursor-not-allowed border border-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            兑换
          </button>
        </div>

        {/* 状态提示 */}
        {status === 'success' && (
          <div className="mt-3 flex items-center gap-2 text-sm text-green-400 bg-green-600/10 rounded-lg px-3 py-2 border border-green-500/30">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            兑换成功！已发放奖励
          </div>
        )}
        {status === 'error' && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-400 bg-red-600/10 rounded-lg px-3 py-2 border border-red-500/30">
            <XCircle className="w-4 h-4 shrink-0" />
            无效的礼包码，请检查后重试
          </div>
        )}
      </div>

      {/* 暂无礼包 */}
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-gray-800/50 to-gray-900/50 border border-white/10 flex items-center justify-center mb-4">
          <Gift className="w-10 h-10 text-white/20" />
        </div>
        <h3 className="text-lg font-bold text-white/40 mb-1">暂无礼包</h3>
        <p className="text-sm text-white/20 max-w-[200px]">
          目前没有可用的礼包，请关注游戏公告获取最新礼包码
        </p>
      </div>

      {/* 礼包使用说明 */}
      <div className="bg-gray-800/30 rounded-xl border border-white/5 p-3">
        <h4 className="text-xs font-medium text-white/40 mb-2">使用说明</h4>
        <ul className="space-y-1 text-[10px] text-white/30">
          <li>· 礼包码区分大小写，请准确输入</li>
          <li>· 每个礼包码仅限使用一次</li>
          <li>· 部分礼包码有有效期限制</li>
          <li>· 如遇问题请联系客服</li>
        </ul>
      </div>
    </BasePanel>
  )
}
