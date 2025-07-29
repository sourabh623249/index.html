import * as TextRecognition from 'react-native-text-recognition';
import { OCRResult } from '../types/types';

class OCRService {
  private lastProcessTime = 0;
  private readonly THROTTLE_INTERVAL = 500; // Process every 500ms max

  async processImage(imageUri: string): Promise<OCRResult[]> {
    const now = Date.now();
    if (now - this.lastProcessTime < this.THROTTLE_INTERVAL) {
      return [];
    }

    try {
      this.lastProcessTime = now;
      
      // Use react-native-text-recognition for fast OCR
      const result = await TextRecognition.recognize(imageUri);
      
      if (!result || result.length === 0) {
        return [];
      }

      return result.map((item: any) => ({
        text: item.text?.trim() || '',
        confidence: item.confidence || 0.8,
        bounds: item.bounds ? {
          x: item.bounds.left || 0,
          y: item.bounds.top || 0,
          width: item.bounds.width || 0,
          height: item.bounds.height || 0
        } : undefined
      })).filter(item => item.text.length > 0);

    } catch (error) {
      console.warn('OCR processing failed:', error);
      return [];
    }
  }

  // Process live camera frame (optimized for real-time)
  async processLiveFrame(imageUri: string): Promise<string> {
    try {
      const results = await this.processImage(imageUri);
      
      if (results.length === 0) {
        return '';
      }

      // Combine all detected text
      const combinedText = results
        .filter(result => result.confidence > 0.6) // Filter low confidence
        .map(result => result.text)
        .join(' ')
        .trim();

      return combinedText;
    } catch (error) {
      console.warn('Live OCR failed:', error);
      return '';
    }
  }

  // Clean and preprocess text for better AI processing
  cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Multiple spaces to single
      .replace(/[^\w\s\u0900-\u097F.,?!()-]/g, '') // Keep only letters, numbers, Hindi chars, basic punctuation
      .trim();
  }

  // Check if text looks like a question
  isQuestion(text: string): boolean {
    const questionWords = [
      'what', 'how', 'why', 'when', 'where', 'which', 'who',
      'क्या', 'कैसे', 'क्यों', 'कब', 'कहाँ', 'कौन', 'किस'
    ];
    
    const lowerText = text.toLowerCase();
    return questionWords.some(word => lowerText.includes(word)) || 
           text.includes('?') || 
           text.length > 10; // Assume longer text might be questions
  }
}

export const ocrService = new OCRService();