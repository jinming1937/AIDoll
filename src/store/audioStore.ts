import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AudioState {
  volume: number;
  isMuted: boolean;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  resetAudioSettings: () => void;
}

export const useAudioStore = create<AudioState>()(
  persist(
    (set) => ({
      volume: 0.5,
      isMuted: false,
      setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
      toggleMute: () => set((state) => ({
        isMuted: !state.isMuted,
        volume: !state.isMuted ? 0 : 0.5,
      })),
      resetAudioSettings: () => set({ volume: 0.5, isMuted: false }),
    }),
    {
      name: 'audio-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
