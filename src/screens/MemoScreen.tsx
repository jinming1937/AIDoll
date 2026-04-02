import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import { useThemeStore } from '../store/themeStore';
import { useTranslation } from '../hooks/useTranslation';
import memoStorage, { Memo } from '../services/memoStorage';

type MemoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Memo'>;

interface MemoScreenProps {
  navigation: MemoScreenNavigationProp;
}

const MemoScreen: React.FC<MemoScreenProps> = ({ navigation }) => {
  const { getThemeColors } = useThemeStore();
  const { t } = useTranslation();
  const themeColors = getThemeColors();

  // 备忘录列表
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newMemo, setNewMemo] = useState({ title: '', content: '' });
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [editingContent, setEditingContent] = useState('');

  // 加载备忘录数据
  useEffect(() => {
    loadMemos();
  }, []);

  const loadMemos = async () => {
    try {
      const loadedMemos = await memoStorage.getMemos();
      setMemos(loadedMemos);
    } catch (error) {
      console.error('Error loading memos:', error);
    }
  };

  // 引用
  const titleInputRef = useRef<TextInput>(null);
  const contentInputRef = useRef<TextInput>(null);

  // 创建新备忘录
  const handleCreateMemo = async () => {
    if (!newMemo.title.trim()) {
      Alert.alert(t('common.error') || 'Error', t('memo.enterTitle') || 'Please enter a title');
      return;
    }

    try {
      await memoStorage.saveMemo({
        title: newMemo.title.trim(),
        content: newMemo.content.trim(),
      });
      await loadMemos();
      setNewMemo({ title: '', content: '' });
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating memo:', error);
      Alert.alert(t('common.error') || 'Error', '创建备忘录失败，请重试');
    }
  };

  // 编辑备忘录
  const handleEditMemo = (memo: Memo) => {
    setEditingMemo(memo);
    setEditingContent(memo.content);
  };

  // 保存编辑
  const handleSaveEdit = async () => {
    if (editingMemo) {
      try {
        // 先删除旧备忘录
        await memoStorage.deleteMemo(editingMemo.id);
        // 再创建新备忘录
        await memoStorage.saveMemo({
          title: editingMemo.title,
          content: editingContent.trim(),
        });
        await loadMemos();
        setEditingMemo(null);
        setEditingContent('');
      } catch (error) {
        console.error('Error saving memo:', error);
        Alert.alert(t('common.error') || 'Error', '保存备忘录失败，请重试');
      }
    }
  };

  // 删除备忘录
  const handleDeleteMemo = (id: string) => {
    Alert.alert(
      t('common.confirm') || 'Confirm',
      t('memo.deleteConfirm') || 'Are you sure you want to delete this memo?',
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('common.confirm') || 'OK',
          style: 'destructive',
          onPress: async () => {
            try {
              await memoStorage.deleteMemo(id);
              await loadMemos();
            } catch (error) {
              console.error('Error deleting memo:', error);
              Alert.alert(t('common.error') || 'Error', '删除备忘录失败，请重试');
            }
          },
        },
      ]
    );
  };

  // 复制备忘录
  const handleCopyMemo = async (memo: Memo) => {
    try {
      const contentToCopy = `${memo.content}`;
      await Clipboard.setStringAsync(contentToCopy);
      Alert.alert(t('common.success') || 'Success', '已复制到剪贴板');
    } catch (error) {
      console.error('Error copying memo:', error);
      Alert.alert(t('common.error') || 'Error', '复制失败，请重试');
    }
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return t('memo.yesterday') || 'Yesterday';
    } else if (diffDays < 7) {
      const days = [t('calendar.weekDays.0') || 'Sun', t('calendar.weekDays.1') || 'Mon', t('calendar.weekDays.2') || 'Tue', t('calendar.weekDays.3') || 'Wed', t('calendar.weekDays.4') || 'Thu', t('calendar.weekDays.5') || 'Fri', t('calendar.weekDays.6') || 'Sat'];
      return days[date.getDay()];
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar style={themeColors.primary === '#2C3E50' ? 'light' : 'light'} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.primary }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('memo.title') || 'Memo'}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsCreating(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* 创建新备忘录 */}
        {isCreating && (
          <View style={[styles.createMemoContainer, { backgroundColor: themeColors.surface }]}>
            <TextInput
              ref={titleInputRef}
              style={[styles.titleInput, { color: themeColors.text }]}
              placeholder={t('memo.titlePlaceholder') || 'Title'}
              placeholderTextColor={themeColors.textSecondary}
              value={newMemo.title}
              onChangeText={(text) => setNewMemo({ ...newMemo, title: text })}
              autoFocus
            />
            <TextInput
              ref={contentInputRef}
              style={[styles.contentInput, { color: themeColors.text }]}
              placeholder={t('memo.contentPlaceholder') || 'Content'}
              placeholderTextColor={themeColors.textSecondary}
              value={newMemo.content}
              onChangeText={(text) => setNewMemo({ ...newMemo, content: text })}
              multiline
              numberOfLines={4}
            />
            <View style={styles.createButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: themeColors.primary }]}
                onPress={() => {
                  setIsCreating(false);
                  setNewMemo({ title: '', content: '' });
                }}
              >
                <Text style={[styles.cancelButtonText, { color: themeColors.primary }]}>
                  {t('common.cancel') || 'Cancel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: themeColors.primary }]}
                onPress={handleCreateMemo}
              >
                <Text style={styles.saveButtonText}>{t('common.save') || 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 备忘录列表 */}
        <ScrollView style={styles.memoList}>
          {memos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color={themeColors.textSecondary} />
              <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                {t('memo.empty') || 'No memos yet'}
              </Text>
              <Text style={[styles.emptySubtext, { color: themeColors.textSecondary }]}>
                {t('memo.emptyHint') || 'Tap the + button to create your first memo'}
              </Text>
            </View>
          ) : (
            memos.map((memo) => (
              <View
                key={memo.id}
                style={[styles.memoItem, { backgroundColor: themeColors.surface }]}
              >
                {editingMemo?.id === memo.id ? (
                  <>
                    <Text style={[styles.memoTitle, { color: themeColors.text }]}>
                      {memo.title}
                    </Text>
                    <TextInput
                      style={[styles.editContentInput, { color: themeColors.text }]}
                      value={editingContent}
                      onChangeText={setEditingContent}
                      multiline
                      autoFocus
                    />
                    <View style={styles.editButtons}>
                      <TouchableOpacity
                        style={[styles.cancelButton, { borderColor: themeColors.primary }]}
                        onPress={() => {
                          setEditingMemo(null);
                          setEditingContent('');
                        }}
                      >
                        <Text style={[styles.cancelButtonText, { color: themeColors.primary }]}>
                          {t('common.cancel') || 'Cancel'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.saveButton, { backgroundColor: themeColors.primary }]}
                        onPress={handleSaveEdit}
                      >
                        <Text style={styles.saveButtonText}>{t('common.save') || 'Save'}</Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.memoHeader}>
                      <Text style={[styles.memoTitle, { color: themeColors.text }]}>
                        {memo.title}
                      </Text>
                      <Text style={[styles.memoDate, { color: themeColors.textSecondary }]}>
                        {formatDate(memo.createdAt)}
                      </Text>
                    </View>
                    <Text
                      style={[styles.memoContent, { color: themeColors.textSecondary }]}
                      numberOfLines={3}
                    >
                      {memo.content || t('memo.noContent') || 'No content'}
                    </Text>
                    <View style={styles.memoActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleCopyMemo(memo)}
                      >
                        <Ionicons name="copy-outline" size={20} color={themeColors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleEditMemo(memo)}
                      >
                        <Ionicons name="pencil" size={20} color={themeColors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteMemo(memo.id)}
                      >
                        <Ionicons name="trash" size={20} color="#FF6B6B" />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  createMemoContainer: {
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  contentInput: {
    fontSize: 16,
    marginBottom: 20,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  createButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  memoList: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  memoItem: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  memoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  memoDate: {
    fontSize: 12,
    marginLeft: 10,
  },
  memoContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  memoActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 15,
  },
  actionButton: {
    padding: 5,
  },
  editContentInput: {
    fontSize: 14,
    lineHeight: 20,
    marginVertical: 10,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10,
  },
});

export default MemoScreen;
