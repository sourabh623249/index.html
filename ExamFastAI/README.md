# ExamFast AI – Live Scan Answer App 🔥

A stealth mobile app that looks like a calculator but secretly provides real-time AI answers by scanning text through the camera.

## ✨ Features

- 📷 **Auto OCR Camera** - Automatically detects text without clicking photos
- 🤖 **GPT Answer** - Real-time answers using AI models (OpenAI/Gemini)
- 🔇 **Silent Mode** - No shutter sound or vibrations for stealth use
- 👀 **Stealth UI** - Disguised as a normal calculator app
- 📡 **Low Data** - Optimized for 3G/4G with fast response
- 🌐 **Hindi/English** - Supports both languages automatically
- 🔒 **Secret Access** - Hidden sequence to unlock scan mode

## 🚀 Quick Setup

### Prerequisites
- Node.js (18+ recommended)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android) or Xcode (for iOS)

### Installation

1. **Clone and Install**
   ```bash
   cd ExamFastAI
   npm install
   ```

2. **Setup API Keys**
   
   Edit `services/aiService.ts` and replace the API keys:
   ```typescript
   private apiKeys = {
     openai: 'your-openai-api-key-here',    // Get from https://platform.openai.com/
     gemini: 'your-gemini-api-key-here'     // Get from https://makersuite.google.com/
   };
   ```

3. **Run the App**
   ```bash
   # For development
   npm start
   
   # For Android
   npm run android
   
   # For iOS (macOS only)
   npm run ios
   ```

## 📱 Usage Guide

### Normal Calculator Mode
- App opens as a normal calculator
- All basic calculator functions work
- Completely stealth - looks like a regular calculator app

### Secret Access to AI Mode
1. In calculator, press this sequence: `=` `=` `√` `C`
2. Camera mode will activate
3. Point camera at any text/question
4. AI answer appears automatically

### Camera Features
- **Auto Scan** - Continuously scans for text
- **Manual Capture** - Tap camera button to capture
- **Live Results** - Answers appear in real-time
- **Clear** - Reset the current scan

## 🔧 Configuration

### API Providers
- **OpenAI** - Best quality answers (requires paid API key)
- **Gemini** - Good quality, free tier available
- Fallback mode when APIs are unavailable

### Settings
- **Silent Mode** - Disable all sounds/vibrations
- **Low Data Mode** - Reduced quality for faster responses
- **Language** - Auto-detect Hindi/English or set preference

## 🏗️ Building for Production

### Android APK
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build APK
npm run build:apk
```

### App Store/Play Store
```bash
# iOS
npm run build:ios

# Android
npm run build:android
```

## 🛠️ Technical Details

### Architecture
- **React Native + Expo** - Cross-platform development
- **TypeScript** - Type safety and better development
- **Live OCR** - Real-time text recognition
- **AI Integration** - Multiple API providers with fallbacks

### Key Components
- `CalculatorScreen` - Stealth calculator interface
- `CameraScreen` - Live OCR and AI integration
- `OCRService` - Text recognition and processing
- `AIService` - Multi-provider AI responses

### Performance Optimizations
- Throttled OCR processing (1 scan per second)
- Compressed image quality for faster uploads
- Cached responses for repeated questions
- Low-data mode for slower networks

## 🔒 Privacy & Security

- No data stored on device except settings
- API calls are encrypted (HTTPS)
- No photo storage - images processed in memory
- Stealth mode prevents detection

## 🚨 Important Notes

⚠️ **Disclaimer**: This app is for educational purposes only. Users are responsible for complying with their institution's policies and local laws.

### Recommendations
1. Use your own API keys for better reliability
2. Test thoroughly before important use
3. Ensure good lighting for better OCR
4. Keep app updated for latest features

## 📋 API Key Setup Instructions

### OpenAI API Key
1. Visit https://platform.openai.com/
2. Create account or login
3. Navigate to API Keys section
4. Create new secret key
5. Copy key and paste in `services/aiService.ts`

### Google Gemini API Key
1. Visit https://makersuite.google.com/
2. Sign in with Google account
3. Create new API key
4. Copy key and paste in `services/aiService.ts`

## 🐛 Troubleshooting

### Common Issues

**Camera not working**
- Grant camera permissions in device settings
- Restart app after permission grant

**OCR not detecting text**
- Ensure good lighting
- Hold device steady
- Text should be clear and visible

**AI not responding**
- Check internet connection
- Verify API keys are correct
- Try switching API provider

**App crashes on startup**
- Clear app cache
- Reinstall the app
- Check device compatibility

### Performance Tips
- Close other apps to free memory
- Use on WiFi for faster responses
- Clean camera lens for better OCR
- Update to latest app version

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Verify all setup steps completed
3. Test with different API providers
4. Ensure device meets requirements

---

**Made with ❤️ for students who need quick answers!**

Remember: Use responsibly and follow your institution's academic integrity policies.