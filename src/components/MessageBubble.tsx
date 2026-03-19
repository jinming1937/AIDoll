import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import aiService from '../services/aiService';
import { useThemeStore } from '../store/themeStore';
import { useAudioCacheStore } from '../store/audioCacheStore';
import { useDollStore } from '../store/dollStore';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  dollName: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, dollName }) => {
  const isUser = message.isUser;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const { theme, getThemeColors } = useThemeStore();
  const themeColors = getThemeColors();
  
  // 获取音频缓存和人物配置
  const { getCache, setCache, hasValidCache } = useAudioCacheStore();
  const { config } = useDollStore();

  // 组件卸载时停止播放
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // 播放音频的辅助函数
  const playAudio = async (audioUrl: string) => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );
      setSound(newSound);

      // 监听播放状态
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          newSound.unloadAsync();
          setSound(null);
          setIsSpeaking(false);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Audio playback error:', error);
      return false;
    }
  };

  const handleSpeak = async () => {
    if (isSpeaking) {
      // 停止播放
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      aiService.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    try {
      let audioUrl: string | null = null;
      
      // 1. 首先检查是否有匹配的缓存
      const cachedItem = getCache(message.id, dollName, config.gender);
      
      if (cachedItem) {
        console.log('Using cached audio for message:', message.id);
        audioUrl = cachedItem.audioUrl;
        
        // 尝试播放缓存的音频
        const playSuccess = await playAudio(audioUrl);
        if (playSuccess) {
          return;
        }
        // 播放失败（可能是URL过期），继续调用API
        console.log('Cached audio failed, fetching new audio...');
      }
      
      // 2. 没有缓存或缓存失效，调用大模型TTS
      console.log('Fetching new audio from API...');
      audioUrl = await aiService.synthesizeSpeech(message.text);

      if (audioUrl) {
        // 播放音频
        const playSuccess = await playAudio(audioUrl);
        
        if (playSuccess) {
          // 3. 播放成功后，缓存音频URL
          setCache({
            msgId: message.id,
            audioUrl: audioUrl,
            botName: dollName,
            gender: config.gender,
            timestamp: Date.now(),
          });
          console.log('Audio cached for message:', message.id);
        }
      } else {
        // 没有API Key，使用系统TTS
        Speech.speak(message.text, {
          language: 'zh-CN',
          pitch: 1.2,
          rate: 0.9,
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      }
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.aiContainer,
      ]}
    >
      <View style={styles.bubbleRow}>
        <View
          style={[
            styles.bubble,
            isUser 
              ? [styles.userBubble, { backgroundColor: themeColors.primary }] 
              : [styles.aiBubble, { backgroundColor: themeColors.surface }],
          ]}
        >
          <Text style={[styles.text, isUser ? { color: 'white' } : { color: themeColors.text }]}>
            {message.text}
          </Text>
        </View>
        {!isUser && (
          <TouchableOpacity
            onPress={handleSpeak}
            style={styles.speakButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isSpeaking ? 'volume-high' : 'volume-medium'}
              size={18}
              color={isSpeaking ? themeColors.primary : themeColors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.timestamp, { color: themeColors.textSecondary }]}>
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubbleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speakButton: {
    marginLeft: 6,
    padding: 4,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minHeight: 40,
    justifyContent: 'center',
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 2,
    marginHorizontal: 4,
  },
});

export default MessageBubble;
