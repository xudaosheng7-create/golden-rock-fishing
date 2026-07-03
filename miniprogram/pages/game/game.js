const app = getApp()

Page({
  data: {
    // 开发环境用本地地址，上线改正式域名
    gameUrl: 'http://192.168.101.8:3000'
  },

  onLoad() {
    this.preloadRewardedAd()
    this.listenHashMessage()
  },

  // 监听 H5 通过 URL hash 发来的消息
  listenHashMessage() {
    // web-view 中 postMessage 有限制，用 hash 传消息更可靠
    wx.onAppRoute(() => {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      if (currentPage) {
        const url = currentPage.route || ''
        const hashMatch = url.match(/#msg=(.+)/)
        if (hashMatch) {
          try {
            const msg = JSON.parse(decodeURIComponent(hashMatch[1]))
            this.handleMessage(msg)
          } catch (e) {
            console.warn('hash message parse error:', e)
          }
        }
      }
    })
  },

  // 接收 web-view 的 bindmessage
  onMessage(e) {
    const data = e.detail.data
    if (data && data.length > 0) {
      const msg = data[data.length - 1]
      if (msg) this.handleMessage(msg)
    }
  },

  // 处理 H5 发来的消息
  handleMessage(msg) {
    switch (msg.type) {
      case 'wx_login':
        this.doLogin()
        break
      case 'show_ad':
        this.showAd(msg)
        break
      case 'preload_ad':
        this.preloadAd(msg.adType)
        break
    }
  },

  // ===== 微信登录 =====
  doLogin() {
    wx.login({
      success: (res) => {
        if (res.code) {
          // TODO: 发送 code 到你的后端换取 openid
          // 简化版：直接返回游客信息
          this.sendToH5({
            type: 'wx_login_result',
            success: true,
            profile: {
              nickname: '微信钓友',
              avatarUrl: '/assets/default-avatar.png'
            }
          })
        }
      },
      fail: () => {
        this.sendToH5({
          type: 'wx_login_result',
          success: false,
          error: '登录失败'
        })
      }
    })
  },

  // 向 H5 发送消息
  sendToH5(msg) {
    // 通过修改 web-view src 的 hash 传消息
    const encoded = encodeURIComponent(JSON.stringify(msg))
    const baseUrl = this.data.gameUrl.split('#')[0]
    this.setData({
      gameUrl: `${baseUrl}#msg=${encoded}`
    })
  },

  // ===== 广告 =====
  preloadRewardedAd() {
    if (!app.rewardedAdUnitId) return
    this.rewardedAd = wx.createRewardedVideoAd({
      adUnitId: app.rewardedAdUnitId
    })
    this.rewardedAd.onLoad(() => {
      this.sendToH5({ type: 'ad_ready', ready: true })
    })
    this.rewardedAd.onError(() => {
      this.sendToH5({ type: 'ad_ready', ready: false })
    })
    this.rewardedAd.onClose((res) => {
      if (res && res.isEnded) {
        this.sendToH5({ type: 'ad_result', success: true, scene: this._adScene })
      } else {
        this.sendToH5({ type: 'ad_result', success: false, scene: this._adScene })
      }
      // 重新加载
      this.rewardedAd.load()
    })
  },

  showAd(msg) {
    if (msg.adType === 'rewarded' && this.rewardedAd) {
      this._adScene = msg.scene
      this.rewardedAd.show().catch(() => {
        // 广告加载失败，直接给奖励
        this.sendToH5({ type: 'ad_result', success: true, scene: msg.scene })
        this.rewardedAd.load()
      })
    }

    if (msg.adType === 'banner' && app.bannerAdUnitId) {
      if (!this.bannerAd) {
        this.bannerAd = wx.createBannerAd({
          adUnitId: app.bannerAdUnitId,
          style: { left: 0, top: 0, width: 320 }
        })
      }
      msg.show ? this.bannerAd.show() : this.bannerAd.hide()
    }
  },

  onWebViewLoad() {
    console.log('WebView loaded')
  },

  onWebViewError(e) {
    console.error('WebView error:', e.detail)
  },

  onUnload() {
    if (this.rewardedAd) {
      this.rewardedAd.destroy()
    }
    if (this.bannerAd) {
      this.bannerAd.destroy()
    }
  }
})
