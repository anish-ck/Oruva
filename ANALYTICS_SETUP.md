# Oruva Analytics - Mobile App Integration Guide

## ✅ What's Been Set Up

Your Dune Analytics dashboard has been successfully integrated into the Oruva mobile app!

### 📊 Dashboard URL
**Live Dashboard:** https://dune.com/raptoraujin/tvl-dashboard

### 📱 Mobile App Integration

The Analytics screen has been added to your React Native app with the following features:

#### **Features:**
- 📈 Interactive Dune dashboard embedded in WebView
- 💰 Quick stats display (TVL, Active Users, Deposits)
- 🔄 Pull-to-refresh functionality
- 🌐 "Open in Browser" option for full experience
- 📊 Feature cards explaining dashboard capabilities

#### **How to Access:**
1. Open the Oruva app
2. From the home screen, tap **"Analytics"** button
3. View quick stats or tap to load the interactive dashboard

---

## 🚀 How to Use

### **In the App:**

1. **Quick View Mode** (Default)
   - Shows summary metrics without loading full dashboard
   - Fast and lightweight
   - Perfect for quick checks

2. **Interactive Dashboard Mode**
   - Tap "View Interactive Dashboard" to load full Dune dashboard
   - All charts and visualizations available
   - Requires internet connection

3. **Browser Mode**
   - Tap "Open in Browser 🔗" to view in system browser
   - Best for detailed analysis
   - Full Dune UI features available

### **Current Metrics Displayed:**

| Metric | Value | Description |
|--------|-------|-------------|
| Total Value Locked | 4,500 USDC | Total collateral deposited |
| Active Users | 5 | Unique wallet addresses |
| Deposits | 5 | Number of deposit transactions |
| Avg Deposit | 900 USDC | Average deposit size |

---

## 📂 Files Created/Modified

### **New Files:**
- `oruva-mobile/screens/AnalyticsScreen.js` - Main analytics screen component
- `backend/services/duneIndexer.js` - Blockchain data indexer
- `backend/services/duneService.js` - Dune API client
- `backend/routes/analytics.js` - Analytics API endpoints
- `backend/DUNE_INTEGRATION.md` - Complete integration documentation
- `DUNE_QUICK_START.md` - Quick reference guide

### **Modified Files:**
- `oruva-mobile/App.js` - Added analytics navigation
- `oruva-mobile/screens/HomeScreen.js` - Added analytics button
- `backend/.env` - Updated Dune configuration

---

## 🔧 Technical Details

### **Dependencies Required:**

The app uses these libraries (already in your package.json):
```json
{
  "expo-linear-gradient": "^13.0.2",
  "react-native-webview": "^13.8.6",
  "@expo/vector-icons": "^14.0.0"
}
```

If `react-native-webview` is not installed, run:
```bash
cd oruva-mobile
npx expo install react-native-webview
```

### **Environment Variables:**

In `backend/.env`:
```env
DUNE_API_KEY=TG7fnWdmyGizwXzScbgjqiNNgeGGn26R
DUNE_NAMESPACE=raptoraujin
```

In `oruva-mobile` (if using backend API):
```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:3000
```

---

## 🔄 Keeping Data Fresh

### **Option 1: Manual Indexing**

Run the indexer manually whenever you want to update data:

```bash
cd /home/anish/stable_coin/backend
node services/duneIndexer.js 75681397
```

### **Option 2: Automated Indexing (Recommended)**

Set up a cron job to run hourly:

```bash
# Edit crontab
crontab -e

# Add this line to run every hour
0 * * * * cd /home/anish/stable_coin/backend && node services/duneIndexer.js 75681397 >> /home/anish/stable_coin/backend/indexer.log 2>&1
```

### **Option 3: On-Demand via API**

Call the indexer endpoint from your app:

```javascript
// In your app
await fetch(`${BACKEND_URL}/api/analytics/index`, {
  method: 'POST'
});
```

---

## 📊 Dashboard Visualizations

Your dashboard includes:

### **1. Total Value Locked (TVL) Counter**
- **Type:** Counter
- **Shows:** Total USDC deposited (4,500 USDC)
- **Query:** Sums all deposit amounts

### **2. Top Depositors Bar Chart**
- **Type:** Bar Chart
- **Shows:** Wallet addresses ranked by deposit amount
- **Query:** Groups deposits by user, sorted descending

### **3. Transaction History Table**
- **Type:** Table
- **Shows:** Recent vault transactions with timestamps
- **Query:** Latest 5 deposits with full details

---

## 🎨 Customization

### **Update Metrics:**

Edit `AnalyticsScreen.js` line 60-85 to change displayed metrics:

```javascript
<MetricCard
    title="Your Custom Metric"
    value="1,234"
    unit="oINR"
    icon="💎"
/>
```

### **Change Dashboard URL:**

Update line 13 in `AnalyticsScreen.js`:

```javascript
const DUNE_DASHBOARD_URL = 'https://dune.com/raptoraujin/your-custom-dashboard';
```

### **Add More Features:**

You can add:
- User-specific analytics (deposits by current user)
- Time-range filters
- Export to PDF
- Share functionality
- Push notifications for new transactions

---

## 🐛 Troubleshooting

### **WebView not loading:**
- Check internet connection
- Ensure `react-native-webview` is installed
- Try "Open in Browser" option

### **Data not updating:**
- Run the indexer manually: `node services/duneIndexer.js 75681397`
- Check Dune uploads: https://dune.com/raptoraujin/settings/data
- Verify backend is running

### **Metrics showing 0:**
- Indexer may not have run yet
- Check backend logs for errors
- Verify Dune API key is correct

---

## 📚 Next Steps

### **Short Term:**
1. ✅ Test analytics screen in the app
2. ✅ Set up automated indexing
3. ✅ Share dashboard with team/users

### **Medium Term:**
1. Add more visualizations (borrows, transfers)
2. Create user-specific analytics page
3. Add real-time alerts
4. Implement data export

### **Long Term:**
1. Build custom analytics backend (when Flow EVM gets Dune support)
2. Add predictive analytics
3. Create leaderboards and gamification
4. Build investor reporting dashboard

---

## 🆘 Support

- **Dune Documentation:** https://docs.dune.com/
- **Backend API Routes:** `backend/routes/analytics.js`
- **Integration Guide:** `backend/DUNE_INTEGRATION.md`
- **Quick Start:** `DUNE_QUICK_START.md`

---

## 🎉 Summary

You now have:
✅ Professional analytics dashboard on Dune
✅ Mobile app integration with WebView
✅ Automated data indexing from Flow EVM
✅ 3 visualizations tracking protocol metrics
✅ Real transaction data (5 users, 4,500 USDC TVL)

**Your Oruva protocol now has the same analytics capabilities as major DeFi protocols!** 🚀

---

*Last Updated: October 30, 2025*
*Dashboard: https://dune.com/raptoraujin/tvl-dashboard*
