// Contract addresses on Flow EVM Testnet
export const CONTRACTS = {
    vaultManager: '0x5F1311808ED97661D5b31F4C67637D8952a54cc0',
    vaultEngine: '0xa9255087b8d1B75456eA5d4fc272B884E7A7AE8a',
    oinr: '0x13d855720E87eC59BFC4E27851027f5D8D8E9Eae',
    mockUSDC: '0x5Fda84f0d0985e346ff0fe13dFd7760a9Ff1Ed43',
    priceOracle: '0xe5cCA233Db9655D8C1a64F74e1d5Bb1253e80f99',
    collateralJoin: '0x0b54a6bf84108d7C8d5a2296Df4a2264b1f7Fd66',
    usdcYieldVault: '0x0009f72e3c176163037807f6365695DCeED2a09B',
    oinrYieldVault: '0x5923227b1E40fEbDA88B5231a573069F9669Fb9a',
};

// Import ABIs
export const ABIS = {
    vaultManager: require('../abis/VaultManager.json').abi,
    mockUSDC: require('../abis/MockUSDC.json').abi,
    oinr: require('../abis/oINR.json').abi,
};
