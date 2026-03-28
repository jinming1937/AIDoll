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
  disabled?: boolean;
  dollName: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  dollName,
}) => {
  const [text, setText] = useState('');
  const { theme, getThemeColors } = useThemeStore();
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
          placeholder={t('chat.inputPlaceholder', { name: dollName })}
          placeholderTextColor={themeColors.textSecondary}
          multiline={false}
          editable={!disabled}
          onSubmitEditing={handleSend}
          returnKeyType="send"
        />
        
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
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});

export default ChatInput;
