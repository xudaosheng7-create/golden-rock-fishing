// ═══════════════════════════════════════
// 广告管理器 — 跨平台抽象
// 支持：微信小程序(web-view桥) / H5浏览器(mock) / 未来扩展
// ═══════════════════════════════════════

// ── 广告类型 ──
export const AdType = {
  REWARDED: 'rewarded',
  BANNER: 'banner',
  INTERSTITIAL: 'interstitial',
} as const
export type AdType = (typeof AdType)[keyof typeof AdType]

// ── 广告场景 ──
export const AdScene = {
  FREE_BAIT: 'free_bait',
  FREE_REPAIR: 'free_repair',
  SINGLE_SELL_3X: 'single_sell_3x',
  BATCH_SELL_2X: 'batch_sell_2x',
  EXTRA_SIGNIN: 'extra_signin',
  SPEED_TANK: 'speed_tank',
  REVIVE_FIGHT: 'revive_fight',
  SPOT_CHANGE: 'spot_change',
  RARE_FISH: 'rare_fish',
  IDLE_BANNER: 'idle_banner',
} as const
export type AdScene = (typeof AdScene)[keyof typeof AdScene]

// ── 广告奖励配置 ──
interface AdReward {
  gold?: number
  diamond?: number
  exp?: number
  items?: { id: string; count: number }[]
  multiplier?: number  // 双倍等倍率
}

// ── 场景 → 奖励映射 ──
const SCENE_REWARDS: Record<AdScene, AdReward> = {
  [AdScene.FREE_BAIT]:       { items: [{ id: 'bait_001', count: 10 }] },
  [AdScene.FREE_REPAIR]:     { gold: 200 },
  [AdScene.SINGLE_SELL_3X]:  { multiplier: 3 },
  [AdScene.BATCH_SELL_2X]:   { multiplier: 2 },
  [AdScene.EXTRA_SIGNIN]:    { gold: 500, diamond: 5 },
  [AdScene.SPEED_TANK]:      { gold: 100 },
  [AdScene.REVIVE_FIGHT]:    {},  // 特殊处理：恢复鱼体力
  [AdScene.SPOT_CHANGE]:     {},
  [AdScene.RARE_FISH]:       {},
  [AdScene.IDLE_BANNER]:     {},
}

// ── 广告状态 ──
export interface AdState {
  isSupported: boolean       // 当前环境是否支持广告
  isRewardedReady: boolean   // 激励视频是否加载好
  bannerVisible: boolean     // Banner 是否显示中
  lastRewardedTime: number   // 上次激励视频时间（防刷）
}

// ── 广告回调 ──
type AdCallback = (success: boolean, scene: AdScene) => void

// ═══════════════════════════════════════
// 广告管理器类
// ═══════════════════════════════════════

class AdManagerImpl {
  private state: AdState = {
    isSupported: false,
    isRewardedReady: false,
    bannerVisible: false,
    lastRewardedTime: 0,
  }

  private pendingCallback: AdCallback | null = null
  private rewardedCooldown = 30000  // 30 秒冷却

  // ── 初始化 ──
  init(): void {
    this.detectPlatform()
    if (this.state.isSupported) {
      this.preloadRewarded()
    }
  }

  // ── 平台检测 ──
  private detectPlatform(): void {
    // 检测是否在微信小程序 web-view 中
    const ua = navigator.userAgent
    const isWechat = /MicroMessenger/i.test(ua)
    const isMiniProgram = /miniProgram/i.test(ua) || (window as any).__wxjs_environment === 'miniprogram'

    if (isWechat && isMiniProgram) {
      this.state.isSupported = true
      this.initWechatBridge()
    } else {
      // 浏览器 mock 模式
      this.state.isSupported = true
      this.state.isRewardedReady = true
      console.log('[AdManager] Mock mode - ads will use confirm dialog')
    }
  }

  // ── 微信小程序桥接 ──
  private initWechatBridge(): void {
    // 监听原生层返回的广告结果
    window.addEventListener('message', (event) => {
      const data = event.data
      if (data?.type === 'ad_result') {
        this.handleAdResult(data.success, data.scene as AdScene)
      }
      if (data?.type === 'ad_ready') {
        this.state.isRewardedReady = data.ready
      }
    })

    // 通知原生层预加载
    this.postToNative({ type: 'preload_ad', adType: 'rewarded' })
  }

  // ── 向原生层发消息 ──
  private postToNative(data: Record<string, unknown>): void {
    if ((window as any).wx?.miniProgram) {
      (window as any).wx.miniProgram.postMessage({ data })
    }
  }

  // ── 预加载激励视频 ──
  private preloadRewarded(): void {
    this.postToNative({ type: 'preload_ad', adType: 'rewarded' })
    // 模拟加载延迟
    setTimeout(() => {
      this.state.isRewardedReady = true
    }, 1000)
  }

  // ═══ 公开 API ═══

  // 显示激励视频广告
  showRewardedAd(scene: AdScene, callback: AdCallback): void {
    // 冷却检查
    const now = Date.now()
    if (now - this.state.lastRewardedTime < this.rewardedCooldown) {
      const remain = Math.ceil((this.rewardedCooldown - (now - this.state.lastRewardedTime)) / 1000)
      console.warn(`[AdManager] Rewarded ad cooldown: ${remain}s remaining`)
      callback(false, scene)
      return
    }

    // 就绪检查
    if (!this.state.isRewardedReady) {
      console.warn('[AdManager] Rewarded ad not ready, preloading...')
      this.preloadRewarded()
      callback(false, scene)
      return
    }

    this.pendingCallback = callback

    // 浏览器 mock：弹出确认框模拟
    if (!this.isNativeMiniProgram()) {
      const confirmed = confirm(
        `[广告模拟]\n\n观看 15 秒视频广告？\n奖励：${this.getRewardText(scene)}\n\n(真实环境将播放微信激励视频)`
      )
      this.handleAdResult(confirmed, scene)
      return
    }

    // 微信：通知原生层展示广告
    this.postToNative({ type: 'show_ad', adType: 'rewarded', scene })
    this.state.isRewardedReady = false  // 展示后需重新加载
  }

  // 显示/隐藏 Banner
  showBanner(scene: AdScene): void {
    if (this.state.bannerVisible) return
    this.state.bannerVisible = true
    this.postToNative({ type: 'show_ad', adType: 'banner', scene, show: true })
  }

  hideBanner(): void {
    if (!this.state.bannerVisible) return
    this.state.bannerVisible = false
    this.postToNative({ type: 'show_ad', adType: 'banner', show: false })
  }

  // 显示插屏广告
  showInterstitial(scene: AdScene, probability: number = 0.3): void {
    // 概率展示，避免频繁打扰
    if (Math.random() > probability) return

    if (this.isNativeMiniProgram()) {
      this.postToNative({ type: 'show_ad', adType: 'interstitial', scene })
    }
    // 浏览器模式不弹插屏
  }

  // 获取奖励
  getReward(scene: AdScene): AdReward {
    return { ...SCENE_REWARDS[scene] }
  }

  // 获取状态
  getState(): AdState {
    return { ...this.state }
  }

  // ── 内部 ──
  private handleAdResult(success: boolean, scene: AdScene): void {
    if (this.pendingCallback) {
      this.pendingCallback(success, scene)
      this.pendingCallback = null
    }
    if (success) {
      this.state.lastRewardedTime = Date.now()
      // 观看后重新预加载
      this.preloadRewarded()
    }
  }

  private isNativeMiniProgram(): boolean {
    return /miniProgram/i.test(navigator.userAgent) || (window as any).__wxjs_environment === 'miniprogram'
  }

  private getRewardText(scene: AdScene): string {
    const r = SCENE_REWARDS[scene]
    const parts: string[] = []
    if (r.gold) parts.push(`${r.gold} 金币`)
    if (r.diamond) parts.push(`${r.diamond} 钻石`)
    if (r.exp) parts.push(`${r.exp} 经验`)
    if (r.items) r.items.forEach(i => parts.push(`${i.id} ×${i.count}`))
    if (r.multiplier) parts.push(`${r.multiplier}倍奖励`)
    return parts.join(' + ') || '特殊奖励'
  }
}

// ── 全局单例 ──
export const AdManager = new AdManagerImpl()
