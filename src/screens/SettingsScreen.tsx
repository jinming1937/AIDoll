import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDollStore, getPersonalitiesByGender, getDefaultPersonality, femaleDefaultConfig } from '../store/dollStore';
import { useThemeStore, THEME_OPTIONS } from '../store/themeStore';
import { useAudioStore } from '../store/audioStore';
import { DollConfig, Gender } from '../types';
import { useTranslation } from '../hooks/useTranslation';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  AISettings: undefined;
  LanguageSettings: undefined;
};

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Settings'>;

interface SettingsScreenProps {
  navigation: SettingsScreenNavigationProp;
}

// 性别选项
const getGenderOptions = (t: (key: string) => string): { key: Gender; label: string; icon: string }[] => [
  { key: 'female', label: t('settings.female'), icon: 'female' },
  { key: 'male', label: t('settings.male'), icon: 'male' },
];

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { config, setConfig, resetConfig, setImageUri } = useDollStore();
  const { theme, setTheme, getThemeColors } = useThemeStore();
  const { volume, setVolume, isMuted } = useAudioStore();
  const { t } = useTranslation();
  const [localConfig, setLocalConfig] = useState<DollConfig>(config);

  // 获取当前主题颜色
  const themeColors = getThemeColors();

  // 根据当前性别获取性格选项
  const personalities = getPersonalitiesByGender(localConfig.gender);

  const handleSave = () => {
    setConfig(localConfig);
    Alert.alert(t('messages.saveSuccess'), t('messages.configUpdated'), [
      { text: t('common.confirm'), onPress: () => navigation.goBack() },
    ]);
  };

  const handleReset = () => {
    Alert.alert(t('common.confirm'), t('messages.resetConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        onPress: () => {
          resetConfig();
          setLocalConfig({
            name: femaleDefaultConfig.name,
            gender: femaleDefaultConfig.gender,
            hairColor: femaleDefaultConfig.hairColor,
            skinColor: femaleDefaultConfig.skinColor,
            eyeColor: femaleDefaultConfig.eyeColor,
            outfitColor: femaleDefaultConfig.outfitColor,
            personality: femaleDefaultConfig.personality,
            imageUri: null,
          });
        },
      },
    ]);
  };

  const handleGenderChange = (gender: Gender) => {
    const newPersonality = getDefaultPersonality(gender);
    setLocalConfig({
      ...localConfig,
      gender,
      personality: newPersonality,
    });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('settings.permissionRequired'), t('settings.galleryPermission'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setLocalConfig({ ...localConfig, imageUri: uri });
      setImageUri(uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('settings.permissionRequired'), t('settings.cameraPermission'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setLocalConfig({ ...localConfig, imageUri: uri });
      setImageUri(uri);
    }
  };

  const removeImage = () => {
    Alert.alert(t('settings.removeImage'), t('settings.removeImageConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.confirm'),
        onPress: () => {
          setLocalConfig({ ...localConfig, imageUri: null });
          setImageUri(null);
        },
      },
    ]);
  };

  const handleClearAllData = () => {
    Alert.alert(
      t('common.confirm'),
      t('messages.clearAllDataConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              resetConfig();
              setLocalConfig(femaleDefaultConfig);
              Alert.alert(t('common.success'), t('messages.allDataCleared'), [
                { text: t('common.confirm'), onPress: () => navigation.goBack() },
              ]);
            } catch {
              Alert.alert(t('common.error'), t('messages.clearDataError'));
            }
          },
        },
      ]
    );
  };

  const showImageOptions = () => {
    Alert.alert(
      t('settings.selectImageSource'),
      t('settings.imageSourceHint'),
      [
        { text: t('settings.fromGallery'), onPress: pickImage },
        { text: t('settings.takePhoto'), onPress: takePhoto },
        localConfig.imageUri ? { text: t('settings.removeImage'), onPress: removeImage, style: 'destructive' } : null,
        { text: t('common.cancel'), style: 'cancel' },
      ].filter(Boolean) as any
    );
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
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>{t('settings.title')}</Text>
        <TouchableOpacity style={[styles.saveButton, { backgroundColor: themeColors.primary }]} onPress={handleSave}>
          <Text style={styles.saveButtonText}>{t('common.save')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Upload Section */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('settings.imageUpload')}</Text>
          <TouchableOpacity
            style={[styles.imageUploadContainer, { borderColor: themeColors.primary }]}
            onPress={showImageOptions}
          >
            {localConfig.imageUri ? (
              <Image
                source={{ uri: localConfig.imageUri }}
                style={styles.uploadedImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.uploadPlaceholder, { backgroundColor: themeColors.background }]}>
                <Ionicons name="camera" size={40} color={themeColors.primary} />
                <Text style={[styles.uploadPlaceholderText, { color: themeColors.primary }]}>{t('settings.uploadHint')}</Text>
              </View>
            )}
            <View style={styles.editOverlay}>
              <Ionicons name="pencil" size={20} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Name Section */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('settings.name')}</Text>
          <TextInput
            style={[
              styles.nameInput, 
              { 
                backgroundColor: themeColors.background, 
                borderColor: themeColors.border,
                color: themeColors.text 
              }
            ]}
            value={localConfig.name}
            onChangeText={(text) => setLocalConfig({ ...localConfig, name: text })}
            placeholder={t('settings.namePlaceholder')}
            placeholderTextColor={themeColors.textSecondary}
            maxLength={10}
          />
        </View>

        {/* Gender Section */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('settings.gender')}</Text>
          <View style={styles.genderGrid}>
            {getGenderOptions(t).map((gender) => (
              <TouchableOpacity
                key={gender.key}
                style={[
                  styles.genderButton,
                  localConfig.gender === gender.key && { backgroundColor: themeColors.primary, borderColor: themeColors.primaryDark },
                  { backgroundColor: themeColors.background }
                ]}
                onPress={() => handleGenderChange(gender.key)}
              >
                <Ionicons
                  name={gender.icon as any}
                  size={28}
                  color={themeColors.primary}
                />
                <Text
                  style={[
                    styles.genderText,
                    { color: themeColors.primary }
                  ]}
                >
                  {gender.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Personality Section */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('settings.personality')}</Text>
          <View style={styles.personalityGrid}>
            {personalities.map((p) => (
              <TouchableOpacity
                key={p.key}
                style={[
                  styles.personalityButton,
                  localConfig.personality === p.key && { backgroundColor: themeColors.primary, borderColor: themeColors.primaryDark },
                  { backgroundColor: themeColors.background }
                ]}
                onPress={() =>
                  setLocalConfig({ ...localConfig, personality: p.key })
                }
              >
                <Ionicons
                  name={p.icon as any}
                  size={24}
                  color={themeColors.primary}
                />
                <Text
                  style={[
                    styles.personalityText,
                    { color: themeColors.primary }
                  ]}
                >
                  {t(`settings.personalities.${p.key}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Audio Settings */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('settings.audio')}</Text>
          <View style={styles.audioControl}>
            <View style={styles.audioControlRow}>
              <Ionicons 
                name={isMuted ? "volume-mute" : "volume-medium"} 
                size={24} 
                color={themeColors.primary} 
              />
              <Text style={[styles.audioLabel, { color: themeColors.text }]}>
                {t('settings.volume')}
              </Text>
              <Text style={[styles.volumeValue, { color: themeColors.primary }]}>
                {Math.round(volume * 100)}%
              </Text>
            </View>
            <Slider
              style={styles.volumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={volume}
              onValueChange={setVolume}
              minimumTrackTintColor={themeColors.primary}
              maximumTrackTintColor={themeColors.border}
              thumbTintColor={themeColors.primary}
            />
          </View>
        </View>

        {/* Language Settings Button */}
        <TouchableOpacity
          style={[styles.languageSettingsButton, { backgroundColor: themeColors.surface }]}
          onPress={() => navigation.navigate('LanguageSettings')}
        >
          <Ionicons name="language" size={20} color={themeColors.primary} />
          <Text style={[styles.languageSettingsButtonText, { color: themeColors.text }]}>{t('settings.language')}</Text>
          <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} style={styles.languageSettingsArrow} />
        </TouchableOpacity>

        {/* AI Settings Button */}
        <TouchableOpacity
          style={[styles.aiSettingsButton, { backgroundColor: themeColors.surface }]}
          onPress={() => navigation.navigate('AISettings')}
        >
          <Ionicons name="sparkles" size={20} color={themeColors.primary} />
          <Text style={[styles.aiSettingsButtonText, { color: themeColors.text }]}>{t('settings.aiSettings')}</Text>
          <Ionicons name="chevron-forward" size={20} color={themeColors.textSecondary} style={styles.aiSettingsArrow} />
        </TouchableOpacity>

        {/* Theme Settings */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{t('settings.theme')}</Text>
          <View style={styles.themeGrid}>
            {THEME_OPTIONS.map((themeOption) => (
              <TouchableOpacity
                key={themeOption.key}
                style={[
                  styles.themeButton,
                  theme === themeOption.key && styles.themeButtonSelected,
                  { borderColor: theme === themeOption.key ? themeColors.primary : 'transparent' }
                ]}
                onPress={() => setTheme(themeOption.key)}
              >
                <View style={[styles.themeColorPreview, { backgroundColor: themeOption.color }]} />
                <Text style={[
                  styles.themeLabel,
                  { color: theme === themeOption.key ? themeColors.primary : themeColors.text }
                ]}>
                  {t(`themes.${themeOption.key}`)}
                </Text>
                {theme === themeOption.key && (
                  <Ionicons name="checkmark-circle" size={20} color={themeColors.primary} style={styles.themeCheckmark} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reset Button */}
        <TouchableOpacity style={[styles.resetButton, { backgroundColor: themeColors.surface, borderColor: '#FF6B6B' }]} onPress={handleReset}>
          <Ionicons name="refresh" size={20} color="#FF6B6B" />
          <Text style={[styles.resetButtonText, { color: '#FF6B6B' }]}>{t('settings.reset')}</Text>
        </TouchableOpacity>

        {/* Clear All Data Button */}
        <TouchableOpacity style={[styles.clearAllDataButton, { backgroundColor: themeColors.surface, borderColor: '#FF3B30' }]} onPress={handleClearAllData}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          <Text style={[styles.clearAllDataButtonText, { color: '#FF3B30' }]}>{t('settings.clearAllData')}</Text>
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE4EC',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF69B4',
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
    backgroundColor: 'white',
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
    color: '#333',
    marginBottom: 12,
  },
  imageUploadContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FF69B4',
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  uploadPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadPlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#FF69B4',
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameInput: {
    fontSize: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  genderGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#FFF0F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
  },
  genderButtonSelected: {
    backgroundColor: '#FF69B4',
    borderColor: '#FF1493',
  },
  genderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF69B4',
  },
  genderTextSelected: {
    color: 'white',
  },
  personalityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  personalityButton: {
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFF0F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  personalityButtonSelected: {
    backgroundColor: '#FF69B4',
    borderColor: '#FF1493',
  },
  personalityText: {
    marginTop: 4,
    fontSize: 12,
    color: '#FF69B4',
    fontWeight: '500',
  },
  personalityTextSelected: {
    color: 'white',
  },
  colorSection: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorButtonSelected: {
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  previewSection: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  previewImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  previewDoll: {
    alignItems: 'center',
  },
  previewHead: {
    width: 80,
    height: 80,
    borderRadius: 40,
    position: 'relative',
  },
  previewHair: {
    position: 'absolute',
    top: -10,
    left: 10,
    right: 10,
    height: 30,
    borderRadius: 15,
  },
  previewEye: {
    position: 'absolute',
    top: 30,
    left: 15,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  previewBody: {
    width: 60,
    height: 70,
    borderRadius: 10,
    marginTop: -5,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  resetButtonText: {
    marginLeft: 8,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  clearAllDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 14,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  clearAllDataButtonText: {
    marginLeft: 8,
    color: '#FF3B30',
    fontWeight: '600',
  },
  aiSettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  aiSettingsButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  aiSettingsArrow: {
    marginLeft: 'auto',
  },
  languageSettingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  languageSettingsButtonText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  languageSettingsArrow: {
    marginLeft: 'auto',
  },
  bottomPadding: {
    height: 40,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeButton: {
    flex: 1,
    minWidth: 70,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  themeButtonSelected: {
    backgroundColor: '#FFF0F5',
  },
  themeColorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  themeLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  themeCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  audioControl: {
    marginTop: 8,
  },
  audioControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  audioLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  volumeValue: {
    fontSize: 14,
    color: '#FF69B4',
    fontWeight: '600',
  },
  volumeSlider: {
    width: '100%',
    height: 40,
  },
});

export default SettingsScreen;
