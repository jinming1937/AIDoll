import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { useTranslation } from '../hooks/useTranslation';

const { width } = Dimensions.get('window');

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onVoicePress: () => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onVoicePress,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const { getThemeColors } = useThemeStore();
  const themeColors = getThemeColors();
  const { t } = useTranslation();

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.surface, borderTopColor: themeColors.border }]}>
      <View style={[styles.inputWrapper, { backgroundColor: themeColors.background }]}>
        <TextInput
          style={[styles.input, { color: themeColors.text }]}
          value={text}
          onChangeText={setText}
          placeholder={t('chat.inputPlaceholder')}
          placeholderTextColor={themeColors.textSecondary}
          multiline={false}
          editable={!disabled}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        
        {/* 语音按钮 */}
        <TouchableOpacity
          style={styles.voiceButton}
          onPress={onVoicePress}
          disabled={disabled}
        >
          <Ionicons name="mic-outline" size={24} color={themeColors.primary} />
        </TouchableOpacity>
        
        {/* 发送按钮 */}
        {text.trim().length > 0 && (
          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: themeColors.primary }]}
            onPress={handleSend}
            disabled={disabled}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    zIndex: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    maxHeight: 100,
  },
  voiceButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});

export default ChatInput;
