import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { StackNavigationProp } from '@react-navigation/stack';
import aiService from '../services/aiService';
import { useThemeStore } from '../store/themeStore';
import { useAudioCacheStore } from '../store/audioCacheStore';
import { useDollStore } from '../store/dollStore';
import { Message } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { RootStackParamList } from '../../App';

type MessageBubbleNavigationProp = StackNavigationProp<RootStackParamList>;

interface MessageBubbleProps {
  message: Message;
  dollName: string;
  navigation: MessageBubbleNavigationProp;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, dollName, navigation }) => {
  const isUser = message.isUser;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const { theme, getThemeColors } = useThemeStore();
  const themeColors = getThemeColors();
  const { t, language } = useTranslation();
  
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
          language: language === 'zh' ? 'zh-CN' : 'en-US',
          pitch: 1.2,
          rate: 0.9,
          onDone: () => setIsSpeaking(false),
          onError: () => setIsSpeaking(false),
        });
      }
    } catch (error) {
      console.error('\n\n >>Speech error:', error);
      setIsSpeaking(false);
    }
  };

  // 解析消息内容，判断是否为备忘录或日程创建指令
  const parseMessageContent = () => {
    const text = message.text;
    
    // 检查是否为备忘录创建指令
    const memoCreateMatch = text.match(/\[MEMO:CREATE\]\s*(.+?)\s*\|\s*(.+)/);
    if (memoCreateMatch) {
      const [, title, content] = memoCreateMatch;
      return {
        type: 'memo',
        title: title.trim(),
        content: content.trim(),
        fullContent: text
      };
    }
    
    // 检查是否为日程创建指令
    const calendarCreateMatch = text.match(/\[CALENDAR:CREATE\]\s*(.+?)\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*([\d:]+)?\s*\|\s*(.+)?/);
    if (calendarCreateMatch) {
      const [, title, dateStr, time, description] = calendarCreateMatch;
      return {
        type: 'calendar',
        title: title.trim(),
        date: dateStr,
        time: time?.trim(),
        content: description?.trim() || '',
        fullContent: text
      };
    }
    
    // 普通消息
    return {
      type: 'normal',
      content: text
    };
  };

  const messageContent = parseMessageContent();

  // 处理导航到备忘录页面
  const handleNavigateToMemo = () => {
    navigation.navigate('Memo');
  };

  // 处理导航到日程页面
  const handleNavigateToCalendar = () => {
    navigation.navigate('Calendar');
  };

  // 渲染不同类型的消息卡片
  const renderMessageCard = () => {
    if (messageContent.type === 'memo') {
      return (
        <View style={[styles.card, { backgroundColor: themeColors.surface }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="document-text" size={16} color={themeColors.primary} />
              <Text style={[styles.cardTitle, { color: themeColors.primary }]}>{t('messageCard.memo')}</Text>
            </View>
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={handleNavigateToMemo}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-forward" size={16} color={themeColors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.cardSubtitle, { color: themeColors.text }]}>{messageContent.title}</Text>
          <Text style={[styles.cardContent, { color: themeColors.textSecondary }]}>
            {messageContent.content.length > 20 
              ? messageContent.content.substring(0, 20) + '...' 
              : messageContent.content}
          </Text>
        </View>
      );
    } else if (messageContent.type === 'calendar') {
      return (
        <View style={[styles.card, { backgroundColor: themeColors.surface }]}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Ionicons name="calendar" size={16} color={themeColors.primary} />
              <Text style={[styles.cardTitle, { color: themeColors.primary }]}>{t('messageCard.calendar')}</Text>
            </View>
            <TouchableOpacity
              style={styles.navigateButton}
              onPress={handleNavigateToCalendar}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-forward" size={16} color={themeColors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.cardSubtitle, { color: themeColors.text }]}>{messageContent.title}</Text>
          <Text style={[styles.cardContent, { color: themeColors.textSecondary }]}>
            {messageContent.date} {messageContent.time || ''}
          </Text>
          <Text style={[styles.cardContent, { color: themeColors.textSecondary }]}>
            {messageContent.content.length > 20 
              ? messageContent.content.substring(0, 20) + '...' 
              : messageContent.content}
          </Text>
        </View>
      );
    } else {
      return (
        <View
          style={[
            styles.bubble,
            isUser 
              ? [styles.userBubble, { backgroundColor: themeColors.primary }] 
              : [styles.aiBubble, { backgroundColor: themeColors.surface }],
          ]}
        >
          <Text 
            style={[styles.text, isUser ? { color: 'white' } : { color: themeColors.text }]}
            selectable
          >
            {messageContent.content}
          </Text>
        </View>
      );
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
        {renderMessageCard()}
        {!isUser && messageContent.type === 'normal' && (
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
  card: {
    padding: 16,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navigateButton: {
    padding: 4,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  cardContent: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default MessageBubble;
