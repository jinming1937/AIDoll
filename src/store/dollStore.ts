import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DollConfig, AnimationType } from '../types';

interface DollState {
  config: DollConfig;
  currentAnimation: AnimationType;
  setConfig: (config: Partial<DollConfig>) => void;
  setAnimation: (animation: AnimationType) => void;
  resetConfig: () => void;
}

const defaultConfig: DollConfig = {
  name: '诗雅',
  hairColor: '#2C1810',
  skinColor: '#FFF0E6',
  eyeColor: '#5D4E37',
  outfitColor: '#C41E3A',
  personality: 'elegant',
};

export const useDollStore = create<DollState>()(
  persist(
    (set) => ({
      config: defaultConfig,
      currentAnimation: 'idle',
      setConfig: (newConfig) =>
        set((state) => ({
          config: { ...state.config, ...newConfig },
        })),
      setAnimation: (animation) => set({ currentAnimation: animation }),
      resetConfig: () => set({ config: defaultConfig }),
    }),
    {
      name: 'doll-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
