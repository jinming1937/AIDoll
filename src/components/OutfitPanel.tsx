import React, { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../hooks/useTranslation';
import { IPosition } from '../types';
import { Canvas, Atlas, Skia, useImage, Group } from '@shopify/react-native-skia';
import { getBaseKey, getHideKey } from '../util/lib';

/**
 * 

   bao1
   biyan
   datui_L3
   datui_L6
   datui_L7
   datui_R3
   datui_R6
   datui_R7
   erhuan1
   erhuan2
   gonxin
   kong
   qun_L1
   qun_L10
   qun_L2
   qun_L4
   qun_L5
   qun_L7
   qun_L8
   qun_M1
   qun_M10
   qun_M2
   qun_M4
   qun_M5
   qun_M7
   qun_M8
   qun_M9
   qun_R1
   qun_R10
   qun_R2
   qun_R4
   qun_R5
   qun_R7
   qun_R8
   shangyi1
   shangyi10
   shangyi2
   shangyi3
   shangyi4
   shangyi5
   shangyi6
   shangyi7
   shangyi8
   shangyi9
   shangyiyao1
   shangyiyao10
   shangyiyao2
   shangyiyao3
   shangyiyao4
   shangyiyao5
   shangyiyao7
   shangyiyao8
   shangyiyao9
   shoushi10
   shoushi3
   shoushi4
   shoushi5
   shoushi7
   shoushi8
   toufahou1
   toufahou2
   toufahou3
   toufahou8
   toufaqian10
   toufaqian2
   toufaqian3
   toufaqian4
   toufaqian5
   toufaqian6
   toufaqian7
   toufaqian8
   toufaqian9
   toushi1
   toushi10
   toushi3
   toushi4
   toushi5
   toushi6
   toushi7
   toushi8
   toushi9
   xiaotui_L3
   xiaotui_L5
   xiaotui_L6
   xiaotui_L7
   xiaotui_L9
   xiaotui_R3
   xiaotui_R5
   xiaotui_R6
   xiaotui_R7
   xiaotui_R9
   xie_L1
   xie_L10
   xie_L2
   xie_L3
   xie_L5
   xie_L6
   xie_L7
   xie_L8
   xie_L9
   xie_R1
   xie_R10
   xie_R2
   xie_R3
   xie_R5
   xie_R6
   xie_R7
   xie_R8
   xie_R9
   xiuzi1_L1
   xiuzi1_L3
   xiuzi1_L6
   xiuzi1_L9
   xiuzi1_R1
   xiuzi1_R3
   xiuzi1_R6
   xiuzi1_R9
   xiuzi2_L1
   xiuzi2_L3
   xiuzi2_L6
   xiuzi2_L7
   xiuzi2_L9
   xiuzi2_R1
   xiuzi2_R3
   xiuzi2_R6
   xiuzi2_R7
   xiuzi2_R9
   yao3
   yao6
 */

const PANEL_WIDTH = 80; // width * 0.18;
const SUB_PANEL_WIDTH = 80;

// 装扮分类
const getCategories = (t: (key: string) => string) => [
  { key: 'maozi', label: t('outfit.maozi'), icon: require('../../assets/skia/nav/hat.png') },
  { key: 'toushi', label: t('outfit.toushi'), icon: require('../../assets/skia/nav/hair.png') },
  { key: 'jewelry', label: t('outfit.jewelry'), icon: require('../../assets/skia/nav/jewelry.png') },
  { key: 'top', label: t('outfit.top'), icon: require('../../assets/skia/nav/cloth_up.png') },
  { key: 'bottom', label: t('outfit.bottom'), icon: require('../../assets/skia/nav/cloth_down.png') },
  { key: 'shoes', label: t('outfit.shoes'), icon: require('../../assets/skia/nav/shoes.png') },
] as const;

export type CategoryKey = 'maozi' | 'toushi' | 'top' | 'jewelry' | 'bottom' | 'shoes';

export interface OutfitPanelRef {
  toggle: () => void;
  isVisible: () => boolean;
}

interface OutfitPanelProps {
  config?: any;
  onSelectOutfit?: (category: CategoryKey, outfitId: string) => void;
}

const OutfitPanel = forwardRef<OutfitPanelRef, OutfitPanelProps>(({ config, onSelectOutfit
 }, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [selectedOutfits, setSelectedOutfits] = useState<Record<CategoryKey, string>>({
    maozi: '',
    toushi: '',
    top: '',
    bottom: '',
    jewelry: '',
    shoes: '',
  });
  const { t } = useTranslation();

  const [outfits, setOutfits] = useState<Record<CategoryKey, { id: string; position: IPosition }[]>>({
    maozi: [],
    toushi: [],
    top: [],
    bottom: [],
    jewelry: [],
    shoes: [],
  });

  // 精灵图
  const spriteImage = useImage(require('../../assets/skia/body_girl.png'));
  

  useEffect(() => {
    if (config) {
      console.log('配置加载成功');
      const {posi} = config;
      const listObj = posi as Record<string, { rotate: boolean; xy: number[]; size: number[]; offset: number[]; index: number; category: CategoryKey }>;

      const maozi: { id: string; position: IPosition }[] = [];
      const toushi: { id: string; position: IPosition }[] = [];
      const top: { id: string; position: IPosition }[] = [];
      const bottom: { id: string; position: IPosition }[] = [];
      const jewelry: { id: string; position: IPosition }[] = [];
      const shoes: { id: string; position: IPosition }[] = [];

      Object.keys(listObj).filter(item => !getHideKey().includes(item)).forEach((item) => {
        // console.log('key:', item);
        const {xy, size, offset, rotate, category} = listObj[item];
        const [x, y] = xy;
        const [width, height] = rotate ? size.toReversed() : size;
        const [offsetX, offsetY] = offset;
        const result = {
          id: item,
          position: {
            key: item,
            x: 0,
            y: 0,
            width: 55,
            height: 55,
            offsetX,
            offsetY,
            rotation: rotate ? 90 : 0,
            needRotate: rotate,

            spriteX: x,
            spriteY: y,
            spriteWidth: width,
            spriteHeight: height,
            ox: offsetX || 0,
            oy: offsetY || 0,
          }
        };
        if (category === 'maozi') {
          maozi.push(result);
        } else if (category === 'toushi') {
          toushi.push(result);
        } else if (category === 'top') {
          top.push(result);
        } else if (category === 'bottom') {
          bottom.push(result);
        } else if (category === 'jewelry') {
          jewelry.push(result);
        } else if (category === 'shoes') {
          shoes.push(result);
        } else {
          bottom.push(result);
        }
      });

      setOutfits(pre => ({
        ...pre,
        maozi,
        toushi,
        top,
        bottom,
        jewelry,
        shoes,
      }));
    }
  }, [config]);

  // 分类列表动画
  const categoryPanelAnim = useState(new Animated.Value(-PANEL_WIDTH))[0];
  // 子面板动画
  const subPanelAnim = useState(new Animated.Value(-SUB_PANEL_WIDTH))[0];

  // 显示分类列表
  const showCategoryPanel = () => {
    setIsVisible(true);
    setSelectedCategory(null);
    Animated.timing(categoryPanelAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  // 隐藏分类列表
  const hideCategoryPanel = () => {
    Animated.timing(categoryPanelAnim, {
      toValue: -PANEL_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
    });
  };

  // 显示子面板
  const showSubPanel = (category: CategoryKey) => {
    setSelectedCategory(category);
    Animated.timing(subPanelAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  // 隐藏子面板
  const hideSubPanel = () => {
    Animated.timing(subPanelAnim, {
      toValue: -SUB_PANEL_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setSelectedCategory(null);
    });
  };

  // 切换面板显示/隐藏
  const toggle = () => {
    if (isVisible) {
      // 如果正在显示，先隐藏子面板（如果有），再隐藏分类列表
      if (selectedCategory) {
        hideSubPanel();
      }
      hideCategoryPanel();
    } else {
      showCategoryPanel();
    }
  };

  useImperativeHandle(ref, () => ({
    toggle,
    isVisible: () => isVisible,
  }));

  // 选择分类
  const selectCategory = (category: CategoryKey) => {
    // 先收起分类列表
    Animated.timing(categoryPanelAnim, {
      toValue: -PANEL_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // 分类列表收起后，显示子面板
      showSubPanel(category);
    });
  };

  // 关闭子面板，返回分类列表
  const closeSubPanel = () => {
    hideSubPanel();
    // 子面板收起后，显示分类列表
    Animated.timing(categoryPanelAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  // 选择装扮
  const selectOutfit = (category: CategoryKey, outfitId: string) => {
    console.log('选择装扮:', category, outfitId);
    // TODO: 与SkiaCharacter 中的BASE_POSITION 的key做映射
    // TODO: 进行换装操作

    setSelectedOutfits(prev => ({ ...prev, [category]: outfitId }));
    onSelectOutfit?.(category, outfitId);
  };

  const formatSprites = (position: IPosition) => {
    const {spriteX, spriteY, spriteWidth, spriteHeight} = position;
    return [Skia.XYWHRect(spriteX, spriteY, spriteWidth, spriteHeight)];
  };

  const formatTransform = (position: IPosition) => {
    // console.log('position:', position);
    const {x, y, offsetX, offsetY, needRotate, rotation, spriteWidth, spriteHeight} = position;
    const rotate = rotation * Math.PI / 180;
    const cos = Math.cos(rotate);
    const sin = Math.sin(rotate);

    const cx = spriteWidth / 2;
    const cy = spriteHeight / 2;

    const tx = x - (needRotate ? (cx * cos - cy * sin) - cx : 0); 
    const ty = y - (needRotate ? (cx * sin + cy * cos) - cy : 0);
    return [Skia.RSXform(cos, sin, tx, ty)];
  };

  return (
    <>
      {/* 分类列表面板 */}
      {isVisible && !selectedCategory && (
        <Animated.View
          style={[
            styles.categoryPanel,
            { transform: [{ translateX: categoryPanelAnim }] },
          ]}
        >
          <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
            {getCategories(t).map((category) => (
              <TouchableOpacity
                key={category.key}
                style={styles.categoryItem}
                onPress={() => selectCategory(category.key)}
              >
                <Image source={category.icon} style={{ width: 60, height: 60 }} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* 子面板 - 紧贴左侧 */}
      {selectedCategory && (
        <Animated.View
          style={[
            styles.subPanel,
            { transform: [{ translateX: subPanelAnim }] },
          ]}
        >
          <View style={styles.subPanelHeader}>
            <Text style={styles.subPanelTitle}>
              {getCategories(t).find(c => c.key === selectedCategory)?.label}
            </Text>
            <TouchableOpacity onPress={closeSubPanel}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.outfitList} showsVerticalScrollIndicator={false}>
            {outfits[selectedCategory]?.map((outfit) => (
              <TouchableOpacity
                key={outfit.id}
                style={[
                  styles.outfitItem,
                  selectedOutfits[selectedCategory] === outfit.id && styles.outfitItemSelected,
                ]}
                onPress={() => selectOutfit(selectedCategory, outfit.id)}
                activeOpacity={0.7}
              >
                <View style={{ width: 60, height: 60, position: 'relative' }}>
                  <Canvas style={{ width: 60, height: 60, position: 'absolute', zIndex: 1 }}>
                    <Group transform={[{scale: 60 / Math.max(outfit.position.spriteWidth, outfit.position.spriteHeight)}]}>
                      {spriteImage && (
                        <Atlas
                          image={spriteImage} 
                          sprites={formatSprites(outfit.position)}
                          transforms={formatTransform(outfit.position)}
                        />
                      )}
                    </Group>
                  </Canvas>
                  <View style={{ width: 60, height: 60, position: 'absolute', zIndex: 2, backgroundColor: 'transparent' }} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </>
  );
});

OutfitPanel.displayName = 'OutfitPanel';

const styles = StyleSheet.create({
  // 分类列表面板
  categoryPanel: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 100,
    width: PANEL_WIDTH,
    // backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: 10,
  },
  categoryList: {
    flex: 1,
    paddingVertical: 10,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
  },

  // 子面板 - 紧贴左侧
  subPanel: {
    position: 'absolute',
    left: 0,
    top: 10,
    bottom: 100,
    width: SUB_PANEL_WIDTH,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  subPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  subPanelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  outfitList: {
    flex: 1,
    paddingVertical: 10,
  },
  outfitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  outfitItemSelected: {
    borderColor: '#FF69B4',
  },
});

export default OutfitPanel;
