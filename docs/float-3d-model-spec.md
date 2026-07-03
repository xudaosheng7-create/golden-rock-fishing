# 游钓天下 — 3D 阿波浮漂模型需求

> 交付对象：AI 3D 模型生成工具（豆包等）
> 格式：GLB 2.0 / GLTF
> 目标平台：手机 H5（Three.js + React Three Fiber）

---

## 一、技术规格

| 参数 | 要求 |
|------|------|
| **格式** | `.glb`（首选）或 `.gltf` |
| **面数** | ≤ 800 tris（极小物件） |
| **贴图** | 可不带贴图，纯顶点色/材质色即可 |
| **材质** | 2-3 个简单材质（荧光橙 + 白天线 + 金属环） |
| **单位** | 厘米（1 unit = 1cm），真实尺寸 |
| **朝向** | Y 轴向上为天线方向 |
| **原点** | 漂身几何中心为原点 (0, 0, 0) |

## 二、阿波造型

### 真实结构（从上到下）

```
     ●  天线顶球 — 荧光红，直径 3mm
     │
     │  天线杆 — 细长碳纤杆，直径 1.5mm，长 18cm
     │  黑色/深灰
     │
     —  天线根部色环 — 橙色，宽 2mm
     │
  ╱    ╲
 │  上半  │  荧光橙涂层，自发光质感
 │        │  蛋形最宽处直径 14mm
 │  ══   │  荧光黄绿分界线，宽 2mm
 │  下半  │  白色，略收窄
  ╲    ╱
     │
     ○  底部金属线环 — 银色不锈钢，内径 3mm
     ·  夜光点 — 荧光绿，直径 2mm
```

### 关键尺寸

| 部位 | 尺寸 |
|------|------|
| 漂身总高 | 3.2 cm |
| 漂身最宽处直径 | 1.4 cm |
| 天线杆长度 | 18 cm |
| 天线杆直径 | 1.5 mm |
| 天线顶球直径 | 3 mm |
| 底部线环内径 | 3 mm |

### 漂身轮廓

水滴形 / 蛋形：
- 上部（0-40%）：从天线根部向外鼓起，到最宽处
- 中部（40-45%）：最宽处平台区
- 下部（45-90%）：逐渐收窄
- 底尖（90-100%）：快速收尖

## 三、材质要求

| 部位 | 颜色 | 粗糙度 | 金属度 | 备注 |
|------|------|--------|--------|------|
| 上半漂身 | 荧光橙 #ff3300 | 0.1 | 0.0 | 微自发光 |
| 下半漂身 | 白 #f5f5f5 | 0.3 | 0.0 | |
| 分界线 | 荧光黄绿 #ccff00 | 0.1 | 0.0 | 自发光 |
| 天线杆 | 碳纤黑 #1a1a1a | 0.4 | 0.05 | |
| 天线顶球 | 荧光红 #ff0000 | 0.1 | 0.0 | 强自发光 |
| 线环 | 不锈钢 #cccccc | 0.1 | 0.95 | |
| 夜光点 | 荧光绿 #aaff00 | 0.1 | 0.0 | 半透明 |

## 四、动画要求

此浮漂需要在水中上下浮动，不需要骨骼：

- **天线**：最好独立 Mesh（代码里可单独旋转它模拟鱼讯抖动）
- **漂身**：主体 Mesh（随水波起伏）
- **线环**：底部小环（渔线从此穿过）

三个 Mesh 分开命名：`antenna`、`body`、`ring`

## 五、AI 生图参考提示词

> A realistic Japanese-style fishing float (iso-ami bobber/abo) for a mobile fishing game. Teardrop-shaped body with fluorescent bright orange top half and white bottom half, separated by a thin chartreuse yellow-green band. Long thin carbon fiber antenna rod on top with a bright red ball at the tip. Small stainless steel ring at the bottom. Low-poly game asset under 800 triangles, PBR materials, GLB format, Y-up orientation, total height about 21cm including antenna, optimized for mobile WebGL. Clean topology, 3 separate named meshes: antenna, body, ring.

## 六、使用说明

模型在游戏场景中的位置：
```
position: [1.2, -1.6, -14]  (水面高度，渔线末端)
```

三个状态动画：
- **等待**：随水波轻微起伏
- **咬钩**：快速上下抖动 + 下沉
- **搏鱼**：根据鱼挣扎模式剧烈运动（跳跃、深潜、冲刺等）

## 七、交付物

- `fishing_float.glb` — 3D 模型文件
- 确认：3 个独立 Mesh（antenna / body / ring）

---

*需求文档 v1.0*
