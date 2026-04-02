import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RootStackParamList } from '../../App';
import { useThemeStore } from '../store/themeStore';
import { useTranslation } from '../hooks/useTranslation';
import { translations } from '../i18n';
import calendarStorage, { CalendarEvent } from '../services/calendarStorage';

const { width, height } = Dimensions.get('window');

type CalendarScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Calendar'>;

interface CalendarScreenProps {
  navigation: CalendarScreenNavigationProp;
}

const CalendarScreen: React.FC<CalendarScreenProps> = ({ navigation }) => {
  const { getThemeColors } = useThemeStore();
  const { t, language } = useTranslation();
  const themeColors = getThemeColors();

  // 获取当前日期
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDateEvents, setSelectedDateEvents] = useState<CalendarEvent[]>([]);
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '',
    description: ''
  });
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 加载所有日程
  useEffect(() => {
    loadEvents();
  }, []);

  // 加载选中日期的日程
  useEffect(() => {
    loadSelectedDateEvents();
  }, [selectedDate]);

  const loadEvents = async () => {
    try {
      const allEvents = await calendarStorage.getAllEvents();
      console.log('allEvents:', allEvents);
      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadSelectedDateEvents = async () => {
    try {
      const dateEvents = await calendarStorage.getEventsByDate(selectedDate);
      console.log('dateEvents:', dateEvents);
      setSelectedDateEvents(dateEvents);
    } catch (error) {
      console.error('Error loading selected date events:', error);
    }
  };

  // 生成日历数据
  const generateCalendarDays = () => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const days = [];

    // 添加上个月的占位日期
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: '', isCurrentMonth: false });
    }

    // 添加当前月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const isToday = date.toDateString() === new Date().toDateString();
      days.push({ day: i.toString(), isCurrentMonth: true, isToday });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // 月份名称和星期名称
  // 直接从translations对象中获取，因为t函数不支持返回数组
  const monthNames = language === 'zh' ? translations.zh.calendar.monthNames : translations.en.calendar.monthNames;
  const weekDays = language === 'zh' ? translations.zh.calendar.weekDays : translations.en.calendar.weekDays;

  // 切换到上个月
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // 切换到下个月
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // 创建日程
  const handleCreateEvent = async () => {
    if (!newEvent.title.trim()) {
      Alert.alert(t('common.error') || 'Error', '请输入日程标题');
      return;
    }

    try {
      await calendarStorage.saveEvent({
        title: newEvent.title.trim(),
        description: newEvent.description.trim(),
        date: selectedDate,
        time: newEvent.time.trim(),
        isAllDay: !newEvent.time.trim()
      });
      await loadEvents();
      await loadSelectedDateEvents();
      setIsAddingEvent(false);
      setNewEvent({ title: '', time: '', description: '' });
    } catch (error) {
      console.error('Error creating event:', error);
      Alert.alert(t('common.error') || 'Error', '创建日程失败，请重试');
    }
  };

  // 处理编辑日程
  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      time: event.time || '',
      description: event.description || ''
    });
    setIsEditing(true);
  };

  // 保存编辑的日程
  const handleSaveEdit = async () => {
    if (!newEvent.title.trim()) {
      Alert.alert(t('common.error') || 'Error', '请输入日程标题');
      return;
    }

    if (!editingEvent) return;

    try {
      await calendarStorage.updateEvent({
        ...editingEvent,
        title: newEvent.title.trim(),
        description: newEvent.description.trim(),
        time: newEvent.time.trim(),
        isAllDay: !newEvent.time.trim()
      });
      await loadEvents();
      await loadSelectedDateEvents();
      setIsEditing(false);
      setEditingEvent(null);
      setNewEvent({ title: '', time: '', description: '' });
    } catch (error) {
      console.error('Error updating event:', error);
      Alert.alert(t('common.error') || 'Error', '更新日程失败，请重试');
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
        <Text style={styles.headerTitle}>
          {t('calendar.title')} - {monthNames[month]} {year}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddingEvent(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Calendar */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView 
          style={styles.calendarContainer}
          contentContainerStyle={styles.scrollContent}
        >
        {/* Week Days */}
        <View style={styles.weekDaysContainer}>
          {weekDays.map((day, index) => (
            <Text key={index} style={[styles.weekDay, { color: themeColors.textSecondary }]}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => {
            const dayDate = day.isCurrentMonth ? new Date(year, month, parseInt(day.day)) : null;
            const isSelected = dayDate && dayDate.toDateString() === selectedDate.toDateString();
            const hasEvent = dayDate && events.some(event => 
              new Date(event.date).toDateString() === dayDate.toDateString()
            );
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  !day.isCurrentMonth && styles.otherMonthDay,
                  day.isToday && [styles.todayDay, { backgroundColor: themeColors.primary }],
                  isSelected && [styles.selectedDay, { backgroundColor: themeColors.primary + '80' }]
                ]}
                disabled={!day.isCurrentMonth}
                onPress={() => {
                  if (day.isCurrentMonth) {
                    setSelectedDate(new Date(year, month, parseInt(day.day)));
                  }
                }}
              >
                <Text
                  style={[
                    styles.dayText,
                    !day.isCurrentMonth && styles.otherMonthText,
                    day.isToday && styles.todayText,
                    isSelected && styles.selectedDayText
                  ]}
                >
                  {day.day}
                </Text>
                {hasEvent && (
                  <View style={[styles.eventDot, { backgroundColor: themeColors.primary }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add/Edit Event Form */}
        {(isAddingEvent || isEditing) && (
          <View style={[styles.addEventForm, { backgroundColor: themeColors.surface }]}>
            <Text style={[styles.formTitle, { color: themeColors.text }]}>
              {isEditing ? '编辑日程' : '添加日程'} - {selectedDate.toLocaleDateString()}
            </Text>
            <TextInput
              style={[styles.input, { color: themeColors.text, borderColor: themeColors.border }]}
              placeholder="标题"
              placeholderTextColor={themeColors.textSecondary}
              value={newEvent.title}
              onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
              autoFocus
            />
            <TextInput
              style={[styles.input, { color: themeColors.text, borderColor: themeColors.border }]}
              placeholder="时间 (HH:MM)"
              placeholderTextColor={themeColors.textSecondary}
              value={newEvent.time}
              onChangeText={(text) => setNewEvent({ ...newEvent, time: text })}
              keyboardType="numbers-and-punctuation"
            />
            <TextInput
              style={[styles.textArea, { color: themeColors.text, borderColor: themeColors.border }]}
              placeholder="描述"
              placeholderTextColor={themeColors.textSecondary}
              value={newEvent.description}
              onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
              multiline
              numberOfLines={3}
            />
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: themeColors.primary }]}
                onPress={() => {
                  setIsAddingEvent(false);
                  setIsEditing(false);
                  setEditingEvent(null);
                  setNewEvent({ title: '', time: '', description: '' });
                }}
              >
                <Text style={[styles.cancelButtonText, { color: themeColors.primary }]}>
                  {t('common.cancel') || 'Cancel'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: themeColors.primary }]}
                onPress={isEditing ? handleSaveEdit : handleCreateEvent}
              >
                <Text style={styles.saveButtonText}>{t('common.save') || 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Events Section */}
        <View style={styles.eventsSection}>
          <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
            {t('calendar.events') || 'Events'} - {selectedDate.toLocaleDateString()}
          </Text>
          {selectedDateEvents.length === 0 ? (
            <View style={styles.eventItem}>
              <View style={[styles.eventIndicator, { backgroundColor: themeColors.primary }]} />
              <Text style={[styles.eventText, { color: themeColors.text }]}>
                {t('calendar.noEvents') || 'No events scheduled'}
              </Text>
            </View>
          ) : (
            selectedDateEvents.map((event) => (
              <View key={event.id} style={styles.eventItem}>
                <View style={[styles.eventIndicator, { backgroundColor: themeColors.primary }]} />
                <View style={styles.eventContent}>
                  <Text style={[styles.eventTitle, { color: themeColors.text }]}>
                    {event.title}
                  </Text>
                  {event.time && (
                    <Text style={[styles.eventTime, { color: themeColors.textSecondary }]}>
                      {event.time}
                    </Text>
                  )}
                  {event.description && (
                    <Text style={[styles.eventDescription, { color: themeColors.textSecondary }]}>
                      {event.description}
                    </Text>
                  )}
                </View>
                <View style={styles.eventActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditEvent(event)}
                  >
                    <Ionicons name="pencil" size={20} color={themeColors.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      Alert.alert(
                        t('common.confirm') || 'Confirm',
                        `确定要删除日程「${event.title}」吗？`,
                        [
                          { text: t('common.cancel') || 'Cancel', style: 'cancel' },
                          {
                            text: t('common.confirm') || 'OK',
                            style: 'destructive',
                            onPress: async () => {
                              try {
                                await calendarStorage.deleteEvent(event.id);
                                await loadEvents();
                                await loadSelectedDateEvents();
                              } catch (error) {
                                console.error('Error deleting event:', error);
                                Alert.alert(t('common.error') || 'Error', '删除日程失败，请重试');
                              }
                            },
                          },
                        ]
                      );
                    }}
                  >
                    <Ionicons name="trash" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
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
  placeholder: {
    width: 40,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  calendarContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // 增加底部空间，确保键盘弹起时有足够的滚动空间
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: (width - 40) / 7,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  todayDay: {
    borderRadius: 24,
  },
  dayText: {
    fontSize: 16,
  },
  otherMonthText: {
    color: '#999',
  },
  todayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectedDay: {
    borderRadius: 24,
  },
  selectedDayText: {
    fontWeight: 'bold',
  },
  eventDot: {
    position: 'absolute',
    bottom: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  eventsSection: {
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  eventIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  eventTime: {
    fontSize: 14,
    marginTop: 2,
  },
  eventDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  eventActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
  },
  eventText: {
    fontSize: 16,
  },
  addEventForm: {
    marginVertical: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    fontSize: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  textArea: {
    fontSize: 16,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  formButtons: {
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
});

export default CalendarScreen;
