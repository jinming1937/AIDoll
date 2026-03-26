import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import DollCharacter from '../components/DollCharacter';
import MessageBubble from '../components/MessageBubble';
import OutfitPanel, { OutfitPanelRef } from '../components/OutfitPanel';
import ChatInput from '../components/ChatInput';
import VoicePanel from '../components/VoicePanel';
import { useDollStore } from '../store/dollStore';
import { useChatStore } from '../store/chatStore';
import { useThemeStore } from '../store/themeStore';
import { useAudioStore } from '../store/audioStore';
import aiService from '../services/aiService';
import { useTranslation } from '../hooks/useTranslation';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { config, setAnimation } = useDollStore();
  const { messages, addMessage, voiceState, isAITyping } = useChatStore();
  const { theme, getThemeColors } = useThemeStore();
  const { isMuted, toggleMute } = useAudioStore();
  const { t } = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);
  const outfitPanelRef = useRef<OutfitPanelRef>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isVoicePanelVisible, setIsVoicePanelVisible] = useState(false);
  const [isChatFloatingVisible, setIsChatFloatingVisible] = useState(false);
  const floatingAnim = useRef(new Animated.Value(0)).current;

  // 订阅 theme 变化，确保组件重新渲染
  const themeColors = getThemeColors();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

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

  const scrollToBottom = () => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  };

  const toggleChatFloating = () => {
    if (isChatFloatingVisible) {
      // 收起浮层
      Animated.timing(floatingAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setIsChatFloatingVisible(false);
      });
    } else {
      // 显示浮层
      setIsChatFloatingVisible(true);
      Animated.timing(floatingAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  // 监听键盘事件，自动滚动到底部
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollToBottom();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        scrollToBottom();
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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

      <View style={styles.keyboardAvoidingView}>
        {/* Main Content */}
        <View style={styles.content}>
          {/* Outfit Panel */}
          <OutfitPanel
            ref={outfitPanelRef}
            onSelectOutfit={(category, outfitId) => {
              console.log('Selected outfit:', category, outfitId);
              // TODO: Update doll appearance based on selection
            }}
          />

          {/* Doll Character */}
          <View style={styles.dollContainer}>
            <DollCharacter />
          </View>
        </View>

        {/* Voice Status */}
        {voiceState.isListening && (
          <View style={styles.statusContainer}>
            <Animated.View style={styles.listeningIndicator}>
              <Ionicons name="mic" size={20} color="#FF69B4" />
              <Animated.Text style={styles.statusText}>{t('home.listening')}</Animated.Text>
            </Animated.View>
          </View>
        )}
      </View>

      {/* Chat Floating Button */}
      <TouchableOpacity
        style={[styles.chatFloatingButton, { backgroundColor: themeColors.primary }]}
        onPress={toggleChatFloating}
        disabled={isChatFloatingVisible}
      >
        <Ionicons name="chatbubble-ellipses-outline" size={24} color="white" />
      </TouchableOpacity>

      {/* Chat Floating Panel */}
      {isChatFloatingVisible && (
        <>
          {/* Gray Overlay */}
          <TouchableOpacity 
            style={styles.overlay} 
            onPress={toggleChatFloating}
            activeOpacity={1}
          />
          
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingView}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
          >
            <Animated.View 
              style={[
                styles.chatFloatingPanel,
                {
                  backgroundColor: themeColors.background,
                  transform: [
                    {
                      translateY: floatingAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [height, 0]
                      })
                    }
                  ]
                }
              ]}
            >
              {/* Panel Header */}
              <View style={styles.panelHeader}>
                <View style={styles.panelHandle} />
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={toggleChatFloating}
                >
                  <Ionicons name="close" size={24} color={themeColors.text} />
                </TouchableOpacity>
              </View>
              
              {/* Messages Area */}
              <View style={styles.messagesContainer}>
                <ScrollView
                  ref={scrollViewRef}
                  style={styles.messagesScroll}
                  contentContainerStyle={styles.messagesContent}
                  onContentSizeChange={scrollToBottom}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  {messages.length === 0 ? (
                    <View style={styles.welcomeContainer}>
                      <Animated.Text style={[styles.welcomeText, { opacity: fadeAnim }]}>
                        {t('home.welcome', { name: config.name })}
                      </Animated.Text>
                    </View>
                  ) : (
                    messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        dollName={config.name}
                      />
                    ))
                  )}
                  {isAITyping && (
                    <View style={[styles.typingIndicator, { backgroundColor: themeColors.surface }]}>
                      <Animated.View style={[styles.typingDot, { backgroundColor: themeColors.textSecondary }]} />
                      <Animated.View style={[styles.typingDot, { marginHorizontal: 4, backgroundColor: themeColors.textSecondary }]} />
                      <Animated.View style={[styles.typingDot, { backgroundColor: themeColors.textSecondary }]} />
                    </View>
                  )}
                </ScrollView>
              </View>

              {/* Bottom Controls - Chat Input */}
              <ChatInput
                onSendMessage={handleVoiceResult}
                onVoicePress={() => setIsVoicePanelVisible(true)}
                disabled={isAITyping}
              />
            </Animated.View>
          </KeyboardAvoidingView>
        </>
      )}

      {/* Voice Panel */}
      <VoicePanel
        isVisible={isVoicePanelVisible}
        onClose={() => setIsVoicePanelVisible(false)}
        onVoiceResult={handleVoiceResult}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
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
  messagesContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: 20,
  },
  welcomeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 16,
    textAlign: 'center',
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
  statusContainer: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  listeningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },

  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginTop: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 20,
  },
  chatFloatingPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 25,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
    paddingBottom: 10,
    position: 'relative',
  },
  panelHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 20,
    top: 10,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;
