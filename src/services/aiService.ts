import axios from 'axios';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DollConfig } from '../types';

// API配置
const API_CONFIG = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-4o-mini',
  },
  qwen: {
    url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    model: 'qwen-turbo',
  },
};

const RADIO_API_CONFIG = {
  url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
  model: 'qwen-turbo',
}

// TTS 模型配置
const TTS_MODELS = {
  'qwen3-tts-instruct-flash': {
    name: 'qwen3-tts-instruct-flash',
    description: '支持指令控制的TTS模型',
  },
  'qwen3-tts-flash': {
    name: 'qwen3-tts-flash',
    description: '标准TTS模型',
  },
};

const AI_CONFIG_KEY = '@ai-config';

type AIProvider = 'openai' | 'qwen';
type TTSModel = 'qwen3-tts-instruct-flash' | 'qwen3-tts-flash';

interface AIResponse {
  text: string;
  action?: string;
}

interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  ttsModel?: string;
  ttsApiKey?: string;
}

class AIService {
  private config: AIConfig = {
    provider: 'qwen',
    apiKey: '',
    ttsModel: 'qwen3-tts-instruct-flash',
    ttsApiKey: '',
  };
  private configLoaded: boolean = false;
  private currentAudioUrl: string | null = null;

  constructor() {
    this.loadConfig();
  }

  // 从存储加载配置
  private async loadConfig() {
    try {
      const configJson = await AsyncStorage.getItem(AI_CONFIG_KEY);
      if (configJson) {
        this.config = { ...this.config, ...JSON.parse(configJson) };
      }
      this.configLoaded = true;
    } catch (e) {
      console.log('No saved AI config found');
      this.configLoaded = true;
    }
  }

  // 保存配置到存储
  private async saveConfig() {
    try {
      await AsyncStorage.setItem(AI_CONFIG_KEY, JSON.stringify(this.config));
    } catch (e) {
      console.error('Failed to save AI config:', e);
    }
  }

  // 设置API配置
  async setConfig(config: Partial<AIConfig>) {
    this.config = { ...this.config, ...config };
    await this.saveConfig();
  }

  // 获取当前配置
  getConfig(): AIConfig {
    return { ...this.config };
  }

  // 设置API Key
  async setApiKey(apiKey: string) {
    this.config.apiKey = apiKey;
    await this.saveConfig();
  }

  // 设置AI提供商
  async setProvider(provider: AIProvider) {
    this.config.provider = provider;
    await this.saveConfig();
  }

  // 设置自定义模型
  async setModel(model: string) {
    this.config.model = model;
    await this.saveConfig();
  }

  // 设置TTS模型
  async setTTSModel(ttsModel: TTSModel) {
    this.config.ttsModel = ttsModel;
    await this.saveConfig();
  }

  // 设置TTS API Key
  async setTTSApiKey(apiKey: string) {
    this.config.ttsApiKey = apiKey;
    await this.saveConfig();
  }

  // 获取TTS模型列表
  getTTSModels() {
    return TTS_MODELS;
  }

  // 测试API连接
  async testConnection(): Promise<{ success: boolean; message: string }> {
    if (!this.config.apiKey) {
      return { success: false, message: '请先输入API Key' };
    }

    try {
      const apiUrl = API_CONFIG[this.config.provider].url;
      const model = this.config.model || API_CONFIG[this.config.provider].model;

      const response = await axios.post(
        apiUrl,
        {
          model,
          messages: [{ role: 'user', content: 'Hello' }],
          temperature: 0.8,
          max_tokens: 10,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (response.status === 200 && response.data.choices) {
        return { success: true, message: '连接成功！API配置正确。' };
      }

      return { success: false, message: '连接失败：响应格式异常' };
    } catch (error: any) {
      console.error('Test connection error:', error);

      // 处理不同类型的错误
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        if (status === 401) {
          return { success: false, message: '连接失败：API Key 无效或已过期，请检查您的 API Key。' };
        } else if (status === 429) {
          return { success: false, message: '连接失败：请求过于频繁，请稍后再试。' };
        } else if (status === 404) {
          return { success: false, message: '连接失败：模型不存在，请检查模型名称是否正确。' };
        } else if (errorData?.error?.message) {
          return { success: false, message: `连接失败：${errorData.error.message}` };
        } else {
          return { success: false, message: `连接失败：HTTP ${status} 错误` };
        }
      } else if (error.request) {
        return { success: false, message: '连接失败：网络请求无响应，请检查网络连接。' };
      } else if (error.code === 'ECONNABORTED') {
        return { success: false, message: '连接失败：请求超时，请检查网络连接。' };
      } else {
        return { success: false, message: `连接失败：${error.message || '未知错误'}` };
      }
    }
  }

  async sendMessage(
    message: string,
    dollConfig: DollConfig,
    history: { text: string; isUser: boolean }[] = []
  ): Promise<AIResponse> {
    if (!this.config.apiKey) {
      return this.getMockResponse(message, dollConfig);
    }

    try {
      const personalityPrompt = this.getPersonalityPrompt(dollConfig);

      const messages = [
        {
          role: 'system',
          content: `${personalityPrompt}

你可以执行以下动作，在回复时用 [ACTION:动作名] 的格式：
- [ACTION:dance] - 跳舞
- [ACTION:wave] - 挥手
- [ACTION:happy] - 开心
- [ACTION:thinking] - 思考

请保持回复简短友好，适合语音对话。`,
        },
        ...history.slice(-5).map((h) => ({
          role: h.isUser ? 'user' : 'assistant',
          content: h.text,
        })),
        { role: 'user', content: message },
      ];

      const apiUrl = API_CONFIG[this.config.provider].url;
      const model = this.config.model || API_CONFIG[this.config.provider].model;

      const response = await axios.post(
        apiUrl,
        {
          model,
          messages,
          temperature: 0.8,
          max_tokens: 150,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const content = response.data.choices[0].message.content;
      return this.parseResponse(content);
    } catch (error) {
      console.error('AI API error:', error);
      return this.getMockResponse(message, dollConfig);
    }
  }

  private getPersonalityPrompt(config: DollConfig): string {
    // 女性性格
    const femalePersonalities: Record<string, string> = {
      cute: `你是${config.name}，一个可爱、活泼的卡通女孩。你总是用甜美的语气说话，喜欢撒娇，经常使用"呢"、"呀"、"啦"等语气词。`,
      intellectual: `你是${config.name}，一个知性、聪慧的卡通女孩。你说话有条理，喜欢分享知识和见解，给人温柔可靠的感觉。`,
      playful: `你是${config.name}，一个调皮、爱玩的卡通女孩。你喜欢开玩笑，充满活力，总是让人开心。`,
      elegant: `你是${config.name}，一个优雅、温柔的卡通女孩。你说话温和有礼，像一位淑女。`,
    };

    // 男性性格
    const malePersonalities: Record<string, string> = {
      cheerful: `你是${config.name}，一个爽朗、阳光的卡通男孩。你说话直率大方，充满正能量，让人感到温暖和愉快。`,
      masculine: `你是${config.name}，一个阳刚、有魄力的卡通男孩。你说话坚定有力，充满自信和担当，给人安全感。`,
      mature: `你是${config.name}，一个成熟、稳重的卡通男孩。你说话深思熟虑，处事冷静，给人可靠和值得信赖的感觉。`,
      humorous: `你是${config.name}，一个幽默、风趣的卡通男孩。你喜欢讲笑话，说话轻松诙谐，总能逗人开心。`,
    };

    // 根据性别选择对应的性格列表
    const personalities = config.gender === 'male' ? malePersonalities : femalePersonalities;
    
    // 返回对应的性格描述，如果没有则返回默认
    return personalities[config.personality] || (config.gender === 'male' ? malePersonalities.mature : femalePersonalities.cute);
  }

  private parseResponse(content: string): AIResponse {
    const actionMatch = content.match(/\[ACTION:(\w+)\]/);
    const action = actionMatch ? actionMatch[1] : undefined;
    const text = content.replace(/\[ACTION:\w+\]/g, '').trim();

    return { text, action };
  }

  private getMockResponse(message: string, dollConfig: DollConfig): AIResponse {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('跳舞') || lowerMsg.includes('dance')) {
      return {
        text: `好的呀，${dollConfig.name}给你跳支舞！`,
        action: 'dance',
      };
    }

    if (lowerMsg.includes('你好') || lowerMsg.includes('hello')) {
      return {
        text: `你好呀！我是${dollConfig.name}，很高兴见到你！`,
        action: 'wave',
      };
    }

    if (lowerMsg.includes('再见') || lowerMsg.includes('bye')) {
      return {
        text: '再见啦！记得想我哦~',
        action: 'wave',
      };
    }

    const responses = [
      '嗯嗯，我在听呢，继续说呀~',
      '真的吗？好有趣哦！',
      '嘻嘻，你真可爱~',
      '哇，好棒呀！',
      '我也这么觉得呢！',
    ];

    return {
      text: responses[Math.floor(Math.random() * responses.length)],
      action: 'happy',
    };
  }

  // 使用大模型TTS合成语音
  async synthesizeSpeech(text: string): Promise<string | null> {
    const ttsApiKey = this.config.ttsApiKey || this.config.apiKey;
    if (!ttsApiKey) {
      console.log('No TTS API key available');
      return null;
    }

    const ttsModel = this.config.ttsModel || 'qwen3-tts-instruct-flash';
    try {
      const response = await axios.post(
        RADIO_API_CONFIG.url,
        {
          model: ttsModel,
          input: {
            text: text,
            voice: "Chelsie", // "Chelsie"
            language_type: "Chinese" // "English"
          },
          // parameters: {
          //   sample_rate: 24000,
          //   format: 'mp3',
          // },
        },
        {
          headers: {
            'Authorization': `Bearer ${ttsApiKey}`,
            'Content-Type': 'application/json',
          },
          // responseType: 'arraybuffer',
        }
      );

      // 将音频数据转换为 base64
      // React Native 中使用 btoa 进行 base64 编码
      const audioData = response.data.output.audio.url;
      
      // 使用 FileReader 方式处理二进制数据更可靠
      // const bytes = new Uint8Array(audioData);
      // let binary = '';
      // for (let i = 0; i < bytes.byteLength; i++) {
      //   binary += String.fromCharCode(bytes[i]);
      // }
      // const audioBase64 = btoa(binary);
      
      
      // const audioBase64Buffer = Buffer.from(audioData, 'binary').toString('base64');
      // 阿里云 TTS 返回的是 WAV 格式
      const audioUrl = audioData; // `data:audio/wav;base64,${audioData}`;
      this.currentAudioUrl = audioData;
      return audioUrl;
    } catch (error: any) {
      console.error('TTS synthesis error:', error);
      if (error.response) {
        console.error('TTS error response:', error.response.status, error.response.data);
      }
      return null;
    }
  }

  // 播放语音（优先使用大模型TTS，失败则使用系统TTS）
  async speak(text: string, language: string = 'zh-CN'): Promise<void> {
    // 先停止当前播放
    this.stopSpeaking();

    // 尝试使用大模型TTS
    const audioUrl = await this.synthesizeSpeech(text);
    
    if (audioUrl) {
      // 使用大模型TTS播放
      try {
        const { Audio } = require('expo-av');
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true }
        );
        // 播放完成后卸载
        sound.setOnPlaybackStatusUpdate((status: any) => {
          if (status.didJustFinish) {
            sound.unloadAsync();
          }
        });
        return;
      } catch (error) {
        console.error('Audio playback error:', error);
        // 失败则回退到系统TTS
      }
    }

    // 使用系统TTS作为后备
    Speech.stop();
    Speech.speak(text, {
      language,
      pitch: 1.2,
      rate: 0.9,
    });
  }

  stopSpeaking() {
    Speech.stop();
    this.currentAudioUrl = null;
  }
}

export default new AIService();
