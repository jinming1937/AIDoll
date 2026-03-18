import React, { useState, useImperativeHandle, forwardRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const PANEL_WIDTH = 120; // width * 0.18;
const SUB_PANEL_WIDTH = 120;

// 装扮分类
const CATEGORIES = [
  { key: 'hat', label: '帽子', icon: 'glasses-outline' },
  { key: 'hair', label: '头发', icon: 'woman-outline' },
  { key: 'top', label: '上衣', icon: 'shirt-outline' },
  { key: 'bottom', label: '下装', icon: 'analytics-outline' },
  { key: 'shoes', label: '鞋子', icon: 'footsteps-outline' },
] as const;

// 示例装扮数据
const OUTFITS: Record<string, Array<{ id: string; name: string; color: string }>> = {
  hat: [
    { id: 'hat1', name: '贝雷帽', color: '#8B4513' },
    { id: 'hat2', name: '草帽', color: '#DEB887' },
    { id: 'hat3', name: '礼帽', color: '#2C1810' },
    { id: 'hat4', name: '鸭舌帽', color: '#4A4A4A' },
    { id: 'hat5', name: '无', color: 'transparent' },
  ],
  hair: [
    { id: 'hair1', name: '长卷发', color: '#2C1810' },
    { id: 'hair2', name: '短发', color: '#2C1810' },
    { id: 'hair3', name: '马尾', color: '#2C1810' },
    { id: 'hair4', name: '双马尾', color: '#2C1810' },
    { id: 'hair5', name: '丸子头', color: '#2C1810' },
  ],
  top: [
    { id: 'top1', name: '旗袍', color: '#C41E3A' },
    { id: 'top2', name: 'T恤', color: '#FF69B4' },
    { id: 'top3', name: '衬衫', color: '#FFFFFF' },
    { id: 'top4', name: '毛衣', color: '#FFB6C1' },
    { id: 'top5', name: '外套', color: '#9370DB' },
  ],
  bottom: [
    { id: 'bottom1', name: '长裙', color: '#FF1493' },
    { id: 'bottom2', name: '短裙', color: '#FF69B4' },
    { id: 'bottom3', name: '裤子', color: '#4A4A4A' },
    { id: 'bottom4', name: '短裤', color: '#87CEEB' },
    { id: 'bottom5', name: '无', color: 'transparent' },
  ],
  shoes: [
    { id: 'shoes1', name: '高跟鞋', color: '#8B0000' },
    { id: 'shoes2', name: '运动鞋', color: '#FFFFFF' },
    { id: 'shoes3', name: '靴子', color: '#2C1810' },
    { id: 'shoes4', name: '凉鞋', color: '#DEB887' },
    { id: 'shoes5', name: '平底鞋', color: '#FF69B4' },
  ],
};

export type CategoryKey = typeof CATEGORIES[number]['key'];

export interface OutfitPanelRef {
  toggle: () => void;
  isVisible: () => boolean;
}

interface OutfitPanelProps {
  onSelectOutfit?: (category: CategoryKey, outfitId: string) => void;
}

const OutfitPanel = forwardRef<OutfitPanelRef, OutfitPanelProps>(({ onSelectOutfit }, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | null>(null);
  const [selectedOutfits, setSelectedOutfits] = useState<Record<CategoryKey, string>>({
    hat: 'hat5',
    hair: 'hair1',
    top: 'top1',
    bottom: 'bottom1',
    shoes: 'shoes1',
  });

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
    setSelectedOutfits(prev => ({ ...prev, [category]: outfitId }));
    onSelectOutfit?.(category, outfitId);
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
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.key}
                style={styles.categoryItem}
                onPress={() => selectCategory(category.key)}
              >
                <Ionicons name={category.icon as any} size={38} color="pink" />
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
              {CATEGORIES.find(c => c.key === selectedCategory)?.label}
            </Text>
            <TouchableOpacity onPress={closeSubPanel}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.outfitList} showsVerticalScrollIndicator={false}>
            {OUTFITS[selectedCategory]?.map((outfit) => (
              <TouchableOpacity
                key={outfit.id}
                style={[
                  styles.outfitItem,
                  selectedOutfits[selectedCategory] === outfit.id && styles.outfitItemSelected,
                ]}
                onPress={() => selectOutfit(selectedCategory, outfit.id)}
              >
                <View style={[styles.outfitColor, { backgroundColor: outfit.color }]} />
                <Text style={styles.outfitName}>{outfit.name}</Text>
                {selectedOutfits[selectedCategory] === outfit.id && (
                  <Ionicons name="checkmark" size={20} color="#FF69B4" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}
    </>
  );
});

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
    zIndex: 100,
  },
  categoryList: {
    flex: 1,
    paddingVertical: 10,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 12,
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
    zIndex: 101,
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
    padding: 8,
  },
  outfitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginVertical: 3,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  outfitItemSelected: {
    borderColor: '#FF69B4',
    backgroundColor: '#FFF0F5',
  },
  outfitColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  outfitName: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#333',
  },
});

export default OutfitPanel;
