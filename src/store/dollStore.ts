import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DollConfig, AnimationType, Gender, Personality } from '../types';

interface DollState {
  config: DollConfig;
  currentAnimation: AnimationType;
  setConfig: (config: Partial<DollConfig>) => void;
  setAnimation: (animation: AnimationType) => void;
  resetConfig: () => void;
  setImageUri: (uri: string | null) => void;
  setGender: (gender: Gender) => void;
  setPersonality: (personality: Personality) => void;
}

// 女性默认配置
const femaleDefaultConfig: DollConfig = {
  name: '诗雅',
  gender: 'female',
  hairColor: '#2C1810',
  skinColor: '#FFF0E6',
  eyeColor: '#5D4E37',
  outfitColor: '#C41E3A',
  personality: 'elegant',
  imageUri: null,
};

// 男性默认配置
const maleDefaultConfig: DollConfig = {
  name: '浩然',
  gender: 'male',
  hairColor: '#1A1A1A',
  skinColor: '#F5E6D3',
  eyeColor: '#2C3E50',
  outfitColor: '#2E4053',
  personality: 'mature',
  imageUri: null,
};

// 根据性别获取默认配置
const getDefaultConfig = (gender: Gender = 'female'): DollConfig => {
  return gender === 'male' ? maleDefaultConfig : femaleDefaultConfig;
};

// 女性性格选项
export const FEMALE_PERSONALITIES: { key: Personality; label: string; icon: string }[] = [
  { key: 'cute', label: '可爱', icon: 'heart' },
  { key: 'intellectual', label: '知性', icon: 'book' },
  { key: 'playful', label: '调皮', icon: 'happy' },
  { key: 'elegant', label: '优雅', icon: 'flower' },
];

// 男性性格选项
export const MALE_PERSONALITIES: { key: Personality; label: string; icon: string }[] = [
  { key: 'cheerful', label: '爽朗', icon: 'sunny' },
  { key: 'masculine', label: '阳刚', icon: 'fitness' },
  { key: 'mature', label: '成熟', icon: 'business' },
  { key: 'humorous', label: '幽默', icon: 'happy' },
];

// 获取对应性别的性格列表
export const getPersonalitiesByGender = (gender: Gender) => {
  return gender === 'male' ? MALE_PERSONALITIES : FEMALE_PERSONALITIES;
};

// 获取默认性格
export const getDefaultPersonality = (gender: Gender): Personality => {
  return gender === 'male' ? 'mature' : 'elegant';
};

export const useDollStore = create<DollState>()(
  persist(
    (set) => ({
      config: femaleDefaultConfig,
      currentAnimation: 'idle',
      setConfig: (newConfig) =>
        set((state) => ({
          config: { ...state.config, ...newConfig },
        })),
      setAnimation: (animation) => set({ currentAnimation: animation }),
      resetConfig: () => set({ config: femaleDefaultConfig }),
      setImageUri: (uri) =>
        set((state) => ({
          config: { ...state.config, imageUri: uri },
        })),
      setGender: (gender) =>
        set((state) => ({
          config: {
            ...getDefaultConfig(gender),
            name: state.config.name,
            imageUri: state.config.imageUri,
          },
        })),
      setPersonality: (personality) =>
        set((state) => ({
          config: { ...state.config, personality },
        })),
    }),
    {
      name: 'doll-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
