// ═══════════════════════════════════════
// OceanV41「游钓天下」核心类型定义
// ═══════════════════════════════════════

// ── 稀有度（评审后合并为 5 级） ──
export type Rarity = 1 | 2 | 3 | 4 | 5
export const RARITY_LABEL: Record<Rarity, string> = {
  1: '常见',
  2: '稀有',
  3: '史诗',
  4: '神秘',
  5: '传说',
}
export const RARITY_STAR: Record<Rarity, string> = {
  1: '★',
  2: '★★',
  3: '★★★',
  4: '★★★★',
  5: '★★★★★',
}

// ── 天气 ──
export type Weather = '晴' | '多云' | '雨' | '大风' | '雾' | '台风'

// ── 潮汐 ──
export type Tide = '涨潮' | '退潮' | '平潮' | '大潮' | '小潮'

// ── 钓法 ──
export type FishingMethod = 'rock' | 'boat' | 'lure' | 'trolling' | 'raft'

// ── 钓鱼状态机（7 状态） ──
export type FishingState =
  | 'idle'
  | 'casting'
  | 'waiting'
  | 'biting'
  | 'fighting'
  | 'netting'
  | 'caught'

// ── 挣扎模式（10 种） ──
export type FightMode =
  | 'gentle'
  | 'jump'
  | 'burst'
  | 'sprint'
  | 'deep_dive'
  | 'drill'
  | 'roll'
  | 'spin'
  | 'swing'
  | 'long_endurance'
  | 'scream'

export const FIGHT_MODE_LABEL: Record<FightMode, string> = {
  gentle: '温顺',
  jump: '跳跃',
  burst: '冲刺',
  sprint: '冲刺',
  deep_dive: '深潜',
  drill: '钻底',
  roll: '翻滚',
  spin: '翻滚',
  swing: '摇摆',
  long_endurance: '持久拉锯',
  scream: '尖叫冲刺',
}

export const FIGHT_MODE_DIFFICULTY: Record<FightMode, number> = {
  gentle: 1,
  jump: 2,
  burst: 3,
  sprint: 3,
  deep_dive: 4,
  drill: 3,
  roll: 3,
  spin: 3,
  swing: 2,
  long_endurance: 5,
  scream: 4,
}

// ── QTE 事件类型 ──
export interface QTEEvent {
  mode: Exclude<FightMode, 'gentle' | 'long_endurance'>
  label: string
  duration: number // 秒
  action: 'release' // 松线
}

// ── 鱼类定义 ──
export interface FishDef {
  id: string
  name: string // 中文俗名
  scientificName: string // 学名
  family: string // 科属
  habit: string // 生活习性
  distribution: string // 地理分布
  minW: number // 最小重量 (kg)
  maxW: number // 最大重量 (kg)
  rarity: Rarity
  value: number // 基础单价 (金币/kg)
  valueMax: number // 最大单价
  bait: string[] // 偏好鱼饵 ID 数组
  fight: FightMode // 挣扎模式
  desc: string // 描述
  worldRecord?: number // 世界纪录 (kg)
  dayActive: boolean // 日行性
  nightActive: boolean // 夜行性
  depthMin: number // 活动水深下限 (m)
  depthMax: number // 活动水深上限 (m)
}

// ── 装备定义 ──
export interface EquipDef {
  id: string
  name: string
  type: EquipType
  brand?: string // 品牌
  power?: number // 拉力值
  rareBonus?: number // 稀有加成
  maxDurability: number // 最大耐久
  price: number // 购买价格 (金币)
  diamondPrice?: number // 钻石价格
  unlockLevel: number // 解锁等级
  desc?: string
  // 鱼饵/窝料特有
  keywords?: string[] // 关键词（用于匹配鱼种偏好）
  capacity?: number // 容量（鱼缸扩展）
  maxWeight?: number // 承重（抄网）
}

export type EquipType =
  | 'rod'      // 渔竿
  | 'line'     // 渔线
  | 'hook'     // 渔钩
  | 'float'    // 浮漂
  | 'reel'     // 卷线器
  | 'net'      // 抄网
  | 'bait'     // 鱼饵
  | 'lure'     // 拟饵
  | 'chum'     // 窝料
  | 'tank'     // 鱼缸扩展

export const EQUIP_TYPE_LABEL: Record<EquipType, string> = {
  rod: '渔竿',
  line: '渔线',
  hook: '渔钩',
  float: '浮漂',
  reel: '卷线器',
  net: '抄网',
  bait: '鱼饵',
  lure: '拟饵',
  chum: '窝料',
  tank: '鱼缸扩展',
}

// ── 钓场定义 ──
export interface SpotDef {
  id: string
  name: string
  region: string // 海域
  province: string // 省份
  unlockLevel: number
  entryFee: number // 入场费
  fish: string[] // 可钓鱼种 ID 列表
  waterColor: string // 水域颜色 (hex)
  bgUrl: string // 2D 背景图 CDN URL
  depthRange: [number, number] // 水深范围 (m)
  description: string
}

// ── 窝料定义 ──
export interface ChumDef extends EquipDef {
  type: 'chum'
  fishTargets: string[] // 目标鱼种 ID
  casts: number // 使用次数
}

// ── 任务定义 ──
export type QuestType = 'catch_count' | 'catch_weight'

export interface QuestDef {
  id: string
  type: QuestType
  title: string
  description: string
  targetCount?: number // catch_count 目标数量
  targetWeight?: number // catch_weight 目标重量
  reward: {
    gold: number
    exp: number
    diamond?: number
    itemId?: string
  }
  progress: number
  completed: boolean
  claimed: boolean
}

// ── 鱼缸中的鱼 ──
export interface TankFish {
  id: string // 唯一实例 ID
  fishId: string
  weight: number
  caughtAt: number // Unix timestamp
  lastCollectedAt: number
}

// ── 鱼护中的鱼 ──
export interface BasketFish {
  id: string // 唯一实例 ID
  fishId: string
  weight: number
  caughtAt: number
}

// ── 收集记录 ──
export interface CollectRecord {
  count: number
  maxWeight: number
}

// ── 背包物品 ──
export interface InventoryItem {
  id: string // 装备/消耗品 ID
  count: number // 数量
  durability?: number // 当前耐久（装备类）
}

// ── 玩家统计 ──
export interface GameStats {
  playTime: number // 累计游戏时长（秒）
  totalCasts: number // 累计抛竿次数
  totalEscapes: number // 累计脱钩/断线/逃跑次数
  totalWeight: number // 累计钓获总重量 (kg)
}

// ── 用户档案 ──
export interface UserProfile {
  nickname: string
  avatarUrl: string
}

// ── Toast 通知 ──
export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

// ── 活跃奖励 ──
export interface ActiveReward {
  threshold: number
  reward: {
    gold: number
    diamond?: number
    exp?: number
    itemId?: string
  }
  claimed: boolean
}

// ── 签到奖励 ──
export interface SignInReward {
  day: number
  gold: number
  diamond?: number
  exp?: number
  itemId?: string
}

// ── 钓场环境 ──
export interface SpotEnvironment {
  tide: Tide
  weather: Weather
  time: string // HH:MM 格式
}

// ── 概率计算输入 ──
export interface ProbabilityInput {
  spot: SpotDef
  fish: FishDef
  baitId: string | null
  chumId: string | null
  chumTargets: string[]
  tide: Tide
  weather: Weather
  time: string
  depth: number
  rareBonus: number
}

// ── 概率计算输出 ──
export interface ProbabilityOutput {
  weight: number // 未归一化权重
  breakdown: {
    base: number
    baitMatch: number
    chumMatch: number
    rareBonus: number
    environment: number
  }
}

// ── 战斗结果 ──
export interface CombatResult {
  lineTension: number
  fishStamina: number
  equipmentDamage: {
    rod: number
    line: number
    hook: number
    reel: number
    net: number
  }
  lineSnapped: boolean
  fishEscaped: boolean
}

// ── 面板名称 ──
export type PanelName =
  | 'profile'
  | 'settings'
  | 'equip'
  | 'market'
  | 'basket'
  | 'rank'
  | 'tank'
  | 'mail'
  | 'active'
  | 'gift'
  | 'spot'
  | 'book'
  | 'quest'
  | 'backpack'
  | 'guild'
  | 'expert'
  | null
