# Oruva Logo Setup Instructions

## Current Status
✅ LoginScreen.js has been updated to use PNG logo image
✅ Code is ready to display the logo

## Next Step: Add Your Logo Image

### Option 1: Use Your White Logo PNG
1. Save your white Oruva logo (the one you showed me) as:
   ```
   /home/anish/stable_coin/oruva-mobile/assets/images/oruva-logo-white.png
   ```

2. Make sure it's a PNG with transparent background

3. Restart Expo:
   ```bash
   cd /home/anish/stable_coin/oruva-mobile
   npm start
   ```

### Option 2: Rename Existing Image
If you want to use the existing Gemini generated image:
```bash
cd /home/anish/stable_coin/oruva-mobile/assets/images/
mv Gemini_Generated_Image_5w6sj75w6sj75w6s.png oruva-logo-white.png
```

## Image Specifications
- **File name**: `oruva-logo-white.png`
- **Recommended size**: 600x200 pixels (or similar ratio)
- **Format**: PNG with transparent background
- **Color**: White text/logo for visibility on blue gradient
- **Content**: Just the text "oruva" (without the "o:" symbol)

## What Was Changed
1. ✅ Removed the "o:" circle symbol code
2. ✅ Removed the text-based "oruva" rendering
3. ✅ Added Image component to display PNG logo
4. ✅ Updated styles for proper image sizing

## Current Code
```javascript
<Image 
    source={require('../assets/images/oruva-logo-white.png')}
    style={styles.logoImage}
    resizeMode="contain"
/>

// Style:
logoImage: {
    width: 250,
    height: 80,
    marginBottom: 8,
}
```

## Testing
After adding the logo file, you should see:
- White Oruva logo (text only) on blue gradient background
- "Bridging India to Web3 Finance" subtitle below
- "Flow EVM Testnet" badge at bottom

If the image doesn't appear, check:
1. File name is exactly: `oruva-logo-white.png`
2. File is in: `/assets/images/` folder
3. Expo cache cleared: `npm start -- --clear`
