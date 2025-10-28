# Oruva App Icon Instructions

## Icon Design
The Oruva app icon should match the brand identity with a PayTM-style blue gradient background and the "o" symbol.

### Design Specifications

**Colors:**
- Primary Blue: `#00BAF2`
- Dark Blue: `#002E6E`
- Mid Blue: `#00509E`
- White: `#FFFFFF`

**Layout:**
- Background: Blue gradient (#002E6E to #00BAF2)
- Symbol: White "o" with circle design (matching logo)
- Style: Rounded square with soft shadows

### Required Icon Sizes

#### iOS
- `icon.png`: 1024x1024px (App Store)

#### Android
- `android-icon-foreground.png`: 1024x1024px (foreground layer)
- `android-icon-monochrome.png`: 1024x1024px (monochrome version)

#### Web
- `favicon.png`: 48x48px

#### Splash Screen
- `splash-icon.png`: 400x400px (centered logo)

### How to Generate Icons

**Option 1: Use an Icon Generator**
1. Visit [https://www.appicon.co/](https://www.appicon.co/) or [https://easyappicon.com/](https://easyappicon.com/)
2. Upload a 1024x1024px master icon
3. Download all required sizes
4. Replace files in `/assets/images/`

**Option 2: Use Expo Asset Generator**
```bash
# Install expo-asset-generator
npm install -g @expo/asset-generator

# Generate icons from master file
npx expo-asset-generator --icon path/to/oruva-icon-1024.png
```

**Option 3: Manual Creation**
1. Create 1024x1024px canvas in design tool (Figma, Photoshop, etc.)
2. Apply purple gradient background
3. Add white "o" symbol in center
4. Export at required sizes
5. Replace existing icon files

### Current Icon Configuration

**app.json settings:**
```json
{
  "icon": "./assets/images/icon.png",
  "splash": {
    "image": "./assets/images/splash-icon.png",
    "backgroundColor": "#00BAF2"
  },
  "android": {
    "adaptiveIcon": {
      "backgroundColor": "#00BAF2",
      "foregroundImage": "./assets/images/android-icon-foreground.png",
      "monochromeImage": "./assets/images/android-icon-monochrome.png"
    }
  }
}
```

### Icon Design Template

**Master Icon (1024x1024px):**
```
┌────────────────────────────────┐
│  Blue Gradient Background      │
│  (#002E6E → #00BAF2)          │
│                                │
│         ┌─────┐                │
│         │  o  │  (White)       │
│         │ ⭕  │                │
│         └─────┘                │
│                                │
│       "oruva" text             │
│    (optional for splash)       │
└────────────────────────────────┘
```

### After Updating Icons

1. Clear Expo cache:
   ```bash
   expo start -c
   ```

2. Rebuild the app:
   ```bash
   # For Android
   eas build --platform android

   # For iOS
   eas build --platform ios
   ```

3. Test on device to verify icon appears correctly

### Notes
- Icons should be PNG format with transparency
- Android adaptive icons should have safe zone (inner 66% of canvas)
- Avoid small text or complex details that won't be readable at small sizes
- Test icons on both light and dark backgrounds
