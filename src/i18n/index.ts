import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'zh' | 'en';

const LANGUAGE_KEY = '@app-language';

// 翻译内容
export const translations = {
  zh: {
    // 通用
    common: {
      save: '保存',
      cancel: '取消',
      confirm: '确定',
      back: '返回',
      loading: '加载中...',
      error: '错误',
      success: '成功',
      testing: '测试中...',
    },
    // 首页
    home: {
      title: 'AI Doll',
      welcome: '发送消息，开始和{{name}}对话吧~',
      listening: '正在聆听...',
      settings: '设置',
    },
    // 设置页面
    settings: {
      title: '设置',
      name: '名字',
      namePlaceholder: '输入名字',
      personality: '性格',
      appearance: '外观',
      hairColor: '发色',
      skinColor: '肤色',
      eyeColor: '眼睛颜色',
      outfitColor: '服装颜色',
      preview: '预览',
      reset: '恢复默认设置',
      clearAllData: '清除所有数据',
      aiSettings: 'AI模型设置',
      language: '语言设置',
      gender: '性别',
      female: '女',
      male: '男',
      theme: '主题设置',
      imageUpload: '人物图片',
      uploadHint: '点击上传人偶图片',
      removeImage: '移除图片',
      selectImageSource: '选择人偶图片',
      imageSourceHint: '请选择图片来源',
      fromGallery: '从相册选择',
      takePhoto: '拍照',
      permissionRequired: '权限 needed',
      galleryPermission: '需要访问相册权限来选择图片',
      cameraPermission: '需要相机权限来拍照',
      removeImageConfirm: '确定要移除自定义图片吗？',
      audio: '音效设置',
      volume: '音量',
      personalities: {
        cute: '可爱',
        intellectual: '知性',
        playful: '调皮',
        elegant: '优雅',
        cheerful: '爽朗',
        masculine: '阳刚',
        mature: '成熟',
        humorous: '幽默',
      },
    },
    // AI设置页面
    aiSettings: {
      title: 'AI设置',
      selectModel: '选择AI模型',
      selectVersion: '选择模型版本',
      selectChatVersion: '选择聊天版本',
      apiKey: 'API Key',
      apiKeyPlaceholder: '输入{{provider}} API Key',
      testConnection: '测试连接',
      clearApiKey: '清除API Key',
      ttsSettings: '语音模型设置',
      selectTTSModel: '选择语音模型',
      ttsApiKey: '语音模型 API Key（可选，默认使用AI模型Key）',
      ttsApiKeyPlaceholder: '输入语音模型专用API Key（可选）',
      ttsInstructDesc: '支持指令控制的TTS模型，更自然',
      ttsStandardDesc: '标准TTS模型',
      helpText: {
        qwen: '获取通义千问API Key: https://dashscope.aliyun.com/',
        openai: '获取OpenAI API Key: https://platform.openai.com/api-keys',
      },
      providers: {
        qwen: {
          name: '通义千问 (Qwen)',
          description: '阿里云大模型，国内访问稳定',
        },
        openai: {
          name: 'OpenAI',
          description: 'GPT模型，需要国外网络',
        },
      },
      note: {
        title: '💡 使用说明',
        content: '1. 不设置API Key时，应用会使用内置的模拟回复\n2. 设置API Key后，卡通人物会使用AI模型进行智能回复\n3. API Key仅保存在本地，不会上传到任何服务器\n4. 通义千问对中文支持更好，推荐国内用户使用',
      },
    },
    // 语言设置页面
    language: {
      title: '语言设置',
      selectLanguage: '选择语言',
      languages: {
        zh: '简体中文',
        en: 'English',
      },
    },
    // 消息
    messages: {
      saveSuccess: '保存成功',
      saveError: '保存失败',
      configUpdated: '配置已更新！',
      clearConfirm: '确定要清除API Key吗？',
      resetConfirm: '确定要恢复默认设置吗？',
      enterApiKey: '请先输入API Key',
      testConnectionFailed: '连接测试失败',
      clearAllDataConfirm: '确定要清除所有数据吗？此操作不可恢复。',
      allDataCleared: '所有数据已成功清除',
      clearDataError: '清除数据失败，请重试',
    },
    // 聊天输入
    chat: {
      inputPlaceholder: '发送给{{name}}',
      typing: '正在输入...',
    },
    // 语音面板
    voice: {
      listening: '正在聆听...',
      processing: '识别中...',
      holdToSpeak: '按住说话',
      startFailed: '无法启动语音识别',
    },
    // 主题
    themes: {
      pink: '粉色',
      blue: '蓝色',
      black: '黑色',
      white: '白色',
    },
    // 装扮
    outfit: {
      maozi: '帽子',
      toushi: '头饰',
      top: '上衣',
      jewelry: '首饰',
      bottom: '下装',
      shoes: '鞋子',
      none: '无',
    },
    // 日历
    calendar: {
      title: '日历',
      events: '日程',
      noEvents: '暂无日程安排',
      monthNames: [
        '一月', '二月', '三月', '四月', '五月', '六月',
        '七月', '八月', '九月', '十月', '十一月', '十二月'
      ],
      weekDays: ['日', '一', '二', '三', '四', '五', '六']
    },
    // 备忘录
    memo: {
      title: '备忘录',
      enterTitle: '请输入标题',
      titlePlaceholder: '标题',
      contentPlaceholder: '内容',
      deleteConfirm: '确定要删除这个备忘录吗？',
      empty: '暂无备忘录',
      emptyHint: '点击右上角的 + 按钮创建你的第一个备忘录',
      noContent: '无内容',
      yesterday: '昨天'
    },
    // 消息卡片
    messageCard: {
      memo: '备忘录',
      calendar: '日程'
    },
  },
  en: {
    // Common
    common: {
      save: 'Save',
      cancel: 'Cancel',
      confirm: 'OK',
      back: 'Back',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      testing: 'Testing...',
    },
    // Home
    home: {
      title: 'AI Doll',
      welcome: 'Hold the button below to start chatting with {{name}}~',
      listening: 'Listening...',
      settings: 'Settings',
    },
    // Settings
    settings: {
      title: 'Settings',
      name: 'Name',
      namePlaceholder: 'Enter name',
      personality: 'Personality',
      appearance: 'Appearance',
      hairColor: 'Hair Color',
      skinColor: 'Skin Color',
      eyeColor: 'Eye Color',
      outfitColor: 'Outfit Color',
      preview: 'Preview',
      reset: 'Reset to Default',
      clearAllData: 'Clear All Data',
      aiSettings: 'AI Model Settings',
      language: 'Language Settings',
      gender: 'Gender',
      female: 'Female',
      male: 'Male',
      theme: 'Theme Settings',
      imageUpload: 'Character Image',
      uploadHint: 'Tap to upload doll image',
      removeImage: 'Remove Image',
      selectImageSource: 'Select Doll Image',
      imageSourceHint: 'Please select image source',
      fromGallery: 'Choose from Gallery',
      takePhoto: 'Take Photo',
      permissionRequired: 'Permission Required',
      galleryPermission: 'Need gallery permission to select images',
      cameraPermission: 'Need camera permission to take photos',
      removeImageConfirm: 'Are you sure you want to remove the custom image?',
      audio: 'Audio Settings',
      volume: 'Volume',
      personalities: {
        cute: 'Cute',
        intellectual: 'Intellectual',
        playful: 'Playful',
        elegant: 'Elegant',
        cheerful: 'Cheerful',
        masculine: 'Masculine',
        mature: 'Mature',
        humorous: 'Humorous',
      },
    },
    // AI Settings
    aiSettings: {
      title: 'AI Settings',
      selectModel: 'Select AI Model',
      selectVersion: 'Select Model Version',
      selectChatVersion: 'Select Chat Version',
      apiKey: 'API Key',
      apiKeyPlaceholder: 'Enter {{provider}} API Key',
      testConnection: 'Test Connection',
      clearApiKey: 'Clear API Key',
      ttsSettings: 'Voice Model Settings',
      selectTTSModel: 'Select Voice Model',
      ttsApiKey: 'Voice Model API Key (Optional, uses AI model key by default)',
      ttsApiKeyPlaceholder: 'Enter voice model API Key (optional)',
      ttsInstructDesc: 'TTS model with instruction control, more natural',
      ttsStandardDesc: 'Standard TTS model',
      helpText: {
        qwen: 'Get Qwen API Key: https://dashscope.aliyun.com/',
        openai: 'Get OpenAI API Key: https://platform.openai.com/api-keys',
      },
      providers: {
        qwen: {
          name: 'Qwen (Alibaba)',
          description: 'Alibaba Cloud LLM, stable access in China',
        },
        openai: {
          name: 'OpenAI',
          description: 'GPT models, requires international network',
        },
      },
      note: {
        title: '💡 Instructions',
        content: '1. Without API Key, the app uses built-in mock responses\n2. With API Key, the doll uses AI for smart replies\n3. API Key is stored locally only, never uploaded\n4. Qwen has better Chinese support, recommended for Chinese users',
      },
    },
    // Language Settings
    language: {
      title: 'Language Settings',
      selectLanguage: 'Select Language',
      languages: {
        zh: '简体中文',
        en: 'English',
      },
    },
    // Messages
    messages: {
      saveSuccess: 'Save Successful',
      saveError: 'Save Failed',
      configUpdated: 'Configuration updated!',
      clearConfirm: 'Are you sure you want to clear the API Key?',
      resetConfirm: 'Are you sure you want to reset to default settings?',
      enterApiKey: 'Please enter API Key first',
      testConnectionFailed: 'Connection test failed',
      clearAllDataConfirm: 'Are you sure you want to clear all data? This action cannot be undone.',
      allDataCleared: 'All data has been successfully cleared',
      clearDataError: 'Failed to clear data, please try again',
    },
    // Chat Input
    chat: {
      inputPlaceholder: 'Send to {{name}}', 
      typing: 'Typing...',
    },
    // Voice Panel
    voice: {
      listening: 'Listening...',
      processing: 'Processing...',
      holdToSpeak: 'Hold to speak',
      startFailed: 'Failed to start voice recognition',
    },
    // Themes
    themes: {
      pink: 'Pink',
      blue: 'Blue',
      black: 'Black',
      white: 'White',
    },
    // Outfit
    outfit: {
      maozi: 'Hat',
      toushi: 'Hair',
      top: 'Top',
      jewelry: 'Jewelry',
      bottom: 'Bottom',
      shoes: 'Shoes',
      none: 'None',
    },
    // Calendar
    calendar: {
      title: 'Calendar',
      events: 'Events',
      noEvents: 'No events scheduled',
      monthNames: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ],
      weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    },
    // Memo
    memo: {
      title: 'Memo',
      enterTitle: 'Please enter a title',
      titlePlaceholder: 'Title',
      contentPlaceholder: 'Content',
      deleteConfirm: 'Are you sure you want to delete this memo?',
      empty: 'No memos yet',
      emptyHint: 'Tap the + button to create your first memo',
      noContent: 'No content',
      yesterday: 'Yesterday'
    },
    // Message Card
    messageCard: {
      memo: 'Memo',
      calendar: 'Calendar'
    },
  },
};

// 获取嵌套对象的值
function getNestedValue(obj: any, path: string): string {
  const keys = path.split('.');
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return path; // 返回路径作为fallback
    }
  }
  return typeof value === 'string' ? value : path;
}

// 替换模板变量
function replaceVars(text: string, vars?: Record<string, string>): string {
  if (!vars) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => vars[key] || match);
}

class I18nService {
  private currentLanguage: Language = 'zh';
  private listeners: ((lang: Language) => void)[] = [];

  constructor() {
    this.loadLanguage();
  }

  private async loadLanguage() {
    try {
      const savedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLang && (savedLang === 'zh' || savedLang === 'en')) {
        this.currentLanguage = savedLang;
        this.notifyListeners();
      }
    } catch {
      console.log('No saved language found');
    }
  }

  private async saveLanguage() {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, this.currentLanguage);
    } catch (e) {
      console.error('Failed to save language:', e);
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.currentLanguage));
  }

  // 获取当前语言
  getLanguage(): Language {
    return this.currentLanguage;
  }

  // 设置语言
  async setLanguage(lang: Language) {
    this.currentLanguage = lang;
    await this.saveLanguage();
    this.notifyListeners();
  }

  // 切换语言
  async toggleLanguage() {
    const newLang = this.currentLanguage === 'zh' ? 'en' : 'zh';
    await this.setLanguage(newLang);
  }

  // 订阅语言变化
  subscribe(listener: (lang: Language) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // 翻译
  t(key: string, vars?: Record<string, string>): string {
    const translation = translations[this.currentLanguage];
    const text = getNestedValue(translation, key);
    return replaceVars(text, vars);
  }
}

export const i18n = new I18nService();
