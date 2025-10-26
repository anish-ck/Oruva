const { ethers } = require('ethers');

// The error data from the revert
const errorData = '0xfb8f41b2000000000000000000000000347fe2d1a1789aedd2cb7effc86377b8d208a29500000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000126253';

console.log('\n🔍 Decoding error data:\n');
console.log('Raw data:', errorData);
console.log('');

// The error signature (first 4 bytes)
const errorSig = errorData.substring(0, 10);
console.log('Error signature:', errorSig);

// Try to decode with common Ownable errors
const ownableErrors = new ethers.utils.Interface([
    'error OwnableUnauthorizedAccount(address account)',
    'error OwnableInvalidOwner(address owner)'
]);

try {
    const decoded = ownableErrors.parseError(errorData);
    console.log('✅ Decoded error:', decoded.name);
    console.log('Arguments:', decoded.args);
} catch (err) {
    console.log('❌ Not an Ownable error');

    // Try to manually parse the data
    console.log('\nManual decode:');
    const params = errorData.substring(10); // Remove selector
    const chunks = [];
    for (let i = 0; i < params.length; i += 64) {
        chunks.push(params.substr(i, 64));
    }

    console.log('Param 1 (address):', '0x' + chunks[0].substring(24));
    if (chunks[1]) {
        console.log('Param 2:', '0x' + chunks[1]);
    }
    if (chunks[2]) {
        console.log('Param 3:', ethers.BigNumber.from('0x' + chunks[2]).toString());
    }
}

// Calculate the error selector manually
const errorSigString = 'OwnableUnauthorizedAccount(address)';
const calculatedSig = ethers.utils.id(errorSigString).substring(0, 10);
console.log('\nCalculated OwnableUnauthorizedAccount selector:', calculatedSig);
console.log('Match:', calculatedSig === errorSig ? '✅' : '❌');
