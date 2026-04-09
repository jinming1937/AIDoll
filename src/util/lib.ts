
export interface IBone {
  name: string;
  x: number;
  y: number;
  rotation?: number;
  parent?: string;
}
// ==============================================
// 计算每根骨头的【世界坐标 + 世界旋转】
// ==============================================
export function computeBoneWorldTransforms(bones: IBone[]) {
  const boneMap: Record<string, IBone & { worldX: number; worldY: number; worldRotation: number }> = {};
  bones.forEach(b => {
    boneMap[b.name] = {
      ...b,
      worldX: 0,
      worldY: 0,
      worldRotation: 0
    };
  });

  // 父子递归计算
  bones.forEach(bone => {
    if (bone.parent === undefined) {
      // 根骨骼
      boneMap[bone.name].worldX = 0;
      boneMap[bone.name].worldY = 0;
      boneMap[bone.name].worldRotation = bone.rotation || 0;
    } else {
      const parent = boneMap[bone.parent];
      const rad = (parent.worldRotation * Math.PI) / 180;

      // 子骨骼 = 父坐标 + 偏移旋转后的位置
      const wx = parent.worldX + bone.x * Math.cos(rad) - bone.y * Math.sin(rad);
      const wy = parent.worldY + bone.x * Math.sin(rad) + bone.y * Math.cos(rad);
      const wr = parent.worldRotation + (bone.rotation || 0);

      boneMap[bone.name].worldX = wx;
      boneMap[bone.name].worldY = wy;
      boneMap[bone.name].worldRotation = wr;
    }
  });

  return boneMap;
}

// 🔥 加载本地 JSON（简化版本，直接使用 require）
export const loadLocalJson = (jsonAsset: any) => {
  try {
    console.log('开始加载 JSON 资源...');
    // 直接使用 require 加载 JSON 文件
    const jsonData = jsonAsset;
    console.log('✅ JSON 加载成功，数据结构:', Object.keys(jsonData));
    return jsonData;
  } catch (err) {
    console.error('❌ 加载失败', err);
    return null;
  }
};

export const getBaseKey = () => {
  const base = [
    "xiaobi_L1", // 小臂
    "dabi_L1", // 大臂
    "shou_L1", // 手
    "xiaotui_L", // 小腿 左
    "xiaotui_R", // 大腿 右
    "datui_L", // 大腿 左
    "datui_R", // 大腿 右
    "jiao_L1", // 脚 左
    "jiao_R1", // 脚 右
    "yao1", // 腰
    "xiong", // 胸
    "xiaobi_R1", // 小臂 右
    "dabi_R1", // 大臂 右
    "shou_R1", // 手 右
    "tou", // 头
    "zhengyan", // 睁眼
    "mei", // 眉
    "zui", // 嘴
    "toufaqian1", // 头发 前
  ];
  return [...base];
};

export const getHideKey = () => {
  // 闭眼， 红心
  const other = ['biyan', 'gonxin', 'bao1'];
  const shoes = new Array(10).fill('').map((i, index) => `xie_R${index + 1}`);
  const base = getBaseKey();
  return [...base, ...other, ...shoes]; 
}

// const outfitCategory


// export function makeRotatedSprite_FIX90(
//   targetX: number,  // 你希望精灵【中心】在屏幕的 X
//   targetY: number,  // 你希望精灵【中心】在屏幕的 Y
//   srcW: number,     // 子图原始【正】宽度
//   srcH: number,     // 子图原始【正】高度
//   angle: number    // 你想要的最终旋转角度
// ) {
//   // =======================
//   // 关键 1：逆时针90° 修正（你是对的，用 +90）
//   // =======================
//   const finalRad = ((angle + 90) * Math.PI) / 180;

//   const scos = Math.cos(finalRad);
//   const ssin = Math.sin(finalRad);

//   // =======================
//   // 关键 2：宽高交换（你做对了）
//   // =======================
//   const cx = srcH / 2;
//   const cy = srcW / 2;

//   // =======================
//   // 关键 3：坐标系旋转后的修正公式（这就是你位置错的原因！）
//   // =======================
//   const tx = targetX - (-cy * scos - cx * ssin);
//   const ty = targetY - (-cy * ssin + cx * scos);

//   return rsxform({ scos, ssin, tx, ty });
// }