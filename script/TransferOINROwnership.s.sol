// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";

interface IoINR {
    function transferOwnership(address newOwner) external;
    function owner() external view returns (address);
}

interface IVaultManager {
    function transferTokenOwnership(address token, address newOwner) external;
    function owner() external view returns (address);
}

/// @title TransferOINROwnership
/// @notice Transfer oINR ownership from old VaultManager to new VaultManager
contract TransferOINROwnership is Script {
    address constant OLD_VAULT_MANAGER = 0x2241e8cC49b20fd631C7Cf5810fd87DB78AAe97e;
    address constant NEW_VAULT_MANAGER = 0x22E1AE8A85e76e94683D668c0107b69eF18a62cA;
    address constant OINR_TOKEN = 0x883Fa6BE70D11516dC3d9ED851278829a746840F;

    function run() external {
        vm.startBroadcast();

        console.log("=== Transferring oINR Ownership ===\n");
        console.log("Old VaultManager:", OLD_VAULT_MANAGER);
        console.log("New VaultManager:", NEW_VAULT_MANAGER);
        console.log("oINR Token:", OINR_TOKEN);

        address currentOwner = IoINR(OINR_TOKEN).owner();
        console.log("\nCurrent oINR owner:", currentOwner);

        if (currentOwner == OLD_VAULT_MANAGER) {
            console.log("\nCalling old VaultManager to transfer ownership...");
            
            // Try to call transferTokenOwnership on old VaultManager
            // This will only work if the old VaultManager has this function
            try IVaultManager(OLD_VAULT_MANAGER).transferTokenOwnership(
                OINR_TOKEN,
                NEW_VAULT_MANAGER
            ) {
                console.log("[OK] Ownership transferred via VaultManager");
            } catch {
                console.log("[FAILED] Old VaultManager doesn't have transferTokenOwnership");
                console.log("\nTrying direct transfer (will fail if we're not owner)...");
                IoINR(OINR_TOKEN).transferOwnership(NEW_VAULT_MANAGER);
                console.log("[OK] Direct transfer successful");
            }
        } else if (currentOwner == NEW_VAULT_MANAGER) {
            console.log("[OK] Already owned by new VaultManager");
        } else {
            console.log("WARNING: oINR owned by unexpected address:", currentOwner);
            console.log("Attempting to transfer anyway...");
            IoINR(OINR_TOKEN).transferOwnership(NEW_VAULT_MANAGER);
        }

        address newOwner = IoINR(OINR_TOKEN).owner();
        console.log("\nNew oINR owner:", newOwner);
        
        require(newOwner == NEW_VAULT_MANAGER, "Transfer failed");
        console.log("\n[OK] oINR ownership successfully transferred!");

        vm.stopBroadcast();
    }
}
