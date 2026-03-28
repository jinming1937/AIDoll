import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { useThemeStore } from '../store/themeStore';
import { useTranslation } from '../hooks/useTranslation';
// import { Message } from '../store/chatStore';
import { Message } from '../types';
import { RootStackParamList } from '../../App';


const { width, height } = Dimensions.get('window');

type ChatFloatingPanelNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface ChatFloatingPanelProps {
  visible: boolean;
  onClose: () => void;
  messages: Message[];
  isAITyping: boolean;
  dollName: string;
  onSendMessage: (text: string) => void;
  navigation: ChatFloatingPanelNavigationProp;
}

export interface ChatFloatingPanelRef {
  scrollToBottom: () => void;
}

const ChatFloatingPanel = forwardRef<ChatFloatingPanelRef, ChatFloatingPanelProps>(
  ({ visible, onClose, messages, isAITyping, dollName, onSendMessage, navigation }, ref) => {
    const { getThemeColors } = useThemeStore();
    const { t } = useTranslation();
    const scrollViewRef = useRef<ScrollView>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const floatingAnim = useRef(new Animated.Value(0)).current;
    const themeColors = getThemeColors();

    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }, []);

    useEffect(() => {
      if (visible) {
        Animated.timing(floatingAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(floatingAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    }, [visible]);

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

    const scrollToBottom = () => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    useImperativeHandle(ref, () => ({
      scrollToBottom,
    }));

    return (
      <>
        {/* Gray Overlay */}
        <TouchableOpacity
          style={[
            styles.overlay,
            {
              opacity: visible ? 1 : 0,
              pointerEvents: visible ? 'auto' : 'none'
            }
          ]}
          onPress={onClose}
          activeOpacity={1}
        />

        <Animated.View
          style={[
            styles.chatFloatingPanel,
            {
              backgroundColor: themeColors.background,
              opacity: visible ? 1 : 0,
              pointerEvents: visible ? 'auto' : 'none',
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
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={themeColors.text} />
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView
            // 平台差异化配置：iOS用padding，Android用height（最稳方案）
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
            // 适配导航栏/状态栏高度，iOS一般60-80，Android可设0
            keyboardVerticalOffset={Platform.OS === 'ios' ? 150 : 0}
            // 强制开启避让（默认true，防止误关）
            enabled={true}
          >
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
                    <Animated.Text style={[styles.welcomeText, { opacity: fadeAnim, color: themeColors.text }]}>
                      {t('home.welcome', { name: dollName })}
                    </Animated.Text>
                  </View>
                ) : (
                  messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      dollName={dollName}
                      navigation={navigation}
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
            <View style={[styles.inputWrapper, { paddingBottom: Platform.OS === 'ios' ? 20 : 0 }]}>
              <ChatInput
                onSendMessage={onSendMessage}
                disabled={isAITyping}
                dollName={dollName}
              />
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </>
    );
  }
);

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
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
    height: height * 0.8,
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
  blankSpace: {
    height: 30,
  },
  inputWrapper: {
    width: '100%',
  },
});

export default ChatFloatingPanel;
