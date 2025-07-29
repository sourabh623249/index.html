import axios from 'axios';
import { AIResponse, AppSettings } from '../types/types';

class AIService {
  private readonly OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
  private readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  
  // Default API keys - User should replace with their own
  private apiKeys = {
    openai: 'your-openai-api-key-here',
    gemini: 'your-gemini-api-key-here'
  };

  async getAnswer(question: string, settings: AppSettings): Promise<AIResponse> {
    const cleanQuestion = this.preprocessQuestion(question);
    
    if (cleanQuestion.length < 5) {
      return {
        answer: 'Please provide a clearer question.',
        confidence: 0.1,
        language: 'english'
      };
    }

    try {
      switch (settings.apiProvider) {
        case 'openai':
          return await this.getOpenAIAnswer(cleanQuestion, settings);
        case 'gemini':
          return await this.getGeminiAnswer(cleanQuestion, settings);
        default:
          return await this.getFallbackAnswer(cleanQuestion, settings);
      }
    } catch (error) {
      console.warn('AI Service Error:', error);
      return await this.getFallbackAnswer(cleanQuestion, settings);
    }
  }

  private async getOpenAIAnswer(question: string, settings: AppSettings): Promise<AIResponse> {
    const prompt = this.buildPrompt(question, settings);
    
    const response = await axios.post(
      this.OPENAI_API_URL,
      {
        model: settings.lowDataMode ? 'gpt-3.5-turbo' : 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are ExamFast AI. Give concise, accurate answers. Support both Hindi and English. For academic questions, provide step-by-step solutions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: settings.lowDataMode ? 150 : 300,
        temperature: 0.3
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKeys.openai}`,
          'Content-Type': 'application/json'
        },
        timeout: settings.lowDataMode ? 10000 : 20000
      }
    );

    const answer = response.data.choices[0]?.message?.content?.trim() || 'No answer found.';
    
    return {
      answer,
      confidence: 0.9,
      language: this.detectLanguage(answer)
    };
  }

  private async getGeminiAnswer(question: string, settings: AppSettings): Promise<AIResponse> {
    const prompt = this.buildPrompt(question, settings);
    
    const response = await axios.post(
      `${this.GEMINI_API_URL}?key=${this.apiKeys.gemini}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: settings.lowDataMode ? 150 : 300,
          temperature: 0.3
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: settings.lowDataMode ? 10000 : 20000
      }
    );

    const answer = response.data.candidates[0]?.content?.parts[0]?.text?.trim() || 'No answer found.';
    
    return {
      answer,
      confidence: 0.85,
      language: this.detectLanguage(answer)
    };
  }

  private async getFallbackAnswer(question: string, settings: AppSettings): Promise<AIResponse> {
    // Simple fallback logic for when APIs are unavailable
    const basicAnswers = {
      'what is': 'This is a definition question. Please check your textbook or notes.',
      'how to': 'This is a procedural question. Break it down into steps.',
      'why': 'This requires explanation. Look for cause-and-effect relationships.',
      'calculate': 'This is a math problem. Identify the formula needed.',
      'solve': 'Break the problem into smaller parts and solve step by step.'
    };

    const lowerQuestion = question.toLowerCase();
    for (const [key, value] of Object.entries(basicAnswers)) {
      if (lowerQuestion.includes(key)) {
        return {
          answer: value,
          confidence: 0.5,
          language: 'english'
        };
      }
    }

    return {
      answer: 'Question detected. Please ensure good lighting and clear text for better results.',
      confidence: 0.3,
      language: 'english'
    };
  }

  private buildPrompt(question: string, settings: AppSettings): string {
    let prompt = '';
    
    if (settings.language === 'hindi') {
      prompt = `कृपया इस प्रश्न का संक्षिप्त और सटीक उत्तर दें:\n\n${question}`;
    } else if (settings.language === 'english') {
      prompt = `Please provide a concise and accurate answer to this question:\n\n${question}`;
    } else {
      prompt = `Please answer this question in the same language it was asked. If it's in Hindi, respond in Hindi. If in English, respond in English:\n\n${question}`;
    }
    
    if (settings.lowDataMode) {
      prompt += '\n\nPlease keep the answer brief and to the point.';
    }
    
    return prompt;
  }

  private preprocessQuestion(question: string): string {
    return question
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\u0900-\u097F.,?!()-]/g, '')
      .trim();
  }

  private detectLanguage(text: string): 'hindi' | 'english' | 'mixed' {
    const hindiChars = text.match(/[\u0900-\u097F]/g);
    const englishChars = text.match(/[a-zA-Z]/g);
    
    if (hindiChars && englishChars) return 'mixed';
    if (hindiChars) return 'hindi';
    return 'english';
  }

  // Method to update API keys
  updateApiKey(provider: 'openai' | 'gemini', key: string) {
    this.apiKeys[provider] = key;
  }

  // Test API connection
  async testConnection(provider: 'openai' | 'gemini'): Promise<boolean> {
    try {
      const testQuestion = 'Test question';
      const settings: AppSettings = {
        silentMode: true,
        stealthMode: true,
        language: 'english',
        apiProvider: provider,
        lowDataMode: true
      };
      
      await this.getAnswer(testQuestion, settings);
      return true;
    } catch {
      return false;
    }
  }
}

export const aiService = new AIService();