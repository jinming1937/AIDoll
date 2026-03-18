import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeType, ThemeColors } from '../types';

interface ThemeState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  getThemeColors: () => ThemeColors;
}

// 主题颜色配置
export const THEME_COLORS: Record<ThemeType, ThemeColors> = {
  pink: {
    primary: '#FF69B4',
    primaryLight: '#FFB6C1',
    primaryDark: '#FF1493',
    background: '#FFF0F5',
    surface: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#FFE4EC',
    accent: '#FFC0CB',
  },
  blue: {
    primary: '#4A90D9',
    primaryLight: '#87CEEB',
    primaryDark: '#2E5C8A',
    background: '#F0F8FF',
    surface: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#D6EAF8',
    accent: '#5DADE2',
  },
  black: {
    primary: '#2C3E50',
    primaryLight: '#566573',
    primaryDark: '#1A252F',
    background: '#1A1A1A',
    surface: '#2C2C2C',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    border: '#404040',
    accent: '#34495E',
  },
  white: {
    primary: '#808080',
    primaryLight: '#A0A0A0',
    primaryDark: '#606060',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#333333',
    textSecondary: '#666666',
    border: '#E0E0E0',
    accent: '#D0D0D0',
  },
};

// 主题选项
export const THEME_OPTIONS: { key: ThemeType; label: string; color: string }[] = [
  { key: 'pink', label: '粉色', color: '#FF69B4' },
  { key: 'blue', label: '蓝色', color: '#4A90D9' },
  { key: 'black', label: '黑色', color: '#2C3E50' },
  { key: 'white', label: '白色', color: '#808080' },
];

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'pink',
      setTheme: (theme) => set({ theme }),
      getThemeColors: () => THEME_COLORS[get().theme],
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
