import { BasePanel } from '../BasePanel'
import { Mail, MailOpen, Gift } from 'lucide-react'

interface MailPanelProps {
  onClose: () => void
}

// 占位邮件
const MOCK_MAILS = [
  {
    id: 'sys_001',
    title: '欢迎来到游钓天下',
    content: '欢迎加入钓鱼的世界！作为新手礼物，我们为您准备了初始装备和金币，祝您钓获满满！',
    receivedAt: Date.now() - 86400000,
    read: true,
    hasReward: false,
  },
  {
    id: 'sys_002',
    title: '版本更新公告 v1.0.0',
    content: '新增专家模式、每日委托系统，优化钓鱼手感，修复已知问题。感谢您的支持！',
    receivedAt: Date.now() - 172800000,
    read: true,
    hasReward: false,
  },
  {
    id: 'sys_003',
    title: '周末双倍活动',
    content: '本周末所有钓场收益翻倍！快来享受双倍渔获的乐趣吧！',
    receivedAt: Date.now() - 259200000,
    read: false,
    hasReward: true,
  },
]

function formatMailTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return '刚刚'
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}天前`
  return `${Math.floor(days / 7)}周前`
}

export function MailPanel({ onClose }: MailPanelProps) {
  return (
    <BasePanel title="邮件" onClose={onClose}>
      {MOCK_MAILS.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-gray-800/50 border border-white/10 flex items-center justify-center mb-4">
            <Mail className="w-10 h-10 text-white/20" />
          </div>
          <h3 className="text-lg font-bold text-white/40 mb-1">暂无邮件</h3>
          <p className="text-sm text-white/20">系统邮件和活动奖励将会在这里显示</p>
        </div>
      ) : (
        <div className="space-y-2">
          {MOCK_MAILS.map((mail) => (
            <div
              key={mail.id}
              className={`bg-gray-800/50 rounded-xl border p-4 transition-all ${
                mail.read ? 'border-white/5 opacity-70' : 'border-cyan-500/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  {mail.read ? (
                    <MailOpen className="w-5 h-5 text-white/30" />
                  ) : (
                    <Mail className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-white truncate">{mail.title}</h4>
                    <span className="text-[10px] text-white/30 ml-2 shrink-0">
                      {formatMailTime(mail.receivedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 line-clamp-2">{mail.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    {!mail.read && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                        未读
                      </span>
                    )}
                    {mail.hasReward && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-300 flex items-center gap-0.5">
                        <Gift className="w-2.5 h-2.5" />
                        有附件
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </BasePanel>
  )
}
