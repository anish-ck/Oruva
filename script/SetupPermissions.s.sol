// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";

interface IVaultEngine {
    function setVaultManager(address newManager) external;
    function vaultManager() external view returns (address);
}

interface IoINR {
    function transferOwnership(address newOwner) external;
    function owner() external view returns (address);
}

/// @title SetupPermissions
/// @notice Configure permissions for all deployed contracts
contract SetupPermissions is Script {
    // Deployed contract addresses
    address constant VAULT_ENGINE = 0x544759a30fD8fbf6E26b2184119F49921BF3c265;
    address constant OINR_TOKEN = 0x883Fa6BE70D11516dC3d9ED851278829a746840F;
    address constant VAULT_MANAGER = 0x2241e8cC49b20fd631C7Cf5810fd87DB78AAe97e;

    function run() external {
        vm.startBroadcast();

        console.log("=== Setting up Permissions ===\n");

        // 1. Set VaultManager as the vault manager in VaultEngine
        console.log("Step 1: Setting VaultManager as vault manager...");
        console.log("  VaultEngine:", VAULT_ENGINE);
        console.log("  New Manager:", VAULT_MANAGER);

        IVaultEngine(VAULT_ENGINE).setVaultManager(VAULT_MANAGER);
        console.log("  [OK] VaultManager set successfully");

        address currentManager = IVaultEngine(VAULT_ENGINE).vaultManager();
        console.log("  Current vault manager:", currentManager);
        require(currentManager == VAULT_MANAGER, "Manager not set correctly");

        // 2. Transfer oINR ownership to VaultManager (so it can mint/burn)
        console.log("\nStep 2: Transferring oINR ownership to VaultManager...");
        console.log("  oINR Token:", OINR_TOKEN);
        console.log("  VaultManager:", VAULT_MANAGER);

        address currentOwner = IoINR(OINR_TOKEN).owner();
        console.log("  Current owner:", currentOwner);

        if (currentOwner != VAULT_MANAGER) {
            console.log("  Transferring ownership to VaultManager...");
            IoINR(OINR_TOKEN).transferOwnership(VAULT_MANAGER);
            console.log("  [OK] Ownership transferred");
        } else {
            console.log("  [OK] Already owned by VaultManager");
        }

        console.log("\n=== Setup Complete ===");
        console.log("[OK] VaultManager can now manage vaults");
        console.log("[OK] VaultManager can mint/burn oINR tokens");

        vm.stopBroadcast();
    }
}
