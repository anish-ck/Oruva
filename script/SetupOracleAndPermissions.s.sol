// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";

interface IVaultEngine {
    function setVaultManager(address newManager) external;
}

interface IoINR {
    function transferOwnership(address newOwner) external;
}

interface ISimplePriceOracle {
    function setPrice(address token, uint256 priceInINR) external;
}

/// @title SetupOracleAndPermissions
/// @notice Final setup: Set USDC price and configure all permissions
contract SetupOracleAndPermissions is Script {
    // Deployed contract addresses
    address constant VAULT_ENGINE = 0x544759a30fD8fbf6E26b2184119F49921BF3c265;
    address constant OINR_TOKEN = 0x883Fa6BE70D11516dC3d9ED851278829a746840F;
    address constant VAULT_MANAGER = 0x22E1AE8A85e76e94683D668c0107b69eF18a62cA;
    address constant PRICE_ORACLE = 0xBE8b98f6b8ca2E9B643C1Bdd27f5c2A117b7dB4e;
    address constant MOCK_USDC = 0x6BF62E80CaF83847eD57233Ee119673F8fF7aB5c;

    function run() external {
        vm.startBroadcast();

        console.log("=== Final Setup: Oracle + Permissions ===\n");

        // 1. Set USDC price in oracle (1 USDC = 83 INR)
        console.log("Step 1: Setting USDC price in oracle...");
        console.log("  Oracle:", PRICE_ORACLE);
        console.log("  MockUSDC:", MOCK_USDC);
        console.log("  Price: 1 USDC = 83 INR");

        uint256 usdcPriceInINR = 83e18; // 83 INR with 18 decimals
        ISimplePriceOracle(PRICE_ORACLE).setPrice(MOCK_USDC, usdcPriceInINR);
        console.log("  [OK] Price set successfully");

        // 2. Set VaultManager as the vault manager
        console.log("\nStep 2: Setting VaultManager as vault manager...");
        console.log("  VaultEngine:", VAULT_ENGINE);
        console.log("  VaultManager:", VAULT_MANAGER);

        IVaultEngine(VAULT_ENGINE).setVaultManager(VAULT_MANAGER);
        console.log("  [OK] VaultManager set successfully");

        // 3. Transfer oINR ownership to VaultManager
        console.log("\nStep 3: Transferring oINR ownership to VaultManager...");
        console.log("  oINR Token:", OINR_TOKEN);
        console.log("  VaultManager:", VAULT_MANAGER);

        IoINR(OINR_TOKEN).transferOwnership(VAULT_MANAGER);
        console.log("  [OK] Ownership transferred");

        console.log("\n=== Setup Complete ===");
        console.log("[OK] USDC price: 83 INR");
        console.log("[OK] VaultManager can manage vaults");
        console.log("[OK] VaultManager can mint/burn oINR");
        console.log("\nSystem is ready for use!");
        console.log("\nExample:");
        console.log("- Deposit 1000 USDC (value: 83,000 INR)");
        console.log("- Max borrow: 55,333 oINR (at 150% ratio)");

        vm.stopBroadcast();
    }
}
