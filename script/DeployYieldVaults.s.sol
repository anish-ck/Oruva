// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/YieldVault.sol";

contract DeployYieldVaults is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        // Contract addresses from existing deployment
        address usdcAddress = 0x5Fda84f0d0985e346ff0fe13dFd7760a9Ff1Ed43; // MockUSDC
        address oinrAddress = 0x13d855720E87eC59BFC4E27851027f5D8D8E9Eae; // oINR
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy USDC Yield Vault
        YieldVault usdcVault = new YieldVault(usdcAddress);
        console.log("USDC Yield Vault deployed at:", address(usdcVault));
        
        // Deploy oINR Yield Vault  
        YieldVault oinrVault = new YieldVault(oinrAddress);
        console.log("oINR Yield Vault deployed at:", address(oinrVault));
        
        vm.stopBroadcast();
        
        // Log deployment info
        console.log("\n=== Yield Vaults Deployed ===");
        console.log("USDC Vault:", address(usdcVault));
        console.log("oINR Vault:", address(oinrVault));
        console.log("Default APY: 5.00%");
        console.log("\nNext steps:");
        console.log("1. Fund vaults with tokens for yield distribution");
        console.log("2. Update CONTRACT_ADDRESSES.json");
        console.log("3. Add to mobile app");
    }
}
