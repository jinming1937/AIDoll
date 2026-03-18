import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import { useDollStore, getPersonalitiesByGender, getDefaultPersonality } from '../store/dollStore';
import { useThemeStore, THEME_OPTIONS } from '../store/themeStore';
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
const GENDER_OPTIONS: { key: Gender; label: string; icon: string }[] = [
  { key: 'female', label: '女', icon: 'female' },
  { key: 'male', label: '男', icon: 'male' },
];

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { config, setConfig, resetConfig, setImageUri } = useDollStore();
  const { theme, setTheme, getThemeColors } = useThemeStore();
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
            name: 'Luna',
            gender: 'female',
            hairColor: '#FFD700',
            skinColor: '#FFE4D6',
            eyeColor: '#4A90D9',
            outfitColor: '#FF69B4',
            personality: 'cute',
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
      Alert.alert('权限 needed', '需要访问相册权限来选择图片');
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
      Alert.alert('权限 needed', '需要相机权限来拍照');
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
    Alert.alert('移除图片', '确定要移除自定义图片吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '确定',
        onPress: () => {
          setLocalConfig({ ...localConfig, imageUri: null });
          setImageUri(null);
        },
      },
    ]);
  };

  const showImageOptions = () => {
    Alert.alert(
      '选择人偶图片',
      '请选择图片来源',
      [
        { text: '从相册选择', onPress: pickImage },
        { text: '拍照', onPress: takePhoto },
        localConfig.imageUri ? { text: '移除图片', onPress: removeImage, style: 'destructive' } : null,
        { text: '取消', style: 'cancel' },
      ].filter(Boolean) as any
    );
  };

  const ColorPicker = ({
    label,
    colors,
    selected,
    onSelect,
  }: {
    label: string;
    colors: string[];
    selected: string;
    onSelect: (color: string) => void;
  }) => (
    <View style={styles.colorSection}>
      <Text style={[styles.sectionLabel, { color: themeColors.textSecondary }]}>{label}</Text>
      <View style={styles.colorGrid}>
        {colors.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorButton,
              { backgroundColor: color },
              selected === color && { borderColor: themeColors.primary },
            ]}
            onPress={() => onSelect(color)}
          >
            {selected === color && (
              <Ionicons name="checkmark" size={20} color="white" />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

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
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>人物图片</Text>
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
                <Text style={[styles.uploadPlaceholderText, { color: themeColors.primary }]}>点击上传人偶图片</Text>
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
            style={[styles.nameInput, { 
              backgroundColor: themeColors.background, 
              borderColor: themeColors.border,
              color: themeColors.text 
            }]}
            value={localConfig.name}
            onChangeText={(text) => setLocalConfig({ ...localConfig, name: text })}
            placeholder={t('settings.namePlaceholder')}
            placeholderTextColor={themeColors.textSecondary}
            maxLength={10}
          />
        </View>

        {/* Gender Section */}
        <View style={[styles.section, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>性别</Text>
          <View style={styles.genderGrid}>
            {GENDER_OPTIONS.map((gender) => (
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
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>性格</Text>
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
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
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
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>主题设置</Text>
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
                  {themeOption.label}
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
});

export default SettingsScreen;
