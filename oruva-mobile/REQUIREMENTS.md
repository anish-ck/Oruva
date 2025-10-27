# Requirements to Run Oruva Mobile App

## 📋 System Requirements

### For Development Machine (Laptop/Desktop)

**Operating System:**
- macOS 10.15 or later (for iOS development)
- Windows 10/11 or Ubuntu 18.04+ (for Android development)
- Linux (Ubuntu, Fedora, etc.)

**Software Requirements:**

1. **Node.js**
   - Version: 18.x or 20.x (LTS recommended)
   - Check: `node --version`
   - Download: https://nodejs.org/

2. **npm** (comes with Node.js)
   - Version: 9.x or higher
   - Check: `npm --version`

3. **Git**
   - Any recent version
   - Check: `git --version`

**Optional (for native builds):**
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)

---

## 📱 Mobile Device Requirements

### To Run the App on Your Phone

**Option 1: Using Expo Go (Easiest)**

1. **Android Phone:**
   - Android 13.0 (API 33) or higher recommended
   - Install "Expo Go" from Google Play Store
   - Phone and laptop must be on same WiFi network

2. **iPhone:**
   - iOS 13.0 or higher
   - Install "Expo Go" from App Store
   - Phone and laptop must be on same WiFi network

**Option 2: Using Android Emulator**
- Android Studio installed
- Virtual device created (Pixel 5, API 33+)
- At least 8GB RAM on development machine

**Option 3: Using iOS Simulator** (macOS only)
- Xcode installed
- iOS Simulator set up

---

## 🔧 Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd stable_coin
git checkout frontend-expo
cd oruva-mobile
```

### 2. Install Dependencies
```bash
npm install
```

This will install:
- React Native (v0.81.5)
- Expo SDK (~54.0)
- ethers.js (v5.7.2) - For blockchain interactions
- React Navigation - For app navigation
- AsyncStorage - For data persistence
- All required polyfills and dependencies

**Installation Time:** 2-5 minutes depending on internet speed

### 3. Verify Installation
```bash
npx expo --version
```
Should show: `~54.0.x`

---

## 🚀 Running the App

### Start Development Server
```bash
npx expo start
```

You'll see:
- QR code in terminal
- Options to open on Android/iOS/Web
- Development server running on port 8081

### Open on Phone
1. Open "Expo Go" app on your phone
2. Scan the QR code from terminal
3. App will load (may take 1-2 minutes first time)

### Common Commands
```bash
npx expo start          # Start development server
npx expo start --clear  # Clear cache and start
npx expo start --android # Open on Android emulator
npx expo start --ios    # Open on iOS simulator (macOS)
```

---

## 🌐 Blockchain Requirements

### Flow EVM Testnet Access

**No installation needed!** The app connects to:
- Network: Flow EVM Testnet
- Chain ID: 545
- RPC URL: https://testnet.evm.nodes.onflow.org

### Get Test Tokens (After Running App)

1. **Connect Wallet in App**
   - Tap "Connect Wallet"
   - Copy your wallet address

2. **Get FLOW Tokens (for gas fees)**
   - Visit: https://faucet.flow.com/
   - Select "EVM Testnet"
   - Paste your address
   - Request tokens
   - Wait 1-2 minutes

3. **Mint Test USDC** (in app)
   - Use "Mint Test USDC" card
   - Enter amount (e.g., 1000)
   - Tap "Mint"

---

## 📦 Key Dependencies Explained

### Core Framework
- **expo** (~54.0.20) - Development platform for React Native
- **react-native** (0.81.5) - Mobile framework
- **react** (19.1.0) - UI library

### Blockchain
- **ethers** (^5.7.2) - Ethereum/EVM library for wallet & contracts
- **react-native-get-random-values** - Secure random generation
- **react-native-url-polyfill** - URL support for React Native

### Storage & State
- **@react-native-async-storage/async-storage** - Local data storage
- **react-native-mmkv** - Fast key-value storage

### Navigation
- **@react-navigation/native** - Navigation framework
- **react-native-screens** - Native screen handling

### UI Components
- **expo-vector-icons** - Icon library
- **react-native-safe-area-context** - Safe area handling

---

## ⚠️ Common Issues & Solutions

### Issue: "Command not found: expo"
**Solution:**
```bash
npm install -g expo-cli
# OR use npx
npx expo start
```

### Issue: "Metro bundler error"
**Solution:**
```bash
npx expo start --clear
```

### Issue: "Can't connect to development server"
**Solution:**
- Ensure phone and laptop on same WiFi
- Disable VPN
- Check firewall settings
- Try: `npx expo start --tunnel`

### Issue: "Module not found"
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: App crashes on launch
**Solution:**
```bash
# Clear Expo cache
npx expo start --clear

# Clear React Native cache
rm -rf node_modules/.cache
```

---

## 💾 Disk Space Requirements

- **Development Machine:**
  - Node modules: ~500 MB
  - Expo tools: ~200 MB
  - Total: ~1 GB minimum

- **Mobile Device:**
  - Expo Go app: ~50 MB
  - Running app: ~100-200 MB RAM

---

## 🔐 Permissions Required

### Android
- Internet access (automatically granted)
- Storage (for AsyncStorage - automatically granted)

### iOS
- Internet access (automatically granted)
- Local storage (automatically granted)

**No sensitive permissions needed!**

---

## 🌍 Network Requirements

- **Internet connection** - Required for:
  - Installing dependencies
  - Running Expo dev server
  - Connecting to Flow EVM Testnet
  - Blockchain transactions

- **Same WiFi network** - Required for:
  - Phone to connect to laptop's Expo server
  - OR use tunnel mode: `npx expo start --tunnel`

---

## ✅ Quick Checklist

Before running the app, ensure you have:

- [ ] Node.js 18.x or 20.x installed
- [ ] npm 9.x or higher
- [ ] Cloned the repository
- [ ] Switched to `frontend-expo` branch
- [ ] Ran `npm install` in `oruva-mobile` folder
- [ ] Phone and laptop on same WiFi
- [ ] Expo Go app installed on phone
- [ ] Internet connection active

---

## 🎯 First-Time Setup (Complete Flow)

1. **Install Node.js** → https://nodejs.org/
2. **Clone repo & install:**
   ```bash
   git clone <repo>
   cd stable_coin
   git checkout frontend-expo
   cd oruva-mobile
   npm install
   ```
3. **Start app:**
   ```bash
   npx expo start
   ```
4. **On phone:**
   - Install Expo Go
   - Scan QR code
   - Wait for app to load

5. **In app:**
   - Connect wallet
   - Copy address
   - Get FLOW from faucet
   - Mint test USDC
   - Start using!

**Total time:** 10-15 minutes

---

## 📞 Support

If you encounter issues:
1. Check error messages in terminal
2. Look for red error screen on phone
3. Check Metro bundler logs
4. Try clearing cache: `npx expo start --clear`

**Common Error Logs Location:**
- Terminal output
- Expo Go app (shake phone → show logs)
- `~/.expo/` folder

---

## 🔄 Updating the App

When code changes:
1. Save files in editor
2. App auto-reloads on phone
3. If not, shake phone → "Reload"

When dependencies change:
```bash
npm install
npx expo start --clear
```

---

Built with ❤️ for Flow EVM Hackathon
