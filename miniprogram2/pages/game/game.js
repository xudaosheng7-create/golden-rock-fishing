const app = getApp()

Page({
  data: {
    gameUrl: app.globalData.gameUrl
  },

  onLoad() {
    console.log('Game page loaded, url:', this.data.gameUrl)
  },

  onMessage(e) {
    const msgs = e.detail.data
    if (msgs && msgs.length) {
      console.log('H5 message:', msgs[msgs.length-1])
    }
  },

  onError(e) {
    console.error('WebView error:', e.detail)
  }
})
