import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import aiService from '../services/aiService';
import { useTranslation } from '../hooks/useTranslation';
import { useThemeStore } from '../store/themeStore';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  AISettings: undefined;
};

type AISettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AISettings'>;

interface AISettingsScreenProps {
  navigation: AISettingsScreenNavigationProp;
}

type AIProvider = 'openai' | 'qwen';
type TTSModel = 'qwen3-tts-instruct-flash' | 'qwen3-tts-flash';

interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  ttsModel?: string;
  ttsApiKey?: string;
}

const getProviders = (t: (key: string) => string) => [
  {
    key: 'qwen' as AIProvider,
    name: t('aiSettings.providers.qwen.name'),
    description: t('aiSettings.providers.qwen.description'),
    defaultModel: 'qwen-turbo',
    models: ['qwen-turbo', 'qwen-plus', 'qwen-max'],
  },
  {
    key: 'openai' as AIProvider,
    name: t('aiSettings.providers.openai.name'),
    description: t('aiSettings.providers.openai.description'),
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
  },
];

const getTTSDescription = (key: TTSModel, t: (key: string) => string): string => {
  const descriptions: Record<TTSModel, string> = {
    'qwen3-tts-instruct-flash': t('aiSettings.ttsInstructDesc') || '支持指令控制的TTS模型，更自然',
    'qwen3-tts-flash': t('aiSettings.ttsStandardDesc') || '标准TTS模型',
  };
  return descriptions[key];
};

const TTS_MODELS: { key: TTSModel; name: string }[] = [
  {
    key: 'qwen3-tts-instruct-flash',
    name: 'qwen3-tts-instruct-flash',
  },
  {
    key: 'qwen3-tts-flash',
    name: 'qwen3-tts-flash',
  },
];

const AISettingsScreen: React.FC<AISettingsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme, getThemeColors } = useThemeStore();
  const themeColors = getThemeColors();
  const [config, setConfig] = useState<AIConfig>({
    provider: 'qwen',
    apiKey: '',
    model: 'qwen-turbo',
    ttsModel: 'qwen3-tts-instruct-flash',
    ttsApiKey: '',
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [showTTSApiKey, setShowTTSApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const PROVIDERS = getProviders(t);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    const currentConfig = aiService.getConfig();
    setConfig({
      provider: currentConfig.provider || 'qwen',
      apiKey: currentConfig.apiKey || '',
      model: currentConfig.model || 'qwen-turbo',
      ttsModel: currentConfig.ttsModel || 'qwen3-tts-instruct-flash',
      ttsApiKey: currentConfig.ttsApiKey || '',
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await aiService.setConfig(config);
      Alert.alert(t('messages.saveSuccess'), t('messages.configUpdated'), [
        { text: t('common.confirm'), onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert(t('messages.saveError'), t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    Alert.alert(t('common.confirm'), t('messages.clearConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        onPress: async () => {
          await aiService.setApiKey('');
          setConfig({ ...config, apiKey: '' });
        },
      },
    ]);
  };

  const selectedProvider = PROVIDERS.find((p) => p.key === config.provider);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style={theme === 'black' ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.surface, borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={themeColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>{t('aiSettings.title')}</Text>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: themeColors.primary }, isLoading && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? t('common.loading') : t('common.save')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Provider Selection */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('aiSettings.selectModel')}</Text>
          {PROVIDERS.map((provider) => (
            <TouchableOpacity
              key={provider.key}
              style={[
                styles.providerCard,
                { backgroundColor: themeColors.background },
                config.provider === provider.key && { borderColor: themeColors.primary },
              ]}
              onPress={() =>
                setConfig({
                  ...config,
                  provider: provider.key,
                  model: provider.defaultModel,
                })
              }
            >
              <View style={styles.providerInfo}>
                <Text
                  style={[
                    styles.providerName,
                    { color: themeColors.text },
                    config.provider === provider.key && { color: themeColors.primary },
                  ]}
                >
                  {provider.name}
                </Text>
                <Text style={[styles.providerDescription, { color: themeColors.textSecondary }]}>
                  {provider.description}
                </Text>
              </View>
              {config.provider === provider.key && (
                <Ionicons name="checkmark-circle" size={24} color={themeColors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Model Selection */}
        {selectedProvider && (
          <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('aiSettings.selectChatVersion')}</Text>
            <Text style={[styles.subSectionLabel, { color: themeColors.textSecondary }]}>{t('aiSettings.selectVersion')}</Text>
            <View style={styles.modelGrid}>
              {selectedProvider.models.map((model) => (
                <TouchableOpacity
                  key={model}
                  style={[
                    styles.modelButton,
                    { backgroundColor: themeColors.background },
                    config.model === model && { backgroundColor: themeColors.primary, borderColor: themeColors.primaryDark },
                  ]}
                  onPress={() => setConfig({ ...config, model })}
                >
                  <Text
                    style={[
                      styles.modelText,
                      { color: themeColors.text },
                      config.model === model && { color: 'white' },
                    ]}
                  >
                    {model}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* TTS Model Selection */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('aiSettings.ttsSettings')}</Text>
          
          {/* TTS Model Selection */}
          <Text style={[styles.subSectionLabel, { color: themeColors.textSecondary }]}>{t('aiSettings.selectTTSModel')}</Text>
          <View style={styles.ttsModelContainer}>
            {TTS_MODELS.map((ttsModel) => (
              <TouchableOpacity
                key={ttsModel.key}
                style={[
                  styles.ttsModelButton,
                  { backgroundColor: themeColors.background },
                  config.ttsModel === ttsModel.key && { borderColor: themeColors.primary },
                ]}
                onPress={() => setConfig({ ...config, ttsModel: ttsModel.key })}
              >
                <View style={styles.ttsModelHeader}>
                  <Text
                    style={[
                      styles.ttsModelName,
                      { color: themeColors.text },
                      config.ttsModel === ttsModel.key && { color: themeColors.primary },
                    ]}
                  >
                    {ttsModel.name}
                  </Text>
                  {config.ttsModel === ttsModel.key && (
                    <Ionicons name="checkmark-circle" size={20} color={themeColors.primary} />
                  )}
                </View>
                <Text style={[styles.ttsModelDescription, { color: themeColors.textSecondary }]}>
                  {getTTSDescription(ttsModel.key, t)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* TTS API Key Input (Optional) */}
          <Text style={[styles.subSectionLabel, { color: themeColors.textSecondary, marginTop: 16 }]}>
            {t('aiSettings.ttsApiKey')}
          </Text>
          <View style={[styles.apiKeyContainer, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
            <TextInput
              style={[styles.apiKeyInput, { color: themeColors.text }]}
              value={config.ttsApiKey}
              onChangeText={(text) => setConfig({ ...config, ttsApiKey: text })}
              placeholder={t('aiSettings.ttsApiKeyPlaceholder')}
              placeholderTextColor={themeColors.textSecondary}
              secureTextEntry={!showTTSApiKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowTTSApiKey(!showTTSApiKey)}
            >
              <Ionicons
                name={showTTSApiKey ? 'eye-off' : 'eye'}
                size={20}
                color={themeColors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

         {/* API Key Input */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('aiSettings.apiKey')}</Text>
          <View style={[styles.apiKeyContainer, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
            <TextInput
              style={[styles.apiKeyInput, { color: themeColors.text }]}
              value={config.apiKey}
              onChangeText={(text) => setConfig({ ...config, apiKey: text })}
              placeholder={t('aiSettings.apiKeyPlaceholder', { provider: selectedProvider?.name || '' })}
              placeholderTextColor={themeColors.textSecondary}
              secureTextEntry={!showApiKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowApiKey(!showApiKey)}
            >
              <Ionicons
                name={showApiKey ? 'eye-off' : 'eye'}
                size={20}
                color={themeColors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Ionicons name="information-circle" size={16} color={themeColors.textSecondary} />
            <Text style={[styles.helpText, { color: themeColors.textSecondary }]}>
              {config.provider === 'qwen'
                ? t('aiSettings.helpText.qwen')
                : t('aiSettings.helpText.openai')}
            </Text>
          </View>

          {config.apiKey ? (
            <TouchableOpacity
              style={[styles.clearButton, { borderColor: '#FF6B6B' }]}
              onPress={handleClear}
            >
              <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
              <Text style={styles.clearButtonText}>{t('aiSettings.clearApiKey')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>


        {/* Test Connection */}
        <TouchableOpacity
          style={[styles.testButton, { backgroundColor: themeColors.surface }, isTesting && { opacity: 0.7 }]}
          onPress={async () => {
            if (!config.apiKey) {
              Alert.alert(t('common.error'), t('messages.enterApiKey'));
              return;
            }
            setIsTesting(true);
            try {
              // 先保存当前配置
              await aiService.setConfig(config);
              const result = await aiService.testConnection();
              Alert.alert(
                result.success ? t('common.success') : t('common.error'),
                result.message,
                [{ text: t('common.confirm'), style: 'default' }]
              );
            } catch (error) {
              Alert.alert(
                t('common.error'),
                t('messages.testConnectionFailed'),
                [{ text: t('common.confirm'), style: 'default' }]
              );
            } finally {
              setIsTesting(false);
            }
          }}
          disabled={isTesting}
        >
          <Ionicons name={isTesting ? 'hourglass' : 'flash'} size={20} color={themeColors.primary} />
          <Text style={[styles.testButtonText, { color: themeColors.primary }]}>
            {isTesting ? t('common.testing') : t('aiSettings.testConnection')}
          </Text>
        </TouchableOpacity>

        {/* Note */}
        <View style={[styles.noteContainer, { backgroundColor: theme === 'black' ? '#2C2C2C' : '#FFF8E1', borderLeftColor: '#FFC107' }]}>
          <Text style={[styles.noteTitle, { color: themeColors.text }]}>{t('aiSettings.note.title')}</Text>
          <Text style={[styles.noteText, { color: themeColors.textSecondary }]}>
            {t('aiSettings.note.content')}
          </Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subSectionLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  providerDescription: {
    fontSize: 13,
  },
  modelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modelText: {
    fontSize: 14,
  },
  ttsModelContainer: {
    gap: 10,
  },
  ttsModelButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  ttsModelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ttsModelName: {
    fontSize: 15,
    fontWeight: '600',
  },
  ttsModelDescription: {
    fontSize: 13,
  },
  apiKeyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  apiKeyInput: {
    flex: 1,
    fontSize: 15,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  eyeButton: {
    padding: 12,
  },
  helpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  helpText: {
    marginLeft: 6,
    fontSize: 12,
    flex: 1,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  clearButtonText: {
    marginLeft: 8,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  testButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  noteContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  noteText: {
    fontSize: 13,
    lineHeight: 20,
  },
  bottomPadding: {
    height: 40,
  },
});

export default AISettingsScreen;
