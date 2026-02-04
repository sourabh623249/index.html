export interface OCRResult {
  text: string;
  confidence: number;
  bounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface AIResponse {
  answer: string;
  explanation?: string;
  confidence: number;
  language: 'hindi' | 'english' | 'mixed';
}

export interface AppSettings {
  silentMode: boolean;
  stealthMode: boolean;
  language: 'hindi' | 'english' | 'auto';
  apiProvider: 'openai' | 'gemini' | 'claude';
  lowDataMode: boolean;
}

export interface CameraState {
  isScanning: boolean;
  hasPermission: boolean;
  isProcessing: boolean;
  lastScanTime: number;
}

export interface CalculatorState {
  display: string;
  history: string[];
  isResultShown: boolean;
}