# 鱼竿 3D 模型目录

把 `fishing_rod.glb` 放这里。

## 导出步骤（Blender）

1. 打开 Blender → 新建 → 切到「脚本」工作区
2. 打开 `build_fishing_rod.py`（位于 `C:\Users\Lenovo\Desktop\法院\游钓天下_鱼竿模型\`）
3. 复制全部代码 → 粘贴到 Blender 脚本编辑器 → 点 ▶ 运行
4. 等 5-10 秒，模型出现在场景里
5. **文件 → 导出 → glTF 2.0 (.glb)**
   - ✅ 应用变换
   - ✅ 三角化
   - ✅ 骨架
   - ✅ 蒙皮
   - ❌ 相机、灯光
6. 保存为 `fishing_rod.glb`，**放到本目录**（即 `C:\Users\Lenovo\ocean-fishing\public\models\`）

## 使用

`src/components/FishingRod.tsx` 已就绪，直接在场景里引入：

```tsx
import FishingRod from '@/components/FishingRod'

<FishingRod bendAngle={fishPull * 30} />
```

## 路径不匹配

如果 `useGLTF('/models/fishing_rod.glb')` 路径不对，改成：

```tsx
const gltf = useGLTF(new URL('../assets/models/fishing_rod.glb', import.meta.url).href)
```

或把 GLB 放到 `src/assets/models/`，按需调整。