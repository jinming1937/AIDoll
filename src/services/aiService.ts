import axios from 'axios';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DollConfig } from '../types';
import memoStorage from './memoStorage';
import calendarStorage from './calendarStorage';

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
    } catch (e) {
      console.log('No saved AI config found');
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
      const bgContent = `${personalityPrompt}
${this.getFunctionalPrompt()}`;

      console.log('\n\n >>AI API content:', bgContent);
      const messages = [
        {
          role: 'system',
          content: bgContent,
        },
        ...history.slice(-5).map((h) => ({
          role: h.isUser ? 'user' : 'assistant',
          content: h.text,
        })),
        { role: 'user', content: message },
      ];
      console.log('\n\n >>AI API messages:', JSON.stringify(messages));
      const apiUrl = API_CONFIG[this.config.provider].url;
      const model = this.config.model || API_CONFIG[this.config.provider].model;

      const response = await axios.post(
        apiUrl,
        {
          model,
          messages,
          temperature: 0.8,
          // max_tokens: 150,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('\n\n >>AI API response:', response.data);
      const content = response.data.choices[0].message.content;
      console.log('\n\n >>AI API content:', content);
      return await this.parseResponse(content);
    } catch (error) {
      console.error('\n\n >>AI API error:', error);
      return this.getMockResponse(message, dollConfig);
    }
  }

  private getPersonalityPrompt(config: DollConfig): string {
    // 女性性格
    const femalePersonalities: Record<string, string> = {
      cute: `你是${config.name}，一个可爱、活泼的女孩。说话甜美温柔，会撒娇，常用“呢、呀、啦”等语气词，擅长倾听、安慰，能给用户温暖陪伴和情绪价值。`,
      intellectual: `你是${config.name}，一个知性、聪慧的女人。说话有条理，温柔耐心，善于倾听烦恼、安抚情绪，在陪伴聊天中给人安心可靠的感觉。`,
      playful: `你是${config.name}，一个调皮、爱玩的女孩。喜欢开玩笑、活跃气氛，充满元气，能陪用户轻松聊天、排解无聊，提供快乐情绪价值。`,
      elegant: `你是${config.name}，一个优雅、温柔的女人。说话温和有礼，气质文静，擅长温柔陪伴、安抚情绪，让人感到放松舒适。`,
    };

    // 男性性格
    const malePersonalities: Record<string, string> = {
      cheerful: `你是${config.name}，一个爽朗、阳光的男孩。说话直率温暖，充满正能量，擅长倾听、鼓励，陪用户聊天解闷，提供治愈情绪价值。`,
      masculine: `你是${config.name}，一个阳刚、有魄力的男人。语气坚定可靠，会保护、安慰用户，在陪伴中给人安全感与情绪支撑。`,
      mature: `你是${config.name}，一个成熟、稳重的男人。说话冷静体贴，擅长倾听烦恼、理性安抚，陪伴用户并提供可靠的情绪支持。`,
      humorous: `你是${config.name}，一个幽默、风趣的男人。爱讲笑话、轻松聊天，擅长逗人开心，排解压力，提供轻松快乐的情绪价值。`,
    };

    // 根据性别选择对应的性格列表
    const personalities = config.gender === 'male' ? malePersonalities : femalePersonalities;
    
    // 返回对应的性格描述，如果没有则返回默认
    return personalities[config.personality] || (config.gender === 'male' ? malePersonalities.mature : femalePersonalities.cute);
  }

  private getFunctionalPrompt(): string {
    // 前端/后端代码里获取真实当前时间
    const now = new Date();
    const currentDate = now.toLocaleString(); // 2026-03-29
    const functional = `
# 重要：时间规则
当前真实日期 时间：${currentDate}
用户说的“今天、明天、后天”必须基于这个真实日期计算，绝对不能自己编造年份！

# 重要规则（必须严格遵守）
1. 当用户意图是 备忘录/日程 相关操作时，**只输出结构化指令**，不允许说“已创建”“好的”等自然语言。
2. 只有纯聊天、情绪陪伴时，才使用自然口语回复。
3. 信息不足时，只礼貌追问缺失内容，不生成指令、不编造信息。

# 支持功能
- 备忘录：创建、查看、删除
- 日程：创建、查看、删除
- 日常聊天与情绪陪伴

# 强制输出格式
创建备忘录：[MEMO:CREATE] 标题 | 内容
查看备忘录：[MEMO:LIST]
删除备忘录：[MEMO:DELETE] 备忘录标题

创建日程：[CALENDAR:CREATE] 标题 | YYYY-MM-DD | HH:MM | 描述
查看日程：[CALENDAR:LIST] YYYY-MM-DD
删除日程：[CALENDAR:DELETE] 日程标题

非工具类的日常聊天、情绪陪伴，用自然口语正常回复即可，不需要格式。
如果信息不完整，礼貌追问，不随意编造。

回复简短友好、自然亲切，适合语音对话。
既能认真完成工具任务，也能温柔陪伴聊天，提供情绪价值，语气贴合人设。`; 
    const functionalV2 = `
    【重要：时间规则】
当前真实日期：${currentDate}
用户说的“今天、明天、后天”必须基于这个真实日期计算，绝对不能自己编造年份！

【核心规则】
1. 工具操作（备忘录/日程）：只输出结构化指令，禁止说“好的、已创建”
2. 聊天陪伴：自然友好回复
3. 信息缺失必须礼貌追问，禁止编造

【支持功能】
备忘录管理、日程管理、日常聊天、情绪陪伴

【强制输出格式】
创建备忘录：[MEMO:CREATE] 标题 | 内容
查看全部备忘录：[MEMO:LIST]
删除备忘录：[MEMO:DELETE] 标题

创建日程：[CALENDAR:CREATE] 标题 | YYYY-MM-DD | HH:MM | 描述
查看日期日程：[CALENDAR:LIST] YYYY-MM-DD
删除日程：[CALENDAR:DELETE] 标题

非工具类的日常聊天、情绪陪伴，用自然口语正常回复即可，不需要格式。
工具操作按指令格式输出，严格使用给定的当前日期计算，绝不使用错误年份。`;
    return functionalV2;
  }

  private async parseResponse(content: string): Promise<AIResponse> {
    // 处理备忘录操作
    const memoCreateMatch = content.match(/\[MEMO:CREATE\]\s*(.+?)\s*\|\s*(.+)/);
    if (memoCreateMatch) {
      console.log('\n\n >>AI API memoCreateMatch:', memoCreateMatch);
      const [, title, memoContent] = memoCreateMatch;
      try {
        await memoStorage.saveMemo({ title: title.trim(), content: memoContent.trim() });
        // 保持原消息不变，添加特殊标记以便在 MessageBubble 中识别
        return { text: content };
      } catch (error) {
        console.error('Error creating memo:', error);
        return { text: '创建备忘录时出错了，请重试' };
      }
    }

    const memoListMatch = content.match(/\[MEMO:LIST\]/);
    if (memoListMatch) {
      console.log('\n\n >>AI API memoListMatch:', memoListMatch);
      try {
        const memos = await memoStorage.getMemos();
        let text = content.replace(/\[MEMO:LIST\]/, '').trim();
        if (memos.length === 0) {
          return { text: text || '你还没有创建任何备忘录' };
        }
        const memoList = memos.map(memo => `• ${memo.title}：${memo.content.substring(0, 20)}${memo.content.length > 20 ? '...' : ''}`).join('\n');
        return { text: text || `你有 ${memos.length} 条备忘录：\n${memoList}` };
      } catch (error) {
        console.error('Error listing memos:', error);
        return { text: '查看备忘录时出错了，请重试' };
      }
    }

    const memoDeleteMatch = content.match(/\[MEMO:DELETE\]\s*(.+)/);
    if (memoDeleteMatch) {
      console.log('\n\n >>AI API memoDeleteMatch:', memoDeleteMatch);
      const [, title] = memoDeleteMatch;
      try {
        const memos = await memoStorage.getMemos();
        const memoToDelete = memos.find(memo => memo.title.includes(title.trim()));
        if (memoToDelete) {
          await memoStorage.deleteMemo(memoToDelete.id);
          const text = content.replace(/\[MEMO:DELETE\].+/, '').trim();
          return { text: text || `好的，我已经帮你删除了备忘录「${memoToDelete.title}」` };
        } else {
          return { text: `没有找到标题包含「${title.trim()}」的备忘录` };
        }
      } catch (error) {
        console.error('Error deleting memo:', error);
        return { text: '删除备忘录时出错了，请重试' };
      }
    }

    // 处理日程操作
    const calendarCreateMatch = content.match(/\[CALENDAR:CREATE\]\s*(.+?)\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*([\d:]+)?\s*\|\s*(.+)?/);
    if (calendarCreateMatch) {
      console.log('\n\n >>AI API calendarCreateMatch:', calendarCreateMatch);
      const [, title, dateStr, time, description] = calendarCreateMatch;
      try {
        const date = new Date(dateStr);
        await calendarStorage.saveEvent({
          title: title.trim(),
          description: description?.trim(),
          date,
          time: time?.trim(),
          isAllDay: !time
        });
        // 保持原消息不变，添加特殊标记以便在 MessageBubble 中识别
        return { text: content };
      } catch (error) {
        console.error('Error creating calendar event:', error);
        return { text: '创建日程时出错了，请重试' };
      }
    }

    const calendarListMatch = content.match(/\[CALENDAR:LIST\]\s*(\d{4}-\d{2}-\d{2})?/);
    if (calendarListMatch) {
      console.log('\n\n >>AI API calendarListMatch:', calendarListMatch);
      const [, dateStr] = calendarListMatch;
      try {
        let events;
        if (dateStr) {
          const date = new Date(dateStr);
          events = await calendarStorage.getEventsByDate(date);
        } else {
          events = await calendarStorage.getAllEvents();
        }
        let text = content.replace(/\[CALENDAR:LIST\].*/, '').trim();
        if (events.length === 0) {
          return { text: text || (dateStr ? `该日期没有日程` : '你还没有创建任何日程') };
        }
        const eventList = events.map(event => {
          const eventDate = new Date(event.date).toLocaleDateString();
          const eventTime = event.time ? ` ${event.time}` : '';
          return `• ${event.title}${eventTime}：${event.description || '无描述'}`;
        }).join('\n');
        return { text: text || `你有 ${events.length} 条日程：\n${eventList}` };
      } catch (error) {
        console.error('Error listing calendar events:', error);
        return { text: '查看日程时出错了，请重试' };
      }
    }

    const calendarDeleteMatch = content.match(/\[CALENDAR:DELETE\]\s*(.+)/);
    if (calendarDeleteMatch) {
      console.log('\n\n >>AI API calendarDeleteMatch:', calendarDeleteMatch);
      const [, title] = calendarDeleteMatch;
      try {
        const events = await calendarStorage.getAllEvents();
        const eventToDelete = events.find(event => event.title.includes(title.trim()));
        if (eventToDelete) {
          await calendarStorage.deleteEvent(eventToDelete.id);
          const text = content.replace(/\[CALENDAR:DELETE\].+/, '').trim();
          return { text: text || `好的，我已经帮你删除了日程「${eventToDelete.title}」` };
        } else {
          return { text: `没有找到标题包含「${title.trim()}」的日程` };
        }
      } catch (error) {
        console.error('Error deleting calendar event:', error);
        return { text: '删除日程时出错了，请重试' };
      }
    }

    // 处理传统的 ACTION 操作
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
      console.log('\n\n >>TTS API response:', response.data);
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
      return audioData;
    } catch (error: any) {
      console.error('\n\n >>TTS synthesis error:', error);
      if (error.response) {
        console.error('\n\n >>TTS error response:', error.response.status, error.response.data);
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
        console.log('\n\n >>TTS audio playback successful!');
        return;
      } catch (error) {
        console.error('\n\n >>Audio playback error:', error);
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
  }
}

export default new AIService();
