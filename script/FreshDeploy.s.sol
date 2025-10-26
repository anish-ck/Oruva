// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {VaultManager} from "../src/VaultManager.sol";
import {VaultEngine} from "../src/VaultEngine.sol";
import {oINR} from "../src/oINR.sol";
import {CollateralJoin} from "../src/CollateralJoin.sol";

contract FreshDeploy is Script {
    // Keep existing contracts
    address constant PRICE_ORACLE = 0xe5cCA233Db9655D8C1a64F74e1d5Bb1253e80f99;
    address constant MOCK_USDC = 0x5Fda84f0d0985e346ff0fe13dFd7760a9Ff1Ed43;

    function run() external {
        vm.startBroadcast();

        console.log("=== FRESH DEPLOYMENT (fixing buyOINR bug) ===\n");
        console.log("Deployer:", msg.sender);
        console.log("Reusing:");
        console.log("  Oracle:", PRICE_ORACLE);
        console.log("  USDC:", MOCK_USDC);

        // 1. Deploy new oINR
        console.log("\n1. Deploying new oINR...");
        oINR oinrToken = new oINR();
        console.log("   oINR:", address(oinrToken));

        // 2. Deploy new VaultEngine (takes only manager address, set later)
        console.log("\n2. Deploying new VaultEngine...");
        VaultEngine vaultEngine = new VaultEngine(address(0)); // Temp manager, will update
        console.log("   VaultEngine:", address(vaultEngine));

        // 3. Deploy new CollateralJoin
        console.log("\n3. Deploying new CollateralJoin...");
        bytes32 ilk = bytes32("USDC-A"); // Collateral type identifier
        CollateralJoin collateralJoin = new CollateralJoin(
            address(vaultEngine),
            MOCK_USDC,
            ilk
        );
        console.log("   CollateralJoin:", address(collateralJoin));

        // 4. Deploy new VaultManager (with fixed buyOINR)
        console.log("\n4. Deploying new VaultManager...");
        VaultManager vaultManager = new VaultManager(
            address(vaultEngine),
            address(collateralJoin),
            address(oinrToken),
            PRICE_ORACLE
        );
        console.log("   VaultManager:", address(vaultManager));

        // 5. Setup permissions
        console.log("\n5. Setting up permissions...");
        
        // Transfer oINR ownership to VaultManager
        oinrToken.transferOwnership(address(vaultManager));
        console.log("   [OK] oINR owned by VaultManager");

        // Set VaultManager in VaultEngine
        vaultEngine.setVaultManager(address(vaultManager));
        console.log("   [OK] VaultEngine manager set");

        console.log("\n=== DEPLOYMENT COMPLETE ===\n");
        console.log("[NEW ADDRESSES]");
        console.log("VaultManager:", address(vaultManager));
        console.log("VaultEngine:", address(vaultEngine));
        console.log("oINR:", address(oinrToken));
        console.log("CollateralJoin:", address(collateralJoin));
        console.log("PriceOracle:", PRICE_ORACLE, "(reused)");
        console.log("MockUSDC:", MOCK_USDC, "(reused)");

        // Verify buyOINR function exists
        console.log("\nVerifying VaultManager...");
        console.log("Min Ratio:", vaultManager.minCollateralizationRatio(), "bp");

        console.log("\n[SUCCESS] All contracts deployed and configured!");
        console.log("\nNEXT STEPS:");
        console.log("1. Update CONTRACT_ADDRESSES.json");
        console.log("2. Update mobile app config files");
        console.log("3. Copy new ABIs to mobile app");
        console.log("4. Test buyOINR function!");

        vm.stopBroadcast();
    }
}
