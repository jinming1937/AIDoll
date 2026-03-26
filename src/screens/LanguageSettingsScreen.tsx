import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../hooks/useTranslation';
import { i18n, Language } from '../i18n';
import { useThemeStore } from '../store/themeStore';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  AISettings: undefined;
  LanguageSettings: undefined;
};

type LanguageSettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'LanguageSettings'>;

interface LanguageSettingsScreenProps {
  navigation: LanguageSettingsScreenNavigationProp;
}

const LANGUAGES: { key: Language; label: string; icon: string }[] = [
  { key: 'zh', label: '简体中文', icon: '🇨🇳' },
  { key: 'en', label: 'English', icon: '🇺🇸' },
];

const LanguageSettingsScreen: React.FC<LanguageSettingsScreenProps> = ({ navigation }) => {
  const { t, language, setLanguage } = useTranslation();
  const { theme, getThemeColors } = useThemeStore();
  const themeColors = getThemeColors();

  const handleLanguageChange = async (lang: Language) => {
    await setLanguage(lang);
  };

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
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>{t('language.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language Selection */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('language.selectLanguage')}</Text>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.key}
              style={[
                styles.languageCard,
                { backgroundColor: themeColors.background, borderColor: 'transparent' },
                language === lang.key && { borderColor: themeColors.primary, backgroundColor: themeColors.background },
              ]}
              onPress={() => handleLanguageChange(lang.key)}
            >
              <Text style={styles.languageIcon}>{lang.icon}</Text>
              <View style={styles.languageInfo}>
                <Text
                  style={[
                    styles.languageName,
                    { color: themeColors.text },
                    language === lang.key && { color: themeColors.primary },
                  ]}
                >
                  {lang.label}
                </Text>
              </View>
              {language === lang.key && (
                <Ionicons name="checkmark-circle" size={24} color={themeColors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Current Language Info */}
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle" size={20} color={themeColors.textSecondary} />
          <Text style={[styles.infoText, { color: themeColors.textSecondary }]}>
            {t('language.title')}: {LANGUAGES.find(l => l.key === language)?.label}
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
  placeholder: {
    width: 40,
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
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 2,
  },
  languageIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
  },
  bottomPadding: {
    height: 40,
  },
});

export default LanguageSettingsScreen;
