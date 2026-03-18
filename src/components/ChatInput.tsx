import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSendMessage(text.trim());
      setText('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="输入消息..."
          placeholderTextColor="#999"
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
          <Ionicons name="mic-outline" size={24} color="#FF69B4" />
        </TouchableOpacity>
        
        {/* 发送按钮 */}
        {text.trim().length > 0 && (
          <TouchableOpacity
            style={styles.sendButton}
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
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
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
    backgroundColor: '#FF69B4',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});

export default ChatInput;
