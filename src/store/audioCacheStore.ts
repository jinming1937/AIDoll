import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 音频缓存项接口
export interface AudioCacheItem {
  msgId: string;
  audioUrl: string;
  botName: string;
  gender: string;
  timestamp: number;
}

interface AudioCacheState {
  cache: Record<string, AudioCacheItem>;
  // 添加或更新缓存
  setCache: (item: AudioCacheItem) => void;
  // 根据条件获取缓存
  getCache: (msgId: string, botName: string, gender: string) => AudioCacheItem | null;
  // 检查缓存是否存在且匹配
  hasValidCache: (msgId: string, botName: string, gender: string) => boolean;
  // 清除所有缓存
  clearCache: () => void;
  // 清除过期缓存（超过7天）
  clearExpiredCache: () => void;
}

// 缓存有效期：7天（毫秒）
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000;

export const useAudioCacheStore = create<AudioCacheState>()(
  persist(
    (set, get) => ({
      cache: {},

      setCache: (item) => {
        set((state) => ({
          cache: {
            ...state.cache,
            [item.msgId]: {
              ...item,
              timestamp: Date.now(),
            },
          },
        }));
      },

      getCache: (msgId, botName, gender) => {
        const state = get();
        const item = state.cache[msgId];

        // 检查缓存是否存在且匹配所有条件
        if (
          item &&
          item.botName === botName &&
          item.gender === gender &&
          Date.now() - item.timestamp < CACHE_EXPIRY
        ) {
          return item;
        }

        return null;
      },

      hasValidCache: (msgId, botName, gender) => {
        const state = get();
        const item = state.cache[msgId];

        return !!(
          item &&
          item.botName === botName &&
          item.gender === gender &&
          Date.now() - item.timestamp < CACHE_EXPIRY
        );
      },

      clearCache: () => {
        set({ cache: {} });
      },

      clearExpiredCache: () => {
        set((state) => {
          const now = Date.now();
          const newCache: Record<string, AudioCacheItem> = {};

          Object.entries(state.cache).forEach(([key, item]) => {
            if (now - item.timestamp < CACHE_EXPIRY) {
              newCache[key] = item;
            }
          });

          return { cache: newCache };
        });
      },
    }),
    {
      name: 'audio-cache-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
