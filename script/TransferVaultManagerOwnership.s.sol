// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/VaultManager.sol";

contract TransferVaultManagerOwnership is Script {
    function run() external {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address backendWallet = vm.envAddress("BACKEND_WALLET");
        address vaultManagerAddress = vm.envAddress("VAULT_MANAGER_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        VaultManager vaultManager = VaultManager(vaultManagerAddress);

        console.log("=== Transferring VaultManager Ownership ===");
        console.log("VaultManager:", vaultManagerAddress);
        console.log("Current Owner:", vaultManager.owner());
        console.log("Backend Wallet:", backendWallet);

        // Transfer ownership to backend wallet
        vaultManager.transferOwnership(backendWallet);

        console.log("\n=== Ownership Transferred ===");
        console.log("New Owner:", vaultManager.owner());
        console.log(
            "\nBackend can now use rescueMintOINR() for Cashfree payments!"
        );

        vm.stopBroadcast();
    }
}
