# UI/UX Design & Frontend Improvement Guide

Complete guide for frontend developers to enhance the Oruva mobile app with modern UI/UX practices.

## 📱 Quick Links
- **Setup Guide**: [SETUP.md](./SETUP.md)
- **Blockchain Integration**: [FRONTEND_GUIDE.md](./FRONTEND_GUIDE.md)
- **Expo Guide**: [EXPO_FRONTEND_GUIDE.md](./EXPO_FRONTEND_GUIDE.md)

## 🎨 Design System Implementation

### 1. Create Theme Constants
```javascript
// constants/theme.js
export const theme = {
  colors: {
    primary: '#6C63FF',      // Brand purple
    secondary: '#4CAF50',    // Success green
    accent: '#FF6584',       // Accent pink
    background: '#F5F7FA',   // Light background
    surface: '#FFFFFF',      // Card background
    text: {
      primary: '#1A1A1A',
      secondary: '#6B7280',
      disabled: '#9CA3AF',
    },
    border: '#E5E7EB',
    error: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
  },
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
  },
  borderRadius: {
    sm: 4, md: 8, lg: 12, xl: 16, full: 9999,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: 'bold', lineHeight: 40 },
    h2: { fontSize: 24, fontWeight: 'bold', lineHeight: 32 },
    h3: { fontSize: 20, fontWeight: '600', lineHeight: 28 },
    body: { fontSize: 16, fontWeight: 'normal', lineHeight: 24 },
  },
};

export const darkTheme = {
  ...theme,
  colors: {
    ...theme.colors,
    background: '#1A1A1A',
    surface: '#2D2D2D',
    text: {
      primary: '#FFFFFF',
      secondary: '#A0A0A0',
      disabled: '#666666',
    },
  },
};
```

## 📦 Recommended UI Libraries

### Option 1: React Native Paper (Recommended)
```bash
npm install react-native-paper react-native-vector-icons
```

**Why Paper?**
- Material Design components
- Excellent theming
- Works perfectly with Expo
- Accessible by default

**Quick Start:**
```javascript
import { Provider as PaperProvider, Button, Card } from 'react-native-paper';

export default function App() {
  return (
    <PaperProvider>
      <Card>
        <Card.Content>
          <Button mode="contained">Pay Now</Button>
        </Card.Content>
      </Card>
    </PaperProvider>
  );
}
```

### Option 2: NativeBase
```bash
npm install native-base react-native-svg
```

### Option 3: Tamagui (High Performance)
```bash
npm install tamagui @tamagui/core
```

## 🧩 Essential Components

### 1. Modern Button Component
```javascript
// components/Button.js
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

export function Button({ 
  title, onPress, variant = 'primary', loading, disabled, icon, fullWidth 
}) {
  return (
    <TouchableOpacity 
      style={[styles.button, styles[variant], fullWidth && styles.fullWidth]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#fff' : '#6C63FF'} />
      ) : (
        <>
          {icon}
          <Text style={styles.text}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}
```

### 2. Card Component
```javascript
// components/Card.js
export function Card({ children, elevated = true, onPress }) {
  const Component = onPress ? TouchableOpacity : View;
  return (
    <Component style={[styles.card, elevated && styles.shadow]}>
      {children}
    </Component>
  );
}
```

### 3. Input Component
```javascript
// components/Input.js
export function Input({ label, error, icon, ...props }) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.error]}>
        {icon}
        <TextInput style={styles.input} {...props} />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}
```

## 🎭 Navigation Setup

### Install React Navigation
```bash
npm install @react-navigation/native @react-navigation/bottom-tabs
expo install react-native-screens react-native-safe-area-context
```

### Implementation
```javascript
// navigation/AppNavigator.js
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const icons = {
              Home: 'home',
              AddINR: 'add-circle',
              Borrow: 'cash',
              Earn: 'trending-up',
              Profile: 'person',
            };
            const iconName = focused ? icons[route.name] : `${icons[route.name]}-outline`;
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeTab} />
        <Tab.Screen name="AddINR" component={AddINRTab} />
        <Tab.Screen name="Borrow" component={BorrowTab} />
        <Tab.Screen name="Earn" component={EarnTab} />
        <Tab.Screen name="Profile" component={ProfileTab} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

## 🎬 Animations

### Install Reanimated
```bash
expo install react-native-reanimated
```

### Animated Button Example
```javascript
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated';

function AnimatedButton({ onPress, children }) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => { scale.value = withSpring(0.95); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
    >
      <Animated.View style={animatedStyle}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
```

## 💫 Loading States

### Skeleton Loader
```javascript
// components/SkeletonLoader.js
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export function SkeletonLoader({ width = '100%', height = 20 }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 1000 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={[{ width, height, backgroundColor: '#E1E9EE' }, animatedStyle]} />;
}
```

## 🎨 Modern Screen Example

### Enhanced Add INR Screen
```javascript
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export function AddINRTab({ onBack }) {
  const [amount, setAmount] = useState('');
  const presetAmounts = [100, 500, 1000, 5000];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Add INR</Text>
          <Text style={styles.subtitle}>Top up instantly</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Amount Input */}
        <Card>
          <Text style={styles.label}>Enter Amount</Text>
          <View style={styles.amountInput}>
            <Text style={styles.currency}>₹</Text>
            <TextInput 
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              keyboardType="decimal-pad"
              style={styles.input}
            />
          </View>

          {/* Quick Select */}
          <View style={styles.presets}>
            {presetAmounts.map(preset => (
              <TouchableOpacity
                key={preset}
                style={[styles.preset, amount === String(preset) && styles.presetActive]}
                onPress={() => setAmount(String(preset))}
              >
                <Text>₹{preset}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Info Card */}
        <Card>
          <View style={styles.row}>
            <Text>You'll receive</Text>
            <Text style={styles.value}>{amount || '0'} oINR</Text>
          </View>
          <View style={styles.row}>
            <Text>Rate</Text>
            <Text style={styles.value}>1:1</Text>
          </View>
        </Card>

        {/* Payment Method */}
        <Card>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethod}>
            <Ionicons name="card-outline" size={24} />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentName}>UPI Payment</Text>
              <Text style={styles.paymentDesc}>Google Pay, PhonePe, Paytm</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          </View>
        </Card>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.footer}>
        <Button
          title={`Pay ₹${amount || '0'}`}
          onPress={handlePayment}
          disabled={!amount}
          fullWidth
        />
      </View>
    </View>
  );
}
```

## 🌓 Dark Mode

### Theme Context
```javascript
// contexts/ThemeContext.js
import React, { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme: () => setIsDark(!isDark) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

## 📊 Performance Tips

### List Optimization
```bash
npm install @shopify/flash-list
```

```javascript
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={transactions}
  renderItem={({ item }) => <TransactionCard item={item} />}
  estimatedItemSize={80}
/>
```

### Image Optimization
```bash
expo install expo-image
```

```javascript
import { Image } from 'expo-image';

<Image
  source={{ uri: url }}
  contentFit="cover"
  transition={200}
/>
```

## ♿ Accessibility

```javascript
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Pay 100 rupees"
  accessibilityHint="Opens payment gateway"
  accessibilityRole="button"
>
  <Text>Pay ₹100</Text>
</TouchableOpacity>
```

## 🧪 Testing

```bash
npm install --save-dev @testing-library/react-native
```

```javascript
import { render, fireEvent } from '@testing-library/react-native';

test('button calls onPress', () => {
  const onPress = jest.fn();
  const { getByText } = render(<Button title="Click" onPress={onPress} />);
  fireEvent.press(getByText('Click'));
  expect(onPress).toHaveBeenCalled();
});
```

## 🎯 Implementation Roadmap

### Week 1-2: Foundation
- [ ] Create design system (theme.js)
- [ ] Install React Native Paper
- [ ] Implement React Navigation
- [ ] Build base components (Button, Card, Input)

### Week 3-4: Components
- [ ] Create component library
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Add toast notifications

### Week 5-6: Screens
- [ ] Redesign all main screens
- [ ] Add animations
- [ ] Implement dark mode
- [ ] Improve accessibility

### Week 7-8: Polish
- [ ] Performance optimization
- [ ] Write tests
- [ ] Final design review
- [ ] Documentation

## 📚 Resources

### Design
- **Dribbble**: https://dribbble.com/
- **Mobbin**: https://mobbin.com/
- **Material Design**: https://m3.material.io/

### Development
- **React Native**: https://reactnative.dev/
- **Expo**: https://docs.expo.dev/
- **React Navigation**: https://reactnavigation.org/
- **React Native Paper**: https://callstack.github.io/react-native-paper/

### Icons & Assets
- **Ionicons**: https://ionic.io/ionicons
- **Lottie**: https://lottiefiles.com/
- **Unsplash**: https://unsplash.com/

---

**Ready to build beautiful UIs! 🎨**
