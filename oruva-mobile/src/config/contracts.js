// Contract addresses on Flow EVM Testnet
export const CONTRACTS = {
    vaultManager: '0x347fe2d1A1789AeDd2cB7eFFC86377b8D208A295',
    vaultEngine: '0x9Bc8A5BF079dd86F7873C44c4D1FF9CC88dDE35e',
    oinr: '0x5E6883b7b37A02381325234ECbf13f0729584aD0',
    mockUSDC: '0x5Fda84f0d0985e346ff0fe13dFd7760a9Ff1Ed43',
    priceOracle: '0xe5cCA233Db9655D8C1a64F74e1d5Bb1253e80f99',
    collateralJoin: '0xf7d4e2ab21e0a74f342688209F271a188B807Dc6',
};

// Import ABIs
export const ABIS = {
    vaultManager: require('../abis/VaultManager.json').abi,
    mockUSDC: require('../abis/MockUSDC.json').abi,
    oinr: require('../abis/oINR.json').abi,
};
