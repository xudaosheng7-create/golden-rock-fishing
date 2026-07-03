/**
 * 鱼类图片映射 — 编号直连 fish_001.png ~ fish_100.png
 */
export const FISH_IMAGES: Record<string, string> = {}

for (let i = 1; i <= 100; i++) {
  const id = `fish_${String(i).padStart(3, '0')}`
  FISH_IMAGES[id] = `/fish/${id}.png`
}
