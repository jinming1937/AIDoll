import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';

const { width } = Dimensions.get('window');

interface QuickToolsProps {
  onCalendarPress?: () => void;
  onMemoPress?: () => void;
  onAccountingPress?: () => void;
  onGamePress?: () => void;
  onMessageHistoryPress?: () => void;
}

const QuickTools: React.FC<QuickToolsProps> = ({
  onCalendarPress,
  onMemoPress,
  onAccountingPress,
  onGamePress,
  onMessageHistoryPress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { getThemeColors } = useThemeStore();
  const themeColors = getThemeColors();

  const animation = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    if (isExpanded) {
      Animated.timing(animation, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setIsExpanded(false));
    } else {
      setIsExpanded(true);
      Animated.timing(animation, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  const tools = [
    { id: 'game', icon: 'game-controller-outline', onPress: onGamePress, color: '#96CEB4' },
    { id: 'accounting', icon: 'wallet-outline', onPress: onAccountingPress, color: '#45B7D1' },
    { id: 'memo', icon: 'document-text-outline', onPress: onMemoPress, color: '#4ECDC4' },
    { id: 'calendar', icon: 'calendar-outline', onPress: onCalendarPress, color: '#FF6B6B' },
    { id: 'message-history', icon: 'chatbubbles-outline', onPress: onMessageHistoryPress, color: '#FFD93D' },
  ];

  const translateX = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [280, 0],
  });

  const opacity = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  const scale = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  const rotateArrow = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      {/* 展开的按钮组 */}
      <Animated.View
        style={[
          styles.toolsContainer,
          {
            transform: [{ translateX }],
            opacity: isExpanded ? opacity : 0,
          },
        ]}
      >
        {tools.map((tool, index) => (
          <Animated.View
            key={tool.id}
            style={{
              transform: [{ scale }],
              opacity,
            }}
          >
            <TouchableOpacity
              style={[styles.toolButton, { backgroundColor: tool.color }]}
              onPress={() => {
                tool.onPress?.();
              }}
              activeOpacity={0.8}
            >
              <Ionicons name={tool.icon as any} size={22} color="white" />
            </TouchableOpacity>
          </Animated.View>
        ))}
      </Animated.View>

      {/* 主按钮 - 箭头 */}
      <TouchableOpacity
        style={[styles.mainButton, { backgroundColor: themeColors.primary }]}
        onPress={toggleExpand}
        activeOpacity={0.8}
      >
        <Animated.View style={{ transform: [{ rotate: rotateArrow }] }}>
          <Ionicons name="chevron-back-outline" size={28} color="white" />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 15,
  },
  mainButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toolsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    right: 70,
    gap: 12,
  },
  toolButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});

export default QuickTools;
