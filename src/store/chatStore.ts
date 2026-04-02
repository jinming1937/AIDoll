import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '../types';

interface ChatState {
  messages: Message[];
  isAITyping: boolean;
  addMessage: (text: string, isUser: boolean) => void;
  clearMessages: () => void;
  setAITyping: (isTyping: boolean) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isAITyping: false,
      addMessage: (text, isUser) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              id: Date.now().toString(),
              text,
              isUser,
              timestamp: Date.now(),
            },
          ],
        })),
      clearMessages: () => set({ messages: [] }),
      setAITyping: (isTyping) => set({ isAITyping: isTyping }),
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
