import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VoiceService from '../services/voiceService';
import { useChatStore } from '../store/chatStore';

const { width, height } = Dimensions.get('window');
const BUTTON_SIZE = 100;

interface VoicePanelProps {
  isVisible: boolean;
  onClose: () => void;
  onVoiceResult: (text: string) => void;
}

const VoicePanel: React.FC<VoicePanelProps> = ({
  isVisible,
  onClose,
  onVoiceResult,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { setVoiceState } = useChatStore();

  const slideAnim = useRef(new Animated.Value(height)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const voiceServiceRef = useRef<VoiceService | null>(null);

  useEffect(() => {
    voiceServiceRef.current = new VoiceService(
      (text) => {
        onVoiceResult(text);
        setIsListening(false);
        setIsProcessing(false);
        setVoiceState({ isListening: false, isProcessing: false });
        onClose();
      },
      (error) => {
        console.error('Voice error:', error);
        setIsListening(false);
        setIsProcessing(false);
        setVoiceState({ isListening: false, isProcessing: false, error });
      }
    );

    return () => {
      voiceServiceRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  useEffect(() => {
    if (isListening) {
      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Scale animation
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        friction: 3,
        useNativeDriver: true,
      }).start();
    } else {
      pulseAnim.setValue(1);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }).start();
    }
  }, [isListening]);

  const handleStartListening = async () => {
    setIsListening(true);
    setVoiceState({ isListening: true, isProcessing: false });

    try {
      await voiceServiceRef.current?.startListening('zh-CN');
    } catch (error) {
      console.error('Failed to start listening:', error);
      setIsListening(false);
      setVoiceState({ isListening: false, isProcessing: false, error: '无法启动语音识别' });
    }
  };

  const handleStopListening = async () => {
    if (!isListening) return;

    setIsListening(false);
    setIsProcessing(true);
    setVoiceState({ isListening: false, isProcessing: true });

    try {
      await voiceServiceRef.current?.stopListening();
    } catch (error) {
      console.error('Failed to stop listening:', error);
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (isListening) {
      handleStopListening();
    }
    onClose();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* 关闭按钮 */}
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Ionicons name="close" size={28} color="#666" />
      </TouchableOpacity>

      {/* 提示文字 */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>
          {isListening
            ? '正在聆听...'
            : isProcessing
            ? '识别中...'
            : '按住说话'}
        </Text>
      </View>

      {/* 语音按钮区域 */}
      <View style={styles.buttonContainer}>
        {/* Pulse rings */}
        {isListening && (
          <>
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.4],
                    outputRange: [0.6, 0],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [
                    {
                      scale: pulseAnim.interpolate({
                        inputRange: [1, 1.4],
                        outputRange: [1.3, 1.7],
                      }),
                    },
                  ],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.4],
                    outputRange: [0.4, 0],
                  }),
                },
              ]}
            />
          </>
        )}

        {/* Main button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPressIn={handleStartListening}
          onPressOut={handleStopListening}
          style={styles.buttonWrapper}
        >
          <Animated.View
            style={[
              styles.button,
              {
                transform: [{ scale: scaleAnim }],
                backgroundColor: isListening ? '#FF1493' : '#FF69B4',
              },
            ]}
          >
            <Ionicons name="mic" size={48} color="white" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* 底部留白 */}
      <View style={styles.bottomSpace} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: height * 0.45,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
    zIndex: 200,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 20,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  hintText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonWrapper: {
    zIndex: 10,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#FF69B4',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF69B4',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  pulseRing: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    backgroundColor: '#FF69B4',
  },
  bottomSpace: {
    height: 40,
  },
});

export default VoicePanel;
