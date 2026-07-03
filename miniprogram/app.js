App({
  onLaunch() {
    // 初始化广告位
    this.initAds()
  },

  initAds() {
    // 激励视频广告单元 ID（微信后台申请后替换）
    this.rewardedAdUnitId = ''
    this.bannerAdUnitId = ''
    this.interstitialAdUnitId = ''
  },

  // 全局数据
  globalData: {
    userProfile: null,
    gameUrl: 'https://你的域名.com',  // 替换为 H5 部署地址
  }
})
