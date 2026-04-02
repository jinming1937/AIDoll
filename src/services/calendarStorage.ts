import AsyncStorage from '@react-native-async-storage/async-storage';

const CALENDAR_STORAGE_KEY = '@calendar_events';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: Date;
  time?: string; // 可选的时间，格式：HH:MM
  isAllDay?: boolean;
}

class CalendarStorage {
  // 获取指定日期的日程
  async getEventsByDate(date: Date): Promise<CalendarEvent[]> {
    try {
      const events = await this.getAllEvents();
      const targetDate = date.toDateString();
      return events.filter(event => 
        new Date(event.date).toDateString() === targetDate
      );
    } catch (error) {
      console.error('Error getting events by date:', error);
      return [];
    }
  }

  // 获取所有日程
  async getAllEvents(): Promise<CalendarEvent[]> {
    try {
      const eventsJson = await AsyncStorage.getItem(CALENDAR_STORAGE_KEY);
      if (eventsJson) {
        const events = JSON.parse(eventsJson);
        // 转换 date 为 Date 对象
        return events.map((event: any) => ({
          ...event,
          date: new Date(event.date)
        }));
      }
      return [];
    } catch (error) {
      console.error('Error getting all events:', error);
      return [];
    }
  }

  // 保存日程
  async saveEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    try {
      const newEvent: CalendarEvent = {
        ...event,
        id: Date.now().toString()
      };
      const events = await this.getAllEvents();
      events.push(newEvent);
      await AsyncStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(events));
      return newEvent;
    } catch (error) {
      console.error('Error saving event:', error);
      throw error;
    }
  }

  // 删除日程
  async deleteEvent(id: string): Promise<void> {
    try {
      const events = await this.getAllEvents();
      const filteredEvents = events.filter(event => event.id !== id);
      await AsyncStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(filteredEvents));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // 清空所有日程
  async clearEvents(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CALENDAR_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing events:', error);
      throw error;
    }
  }

  // 更新日程
  async updateEvent(event: CalendarEvent): Promise<void> {
    try {
      const events = await this.getAllEvents();
      const index = events.findIndex(e => e.id === event.id);
      if (index !== -1) {
        events[index] = event;
        await AsyncStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(events));
      }
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }
}

export default new CalendarStorage();
