import { View, StyleSheet, Dimensions } from 'react-native';
import { Atlas, Canvas, Skia, useImage, Image, rotate, Group } from '@shopify/react-native-skia';

const PARTS = {
  foot_right: { px: 100, py: 500, direction: 1, x: 180, y: 770, w: 120, h: 180 },
  foot_left: { px: 100, py: 500, direction: 1, x: 140, y: 770, w: 120, h: 180 },
  hand_right: { px: 100, py: 200, direction: 1, x: 1160, y: 100, w: 40, h: 120 },
  hand_left: { px: 100, py: 200, direction: 1, x: 1515, y: 100, w: 40, h: 120 },
  arm_right: { px: 100, py: 150, direction: 1, x: 1160, y: 390, w: 120, h: 180 },
  arm_left: { px: 100, py: 150, direction: 1, x: 1515, y: 569, w: 40, h: 120 },
  leg_lit_left: { px: 100, py: 450, direction: 1, x: 180, y: 590, w: 120, h: 180 },
  leg_lit_right: { px: 100, py: 450, direction: 1, x: 180, y: 590, w: 120, h: 180 },
  leg_left: { px: 100, py: 450, direction: 1, x: 180, y: 590, w: 120, h: 180 },
  leg_right: { px: 100, py: 450, direction: 1, x: 180, y: 590, w: 120, h: 180 },
  body_bottom: { px: 100, py: 400, direction: 1, x: 1470, y: 900, w: 100, h: 124 },
  body_top: { px: 100, py: 100, direction: 1, x: 470, y: 80, w: 120, h: 180 },
  head: { px: 200, py: 20, direction: 0, x: 920, y: 670, w: 110, h: 90 },
};

type IBasePosition = {
  x: number;
  y: number;
  width: number;
  height: number;
  rotate?: number;
}

const BASE_POSITION: Record<string, IBasePosition> = {
  "arm_bottom_left":  { "x": 106, "y": 223, "width": 40, "height": 109 },
  "arm_top_left":     { "x": 128, "y": 124, "width": 39, "height": 112 },
  "hand_left":        { "x": 104,  "y": 305, "width": 28, "height": 59 },
  
  "leg_bottom_right":  { "x": 179, "y": 436, "width": 43, "height": 157, rotate: -5 },
  "leg_bottom_left":   { "x": 135, "y": 430, "width": 45, "height": 200, rotate: 3 },
  
  "leg_top_right":    { "x": 176, "y": 259, "width": 62, "height": 210 },
  "leg_top_left":     { "x": 120, "y": 265, "width": 54, "height": 205 },
  
  "foot_right":       { "x": 174, "y": 576, "width": 32, "height": 96, rotate: -6 },
  "foot_left":        { "x": 154, "y": 602, "width": 37, "height": 96, rotate: 4 },
  
  "body_bottom":      { "x": 126, "y": 197, "width": 102, "height": 113 },
  "body_top":         { "x": 127, "y": 75,  "width": 119, "height": 175 },

  "arm_bottom_right": { "x": 230, "y": 225, "width": 30, "height": 102 },
  "arm_top_right":    { "x": 222, "y": 131, "width": 30, "height": 112 },
  "hand_right":       { "x": 239, "y": 308, "width": 30, "height": 61 },
  
  "head":             { "x": 155, "y": 5,  "width": 78, "height": 101 },
  eye_left:           { "x": 156, "y": 59, "width": 20, "height": 14 },
  eye_right:          { "x": 188, "y": 56, "width": 22, "height": 14 },

  mei_l:              { "x": 157, "y": 53, "width": 16, "height": 4 },
  mei_r:              { "x": 190, "y": 52, "width": 21, "height": 4 },
  
  mouth:              { "x": 173, "y": 87, "width": 19, "height": 7 },

  hair:               { "x": 145, "y": -1, "width": 98, "height": 108 },
};

// 映射表：雪碧图到基础位置的映射关系
const Map = [];

export default function SkiaCharacter() {
  // const bone =;


  const sprite = useImage(require('../../assets/skia/body_girl.png'));
  const parts = Object.values(PARTS);
  const sprites = parts.map((p) => Skia.XYWHRect(p.x, p.y, p.w, p.h));
  const transforms = parts.map((p) => {
    if (p?.direction === 0) {
      return Skia.RSXform(0, 1, p.px, p.py);
    }
    return Skia.RSXform(1, 0, p.px, p.py);
  });
  const offsetX = 40;
  const offsetY = 10;
  const sprite_base = {
    head: useImage(require('../../assets/skia/base_body/head.png')),
    body_top: useImage(require('../../assets/skia/base_body/body_top.png')),
    body_bottom: useImage(require('../../assets/skia/base_body/body_bottom.png')),

    hand_right: useImage(require('../../assets/skia/base_body/hand_right.png')),
    hand_left: useImage(require('../../assets/skia/base_body/hand_left.png')),
    foot_right: useImage(require('../../assets/skia/base_body/foot_right.png')),
    foot_left: useImage(require('../../assets/skia/base_body/foot_left.png')),
    
    arm_top_right: useImage(require('../../assets/skia/base_body/arm_top_right.png')),
    arm_top_left: useImage(require('../../assets/skia/base_body/arm_top_left.png')),
    
    arm_bottom_right: useImage(require('../../assets/skia/base_body/arm_bottom_right.png')),
    arm_bottom_left: useImage(require('../../assets/skia/base_body/arm_bottom_left.png')),

    eye_left: useImage(require('../../assets/skia/base_body/eye_left.png')),
    eye_right: useImage(require('../../assets/skia/base_body/eye_right.png')),
    mouth: useImage(require('../../assets/skia/base_body/mouth.png')),
    mei_l: useImage(require('../../assets/skia/base_body/mei_l.png')),
    mei_r: useImage(require('../../assets/skia/base_body/mei_r.png')),
    hair: useImage(require('../../assets/skia/base_body/hair.png')),
    leg_top_right: useImage(require('../../assets/skia/base_body/leg_top_right.png')),
    leg_top_left: useImage(require('../../assets/skia/base_body/leg_top_left.png')),
    leg_bottom_right: useImage(require('../../assets/skia/base_body/leg_bottom_right.png')),
    leg_bottom_left: useImage(require('../../assets/skia/base_body/leg_bottom_left.png')),
  };
  return (
    <View style={styles.container}>
      {/* Skia Canvas 换装核心 */}
      <Canvas style={styles.canvas}>
        {Object.keys(BASE_POSITION).map((key) => {
          const sKey: keyof typeof sprite_base = key as keyof typeof sprite_base;
          const { x, y, width, height, rotate } = BASE_POSITION[sKey];
          let transform = undefined;
          if (rotate) {
            transform = [{ rotate: rotate * Math.PI / 180 }];
          }
          const scale = 0.8;
          const renderX = (x * scale) + offsetX;
          const renderY = (y * scale) + offsetY;
          const renderWidth = width * scale;
          const renderHeight = height * scale;
          return (
            <Image
              key={key}
              image={sprite_base[sKey]}
              x={renderX}
              y={renderY}
              width={renderWidth}
              height={renderHeight}
              origin={{x: renderX + renderWidth / 2, y: renderY + renderHeight / 2}}
              transform={transform}
            />
        )})}
        {/* {sprite && <Atlas image={sprite} sprites={sprites} transforms={transforms} />} */}
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', height: '100%', alignItems: 'center' },
  canvas: { flex: 1, width: '100%', height: '100%' },
});