// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/MockUSDC.sol";
import "../src/oINR.sol";
import "../src/YieldVault.sol";

interface IVaultManager {
    function buyOINR(uint256 oinrAmount) external;  // Takes oINR amount, not USDC
}

contract FundYieldVaults is Script {
    // Contract addresses
    address constant USDC = 0x5Fda84f0d0985e346ff0fe13dFd7760a9Ff1Ed43;
    address constant OINR = 0x13d855720E87eC59BFC4E27851027f5D8D8E9Eae;
    address constant VAULT_MANAGER = 0x5F1311808ED97661D5b31F4C67637D8952a54cc0;
    address constant USDC_VAULT = 0x0009f72e3c176163037807f6365695DCeED2a09B;
    address constant OINR_VAULT = 0x5923227b1E40fEbDA88B5231a573069F9669Fb9a;
    
    // Funding amounts (enough for 1 year of 5% APY on 100k deposits)
    uint256 constant USDC_FUNDING = 10000e6; // 10,000 USDC (6 decimals)
    uint256 constant OINR_FUNDING = 100000e18; // 100,000 oINR (18 decimals)
    uint256 constant USDC_FOR_OINR = 2000e6; // 2,000 USDC worth
    uint256 constant OINR_TO_BUY = 166000e18; // Buy 166,000 oINR with 2000 USDC
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Get token instances
        MockUSDC usdc = MockUSDC(USDC);
        oINR oinr = oINR(OINR);
        IVaultManager vaultManager = IVaultManager(VAULT_MANAGER);
        YieldVault usdcVault = YieldVault(USDC_VAULT);
        YieldVault oinrVault = YieldVault(OINR_VAULT);
        
        // Check current balances
        uint256 usdcBalance = usdc.balanceOf(deployer);
        uint256 oinrBalance = oinr.balanceOf(deployer);
        
        console.log("=== Current Balances ===");
        console.log("USDC:", usdcBalance / 1e6);
        console.log("oINR:", oinrBalance / 1e18);
        
        // Mint USDC if needed (for both vaults + buying oINR)
        uint256 totalUSDCNeeded = USDC_FUNDING + USDC_FOR_OINR;
        if (usdcBalance < totalUSDCNeeded) {
            console.log("\nMinting USDC...");
            usdc.mint(deployer, totalUSDCNeeded);
        }
        
        // Buy oINR if needed
        if (oinrBalance < OINR_FUNDING) {
            console.log("Buying oINR with USDC...");
            // buyOINR takes oINR amount and calculates required USDC
            usdc.approve(VAULT_MANAGER, type(uint256).max);
            vaultManager.buyOINR(OINR_TO_BUY);
            oinrBalance = oinr.balanceOf(deployer);
            console.log("oINR received:", oinrBalance / 1e18);
        }
        
        // Approve vaults
        console.log("\n=== Approving Vaults ===");
        usdc.approve(USDC_VAULT, USDC_FUNDING);
        oinr.approve(OINR_VAULT, OINR_FUNDING);
        
        // Fund vaults
        console.log("\n=== Funding Vaults ===");
        usdcVault.fundVault(USDC_FUNDING);
        console.log("USDC Vault funded with:", USDC_FUNDING / 1e6, "USDC");
        
        oinrVault.fundVault(OINR_FUNDING);
        console.log("oINR Vault funded with:", OINR_FUNDING / 1e18, "oINR");
        
        // Check vault balances
        console.log("\n=== Vault Balances ===");
        console.log("USDC Vault:", usdc.balanceOf(USDC_VAULT) / 1e6, "USDC");
        console.log("oINR Vault:", oinr.balanceOf(OINR_VAULT) / 1e18, "oINR");
        
        vm.stopBroadcast();
        
        console.log("\n=== Vaults Ready ===");
        console.log("Users can now deposit and earn 5% APY!");
    }
}
