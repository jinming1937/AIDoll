import { Audio } from 'expo-av';
import { useAudioStore } from '../store/audioStore';

class AudioService {
  private sound: Audio.Sound | null = null;
  private isPlaying: boolean = false;

  // 初始化音频
  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  // 播放背景音乐
  async playBackgroundMusic() {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
      }

      const { volume, isMuted } = useAudioStore.getState();
      
      if (isMuted || volume === 0) {
        return;
      }

      try {
        const { sound } = await Audio.Sound.createAsync(
          require('../../assets/audio/audio_home_bg.mp3'),
          {
            shouldPlay: true,
            isLooping: true,
            volume: volume,
          }
        );

        this.sound = sound;
        this.isPlaying = true;

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            this.playBackgroundMusic();
          }
        });
      } catch (error) {
        console.warn('Background music file not found, skipping playback:', error);
      }
    } catch (error) {
      console.error('Failed to play background music:', error);
    }
  }

  // 停止背景音乐
  async stopBackgroundMusic() {
    try {
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
        this.sound = null;
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('Failed to stop background music:', error);
    }
  }

  // 暂停背景音乐
  async pauseBackgroundMusic() {
    try {
      if (this.sound && this.isPlaying) {
        await this.sound.pauseAsync();
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('Failed to pause background music:', error);
    }
  }

  // 恢复背景音乐
  async resumeBackgroundMusic() {
    try {
      if (this.sound && !this.isPlaying) {
        const { volume, isMuted } = useAudioStore.getState();
        if (!isMuted && volume > 0) {
          await this.sound.setVolumeAsync(volume);
          await this.sound.playAsync();
          this.isPlaying = true;
        }
      }
    } catch (error) {
      console.error('Failed to resume background music:', error);
    }
  }

  // 更新音量
  async updateVolume() {
    try {
      const { volume, isMuted } = useAudioStore.getState();
      
      if (this.sound) {
        if (isMuted || volume === 0) {
          await this.sound.stopAsync();
          this.isPlaying = false;
        } else {
          await this.sound.setVolumeAsync(volume);
          if (!this.isPlaying) {
            await this.sound.playAsync();
            this.isPlaying = true;
          }
        }
      } else if (!isMuted && volume > 0) {
        await this.playBackgroundMusic();
      }
    } catch (error) {
      console.error('Failed to update volume:', error);
    }
  }

  // 检查播放状态
  getIsPlaying() {
    return this.isPlaying;
  }

  // 清理资源
  async cleanup() {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
        this.isPlaying = false;
      }
    } catch (error) {
      console.error('Failed to cleanup audio:', error);
    }
  }
}

export const audioService = new AudioService();
