// ═══════════════════════════════════════
// 面板管理器
// 按 activePanel 动态渲染对应面板
// ═══════════════════════════════════════

import { useUIStore } from '../store/useUIStore'

// 面板组件
import { SpotPanel } from './panels/SpotPanel'
import { BasketPanel } from './panels/BasketPanel'
import { BackpackPanel } from './panels/BackpackPanel'
import { MarketPanel } from './panels/MarketPanel'
import { QuestPanel } from './panels/QuestPanel'
import { BookPanel } from './panels/BookPanel'
import { RankPanel } from './panels/RankPanel'
import { TankPanel } from './panels/TankPanel'
import { GuildPanel } from './panels/GuildPanel'
import { ActivePanel } from './panels/ActivePanel'
import { ExpertPanel } from './panels/ExpertPanel'
import { ProfilePanel } from './panels/ProfilePanel'
import { EquipPanel } from './panels/EquipPanel'
import { SettingsPanel } from './panels/SettingsPanel'
import { MailPanel } from './panels/MailPanel'
import { GiftPanel } from './panels/GiftPanel'

export function PanelManager() {
  const activePanel = useUIStore((s) => s.activePanel)
  const closePanel = useUIStore((s) => s.closePanel)

  if (!activePanel) return null

  const handleClose = () => closePanel()

  switch (activePanel) {
    case 'spot':
      return <SpotPanel onClose={handleClose} />
    case 'basket':
      return <BasketPanel onClose={handleClose} />
    case 'backpack':
      return <BackpackPanel onClose={handleClose} />
    case 'market':
      return <MarketPanel onClose={handleClose} />
    case 'quest':
      return <QuestPanel onClose={handleClose} />
    case 'book':
      return <BookPanel onClose={handleClose} />
    case 'rank':
      return <RankPanel onClose={handleClose} />
    case 'tank':
      return <TankPanel onClose={handleClose} />
    case 'guild':
      return <GuildPanel onClose={handleClose} />
    case 'active':
      return <ActivePanel onClose={handleClose} />
    case 'expert':
      return <ExpertPanel onClose={handleClose} />
    case 'profile':
      return <ProfilePanel onClose={handleClose} />
    case 'equip':
      return <EquipPanel onClose={handleClose} />
    case 'settings':
      return <SettingsPanel onClose={handleClose} />
    case 'mail':
      return <MailPanel onClose={handleClose} />
    case 'gift':
      return <GiftPanel onClose={handleClose} />
    default:
      return null
  }
}
