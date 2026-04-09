import { View, StyleSheet } from 'react-native';
import { Atlas, Canvas, Skia, useImage, SkRSXform, SkRect, Group } from '@shopify/react-native-skia';
import { useEffect, useState } from 'react';
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
  "zhengyan": { "x": 155, "y": 58, "width": 20, "height": 14, offsetX: 55, offsetY: 0 },
  "mei": { "x": 157, "y": 52, "width": 16, "height": 4 },
  "zui": { "x": 173, "y": 87, "width": 19, "height": 7 },
  "toufaqian1": { "x": 145, "y": -2, "width": 98, "height": 108 },
};

export default function SkiaCharacter({ config, selectedOutfits }: { config: any; selectedOutfits?: Record<string, string> }) {
  const [sprites, setSprites] = useState<SkRect[]>([]);
  const [transforms, setTransforms] = useState<SkRSXform[]>([]);
  const spriteImage = useImage(require('../../assets/skia/body_girl.png'));
  const baseOffsetX = 60;
  const baseOffsetY = 30;

  useEffect(() => {
    if (config) {
      console.log('配置加载成功');
      const {posi} = config;
      const mapPosition: IPosition[] = [];

      Object.keys(BASE_POSITION).forEach((key) => {
        // 从selectedOutfits中获取对应的选中装扮
        let outfitKey = key;
        
        // 根据BASE_POSITION的key映射到对应的分类
        if (selectedOutfits) {
          if (key === 'toufaqian1') {
            outfitKey = selectedOutfits['toushi'] || key;
          } else if (key === 'xiong') {
            outfitKey = selectedOutfits['top'] || key;
          } else if (key === 'datui_L' || key === 'datui_R' || key === 'xiaotui_L' || key === 'xiaotui_R') {
            outfitKey = selectedOutfits['bottom'] || key;
          } else if (key === 'jiao_L1' || key === 'jiao_R1') {
            outfitKey = selectedOutfits['shoes'] || key;
          } else if (key === 'shou_L1' || key === 'shou_R1' || key === 'xiaobi_L1' || key === 'xiaobi_R1' || key === 'dabi_L1' || key === 'dabi_R1') {
            // 暂不处理手套等配饰
          } else if (key === 'zhengyan' || key === 'mei' || key === 'zui') {
            // 暂不处理面部特征
          }
        }
        
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
        const xp = (debug ? tx : x) - ox;
        const yp = (debug ? ty : y) - oy;
        console.log('center', key, x, y, xp, yp);
        // console.log('diff t', key, x - xp, y - yp, spriteWidth, spriteHeight);
        return Skia.RSXform(scos, ssin, xp, yp);
      }));
    }
  }, [config, selectedOutfits]);


  return (
    <View style={styles.container}>
      {/* Skia Canvas 换装核心 */}
      <Canvas style={styles.canvas}>
        <Group>
          {spriteImage && <Atlas image={spriteImage} sprites={sprites} transforms={transforms} />}
        </Group>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', height: '100%', alignItems: 'center' },
  canvas: { flex: 1, width: '100%', height: '100%' },
});