import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as ScreenOrientation from 'expo-screen-orientation';

import { CalculatorScreen } from './components/CalculatorScreen';
import { CameraScreen } from './components/CameraScreen';
import { AppSettings } from './types/types';

export default function App() {
  const [currentMode, setCurrentMode] = useState<'calculator' | 'camera'>('calculator');
  const [settings, setSettings] = useState<AppSettings>({
    silentMode: true,
    stealthMode: true,
    language: 'auto',
    apiProvider: 'openai',
    lowDataMode: true,
  });

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Lock orientation to portrait for stealth mode
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      
      // Load saved settings
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      
      // Set up haptics for silent mode
      if (settings.silentMode) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.log('Initialization error:', error);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.log('Settings save error:', error);
    }
  };

  const handleSecretAccess = () => {
    if (!settings.silentMode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setCurrentMode('camera');
  };

  const handleBackToCalculator = () => {
    setCurrentMode('calculator');
  };

  return (
    <View style={styles.container}>
      <StatusBar style={currentMode === 'calculator' ? 'dark' : 'light'} />
      
      {currentMode === 'calculator' ? (
        <CalculatorScreen
          onSecretAccess={handleSecretAccess}
          settings={settings}
        />
      ) : (
        <CameraScreen
          onBack={handleBackToCalculator}
          settings={settings}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
