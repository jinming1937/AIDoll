import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import DollCharacter from '../components/DollCharacter';
import OutfitPanel, { OutfitPanelRef } from '../components/OutfitPanel';
import ChatFloatingPanel from '../components/ChatFloatingPanel';
import QuickTools from '../components/QuickTools';
import { useDollStore } from '../store/dollStore';
import { useChatStore } from '../store/chatStore';
import { useThemeStore } from '../store/themeStore';
import { useAudioStore } from '../store/audioStore';
import aiService from '../services/aiService';
import { RootStackParamList } from '../../App';
import { loadLocalJson } from '../util/lib';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { config, setAnimation } = useDollStore();
  const { messages, addMessage, isAITyping } = useChatStore();
  const { getThemeColors } = useThemeStore();
  const { isMuted, toggleMute } = useAudioStore();
  const outfitPanelRef = useRef<OutfitPanelRef>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isChatFloatingVisible, setIsChatFloatingVisible] = useState(false);
  const [selectedOutfits, setSelectedOutfits] = useState<Record<string, string>>({
    maozi: '',
    toushi: '',
    top: '',
    bottom: '',
    jewelry: '',
    shoes: '',
  });

  // 订阅 theme 变化，确保组件重新渲染
  const themeColors = getThemeColors();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handleVoiceResult = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Add user message
    addMessage(text, true);

    // Set talking animation
    setAnimation('thinking');

    try {
      // Get AI response
      const response = await aiService.sendMessage(
        text,
        config,
        messages.slice(-5)
      );

      // Handle action
      if (response.action) {
        setAnimation(response.action as any);
        // Reset to idle after animation
        setTimeout(() => setAnimation('idle'), 3000);
      } else {
        setAnimation('talking');
        setTimeout(() => setAnimation('idle'), 2000);
      }

      // Add AI message
      addMessage(response.text, false);

      // Speak response
      aiService.speak(response.text);
    } catch (error) {
      console.error('Error processing voice:', error);
      setAnimation('idle');
    }
  }, [config, messages, addMessage, setAnimation]);

  const toggleChatFloating = () => {
    setIsChatFloatingVisible(!isChatFloatingVisible);
  };

  // 使用示例（游戏启动时预加载配置） 女主.json
    const gameConfig = loadLocalJson(require('../../assets/data/nvzhu.json'));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style={themeColors.primary === '#2C3E50' ? 'light' : 'light'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.primary }]}>
        <TouchableOpacity
          style={[styles.outfitButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
          onPress={() => outfitPanelRef.current?.toggle()}
        >
          <Ionicons name="shirt-outline" size={24} color="white" />
        </TouchableOpacity>
        <Animated.Text style={[styles.headerTitle, { opacity: fadeAnim }]}>
          {config.name}
        </Animated.Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.volumeButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
            onPress={toggleMute}
          >
            <Ionicons name={isMuted ? "volume-mute-outline" : "volume-high-outline"} size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.settingsButton, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
            onPress={() => navigation.navigate('Settings')}
          >
            <Ionicons name="settings-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Outfit Panel */}
        <OutfitPanel
          ref={outfitPanelRef}
          config={gameConfig}
          onSelectOutfit={(category, outfitId) => {
            console.log('Selected outfit:', category, outfitId);
            setSelectedOutfits(prev => ({ ...prev, [category]: outfitId }));
          }}
        />

        {/* Doll Character */}
        <View style={styles.dollContainer}>
          <DollCharacter config={gameConfig} selectedOutfits={selectedOutfits} />
        </View>
      </View>

      {/* Chat Floating Button */}
      <TouchableOpacity
        style={[styles.chatFloatingButton, { backgroundColor: themeColors.primary }]}
        onPress={toggleChatFloating}
        disabled={isChatFloatingVisible}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
      </TouchableOpacity>

      {/* Quick Tools */}
      <QuickTools
        onCalendarPress={() => {
          // 导航到日历页面
          navigation.navigate('Calendar');
        }}
        onMemoPress={() => {
          // 导航到备忘录页面
          navigation.navigate('Memo');
        }}
        onAccountingPress={() => {
          // TODO: 导航到记账页面
          console.log('Accounting pressed');
        }}
        onGamePress={() => {
          // TODO: 导航到小游戏页面
          console.log('Game pressed');
        }}
        onMessageHistoryPress={() => {
          // TODO: 导航到消息历史页面
          console.log('Message history pressed');
        }}
      />

      {/* Chat Floating Panel */}
      <ChatFloatingPanel
        visible={isChatFloatingVisible}
        onClose={toggleChatFloating}
        messages={messages}
        isAITyping={isAITyping}
        dollName={config.name}
        onSendMessage={handleVoiceResult}
        navigation={navigation}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  outfitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  volumeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    position: 'relative',
  },
  dollContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatFloatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10,
  },
});

export default HomeScreen;
