# Add Oruva Logo Image

## Instructions

1. **Save the Oruva logo image** (the purple/blue banner with circle "o:" and "oruva" text) as:
   - File name: `oruva-logo.png`
   - Location: `/oruva-mobile/assets/images/oruva-logo.png`

2. **Image Specifications:**
   - Format: PNG with transparent background OR white text on transparent
   - Recommended size: 600x160 pixels (or similar aspect ratio)
   - The image should have white text/logo for visibility on blue gradient background

3. **Color Adjustment:**
   Since the logo in your image has purple background, you have two options:
   
   **Option A: Use transparent background version**
   - Export the logo with white "o:" circle and white "oruva" text
   - Transparent background
   - This will show nicely on the blue gradient
   
   **Option B: Keep as-is**
   - The current purple logo will display as a banner on the blue background
   - May need to adjust styling if needed

## After Adding the Image

Once you add `oruva-logo.png` to this folder:

1. The LoginScreen will automatically display it
2. The logo will appear at the top of the login screen
3. Below it will show "Bridging India to Web3 Finance"
4. The app will use PayTM blue theme (#00BAF2)

## Current Code

The LoginScreen.js is already updated to use:
```javascript
<Image 
    source={require('../assets/images/oruva-logo.png')}
    style={styles.logoImage}
    resizeMode="contain"
/>
```

## Quick Steps

```bash
# Navigate to the assets/images folder
cd oruva-mobile/assets/images/

# Add your oruva-logo.png file here
# Then restart the Expo server
expo start -c
```
