import AsyncStorage from '@react-native-async-storage/async-storage';

const MEMO_STORAGE_KEY = '@memos';

export interface Memo {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

class MemoStorage {
  // 获取所有备忘录
  async getMemos(): Promise<Memo[]> {
    try {
      const memosJson = await AsyncStorage.getItem(MEMO_STORAGE_KEY);
      if (memosJson) {
        const memos = JSON.parse(memosJson);
        // 转换 createdAt 为 Date 对象
        return memos.map((memo: any) => ({
          ...memo,
          createdAt: new Date(memo.createdAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting memos:', error);
      return [];
    }
  }

  // 保存备忘录
  async saveMemo(memo: Omit<Memo, 'id' | 'createdAt'>): Promise<Memo> {
    try {
      const newMemo: Memo = {
        ...memo,
        id: Date.now().toString(),
        createdAt: new Date()
      };
      const memos = await this.getMemos();
      memos.push(newMemo);
      await AsyncStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(memos));
      return newMemo;
    } catch (error) {
      console.error('Error saving memo:', error);
      throw error;
    }
  }

  // 删除备忘录
  async deleteMemo(id: string): Promise<void> {
    try {
      const memos = await this.getMemos();
      const filteredMemos = memos.filter(memo => memo.id !== id);
      await AsyncStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(filteredMemos));
    } catch (error) {
      console.error('Error deleting memo:', error);
      throw error;
    }
  }

  // 清空所有备忘录
  async clearMemos(): Promise<void> {
    try {
      await AsyncStorage.removeItem(MEMO_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing memos:', error);
      throw error;
    }
  }
}

export default new MemoStorage();
