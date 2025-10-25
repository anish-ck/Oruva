// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {VaultEngine} from "../src/VaultEngine.sol";
import {oINR} from "../src/oINR.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {SimplePriceOracle} from "../src/SimplePriceOracle.sol";
import {VaultManager} from "../src/VaultManager.sol";
import {CollateralJoin} from "../src/CollateralJoin.sol";

/// @title CompleteDeployment
/// @notice Deploy all contracts and set up permissions in one script
contract CompleteDeployment is Script {
    function run() external {
        vm.startBroadcast();

        console.log("=== Starting Complete Deployment ===\n");

        // 1. Deploy MockUSDC
        console.log("1. Deploying MockUSDC...");
        MockUSDC usdc = new MockUSDC();
        console.log("   MockUSDC:", address(usdc));

        // 2. Deploy VaultEngine
        console.log("\n2. Deploying VaultEngine...");
        VaultEngine vaultEngine = new VaultEngine(msg.sender);
        console.log("   VaultEngine:", address(vaultEngine));

        // 3. Deploy oINR Token
        console.log("\n3. Deploying oINR Token...");
        oINR oinrToken = new oINR();
        console.log("   oINR:", address(oinrToken));

        // 4. Deploy CollateralJoin
        console.log("\n4. Deploying CollateralJoin...");
        CollateralJoin collateralJoin = new CollateralJoin(
            address(vaultEngine),
            address(usdc),
            bytes32("USDC")
        );
        console.log("   CollateralJoin:", address(collateralJoin));

        // 5. Deploy SimplePriceOracle
        console.log("\n5. Deploying SimplePriceOracle...");
        SimplePriceOracle oracle = new SimplePriceOracle();
        oracle.setPrice(address(usdc), 83 * 1e18); // 1 USDC = 83 INR
        console.log("   SimplePriceOracle:", address(oracle));
        console.log("   USDC Price set to:", 83, "INR");

        // 6. Deploy VaultManager
        console.log("\n6. Deploying VaultManager...");
        VaultManager vaultManager = new VaultManager(
            address(vaultEngine),
            address(collateralJoin),
            address(usdc),
            address(oinrToken)
        );
        console.log("   VaultManager:", address(vaultManager));

        // 7. Set Oracle in VaultManager
        console.log("\n7. Setting Oracle in VaultManager...");
        vaultManager.setPriceOracle(address(oracle));
        console.log("   [OK] Oracle set");

        // 8. Set VaultManager as manager in VaultEngine
        console.log("\n8. Setting VaultManager as manager in VaultEngine...");
        vaultEngine.setVaultManager(address(vaultManager));
        console.log("   [OK] VaultManager set");

        // 9. Transfer oINR ownership to VaultManager
        console.log("\n9. Transferring oINR ownership to VaultManager...");
        oinrToken.transferOwnership(address(vaultManager));
        console.log("   [OK] Ownership transferred");

        // Verification
        console.log("\n=== Verifying Setup ===");
        address engineManager = vaultEngine.vaultManager();
        address oinrOwner = oinrToken.owner();
        
        console.log("VaultEngine manager:", engineManager);
        console.log("oINR owner:", oinrOwner);
        
        require(engineManager == address(vaultManager), "VaultManager not set in engine");
        require(oinrOwner == address(vaultManager), "VaultManager not owner of oINR");

        console.log("\n=== Deployment Summary ===");
        console.log("MockUSDC:          ", address(usdc));
        console.log("VaultEngine:       ", address(vaultEngine));
        console.log("oINR:              ", address(oinrToken));
        console.log("CollateralJoin:    ", address(collateralJoin));
        console.log("SimplePriceOracle: ", address(oracle));
        console.log("VaultManager:      ", address(vaultManager));
        console.log("\n[OK] All contracts deployed and configured!");
        console.log("[OK] Ready to use!");

        vm.stopBroadcast();
    }
}
