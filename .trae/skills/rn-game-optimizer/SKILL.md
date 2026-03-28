---
name: "rn-game-optimizer"
description: "优化React Native游戏性能，包括Skia渲染、资源管理和状态管理。当项目出现性能问题或需要提升游戏运行效率时调用。"
---

# React Native 游戏优化器

## 核心功能

### 1. Skia 渲染优化

**Sprite 图集优化**
- 将多个小图片合并为图集，减少绘制调用
- 使用 Atlas 组件批量渲染精灵
- 优化图片加载和缓存策略

**渲染性能提升**
- 减少不必要的重绘和重新计算
- 合理使用 Canvas 组件和绘制上下文
- 优化渲染树结构，减少嵌套层级

### 2. 资源管理优化

**图片资源优化**
- 压缩图片资源，减少包体积
- 实现图片懒加载和预加载策略
- 使用合适的图片格式和分辨率

**音频资源管理**
- 优化音频加载和缓存
- 实现音频池管理，避免重复加载
- 合理控制音频播放时机

### 3. 状态管理优化

**Zustand 状态管理最佳实践**
- 合理设计状态结构，避免过度渲染
- 使用 selectors 减少不必要的组件更新
- 优化状态更新逻辑，避免连锁更新

**性能监控**
- 实现性能监控和分析工具
- 识别性能瓶颈并提供优化建议
- 跟踪内存使用和垃圾回收

### 4. 动画和交互优化

**React Native Reanimated 优化**
- 使用 worklets 进行动画计算
- 优化动画性能，避免掉帧
- 合理使用动画缓动函数

**手势交互优化**
- 减少手势识别延迟
- 优化触摸事件处理
- 实现流畅的交互体验

## 使用方法

### 优化 Skia 渲染

1. **检查当前 Skia 实现**：分析 `SkiaCharacter.tsx` 等组件的渲染逻辑
2. **实现图集优化**：将多个小图片合并为图集，使用 Atlas 组件
3. **优化资源加载**：实现图片的懒加载和缓存策略
4. **减少绘制调用**：合并相似的绘制操作，减少 Canvas 绘制次数

### 优化资源管理

1. **分析资源使用情况**：检查项目中的图片、音频等资源
2. **实现资源池**：创建资源池管理重复使用的资源
3. **优化资源加载时机**：根据场景需求动态加载资源
4. **监控资源使用**：跟踪资源使用情况，及时释放不需要的资源

### 优化状态管理

1. **分析状态结构**：检查 Zustand store 的设计
2. **优化状态更新**：使用合适的状态更新策略
3. **减少不必要的渲染**：使用 selectors 和 memoization
4. **实现性能监控**：添加性能监控工具，识别瓶颈

## 代码示例

### 图集优化示例

```typescript
// 优化前：多个独立图片加载
const sprite_base = {
  head: useImage(require('../../assets/skia/base_body/head.png')),
  body_top: useImage(require('../../assets/skia/base_body/body_top.png')),
  // 更多图片...
};

// 优化后：使用图集
const spriteSheet = useImage(require('../../assets/skia/character_spritesheet.png'));
const sprites = [
  Skia.XYWHRect(0, 0, 100, 100), // head
  Skia.XYWHRect(100, 0, 150, 120), // body_top
  // 更多精灵区域...
];
const transforms = [
  Skia.RSXform(1, 0, 100, 20), // head position
  Skia.RSXform(1, 0, 120, 120), // body_top position
  // 更多变换...
];

// 渲染
<Atlas image={spriteSheet} sprites={sprites} transforms={transforms} />
```

### 资源加载优化示例

```typescript
// 实现图片懒加载
import { useImage } from '@shopify/react-native-skia';

function useLazyImage(source: any) {
  const [image, setImage] = useState<Image | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 延迟加载图片
    const timer = setTimeout(() => {
      const img = useImage(source);
      setImage(img);
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [source]);

  return { image, isLoading };
}
```

### 状态管理优化示例

```typescript
// Zustand store 优化
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GameState {
  character: {
    position: { x: number; y: number };
    animation: string;
    outfit: string;
  };
  game: {
    score: number;
    level: number;
    isPaused: boolean;
  };
  // 选择器，避免不必要的渲染
  selectors: {
    getCharacterPosition: () => { x: number; y: number };
    getGameScore: () => number;
  };
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      character: {
        position: { x: 0, y: 0 },
        animation: 'idle',
        outfit: 'default',
      },
      game: {
        score: 0,
        level: 1,
        isPaused: false,
      },
      selectors: {
        getCharacterPosition: () => get().character.position,
        getGameScore: () => get().game.score,
      },
    }),
    {
      name: 'game-storage',
    }
  )
);
```

## 性能监控工具

### 实现 FPS 监控

```typescript
import { useRef, useEffect } from 'react';

function useFPSMonitor() {
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const fpsRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTimeRef.current;
      fpsRef.current = Math.round((frameCountRef.current * 1000) / delta);
      frameCountRef.current = 0;
      lastTimeRef.current = now;
      console.log(`FPS: ${fpsRef.current}`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return fpsRef;
}
```

## 常见问题及解决方案

### 1. Skia 渲染性能问题

**症状**：动画卡顿，绘制不流畅
**解决方案**：
- 使用图集减少绘制调用
- 优化 Canvas 尺寸和渲染区域
- 减少复杂路径和渐变的使用
- 使用硬件加速

### 2. 内存使用过高

**症状**：应用崩溃，内存警告
**解决方案**：
- 实现资源池管理
- 及时释放不需要的资源
- 优化图片加载和缓存策略
- 使用适当的图片分辨率

### 3. 启动时间过长

**症状**：应用启动缓慢
**解决方案**：
- 实现资源懒加载
- 优化初始加载流程
- 减少启动时的计算和渲染
- 使用预加载策略

### 4. 状态更新导致的性能问题

**症状**：组件频繁重渲染
**解决方案**：
- 使用 Zustand 的 selectors
- 实现组件 memoization
- 优化状态更新逻辑
- 减少不必要的状态依赖

## 最佳实践

1. **性能优先**：在开发过程中始终考虑性能影响
2. **渐进式优化**：逐步优化，避免一次性大改
3. **监控与分析**：使用性能监控工具识别瓶颈
4. **资源管理**：合理管理和释放资源
5. **代码组织**：保持代码结构清晰，便于维护

## 工具推荐

- **React DevTools**：调试组件渲染
- **Flipper**：调试 React Native 应用
- **Performance Monitor**：监控应用性能
- **Memory Profiler**：分析内存使用

通过以上优化策略，可以显著提升 React Native 游戏的性能和用户体验，特别是在使用 Skia 进行复杂渲染时。