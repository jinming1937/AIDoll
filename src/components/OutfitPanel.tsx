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
import { useTranslation } from '../hooks/useTranslation';
import { useThemeStore } from '../store/themeStore';

const { width, height } = Dimensions.get('window');
const PANEL_WIDTH = 120; // width * 0.18;
const SUB_PANEL_WIDTH = 120;

// 装扮分类
const getCategories = (t: (key: string) => string) => [
  { key: 'hat', label: t('outfit.hat'), icon: 'glasses-outline' },
  { key: 'hair', label: t('outfit.hair'), icon: 'woman-outline' },
  { key: 'top', label: t('outfit.top'), icon: 'shirt-outline' },
  { key: 'bottom', label: t('outfit.bottom'), icon: 'analytics-outline' },
  { key: 'shoes', label: t('outfit.shoes'), icon: 'footsteps-outline' },
] as const;

// 示例装扮数据
const getOutfits = (t: (key: string) => string): Record<string, Array<{ id: string; name: string; color: string }>> => ({
  hat: [
    { id: 'hat1', name: 'Beret', color: '#8B4513' },
    { id: 'hat2', name: 'Straw Hat', color: '#DEB887' },
    { id: 'hat3', name: 'Top Hat', color: '#2C1810' },
    { id: 'hat4', name: 'Cap', color: '#4A4A4A' },
    { id: 'hat5', name: t('outfit.none'), color: 'transparent' },
  ],
  hair: [
    { id: 'hair1', name: 'Long Curly', color: '#2C1810' },
    { id: 'hair2', name: 'Short', color: '#2C1810' },
    { id: 'hair3', name: 'Ponytail', color: '#2C1810' },
    { id: 'hair4', name: 'Twin Tails', color: '#2C1810' },
    { id: 'hair5', name: 'Bun', color: '#2C1810' },
  ],
  top: [
    { id: 'top1', name: 'Qipao', color: '#C41E3A' },
    { id: 'top2', name: 'T-Shirt', color: '#FF69B4' },
    { id: 'top3', name: 'Shirt', color: '#FFFFFF' },
    { id: 'top4', name: 'Sweater', color: '#FFB6C1' },
    { id: 'top5', name: 'Jacket', color: '#9370DB' },
  ],
  bottom: [
    { id: 'bottom1', name: 'Long Skirt', color: '#FF1493' },
    { id: 'bottom2', name: 'Short Skirt', color: '#FF69B4' },
    { id: 'bottom3', name: 'Pants', color: '#4A4A4A' },
    { id: 'bottom4', name: 'Shorts', color: '#87CEEB' },
    { id: 'bottom5', name: t('outfit.none'), color: 'transparent' },
  ],
  shoes: [
    { id: 'shoes1', name: 'High Heels', color: '#8B0000' },
    { id: 'shoes2', name: 'Sneakers', color: '#FFFFFF' },
    { id: 'shoes3', name: 'Boots', color: '#2C1810' },
    { id: 'shoes4', name: 'Sandals', color: '#DEB887' },
    { id: 'shoes5', name: 'Flats', color: '#FF69B4' },
  ],
});

export type CategoryKey = 'hat' | 'hair' | 'top' | 'bottom' | 'shoes';

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
  const { t } = useTranslation();
  const { theme, getThemeColors } = useThemeStore();
  const themeColors = getThemeColors();

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
            {getCategories(t).map((category) => (
              <TouchableOpacity
                key={category.key}
                style={styles.categoryItem}
                onPress={() => selectCategory(category.key)}
              >
                <Ionicons name={category.icon as any} size={38} color={themeColors.primary} />
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
            {getOutfits(t)[selectedCategory]?.map((outfit) => (
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
    zIndex: 10,
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
