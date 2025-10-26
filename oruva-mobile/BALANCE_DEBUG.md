# 🔍 Balance Not Updating - Troubleshooting Guide

## What I Just Added:

1. **🔄 Refresh Button** - Manual refresh button in the header (green circle icon)
2. **📊 Better Logging** - Check your Expo logs to see actual balances
3. **✅ Success Messages** - Now shows "Check your oINR balance above"

## 🐛 Common Reasons Balance Doesn't Update:

### 1. **Transaction Failed** (Most Common)
**Symptoms:**
- No error message shown
- Operation seems to complete
- Balance stays the same

**Check:**
- Look at Expo console logs
- Check if transaction actually succeeded
- Look for error messages in red

**Solution:**
```
1. Check you have enough FLOW for gas
2. Wait for transaction to fully confirm
3. Tap the 🔄 refresh button
```

---

### 2. **Wrong Contract Address**
**Check if using correct oINR contract:**
```
Expected: 0x5E6883b7b37A02381325234ECbf13f0729584aD0
```

**To verify:**
- Check `src/config/contracts.js`
- Should match CONTRACT_ADDRESSES.json

---

### 3. **Transaction Pending**
**Symptoms:**
- Transaction sent but not confirmed
- Balance updates slowly

**Solution:**
```
1. Wait 10-30 seconds
2. Tap 🔄 refresh button
3. Check blockchain explorer if available
```

---

### 4. **Cache Issue**
**Solution:**
```
1. Force close Expo app
2. Reopen and reconnect wallet
3. Check balances again
```

---

## 🔧 Step-by-Step Debug Process:

### Step 1: Check Expo Console Logs
Look for these messages after borrow/buy:
```
Loading data for address: 0x...
Balances: { usdc: '500.00', oinr: '100.00' }
```

### Step 2: Verify Transaction Succeeded
After operation, you should see:
```
✅ "Success" alert
✅ No error in console
✅ Transaction confirmed message
```

### Step 3: Manual Refresh
```
1. Tap the green 🔄 button in header
2. Wait for "Balances refreshed!" message
3. Check if numbers updated
```

### Step 4: Check Actual Balance on Contract
Let me create a direct balance checker...

---

## 🧪 Testing Steps:

### Test 1: Buy oINR
```
1. Note current balances:
   USDC: ___
   oINR: ___

2. Mint 1000 USDC
3. Wait for success message
4. Tap 🔄 refresh
5. USDC should be 1000

6. Buy 100 oINR
7. Wait for success message
8. Tap 🔄 refresh
9. Check:
   USDC: Should decrease (~998.80)
   oINR: Should be 100
```

### Test 2: Borrow oINR
```
1. Note current balances

2. Deposit 500 USDC
3. Tap 🔄 refresh
4. USDC wallet should decrease
5. Collateral should increase

6. Borrow 200 oINR
7. Tap 🔄 refresh
8. oINR balance should increase by 200
9. Debt should show 200
```

---

## 📱 What to Look For:

### In Expo Console (Terminal):
```javascript
// Good signs:
Loading data for address: 0x...
Vault info: { collateral: '500.00', debt: '200.00', ... }
Balances: { usdc: '500.00', oinr: '200.00' }

// Bad signs:
❌ Error: ...
❌ Failed to load data
❌ undefined
```

### In App Screen:
```
💰 Your Balances
USDC: [Should change after mint/buy/deposit]
oINR: [Should change after buy/borrow]

📊 Vault Status
Collateral: [Should change after deposit]
Debt: [Should change after borrow]
```

---

## 🎯 Quick Fix Checklist:

- [ ] Have FLOW for gas fees? (Get from faucet.flow.com)
- [ ] Wait for "Success" message after each operation?
- [ ] Tried tapping 🔄 refresh button?
- [ ] Check Expo console for actual balance values?
- [ ] Transaction actually succeeded (no red errors)?
- [ ] Using correct wallet address?

---

## 🔍 Debug Commands:

### Check Balance Directly
Open Expo console and look for:
```
Balances: { usdc: 'X.XX', oinr: 'Y.YY' }
```

This is the REAL balance from the blockchain!

If these numbers are correct but UI shows wrong values:
- It's a display issue
- Tap refresh
- Restart app

If these numbers are WRONG (not updating):
- Transaction failed
- Wrong contract
- Need to wait for confirmation

---

## 💡 Pro Tips:

1. **Always tap 🔄 after operations** - Forces fresh data from blockchain
2. **Wait 5-10 seconds** - Blockchain needs time to confirm
3. **Check console logs** - They show the truth!
4. **One operation at a time** - Don't spam buttons
5. **Verify success alerts** - "Success" means it worked

---

## 🆘 Still Not Working?

Share these details:
1. Expo console logs (especially "Balances:" line)
2. What operation you did (buy/borrow/deposit)
3. Any error messages
4. Screenshot of balance section

I'll help debug further!
