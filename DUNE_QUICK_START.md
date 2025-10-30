# Dune Analytics Integration - Quick Reference

## 🎯 What You Get

1. **Real-time Protocol Analytics Dashboard**
   - Total Value Locked (TVL)
   - Daily Active Users
   - Transaction Volume
   - Vault Health Metrics

2. **User Analytics**
   - Individual user transaction history
   - Deposit/borrow patterns
   - Wallet-specific metrics

3. **Embedded Visualizations**
   - Live charts in mobile app
   - Interactive dashboards
   - Real-time updates

4. **API Access**
   - Query data programmatically
   - Integrate into backend
   - Custom analytics

---

## ⚠️ Critical Information

**Flow EVM Testnet is NOT natively supported by Dune Analytics.**

You have 3 options:
1. ✅ **Manual Data Upload** (implemented) - Use Table Upload API
2. ⏳ **Request Flow EVM Support** - Contact Dune team
3. 🔄 **Deploy to Supported Chain** - Base, Optimism, Polygon, etc.

---

## 📦 Files Created

1. `backend/services/duneIndexer.js` - Indexes contract events and uploads to Dune
2. `backend/services/duneService.js` - API client for Dune queries
3. `backend/routes/analytics.js` - Express routes for analytics endpoints
4. `backend/DUNE_INTEGRATION.md` - Complete integration guide

---

## 🚀 Quick Start (5 Steps)

### Step 1: Get Dune API Key
```bash
# 1. Sign up: https://dune.com/auth/register
# 2. Go to Settings → API Keys
# 3. Create new API key
# 4. Copy the key
```

### Step 2: Add to .env
```env
DUNE_API_KEY=your_api_key_here
DUNE_NAMESPACE=oruva
```

### Step 3: Run Initial Indexing
```bash
cd backend
node services/duneIndexer.js 0
```

### Step 4: Create Queries in Dune UI
- Go to https://dune.com/queries
- Create 4 queries (see DUNE_INTEGRATION.md)
- Save query IDs to .env

### Step 5: Add Routes to Server
```javascript
// backend/server.js
const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);
```

---

## 📊 Sample SQL Queries for Dune

### TVL Query
```sql
SELECT SUM(amount_usdc) as tvl
FROM oruva.vault_transactions
WHERE event_type = 'deposit'
```

### Daily Active Users
```sql
SELECT 
    DATE_TRUNC('day', block_time) as date,
    COUNT(DISTINCT user_address) as users
FROM oruva.vault_transactions
GROUP BY date
ORDER BY date DESC
```

### User Analytics (with parameter)
```sql
SELECT 
    COUNT(*) as transactions,
    SUM(amount_usdc) as total_volume
FROM oruva.vault_transactions
WHERE user_address = {{user_address}}
```

---

## 🔌 API Endpoints (After Integration)

```bash
# Get protocol metrics
GET /api/analytics/protocol

# Get user analytics
GET /api/analytics/user/0x123...

# Get embed URL
GET /api/analytics/embed/123456/789012

# Execute query
POST /api/analytics/execute/123456
```

---

## 📱 Mobile App Integration

### Option 1: Embed Dashboard
```javascript
import { WebView } from 'react-native-webview';

<WebView source={{ uri: 'https://dune.com/your-username/oruva-analytics' }} />
```

### Option 2: Fetch Data via API
```javascript
const response = await axios.get(
    `${BACKEND_URL}/api/analytics/protocol`
);
```

---

## 🔄 Automation

### Set Up Hourly Indexing

**Option A: Cron Job**
```bash
# Add to crontab
0 * * * * cd /path/to/backend && node services/duneIndexer.js latest
```

**Option B: Node.js Scheduler**
```javascript
const cron = require('node-cron');
const DuneIndexer = require('./services/duneIndexer');

cron.schedule('0 * * * *', async () => {
    const indexer = new DuneIndexer();
    await indexer.runIndexing('latest');
});
```

---

## 🎨 Dashboard Widgets to Create

1. **TVL Counter** - Show total value locked
2. **Daily Users Line Chart** - 30-day trend
3. **Volume Bar Chart** - Deposits vs Borrows
4. **Top Users Table** - Leaderboard
5. **Collateralization Gauge** - Average ratio

---

## 📚 Resources

- **Full Guide**: `backend/DUNE_INTEGRATION.md`
- **Dune Docs**: https://docs.dune.com/
- **API Reference**: https://docs.dune.com/api-reference
- **Discord Support**: https://discord.gg/ErrzwBz

---

## ✅ Checklist

- [ ] Create Dune account
- [ ] Get API key
- [ ] Add to .env
- [ ] Run initial indexing
- [ ] Create SQL queries in Dune
- [ ] Save query IDs
- [ ] Create visualizations
- [ ] Build dashboard
- [ ] Add routes to server
- [ ] Integrate in mobile app
- [ ] Set up automated indexing
- [ ] Request Flow EVM support from Dune

---

## 💡 Pro Tips

1. **Cache Results**: Use `getLatestResults()` instead of `executeAndWait()` for faster responses
2. **Parameterized Queries**: Make queries flexible with parameters
3. **Embed iframes**: Use `?display=iframe` for better embedding
4. **Schedule Queries**: Set up automatic refresh in Dune dashboard
5. **Free Tier Limits**: Be mindful of API rate limits

---

**Need Help?** Check `backend/DUNE_INTEGRATION.md` for detailed instructions.
