import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { AppSettings } from '../types/types';
import { aiService } from '../services/aiService';

interface Props {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onBack: () => void;
}

export const SettingsScreen: React.FC<Props> = ({ settings, onSettingsChange, onBack }) => {
  const [tempSettings, setTempSettings] = useState<AppSettings>(settings);
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    gemini: '',
  });
  const [testingApi, setTestingApi] = useState<string | null>(null);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setTempSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    onSettingsChange(tempSettings);
    
    // Update API keys if provided
    if (apiKeys.openai.trim()) {
      aiService.updateApiKey('openai', apiKeys.openai.trim());
    }
    if (apiKeys.gemini.trim()) {
      aiService.updateApiKey('gemini', apiKeys.gemini.trim());
    }
    
    Alert.alert('Settings Saved', 'Your preferences have been updated.');
  };

  const testApiConnection = async (provider: 'openai' | 'gemini') => {
    if (!apiKeys[provider].trim()) {
      Alert.alert('API Key Required', `Please enter your ${provider} API key first.`);
      return;
    }

    setTestingApi(provider);
    
    // Update API key temporarily for testing
    aiService.updateApiKey(provider, apiKeys[provider].trim());
    
    try {
      const isWorking = await aiService.testConnection(provider);
      Alert.alert(
        'API Test',
        isWorking ? 
          `✅ ${provider} API is working correctly!` : 
          `❌ ${provider} API test failed. Please check your key.`
      );
    } catch (error) {
      Alert.alert('API Test Failed', `Could not connect to ${provider}. Please check your key and internet connection.`);
    } finally {
      setTestingApi(null);
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'This will reset all settings to default values. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setTempSettings({
              silentMode: true,
              stealthMode: true,
              language: 'auto',
              apiProvider: 'openai',
              lowDataMode: true,
            });
            setApiKeys({ openai: '', gemini: '' });
          }
        }
      ]
    );
  };

  return (
    <LinearGradient colors={['#f8f9fa', '#e9ecef']} style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* API Configuration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Configuration</Text>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>OpenAI API Key</Text>
            <Text style={styles.cardDescription}>
              Get your API key from platform.openai.com
            </Text>
            <TextInput
              style={styles.input}
              placeholder="sk-..."
              value={apiKeys.openai}
              onChangeText={(text) => setApiKeys(prev => ({ ...prev, openai: text }))}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.testButton, testingApi === 'openai' && styles.testingButton]}
              onPress={() => testApiConnection('openai')}
              disabled={testingApi === 'openai'}
            >
              <Text style={styles.testButtonText}>
                {testingApi === 'openai' ? 'Testing...' : 'Test Connection'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Google Gemini API Key</Text>
            <Text style={styles.cardDescription}>
              Get your API key from makersuite.google.com
            </Text>
            <TextInput
              style={styles.input}
              placeholder="AIza..."
              value={apiKeys.gemini}
              onChangeText={(text) => setApiKeys(prev => ({ ...prev, gemini: text }))}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.testButton, testingApi === 'gemini' && styles.testingButton]}
              onPress={() => testApiConnection('gemini')}
              disabled={testingApi === 'gemini'}
            >
              <Text style={styles.testButtonText}>
                {testingApi === 'gemini' ? 'Testing...' : 'Test Connection'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchTitle}>Silent Mode</Text>
                <Text style={styles.switchDescription}>
                  Disable sounds and vibrations for stealth use
                </Text>
              </View>
              <Switch
                value={tempSettings.silentMode}
                onValueChange={(value) => updateSetting('silentMode', value)}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={tempSettings.silentMode ? '#007AFF' : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchTitle}>Stealth Mode</Text>
                <Text style={styles.switchDescription}>
                  Keep calculator appearance for disguise
                </Text>
              </View>
              <Switch
                value={tempSettings.stealthMode}
                onValueChange={(value) => updateSetting('stealthMode', value)}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={tempSettings.stealthMode ? '#007AFF' : '#f4f3f4'}
              />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchTitle}>Low Data Mode</Text>
                <Text style={styles.switchDescription}>
                  Optimize for slower internet connections
                </Text>
              </View>
              <Switch
                value={tempSettings.lowDataMode}
                onValueChange={(value) => updateSetting('lowDataMode', value)}
                trackColor={{ false: '#767577', true: '#81b0ff' }}
                thumbColor={tempSettings.lowDataMode ? '#007AFF' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Language & Provider */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language & Provider</Text>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Preferred Language</Text>
            <View style={styles.radioGroup}>
              {['auto', 'english', 'hindi'].map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={styles.radioOption}
                  onPress={() => updateSetting('language', lang as any)}
                >
                  <View style={[
                    styles.radioCircle,
                    tempSettings.language === lang && styles.radioSelected
                  ]}>
                    {tempSettings.language === lang && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.radioText}>
                    {lang === 'auto' ? 'Auto-detect' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>AI Provider</Text>
            <View style={styles.radioGroup}>
              {[
                { key: 'openai', label: 'OpenAI (GPT)' },
                { key: 'gemini', label: 'Google Gemini' },
              ].map((provider) => (
                <TouchableOpacity
                  key={provider.key}
                  style={styles.radioOption}
                  onPress={() => updateSetting('apiProvider', provider.key as any)}
                >
                  <View style={[
                    styles.radioCircle,
                    tempSettings.apiProvider === provider.key && styles.radioSelected
                  ]}>
                    {tempSettings.apiProvider === provider.key && (
                      <View style={styles.radioInner} />
                    )}
                  </View>
                  <Text style={styles.radioText}>{provider.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Reset */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
            <Ionicons name="refresh" size={20} color="#FF3B30" />
            <Text style={styles.resetButtonText}>Reset to Defaults</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Secret Access Code</Text>
            <Text style={styles.instructionText}>
              To access AI scan mode from calculator:{'\n'}
              Press: = = √ C (in sequence)
            </Text>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
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
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
    backgroundColor: '#f8f9fa',
  },
  testButton: {
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testingButton: {
    backgroundColor: '#FF9500',
  },
  testButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchInfo: {
    flex: 1,
    marginRight: 15,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 14,
    color: '#666',
  },
  radioGroup: {
    marginTop: 10,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    backgroundColor: '#007AFF',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  radioText: {
    fontSize: 16,
    color: '#333',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  resetButtonText: {
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
});