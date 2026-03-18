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
const PANEL_WIDTH = width * 0.25;

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

type CategoryKey = typeof CATEGORIES[number]['key'];

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

  const panelAnim = useState(new Animated.Value(-PANEL_WIDTH - 50))[0];
  const subPanelAnim = useState(new Animated.Value(-200))[0];

  const showPanel = () => {
    setIsVisible(true);
    Animated.timing(panelAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hidePanel = () => {
    // 先收起子面板
    Animated.timing(subPanelAnim, {
      toValue: -200,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setSelectedCategory(null);

    // 再收起主面板
    Animated.timing(panelAnim, {
      toValue: -PANEL_WIDTH - 50,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
    });
  };

  const toggle = () => {
    if (isVisible) {
      hidePanel();
    } else {
      showPanel();
    }
  };

  useImperativeHandle(ref, () => ({
    toggle,
    isVisible: () => isVisible,
  }));

  const selectCategory = (category: CategoryKey) => {
    if (selectedCategory === category) {
      // 收起子面板
      Animated.timing(subPanelAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }).start();
      setSelectedCategory(null);
    } else {
      // 展开子面板
      setSelectedCategory(category);
      Animated.timing(subPanelAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const selectOutfit = (category: CategoryKey, outfitId: string) => {
    setSelectedOutfits(prev => ({ ...prev, [category]: outfitId }));
    onSelectOutfit?.(category, outfitId);
  };

  return (
    <>
      {/* 主面板 */}
      <Animated.View style={[styles.panel, { transform: [{ translateX: panelAnim }] }]}>
        {/* 分类列表 */}
        <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.categoryItem,
                selectedCategory === category.key && styles.categoryItemSelected,
              ]}
              onPress={() => selectCategory(category.key)}
            >
              <Ionicons
                name={category.icon as any}
                size={28}
                color={selectedCategory === category.key ? '#FF69B4' : 'white'}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      {/* 子面板 - 显示具体装扮 */}
      {isVisible && selectedCategory && (
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
            <TouchableOpacity onPress={() => selectCategory(selectedCategory)}>
              <Ionicons name="close" size={24} color="#333" />
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
                <View
                  style={[styles.outfitColor, { backgroundColor: outfit.color }]}
                />
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
  panel: {
    position: 'absolute',
    left: 0,
    top: 100,
    bottom: 150,
    width: PANEL_WIDTH,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 100,
  },
  categoryList: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  categoryItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    marginVertical: 4,
    borderRadius: 12,
  },
  categoryItemSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },

  subPanel: {
    position: 'absolute',
    left: PANEL_WIDTH + 5,
    top: 100,
    bottom: 150,
    width: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    zIndex: 99,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  subPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
    padding: 10,
  },
  outfitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginVertical: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  outfitItemSelected: {
    borderColor: '#FF69B4',
    backgroundColor: '#FFF0F5',
  },
  outfitColor: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  outfitName: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    color: '#333',
  },
});

export default OutfitPanel;
