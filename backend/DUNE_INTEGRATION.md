# Dune Analytics Integration for Oruva

This document provides complete instructions for integrating Dune Analytics with the Oruva platform.

## 📊 Overview

Dune Analytics provides blockchain data analytics and visualization capabilities. This integration allows Oruva to:

- Display real-time protocol metrics
- Track user analytics
- Embed live charts in the mobile app
- Monitor TVL, transactions, and vault health

## ⚠️ Important Limitation

**Flow EVM Testnet (Chain ID: 545) is NOT currently supported by Dune Analytics.**

### Solutions:

1. **Request Flow EVM Support** (Recommended for long-term)
   - Contact Dune at https://dune.com/enterprise
   - Explain Oruva's use case and Flow's ecosystem

2. **Use Manual Data Upload** (Interim solution)
   - Use Dune's Table Upload API to index contract events
   - Upload data from Flow EVM to Dune tables
   - Create queries and dashboards from uploaded data

3. **Deploy to Supported Chain** (Alternative)
   - Consider Base, Optimism, or Polygon for mainnet
   - All have native Dune support

---

## 🚀 Setup Instructions

### Step 1: Create Dune Account

1. Sign up at https://dune.com/auth/register
2. Navigate to Settings → API Keys
3. Create a new API key
4. Save the API key securely

### Step 2: Configure Environment Variables

Add to `backend/.env`:

```env
# Dune Analytics Configuration
DUNE_API_KEY=your_dune_api_key_here
DUNE_NAMESPACE=oruva  # Your Dune username

# Dune Query IDs (create these in Dune first)
DUNE_QUERY_TVL=123456
DUNE_QUERY_ACTIVE_USERS=123457
DUNE_QUERY_DAILY_VOLUME=123458
DUNE_QUERY_USER_ANALYTICS=123459
```

### Step 3: Install Dependencies

```bash
cd backend
npm install axios  # Already installed, but verify
```

### Step 4: Initialize Dune Tables

Run the indexer to create tables and upload initial data:

```bash
# Run from backend directory
node services/duneIndexer.js 0

# Arguments:
# 0 = from block number (0 = from genesis)
```

This will:
- Create 3 tables in Dune: `vault_transactions`, `oinr_transfers`, `protocol_metrics`
- Index all contract events from Flow EVM
- Upload data to Dune

### Step 5: Set Up Cron Job for Regular Updates

Add to `backend/package.json`:

```json
{
  "scripts": {
    "dune:index": "node services/duneIndexer.js",
    "dune:index:latest": "node services/duneIndexer.js latest"
  }
}
```

Create a cron job (Linux/Mac):

```bash
# Edit crontab
crontab -e

# Add this line to run indexer every hour
0 * * * * cd /path/to/backend && npm run dune:index:latest >> /var/log/dune-indexer.log 2>&1
```

Or use a Node.js scheduler:

```javascript
// backend/jobs/duneScheduler.js
const cron = require('node-cron');
const DuneIndexer = require('../services/duneIndexer');

// Run every hour
cron.schedule('0 * * * *', async () => {
    console.log('🕐 Running Dune indexing job...');
    const indexer = new DuneIndexer();
    try {
        await indexer.runIndexing('latest');
        console.log('✅ Dune indexing complete');
    } catch (error) {
        console.error('❌ Dune indexing failed:', error);
    }
});
```

### Step 6: Add Analytics Routes to Server

Update `backend/server.js`:

```javascript
const analyticsRoutes = require('./routes/analytics');

// Add after other routes
app.use('/api/analytics', analyticsRoutes);
```

---

## 📝 Creating Dune Queries

### Step 1: Create Queries in Dune UI

Go to https://dune.com/queries and create these queries:

#### Query 1: Total Value Locked (TVL)

```sql
-- Query ID: Save this as DUNE_QUERY_TVL
SELECT 
    SUM(amount_usdc) as total_tvl_usdc,
    COUNT(DISTINCT user_address) as unique_depositors
FROM oruva.vault_transactions
WHERE event_type = 'deposit'
```

#### Query 2: Daily Active Users

```sql
-- Query ID: Save this as DUNE_QUERY_ACTIVE_USERS
SELECT 
    DATE_TRUNC('day', block_time) as date,
    COUNT(DISTINCT user_address) as daily_active_users,
    COUNT(*) as total_transactions
FROM oruva.vault_transactions
GROUP BY date
ORDER BY date DESC
LIMIT 30
```

#### Query 3: Daily Transaction Volume

```sql
-- Query ID: Save this as DUNE_QUERY_DAILY_VOLUME
SELECT 
    DATE_TRUNC('day', block_time) as date,
    SUM(CASE WHEN event_type = 'deposit' THEN amount_usdc ELSE 0 END) as deposit_volume,
    SUM(CASE WHEN event_type = 'borrow' THEN amount_oinr ELSE 0 END) as borrow_volume,
    COUNT(*) as transaction_count
FROM oruva.vault_transactions
GROUP BY date
ORDER BY date DESC
LIMIT 30
```

#### Query 4: User Analytics (Parameterized)

```sql
-- Query ID: Save this as DUNE_QUERY_USER_ANALYTICS
-- Add parameter: user_address (text)
SELECT 
    COUNT(*) as total_transactions,
    SUM(CASE WHEN event_type = 'deposit' THEN amount_usdc ELSE 0 END) as total_deposits,
    SUM(CASE WHEN event_type = 'borrow' THEN amount_oinr ELSE 0 END) as total_borrows,
    MIN(block_time) as first_transaction,
    MAX(block_time) as last_transaction
FROM oruva.vault_transactions
WHERE user_address = {{user_address}}
```

### Step 2: Create Visualizations

For each query:
1. Click "New Visualization"
2. Select chart type (Line, Bar, Counter, etc.)
3. Configure axes and formatting
4. Save visualization

### Step 3: Create Dashboard

1. Go to https://dune.com/create
2. Select "New Dashboard"
3. Name it "Oruva Protocol Analytics"
4. Add widgets from your saved queries
5. Arrange and save

---

## 🎨 Embedding Dashboards in Mobile App

### Option 1: Full Dashboard Embed

```javascript
// oruva-mobile/components/AnalyticsDashboard.js
import React from 'react';
import { WebView } from 'react-native-webview';
import { View, StyleSheet } from 'react-native';

export default function AnalyticsDashboard() {
    const dashboardUrl = 'https://dune.com/your-username/oruva-protocol-analytics';
    
    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: dashboardUrl }}
                style={styles.webview}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webview: {
        flex: 1,
    }
});
```

### Option 2: Individual Chart Embeds

```javascript
// oruva-mobile/components/TVLChart.js
import React from 'react';
import { WebView } from 'react-native-webview';
import { View, StyleSheet } from 'react-native';

export default function TVLChart() {
    // Get embed URL from backend
    const embedUrl = 'https://dune.com/embeds/123456/789012';
    
    return (
        <View style={styles.container}>
            <WebView
                source={{ uri: embedUrl }}
                style={styles.chart}
                scrollEnabled={false}
            />
        </View>
    );
}
```

### Option 3: Fetch Data via API and Display Custom Charts

```javascript
// oruva-mobile/screens/AnalyticsScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';

export default function AnalyticsScreen() {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMetrics();
    }, []);

    async function fetchMetrics() {
        try {
            const response = await axios.get(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/analytics/protocol`
            );
            setMetrics(response.data.data);
        } catch (error) {
            console.error('Error fetching metrics:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <ActivityIndicator size="large" color="#00509E" />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Protocol Analytics</Text>
            {/* Display metrics */}
        </View>
    );
}
```

---

## 🔌 API Endpoints

Once integrated, your backend will expose:

### Get Protocol Metrics
```bash
GET /api/analytics/protocol
Response: { tvl, activeUsers, dailyVolume }
```

### Get User Analytics
```bash
GET /api/analytics/user/0x123...
Response: { totalTransactions, totalDeposits, etc. }
```

### Get Embed URL
```bash
GET /api/analytics/embed/123456/789012?param1=value1
Response: { embedUrl, iframeHtml }
```

### Execute Query
```bash
POST /api/analytics/execute/123456
Body: { parameters: { user_address: "0x123..." } }
Response: { data: [...] }
```

---

## 📊 Sample Dashboard Widgets

### 1. Total Value Locked (TVL) Counter
- Query: TVL query
- Visualization: Counter
- Format: USD with 2 decimals

### 2. Daily Active Users Chart
- Query: Active users query
- Visualization: Line chart
- X-axis: Date
- Y-axis: Active users

### 3. Transaction Volume Chart
- Query: Daily volume query
- Visualization: Stacked bar chart
- X-axis: Date
- Y-axis: Volume (USD)
- Series: Deposits, Borrows

### 4. Top Users Table
- Query: Top users by volume
- Visualization: Table
- Columns: Address, Total Volume, Transaction Count

---

## 🔄 Data Flow

```
Flow EVM Testnet
       ↓
Contract Events (Deposited, Borrowed, etc.)
       ↓
Backend Indexer (duneIndexer.js)
       ↓
Dune Table Upload API
       ↓
Dune Tables (vault_transactions, oinr_transfers, etc.)
       ↓
Dune SQL Queries
       ↓
Dune Visualizations & Dashboard
       ↓
Mobile App (via embed or API)
```

---

## 🎯 Next Steps

1. **Create Dune Account** ✅
2. **Get API Key** ✅
3. **Run Initial Indexing** ⏳
4. **Create Queries in Dune UI** ⏳
5. **Build Dashboard** ⏳
6. **Integrate Embeds in Mobile App** ⏳
7. **Set Up Automated Indexing** ⏳
8. **Request Flow EVM Support from Dune** ⏳

---

## 📚 Additional Resources

- **Dune Docs**: https://docs.dune.com/
- **Dune Discord**: https://discord.gg/ErrzwBz
- **API Reference**: https://docs.dune.com/api-reference
- **SQL Guide**: https://docs.dune.com/query-engine

---

## 🐛 Troubleshooting

### Issue: "Table already exists"
This is normal on subsequent runs. The indexer will skip table creation.

### Issue: "Flow EVM data not showing"
Flow EVM is not natively supported. You must use the manual upload method via the indexer.

### Issue: "API rate limit exceeded"
Free tier has limits. Consider upgrading to paid plan or reduce query frequency.

### Issue: "Query timeout"
Increase `maxWaitTime` in `executeAndWait()` function or use `getLatestResults()` instead.

---

**Last Updated**: October 30, 2025  
**Maintained By**: Oruva Team
