// ═══════════════════════════════════════
// 微信小程序桥接层
// H5 ↔ 原生壳 通信
// ═══════════════════════════════════════

import type { UserProfile } from '../types'

// 是否在微信环境
export function isWechat(): boolean {
  return /MicroMessenger/i.test(navigator.userAgent)
}

// 是否在微信小程序 web-view 中
export function isMiniProgram(): boolean {
  return isWechat() && (
    /miniProgram/i.test(navigator.userAgent) ||
    (window as any).__wxjs_environment === 'miniprogram'
  )
}

// 请求微信登录（通知原生壳）
export function requestWechatLogin(): Promise<UserProfile> {
  return new Promise((resolve, reject) => {
    if (!isMiniProgram()) {
      // 浏览器模式：模拟登录
      setTimeout(() => {
        resolve({
          nickname: '微信用户' + Math.floor(Math.random() * 9000 + 1000),
          avatarUrl: 'https://cdn.ocean-fishing.com/ui/wx-avatar-default.png',
        })
      }, 800)
      return
    }

    // 微信环境：发消息给原生壳
    postToNative({ type: 'wx_login' })

    // 监听原生壳返回
    const handler = (event: MessageEvent) => {
      const data = event.data
      if (data?.type === 'wx_login_result') {
        window.removeEventListener('message', handler)
        if (data.success && data.profile) {
          resolve(data.profile as UserProfile)
        } else {
          reject(new Error(data.error || '登录失败'))
        }
      }
    }
    window.addEventListener('message', handler)

    // 超时
    setTimeout(() => {
      window.removeEventListener('message', handler)
      reject(new Error('登录超时'))
    }, 10000)
  })
}

// 向原生壳发消息
function postToNative(data: Record<string, unknown>): void {
  if ((window as any).wx?.miniProgram) {
    (window as any).wx.miniProgram.postMessage({ data })
  }
}

// 监听原生壳的环境参数（openid 等）
export function listenForEnvParams(callback: (params: Record<string, string>) => void): void {
  const handler = (event: MessageEvent) => {
    const data = event.data
    if (data?.type === 'env_params') {
      callback(data.params || {})
    }
  }
  window.addEventListener('message', handler)
}
