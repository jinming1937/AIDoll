import { View, StyleSheet } from 'react-native';
import { Atlas, Image, Canvas, Text, Skia, useImage, SkRSXform, SkRect, Group, Circle, Transforms3d, useFont, SkFont, Rect, rect } from '@shopify/react-native-skia';
import { ReactNode, useEffect, useState } from 'react';
import { IBasePosition, IPosition, ISprite } from '../types';

/**
 * xiaobi_L1
 * dabi_L1
 * shou_L1
 * xiaotui_L
 * xiaotui_R
 * datui_L
 * datui_R
 * jiao_L1
 * jiao_R1
 * yao1
 * xiong
 * xiaobi_R1
 * dabi_R1
 * shou_R1
 * tou
 * zhengyan
 * mei
 * zui
 * toufaqian1
*/
const BASE_POSITION: Record<string, IBasePosition> = {
  "xiaobi_L1": { "x": 106, "y": 223, "width": 40, "height": 109 },
  "dabi_L1": { "x": 128, "y": 124, "width": 39, "height": 112 },
  "shou_L1": { "x": 104, "y": 305, "width": 28, "height": 59 },
  "xiaotui_R": { "x": 179, "y": 436, "width": 43, "height": 157, rotate: -5, offsetX: -7, offsetY: 0 },
  "xiaotui_L": { "x": 135, "y": 430, "width": 45, "height": 200, rotate: 3, offsetX: 5, offsetY: 0 },
  "datui_R": { "x": 176, "y": 259, "width": 62, "height": 210 },
  "datui_L": { "x": 120, "y": 265, "width": 54, "height": 205, offsetX: 54, offsetY: 0 },
  "jiao_R1": { "x": 174, "y": 576, "width": 32, "height": 96, rotate: -6, offsetX: -5, offsetY: 0 },
  "jiao_L1": { "x": 154, "y": 602, "width": 37, "height": 96, rotate: 4, offsetX: 4, offsetY: 0 },
  "yao1": { "x": 126, "y": 197, "width": 102, "height": 113 },
  "xiong": { "x": 127, "y": 75, "width": 119, "height": 175 },
  "xiaobi_R1": { "x": 230, "y": 225, "width": 30, "height": 102 },
  "dabi_R1": { "x": 222, "y": 131, "width": 30, "height": 112 },
  "shou_R1": { "x": 239, "y": 308, "width": 30, "height": 61 },
  "tou": { "x": 155, "y": 5, "width": 78, "height": 101, offsetX: 78, offsetY: 0 },
  "zhengyan": { "x": 155, "y": 57, "width": 20, "height": 14, offsetX: 55, offsetY: 0 },
  "mei": { "x": 157, "y": 51, "width": 16, "height": 4 },
  "zui": { "x": 173, "y": 87, "width": 19, "height": 7 },
  "toufaqian1": { "x": 145, "y": -3, "width": 98, "height": 108 },
};

type IBone = {
  x: number;
  y: number;
  name: string;
  parent?: string;
  rotation?: number;
  length?: number;
  children?: IBone[];
}

// ==============================================
// 核心工具函数：把骨骼 JSON 转成 Skia 嵌套结构
// ==============================================
function buildSkeletonGroups(bones: IBone[], font: SkFont | null) {
  const boneMap: Record<string, IBone> = {};
  const rootGroups = [];

  // 1. 先把所有骨骼放进 map 里
  bones.forEach(bone => {
    boneMap[bone.name] = {
      ...bone,
      children: []
    };
  });

  // 2. 建立父子关系
  bones.forEach(bone => {
    if (bone.parent && boneMap[bone.parent]) {
      boneMap[bone.parent]?.children?.push(boneMap[bone.name]);
    }
  });

  // 3. 找到根节点
  const root = boneMap['root'];

  // 4. 递归渲染骨骼为 Skia Group
  function renderGroup(bone: IBone) {
    const transform: Transforms3d = [];

    if (['gonxin', 'gonxin2', 'gonxin3', 'gonxin4', 'gonxin5'].includes(bone.name)) {
      return null;
    }
    // 位置
    if (bone.x !== undefined || bone.y !== undefined) {
      transform.push({
        translate: [bone.x, 300 - bone.y, 0]
      });
    }

    // 旋转
    if (bone.rotation !== undefined) {
      // transform.push({ rotate: bone.rotation });
    }
    // 子骨骼
    const childGroups = (bone.children || []).map(child => renderGroup(child));

    // 返回 Group
    return (
      <Group key={bone.name} transform={transform}>
        {/* 骨骼可视化（调试用） */}
        <Rect rect={rect(2, 2, 10, bone.length || 40)} color="blue" />
        <Circle cx={0} cy={0} r={4} color="red" />
        <Text x={10} y={5} text={bone.name} font={font} color="blue" />
        {/* 你的精灵图/衣服/身体 可以挂在这里！ */}
        {childGroups}
      </Group>
    );
  }

  return renderGroup(root);
}

// ==============================
// 工具：构建骨骼父子关系
// ==============================
function buildSkeletonTree(bones: IBone[], renderBone: (bone: IBone) => ReactNode) {
  const map: Record<string, IBone> = {};
  bones.forEach(b => (map[b.name] = { ...b, children: [] }));
  bones.forEach(b => {
    if (b.parent) map[b.parent]?.children?.push(map[b.name]);
  });
  return renderBone(map.root);
}
export default function SkiaCharacter({ config, selectedOutfits }: { config: any; selectedOutfits?: Record<string, string> }) {
  const [sprites, setSprites] = useState<SkRect[]>([]);
  const [transforms, setTransforms] = useState<SkRSXform[]>([]);
  const spriteImage = useImage(require('../../assets/skia/body_girl.png'));
  const baseOffsetX = 60;
  const baseOffsetY = 30;
  const font = useFont(require("../../assets/font/AlimamaAgileVF-Thin.ttf"), 32);


  useEffect(() => {
    if (config) {
      console.log('配置加载成功');
      const {posi} = config;
      const mapPosition: IPosition[] = [];

      Object.keys([]).forEach((key) => {
        // 从selectedOutfits中获取对应的选中装扮
        let outfitKey = key;
        // if (selectedOutfits) {
        //   if (key === 'toufaqian1') {
        //     outfitKey = selectedOutfits['toushi'] || key;
        //   } else if (key === 'xiong') {
        //     outfitKey = selectedOutfits['top'] || key;
        //   } else if (key === 'datui_L' || key === 'datui_R' || key === 'xiaotui_L' || key === 'xiaotui_R') {
        //     outfitKey = selectedOutfits['bottom'] || key;
        //   } else if (key === 'jiao_L1' || key === 'jiao_R1') {
        //     outfitKey = selectedOutfits['shoes'] || key;
        //   } else if (key === 'shou_L1' || key === 'shou_R1' || key === 'xiaobi_L1' || key === 'xiaobi_R1' || key === 'dabi_L1' || key === 'dabi_R1') {
        //     // 暂不处理手套等配饰
        //   } else if (key === 'zhengyan' || key === 'mei' || key === 'zui') {
        //     // 暂不处理面部特征
        //   }
        // }
        
        const { x, y, width, height, rotate, offsetX, offsetY } = BASE_POSITION[key];
        const sprite = posi[outfitKey || 'kong'] as ISprite;
        const { xy, size, offset } = sprite;
        const needRotate = sprite.rotate;
        const [spriteWidth, spriteHeight] = needRotate ? size.toReversed() : size;
        const [spriteX, spriteY] = xy;
        // console.log('diff:', key, width - spriteWidth, height - spriteHeight);

        mapPosition.push({
          key,
          x,
          y,
          width,
          height,
          rotation: (rotate || 0) + (needRotate ? 90 : 0),
          spriteX,
          spriteY,
          spriteWidth,
          spriteHeight,
          needRotate: needRotate,
          offsetX: offsetX || 0,
          offsetY: offsetY || 0,
          ox: offset[0] || 0,
          oy: offset[1] || 0,
        });
      });
      // sprite 位置: x,y在精灵图中的位置，rect取一个矩形
      setSprites(mapPosition.map((p) => {
        const { spriteX, spriteY, spriteWidth, spriteHeight } = p;
        return Skia.XYWHRect(spriteX, spriteY, spriteWidth, spriteHeight);
      }));
      // sprite 旋转: 精灵图旋转角度, + xy 偏移
      // 旋转以sprites左上角为旋转中心，所以需要修正旋转位置
      setTransforms(mapPosition.map((p) => {
        const { key, x, y, rotation, spriteWidth, spriteHeight, ox, oy } = p;
        const needRotate = p.needRotate;
        // console.log('rotation:', rotation, key);
        const [cx, cy] = [spriteWidth / 2, spriteHeight / 2];
        // 角度 → 弧度
        const rad = (rotation || 0) * Math.PI / 180;
        const scos = Math.cos(rad);
        const ssin = Math.sin(rad);

        // ✅ 中心旋转修正公式（必须加！）
        // const tx = x - (-cy * scos - cx * ssin);
        // const ty = y - (-cy * ssin + cx * scos);

        const tx = x + (needRotate ? spriteHeight : p.offsetX)  // - (cx * scos - cy * ssin);
        const ty = y + (needRotate ? 0 : p.offsetY)  // - (cx * ssin + cy * scos);
        const debug = needRotate || rotation;
        const xp = (debug ? tx : x);
        const yp = (debug ? ty : y);
        // console.log('center', key, x, y, xp, yp);
        // console.log('diff t', key, x - xp, y - yp, spriteWidth, spriteHeight);
        return Skia.RSXform(scos, ssin, xp, yp);
      }));
    }
  }, [config, selectedOutfits]);

    
  // ==========================================
  // 核心：骨骼 → 插槽 → 皮肤图片 自动挂载
  // ==========================================
  function renderBone(bone: IBone, parentWorld = { x:0, y:0, rotation:0 }) {
    // 世界坐标 = 父坐标 + 子相对坐标（核心！！！）
    const wx = parentWorld.x + (bone.x || 0);
    const wy = parentWorld.y + (bone.y || 0);
    const wr = parentWorld.rotation + (bone.rotation || 0);
    const transform: Transforms3d = [];
    if (bone.x || bone.y) transform.push({ translate: [bone.x || 0, bone.y || 0, 0] });
    // if (bone.rotation) transform.push({ rotate: wr * Math.PI / 180 });

    // 找到当前骨骼对应的所有插槽
    const slotsOnBone = config.slots.filter((slot: { bone: string }) => slot.bone === bone.name);

    console.log('bone:', bone.name, wx, wy);

    return (
      <Group key={bone.name} origin={{x: parentWorld.x, y: parentWorld.y}} transform={transform}>
        {/* 骨骼调试点 */}
        <Circle cx={0} cy={0} r={3} color="red" />
        <Text x={10} y={5} text={bone.name} font={font} color="blue" />
        {/* ======================================
            2. 插槽 slot = 图片容器
            ====================================== */}
        {/* {slotsOnBone.map((slot: { name: string, attachment: string }) => {
          const attachment = config.skins[0].attachments[slot.attachment]; // 从皮肤里取图片配置
          if (!attachment) return null;

          let atta = attachment[slot.attachment] || attachment;
          if (!atta) return null;
          const pos = config.posi[slot.attachment];
          if (!pos) return null;
          const size = pos.rotate ? pos.size.toReversed() : pos.size; 
          const imgSprite = Skia.XYWHRect(pos.xy[0], pos.xy[1], size[0], size[1]);
          const rotate = pos.rotate ? 90 : 0;
          const rad = (rotate || 0) * Math.PI / 180;
          const scos = Math.cos(rad);
          const ssin = Math.sin(rad);
          const imgTransform = Skia.RSXform(scos, ssin, atta.x, atta.y);

          return (
            <Group
              key={slot.attachment}
              transform={[{ translate: [atta.x, atta.y, 0] }]}
            >
              {spriteImage && <Atlas image={spriteImage} sprites={[imgSprite]} transforms={[imgTransform]} />}
            </Group>
          );
        })} */}

        {/* 子骨骼递归 */}
        {bone.children?.map(child => renderBone(child, { x:wx, y:wy, rotation:wr }))}
      </Group>
    );
  }

  const map: Record<string, IBone> = {};
  config.bones.forEach((b: IBone) => (map[b.name] = { ...b, children: [] }));
  config.bones.forEach((b: IBone) => {
    if (b.parent) map[b.parent]?.children?.push(map[b.name]);
  });

  return (
    <View style={styles.container}>
      {/* Skia Canvas 换装核心 */}
      <Canvas style={styles.canvas}>
        <Group>
          {/* 整体角色偏移到屏幕中间 */}
          <Group origin={{x:0, y:0}} transform={[{ translate: [-200, 20], }, {scale: 0.6 }]}>
            {renderBone(map['root'])}
            {/* {buildSkeletonGroups(config.bones, font)} */}
          </Group>

          {/* {spriteImage && <Atlas image={spriteImage} sprites={sprites} transforms={transforms} />} */}
        </Group>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', height: '100%', alignItems: 'center' },
  canvas: { flex: 1, width: '100%', height: '100%' },
});