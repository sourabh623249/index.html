import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  StatusBar,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as KeepAwake from 'expo-keep-awake';
import { AppSettings, CameraState, AIResponse } from '../types/types';
import { ocrService } from '../services/ocrService';
import { aiService } from '../services/aiService';

const { width, height } = Dimensions.get('window');

interface Props {
  onBack: () => void;
  settings: AppSettings;
}

export const CameraScreen: React.FC<Props> = ({ onBack, settings }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [cameraState, setCameraState] = useState<CameraState>({
    isScanning: false,
    hasPermission: false,
    isProcessing: false,
    lastScanTime: 0,
  });
  
  const [detectedText, setDetectedText] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isGettingAnswer, setIsGettingAnswer] = useState(false);
  
  const cameraRef = useRef<CameraView>(null);
  const processingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    KeepAwake.activateKeepAwake();
    StatusBar.setBarStyle('light-content');
    
    return () => {
      KeepAwake.deactivateKeepAwake();
      StatusBar.setBarStyle('dark-content');
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const checkPermissions = async () => {
      if (permission?.granted && mediaPermission?.granted) {
        setCameraState(prev => ({ ...prev, hasPermission: true }));
      }
    };
    checkPermissions();
  }, [permission, mediaPermission]);

  const handlePermissionRequest = async () => {
    const cameraResponse = await requestPermission();
    const mediaResponse = await requestMediaPermission();
    
    if (cameraResponse.granted && mediaResponse.granted) {
      setCameraState(prev => ({ ...prev, hasPermission: true }));
    } else {
      Alert.alert(
        'Permissions Required',
        'Camera and media permissions are required for this feature.',
        [{ text: 'OK' }]
      );
    }
  };

  const processLiveFrame = async () => {
    if (!cameraRef.current || cameraState.isProcessing) return;
    
    const now = Date.now();
    if (now - cameraState.lastScanTime < 1000) return; // Throttle to 1 second

    try {
      setCameraState(prev => ({ ...prev, isProcessing: true, lastScanTime: now }));
      
      // Take a picture for OCR processing
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
        skipProcessing: true,
      });

      if (photo?.uri) {
        const text = await ocrService.processLiveFrame(photo.uri);
        const cleanText = ocrService.cleanText(text);
        
        if (cleanText && cleanText.length > 5) {
          setDetectedText(cleanText);
          
          // Auto-get answer if text looks like a question
          if (ocrService.isQuestion(cleanText) && !isGettingAnswer) {
            await getAIAnswer(cleanText);
          }
        }
      }
    } catch (error) {
      console.warn('Live processing error:', error);
    } finally {
      setCameraState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const getAIAnswer = async (question: string) => {
    if (isGettingAnswer) return;
    
    setIsGettingAnswer(true);
    setAiResponse(null);
    
    try {
      const response = await aiService.getAnswer(question, settings);
      setAiResponse(response);
    } catch (error) {
      setAiResponse({
        answer: 'Error getting answer. Please try again.',
        confidence: 0.1,
        language: 'english'
      });
    } finally {
      setIsGettingAnswer(false);
    }
  };

  const startLiveScanning = () => {
    if (cameraState.isScanning) {
      // Stop scanning
      setCameraState(prev => ({ ...prev, isScanning: false }));
      if (processingTimeoutRef.current) {
        clearInterval(processingTimeoutRef.current);
      }
    } else {
      // Start scanning
      setCameraState(prev => ({ ...prev, isScanning: true }));
      
      // Start continuous processing
      processingTimeoutRef.current = setInterval(processLiveFrame, 1500);
    }
  };

  const manualCapture = async () => {
    if (!cameraRef.current) return;
    
    try {
      setCameraState(prev => ({ ...prev, isProcessing: true }));
      
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo?.uri) {
        const text = await ocrService.processLiveFrame(photo.uri);
        const cleanText = ocrService.cleanText(text);
        
        if (cleanText) {
          setDetectedText(cleanText);
          await getAIAnswer(cleanText);
        } else {
          Alert.alert('No Text Found', 'Could not detect any text in the image.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image.');
    } finally {
      setCameraState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const toggleCamera = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted || !mediaPermission?.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Ionicons name="camera-outline" size={80} color="#666" />
        <Text style={styles.permissionText}>
          Camera and media permissions are required to scan questions
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={handlePermissionRequest}>
          <Text style={styles.permissionButtonText}>Grant Permissions</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Back to Calculator</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      {/* Camera View */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        animateShutter={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onBack}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Mode</Text>
          <TouchableOpacity style={styles.headerButton} onPress={toggleCamera}>
            <Ionicons name="camera-reverse" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Scanning overlay */}
        <View style={styles.scanArea}>
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            {cameraState.isScanning && (
              <View style={styles.scanLine}>
                <LinearGradient
                  colors={['transparent', '#00ff00', 'transparent']}
                  style={styles.scanLineGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
            )}
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, cameraState.isScanning && styles.activeButton]}
            onPress={startLiveScanning}
            disabled={cameraState.isProcessing}
          >
            <Ionicons 
              name={cameraState.isScanning ? "stop" : "scan"} 
              size={24} 
              color="#fff" 
            />
            <Text style={styles.controlButtonText}>
              {cameraState.isScanning ? 'Stop' : 'Auto Scan'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, cameraState.isProcessing && styles.processingButton]}
            onPress={manualCapture}
            disabled={cameraState.isProcessing}
          >
            {cameraState.isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="camera" size={32} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setDetectedText('')}
          >
            <Ionicons name="refresh" size={24} color="#fff" />
            <Text style={styles.controlButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </CameraView>

      {/* Results Panel */}
      {(detectedText || aiResponse || isGettingAnswer) && (
        <View style={styles.resultsPanel}>
          <ScrollView style={styles.resultsScroll} showsVerticalScrollIndicator={false}>
            {detectedText && (
              <View style={styles.resultSection}>
                <Text style={styles.resultLabel}>Detected Text:</Text>
                <Text style={styles.detectedText}>{detectedText}</Text>
              </View>
            )}
            
            {isGettingAnswer && (
              <View style={styles.resultSection}>
                <Text style={styles.resultLabel}>Getting Answer...</Text>
                <ActivityIndicator color="#007AFF" style={styles.loadingIndicator} />
              </View>
            )}
            
            {aiResponse && (
              <View style={styles.resultSection}>
                <Text style={styles.resultLabel}>Answer:</Text>
                <Text style={styles.answerText}>{aiResponse.answer}</Text>
                <Text style={styles.confidenceText}>
                  Confidence: {Math.round(aiResponse.confidence * 100)}%
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 40,
  },
  permissionText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginVertical: 30,
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#666',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  camera: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  scanFrame: {
    width: width - 80,
    height: (width - 80) * 0.7,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#00ff00',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
  },
  scanLineGradient: {
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 30,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  controlButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 15,
    minWidth: 70,
  },
  activeButton: {
    backgroundColor: 'rgba(0,255,0,0.3)',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  processingButton: {
    backgroundColor: 'rgba(255,165,0,0.3)',
  },
  resultsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: height * 0.4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  resultsScroll: {
    padding: 20,
  },
  resultSection: {
    marginBottom: 15,
  },
  resultLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  detectedText: {
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
  },
  answerText: {
    fontSize: 16,
    color: '#333',
    backgroundColor: '#e6f3ff',
    padding: 15,
    borderRadius: 8,
    lineHeight: 22,
  },
  confidenceText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'right',
  },
  loadingIndicator: {
    marginVertical: 10,
  },
});