/**
 * 游戏通用资源 URL 定义
 * 钓场背景图在 SPOTS 中各自定义，此处只放全局资源
 */
export const ASSETS = {
  defaultAvatar: 'https://cdn.ocean-fishing.com/ui/default-avatar.webp',
  logo: 'https://cdn.ocean-fishing.com/ui/logo.webp',

  sfx: {
    cast: 'https://cdn.ocean-fishing.com/sfx/cast.mp3',
    waterSplash: 'https://cdn.ocean-fishing.com/sfx/water-splash.mp3',
    bite: 'https://cdn.ocean-fishing.com/sfx/bite.mp3',
    reel: 'https://cdn.ocean-fishing.com/sfx/reel.mp3',
    lineSnap: 'https://cdn.ocean-fishing.com/sfx/line-snap.mp3',
    caught: 'https://cdn.ocean-fishing.com/sfx/caught.mp3',
    ambient: 'https://cdn.ocean-fishing.com/sfx/ambient-sea.mp3',
  },

  icons: {
    gold: 'https://cdn.ocean-fishing.com/ui/icon-gold.webp',
    diamond: 'https://cdn.ocean-fishing.com/ui/icon-diamond.webp',
    exp: 'https://cdn.ocean-fishing.com/ui/icon-exp.webp',
  },
} as const
