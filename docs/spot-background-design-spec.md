# 「游钓天下」钓场背景图设计需求

## 技术规格

| 参数 | 值 |
|------|-----|
| 分辨率 | **828 × 1792 px** (9:19.5 竖屏，覆盖主流手机) |
| 格式 | WebP (lossy 80%)，保留 PNG 源文件 |
| 构图 | **第一人称钓鱼视角**，画面下方为水面/礁石/船沿，上方为远景天空 |
| 海平线位置 | 画面高度的 **30%~33%** 处（距离顶部） |
| 色调 | 与对应海域真实水色一致，低饱和度，偏写实 |
| 光照 | 午后柔和阳光（下午 2-4 点），右上方来光 |
| 风格 | 写实摄影风，略带电影质感，非卡通 |

## 通用构图模板

```
┌─────────────────────┐
│      天空 40%        │  ← 云层、远山、飞鸟
│    (渐变过渡)       │
├─────────────────────┤
│    海平线 30%        │  ← 远景岛屿/船只/灯塔
├─────────────────────┤
│      水面 70%        │  ← 前景水面波纹、礁石、船沿
│   ～～～～～～～      │
│   ～～～～～～～      │
│   ～～～～～～～      │
│   前景遮罩区         │  ← 画面最下方会被 UI 覆盖
│  (UI 安全区)        │     不需要精细内容
└─────────────────────┘
```

**UI 安全区**：画面底部 15% 会被钓鱼操作按钮和底部菜单遮挡，此区域不要放关键视觉元素。

---

## 逐钓场设计说明

### 1. 长海县 — 渤海·辽宁

**解锁等级**: 1 | **入场费**: 0 | **水色**: `#8B9A6E`

| 要素 | 描述 |
|------|------|
| **天空** | 淡蓝偏灰，稀疏白云，北方清冷感 |
| **远景** | 左侧隐约可见长山群岛轮廓，低矮灰蓝 |
| **水面** | 黄绿色浑浊，渤海特色，浪纹细密 |
| **前景** | 右下可见礁石一角（深灰褐色），上附少量藤壶和海藻 |
| **氛围** | 宁静、开阔、略微萧瑟的北方海域 |
| **色调** | 冷灰绿为主，低饱和度 |

> 🎨 **AI 生图 Prompt**:
> First-person view from a small fishing boat, looking out over the Bohai Sea near Changhai County, Liaoning. Overcast sky with sparse clouds, distant low islands on the left horizon. Murky yellow-green water with fine ripples, a weathered dark grey rock formation visible in the lower right foreground with barnacles. Late afternoon light, cinematic photography style, vertical 9:16 composition, realistic, muted cold tones --ar 9:16 --style raw

---

### 2. 东港市 — 渤海·辽宁

**解锁等级**: 1 | **入场费**: 50 | **水色**: `#7A8B6A`

| 要素 | 描述 |
|------|------|
| **天空** | 浅灰蓝，比长海县略暖 |
| **远景** | 远处有模糊的养殖浮筏阵列（东港特色水产养殖） |
| **水面** | 近岸浅水，泥沙滩底质使水色偏黄褐，水面有轻微反光 |
| **前景** | 画面右下可见沙滩一角，沙色偏黄褐 |
| **氛围** | 安静的近海浅滩，平易近人 |
| **色调** | 暖黄灰，滩涂色调 |

> 🎨 **AI 生图 Prompt**:
> First-person view from a small boat in shallow coastal water near Donggang, Liaoning, Bohai Sea. Soft blue-grey sky, distant lines of aquaculture rafts floating on the horizon. Shallow yellowish-brown water reflecting soft light, sandy seabed visible beneath. A strip of sandy beach in the lower right corner. Warm grey tones, peaceful afternoon atmosphere, cinematic vertical 9:16 --ar 9:16 --style raw

---

### 3. 长岛 — 黄海·山东

**解锁等级**: 1 | **入场费**: 100 | **水色**: `#5A7B5A`

| 要素 | 描述 |
|------|------|
| **天空** | 湛蓝，蓬松积云 |
| **远景** | 右侧可见长岛崖壁（灰白石灰岩），顶部有植被 |
| **水面** | 清澈碧绿，潮流可见白色水纹线，浪花略大 |
| **前景** | 左侧隐约可见暗礁，水下有海藻飘动 |
| **氛围** | 水质清澈、潮流湍急、海岛壮丽 |
| **色调** | 碧绿 + 石灰白 |

> 🎨 **AI 生图 Prompt**:
> First-person view from a boat near Changdao Island, Shandong, Yellow Sea. Bright blue sky with puffy cumulus clouds. White limestone cliffs rising from the sea on the right side, topped with green vegetation. Clear green-blue water showing visible current lines and white ripple patterns. Dark reef barely visible underwater on the lower left with seaweed swaying below the surface. Fresh and vibrant, cinematic vertical 9:16 --ar 9:16 --style raw

---

### 4. 青岛近海 — 黄海·山东

**解锁等级**: 1 | **入场费**: 200 | **水色**: `#4A7B6B`

| 要素 | 描述 |
|------|------|
| **天空** | 晴，远处有薄雾，海天一色处泛白 |
| **远景** | 左侧极远处可见青岛城市天际线剪影（红屋顶建筑群 + 信号山轮廓） |
| **水面** | 深绿偏蓝，浪涌适中，有零星白色浪花 |
| **前景** | 画面下方为防波堤/礁石区边缘 |
| **氛围** | 城市与海洋的交汇，既有自然又有文明感 |
| **色调** | 深绿蓝 + 远处红瓦点缀 |

> 🎨 **AI 生图 Prompt**:
> First-person view from a rocky shore near Qingdao, Shandong, Yellow Sea. Clear sky with light haze on the horizon. Distant silhouette of Qingdao city skyline on the left - red-tiled buildings and Signal Hill. Deep green-blue water with moderate waves and scattered whitecaps. Edge of a breakwater and dark coastal rocks in the immediate foreground. Blend of nature and distant city, cinematic vertical 9:16 --ar 9:16 --style raw

---

### 5. 崇明区 — 东海·上海

**解锁等级**: 1 | **入场费**: 150 | **水色**: `#5A8B7A`

| 要素 | 描述 |
|------|------|
| **天空** | 多云偏灰，长江口湿度大，天际线有薄雾 |
| **远景** | 极远处可见长江大桥轮廓，水面宽阔如海 |
| **水面** | 咸淡水交汇，水色偏褐绿，有明显泥沙带和水色分界线 |
| **前景** | 右下可见芦苇丛一角 |
| **氛围** | 江海交汇、苍茫辽阔 |
| **色调** | 褐绿 + 灰白 |

> 🎨 **AI 生图 Prompt**:
> First-person view from a boat at the mouth of the Yangtze River near Chongming, Shanghai, East China Sea. Overcast grey sky with mist on the horizon. Faint outline of a long bridge in the far distance. Brownish-green brackish water with visible sediment plumes and color boundaries where fresh and salt water meet. A patch of reeds visible in the lower right corner. Vast and atmospheric, cinematic vertical 9:16 --ar 9:16 --style raw

---

### 6. 舟山渔场 — 东海·浙江

**解锁等级**: 1 | **入场费**: 300 | **水色**: `#3B6A8E`

| 要素 | 描述 |
|------|------|
| **天空** | 蔚蓝，有层积云，飞鸟点缀 |
| **远景** | 左右散布数个翠绿岛屿（舟山群岛），岛屿间可见渔船 |
| **水面** | 深蓝绿色，浪涌明显，表面有细碎阳光反射（god rays） |
| **前景** | 画面下方为船沿（木质、旧化）一角 |
| **氛围** | 中国最大渔场，生机勃勃、开阔壮美 |
| **色调** | 深蓝绿 + 翠绿岛屿 |

> 🎨 **AI 生图 Prompt**:
> First-person view from a fishing boat in the Zhoushan fishing grounds, Zhejiang, East China Sea. Bright blue sky with stratocumulus clouds and distant seabirds. Several green islands scattered across the horizon with small fishing boats between them. Deep blue-green water with notable waves and scattered sunlight reflections creating subtle god rays on the surface. Weathered wooden gunwale of the boat visible at the bottom edge. Vibrant and majestic, cinematic vertical 9:16 --ar 9:16 --style raw

---

### 7. 南澳县 — 南海·广东

**解锁等级**: 1 | **入场费**: 500 | **水色**: `#1B5A8E`

| 要素 | 描述 |
|------|------|
| **天空** | 热带晴空，南国白云，光线强烈 |
| **远景** | 右侧可见南澳岛山体（覆盖热带植被），有风力发电机 |
| **水面** | 深蓝，清澈度高，浪涌中等 |
| **前景** | 水面下方隐约可见珊瑚礁/岩石底质 |
| **氛围** | 南国热带海洋，温暖深邃 |
| **色调** | 深蓝 + 翠绿热带植被 |

> 🎨 **AI 生图 Prompt**:
> First-person view from a boat near Nan'ao Island, Guangdong, South China Sea. Tropical clear sky with bright white clouds and strong sunlight. Nan'ao Island visible on the right - green tropical vegetation covering hills with a few wind turbines on the ridge. Deep blue clear water with moderate waves, coral reef and rocky seabed faintly visible beneath the surface in the foreground. Warm tropical atmosphere, cinematic vertical 9:16 --ar 9:16 --style raw

---

### 8. 三亚远海 — 南海·海南

**解锁等级**: 1 | **入场费**: 1000 | **水色**: `#0D3A6E`

| 要素 | 描述 |
|------|------|
| **天空** | 热带深蓝晴空，无云或少云，阳光极强，画面顶部有轻微日晕 |
| **远景** | 海天一色，无陆地，极远处可能有积雨云塔 |
| **水面** | 极深蓝（近乎墨蓝），外海涌浪大，波峰有白色浪花 |
| **前景** | 画面右下为钓船甲板/船沿，金属质感现代船只 |
| **氛围** | 深蓝外海、巨物出没、高级钓场 |
| **色调** | 墨蓝 + 亮白浪花 |

> 🎨 **AI 生图 Prompt**:
> First-person view from a sport fishing boat in deep offshore waters off Sanya, Hainan, South China Sea. Intense tropical deep blue sky, nearly cloudless, with a faint solar halo near the top. No land visible - pure open ocean with a distant cumulonimbus tower on the horizon. Extremely dark blue water with large open-ocean swells and white foam on wave crests. Modern boat deck/gunwale in the lower right corner with metallic finish. Deep sea big game fishing atmosphere, cinematic vertical 9:16 --ar 9:16 --style raw

---

## 风格一致性检查清单

- [ ] 全部采用第一人称视角
- [ ] 海平线统一在画面 30-33% 高度
- [ ] 水色与对应 `waterColor` hex 值一致
- [ ] 由北（渤海）到南（南海）色调逐渐从灰绿变为深蓝
- [ ] 前景元素（礁石/船沿/沙滩）不高于画面底部 20%
- [ ] 底部 15% 为 UI 安全区，无明显视觉焦点
- [ ] 8 张图放在一起应有清晰的纬度递进感

---

## 交付物清单

| 文件名 | 钓场 | 海域 |
|--------|------|------|
| `spot_001.webp` | 长海县 | 渤海 |
| `spot_002.webp` | 东港市 | 渤海 |
| `spot_003.webp` | 长岛 | 黄海 |
| `spot_004.webp` | 青岛近海 | 黄海 |
| `spot_005.webp` | 崇明区 | 东海 |
| `spot_006.webp` | 舟山渔场 | 东海 |
| `spot_007.webp` | 南澳县 | 南海 |
| `spot_008.webp` | 三亚远海 | 南海 |

CDN 上传路径：`https://cdn.ocean-fishing.com/spots/spot_XXX.webp`

---

*设计需求文档 v1.0 — 可直接交付美术或用于 AI 生图*
