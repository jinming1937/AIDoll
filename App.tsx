import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AISettingsScreen from './src/screens/AISettingsScreen';
import LanguageSettingsScreen from './src/screens/LanguageSettingsScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import MemoScreen from './src/screens/MemoScreen';
import { audioService } from './src/services/audioService';
import { useAudioStore } from './src/store/audioStore';

export type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  AISettings: undefined;
  LanguageSettings: undefined;
  Calendar: undefined;
  Memo: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const { volume, isMuted } = useAudioStore((state) => state);
  // 监听音量变化
  useEffect(() => {
    audioService.updateVolume();
  }, [volume, isMuted]);
  
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: '#FFF0F5' },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              presentation: 'modal'
            }}
          />
          <Stack.Screen
            name="AISettings"
            component={AISettingsScreen}
            options={{
              presentation: 'modal'
            }}
          />
          <Stack.Screen
            name="LanguageSettings"
            component={LanguageSettingsScreen}
            options={{
              presentation: 'modal'
            }}
          />
          <Stack.Screen
            name="Calendar"
            component={CalendarScreen}
            options={{
              presentation: 'modal'
            }}
          />
          <Stack.Screen
            name="Memo"
            component={MemoScreen}
            options={{
              presentation: 'modal'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
