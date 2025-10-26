#!/usr/bin/env node

require('dotenv').config();

console.log('\n🔍 Checking Cashfree Backend Configuration...\n');

const checks = {
    'Cashfree App ID': process.env.CASHFREE_APP_ID,
    'Cashfree Secret Key': process.env.CASHFREE_SECRET_KEY ? '✓ Set' : '✗ Missing',
    'Private Key': process.env.PRIVATE_KEY ? '✓ Set' : '✗ Missing',
    'Base URL': process.env.BASE_URL,
    'Environment': process.env.CASHFREE_ENVIRONMENT || 'sandbox',
};

let allGood = true;

for (const [key, value] of Object.entries(checks)) {
    if (!value || value === '✗ Missing') {
        console.log(`❌ ${key}: MISSING`);
        allGood = false;
    } else {
        if (key === 'Cashfree App ID') {
            console.log(`✅ ${key}: ${value}`);
        } else if (key === 'Base URL') {
            console.log(`✅ ${key}: ${value}`);
        } else {
            console.log(`✅ ${key}: ${value}`);
        }
    }
}

console.log('\n📋 Contract Addresses:');
console.log(`  VaultManager: ${process.env.VAULT_MANAGER_ADDRESS || '❌ Missing'}`);
console.log(`  oINR: ${process.env.OINR_ADDRESS || '❌ Missing'}`);
console.log(`  MockUSDC: ${process.env.MOCK_USDC_ADDRESS || '❌ Missing'}`);

if (!allGood) {
    console.log('\n⚠️  Please update backend/.env with missing values');
    console.log('\n📝 Required:');
    console.log('  - PRIVATE_KEY: Wallet private key that owns oINR contract');
    console.log('  - For webhook testing, update BASE_URL to your ngrok URL');
    process.exit(1);
}

console.log('\n✅ All configurations look good!');
console.log('\n📝 Next steps:');
console.log('  1. Start backend: npm run dev');
console.log('  2. Set up ngrok: ngrok http 3000');
console.log('  3. Update BASE_URL in .env with ngrok URL');
console.log('  4. Configure webhook in Cashfree dashboard');
console.log('\n');
