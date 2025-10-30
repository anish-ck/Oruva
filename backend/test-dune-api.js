require('dotenv').config();
const axios = require('axios');

/**
 * Test Dune API Key validity
 */

async function testDuneAPI() {
    const apiKey = process.env.DUNE_API_KEY;
    const namespace = process.env.DUNE_NAMESPACE;

    console.log('🔑 Testing Dune API Key...\n');
    console.log(`API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'NOT SET'}`);
    console.log(`Namespace: ${namespace || 'NOT SET'}\n`);

    if (!apiKey) {
        console.error('❌ DUNE_API_KEY not set in .env file');
        process.exit(1);
    }

    // Test 1: Try to list queries (simple read operation)
    console.log('Test 1: Checking API key validity...');
    try {
        const response = await axios.get(
            'https://api.dune.com/api/v1/query/1/results',
            {
                headers: {
                    'X-DUNE-API-KEY': apiKey
                }
            }
        );
        console.log('✅ API Key is valid!\n');
    } catch (error) {
        if (error.response?.status === 401) {
            console.error('❌ API Key is INVALID');
            console.error('   Error:', error.response.data);
            console.error('\n💡 How to fix:');
            console.error('   1. Go to https://dune.com/settings/api');
            console.error('   2. Create a new API key (or verify existing one)');
            console.error('   3. Update DUNE_API_KEY in backend/.env');
            console.error('   4. Make sure you have an active Dune account\n');
            process.exit(1);
        } else if (error.response?.status === 404) {
            console.log('✅ API Key is valid! (Query not found is expected)\n');
        } else {
            console.error('⚠️  Unexpected error:', error.response?.data || error.message);
        }
    }

    // Test 2: Try table upload (requires paid plan)
    console.log('Test 2: Checking table upload permissions...');
    try {
        const response = await axios.post(
            'https://api.dune.com/api/v1/table/create',
            {
                namespace: namespace,
                table_name: 'test_connection',
                schema: [
                    { name: 'test_field', type: 'varchar' }
                ],
                description: 'Test table for API connection',
                is_private: true
            },
            {
                headers: {
                    'X-DUNE-API-KEY': apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );
        console.log('✅ Table upload enabled!\n');

        // Clean up test table
        console.log('Cleaning up test table...');
        // Note: Dune doesn't have a delete endpoint via API, you'll need to delete manually

    } catch (error) {
        if (error.response?.status === 401) {
            console.error('❌ API Key invalid for table uploads');
            console.error('   Error:', error.response.data);
        } else if (error.response?.status === 403) {
            console.error('❌ Table upload NOT enabled (requires paid plan)');
            console.error('   Error:', error.response.data);
            console.error('\n💡 How to fix:');
            console.error('   Table Upload requires a Dune Plus or higher plan');
            console.error('   Upgrade at: https://dune.com/pricing\n');
        } else if (error.response?.status === 409) {
            console.log('✅ Table upload enabled! (Table exists is OK)\n');
        } else {
            console.error('⚠️  Error:', error.response?.data || error.message);
        }
    }

    console.log('\n📋 Summary:');
    console.log('═══════════════════════════════════════════════════');
    console.log('API Key Status: Check results above');
    console.log('Namespace:', namespace);
    console.log('\nNext Steps:');
    console.log('1. If API key is invalid, regenerate at https://dune.com/settings/api');
    console.log('2. If table upload is disabled, upgrade plan at https://dune.com/pricing');
    console.log('3. For Flow EVM support, contact Dune at https://dune.com/enterprise');
    console.log('═══════════════════════════════════════════════════\n');
}

testDuneAPI().catch(console.error);
