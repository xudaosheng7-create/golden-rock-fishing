# 微信小程序原生壳对接指南

> H5 游戏通过 `<web-view>` 加载，原生壳处理登录 + 广告 + 分享

---

## 一、架构

```
微信小程序原生壳
├── pages/index/index     ← web-view 加载 H5
├── utils/bridge.js        ← 通信桥接
└── app.js                 ← 全局 wx.login / 广告初始化

        ↕ postMessage

H5 游戏 (React)
├── WechatBridge.ts        ← H5 侧通信
├── AdManager.ts           ← 广告管理
└── LoginScreen.tsx        ← 登录 UI
```

---

## 二、原生壳需要实现

### 1. 登录页 (pages/index/index.wxml)

```xml
<web-view 
  src="{{gameUrl}}" 
  bindmessage="onMessage"
  bindload="onLoad"
/>
```

### 2. 登录页 (pages/index/index.js)

```javascript
Page({
  data: {
    gameUrl: 'https://你的域名.com'  // H5 部署地址
  },

  onLoad() {
    // 预登录获取 openid
    this.doLogin()
  },

  doLogin() {
    wx.login({
      success: (res) => {
        // res.code 发给你的后端换取 openid + session_key
        // 后端返回用户信息后...
        const userProfile = {
          nickname: '微信用户',  // 或从后端获取
          avatarUrl: 'https://xxx/avatar.png'
        }
        // 暂存，等待 H5 请求时发送
        this.userProfile = userProfile
      }
    })
  },

  // 接收 H5 消息
  onMessage(e) {
    const data = e.detail.data[0]
    if (!data) return

    switch (data.type) {
      case 'wx_login':
        // H5 请求登录 → 返回用户信息
        this.sendToH5({
          type: 'wx_login_result',
          success: true,
          profile: this.userProfile
        })
        break

      case 'show_ad':
        this.showAd(data)
        break

      case 'preload_ad':
        this.preloadAd(data.adType)
        break
    }
  },

  // 向 H5 发消息
  sendToH5(msg) {
    // web-view 只能通过修改 src hash 或 reload 传参
    // 推荐：使用 URL hash 传递
    const encoded = encodeURIComponent(JSON.stringify(msg))
    this.setData({ gameUrl: `https://你的域名.com#msg=${encoded}` })
  }
})
```

### 3. 广告处理 (同一文件)

```javascript
Page({
  // 预加载激励视频
  preloadAd(adType) {
    if (adType === 'rewarded') {
      this.rewardedAd = wx.createRewardedVideoAd({
        adUnitId: 'adunit-xxxxxxxx'  // 微信后台申请
      })
      this.rewardedAd.load()
    }
  },

  showAd(data) {
    if (data.adType === 'rewarded' && this.rewardedAd) {
      this.rewardedAd.show().then(() => {
        // 看完 → 通知 H5 发奖励
        this.sendToH5({ type: 'ad_result', success: true, scene: data.scene })
      }).catch(() => {
        // 失败/无广告 → 也发奖励（体验优先）
        this.sendToH5({ type: 'ad_result', success: true, scene: data.scene })
        // 重新加载
        this.rewardedAd.load()
      })
    }

    if (data.adType === 'banner') {
      if (!this.bannerAd) {
        this.bannerAd = wx.createBannerAd({
          adUnitId: 'adunit-yyyyyyyy',
          style: { left: 0, top: 0, width: 320 }
        })
      }
      data.show ? this.bannerAd.show() : this.bannerAd.hide()
    }
  }
})
```

---

## 三、H5 侧已实现

| 文件 | 功能 |
|------|------|
| `WechatBridge.ts` | 检测环境 / 请求登录 / 收发消息 |
| `AdManager.ts` | 广告管理 / 浏览器 Mock |
| `LoginScreen.tsx` | 微信登录按钮 / 游客模式 |

---

## 四、通信流程

```
1. 用户打开小程序 → web-view 加载 H5
2. 原生壳调用 wx.login → 获取 openid
3. H5 显示登录页 → 用户点击"微信授权登录"
4. H5 postMessage({type:'wx_login'}) → 原生壳
5. 原生壳 sendToH5({profile}) → H5
6. H5 保存 profile → 进入游戏
```

---

## 五、测试

浏览器直接打开 H5 → 显示"进入游戏"按钮（游客模式）

微信开发者工具中：
1. 创建小程序项目
2. pages/index 配置 web-view
3. web-view src 指向 H5 地址
4. 测试登录 + 广告流程

---

*对接指南 v1.0*
