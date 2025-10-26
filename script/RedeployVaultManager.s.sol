// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {VaultManager} from "../src/VaultManager.sol";
import {oINR} from "../src/oINR.sol";
import {VaultEngine} from "../src/VaultEngine.sol";

contract RedeployVaultManager is Script {
    // Current deployed addresses
    address constant OLD_VAULT_MANAGER =
        0x347fe2d1A1789AeDd2cB7eFFC86377b8D208A295;
    address constant VAULT_ENGINE = 0x9Bc8A5BF079dd86F7873C44c4D1FF9CC88dDE35e;
    address constant COLLATERAL_JOIN =
        0xf7d4e2ab21e0a74f342688209F271a188B807Dc6;
    address constant OINR_TOKEN = 0x5E6883b7b37A02381325234ECbf13f0729584aD0;
    address constant PRICE_ORACLE = 0xe5cCA233Db9655D8C1a64F74e1d5Bb1253e80f99;

    function run() external {
        vm.startBroadcast();

        console.log("=== REDEPLOYING VaultManager ===\n");
        console.log("Old VaultManager:", OLD_VAULT_MANAGER);
        console.log("VaultEngine:", VAULT_ENGINE);
        console.log("oINR Token:", OINR_TOKEN);
        console.log("Price Oracle:", PRICE_ORACLE);

        // 1. Deploy new VaultManager
        console.log("\n1. Deploying new VaultManager...");
        VaultManager newVaultManager = new VaultManager(
            VAULT_ENGINE,
            COLLATERAL_JOIN,
            OINR_TOKEN,
            PRICE_ORACLE
        );
        console.log("   New VaultManager:", address(newVaultManager));

        // 2. Transfer oINR ownership to new VaultManager
        console.log("\n2. Transferring oINR ownership...");
        oINR oinr = oINR(OINR_TOKEN);
        address currentOwner = oinr.owner();
        console.log("   Current oINR owner:", currentOwner);

        if (currentOwner == OLD_VAULT_MANAGER) {
            console.log(
                "   ERROR: Cannot transfer - old VaultManager owns oINR!"
            );
            console.log("   You (deployer) must own oINR to transfer it.");
            console.log("   Current deployer:", msg.sender);
            revert("Deployer must own oINR to redeploy");
        }

        oinr.transferOwnership(address(newVaultManager));
        console.log("   ✅ oINR ownership transferred to new VaultManager");

        // 3. Update VaultEngine's vaultManager
        console.log("\n3. Updating VaultEngine's manager...");
        VaultEngine vaultEngine = VaultEngine(VAULT_ENGINE);
        address currentManager = vaultEngine.vaultManager();
        console.log("   Current manager:", currentManager);

        vaultEngine.setVaultManager(address(newVaultManager));
        console.log("   ✅ VaultEngine updated");

        console.log("\n=== DEPLOYMENT COMPLETE ===");
        console.log("New VaultManager:", address(newVaultManager));
        console.log("\nNEXT STEPS:");
        console.log("1. Update CONTRACT_ADDRESSES.json with new address");
        console.log("2. Update mobile app config");
        console.log("3. Test buyOINR function");

        vm.stopBroadcast();
    }
}
