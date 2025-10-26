// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/VaultManager.sol";
import "../src/oINR.sol";

contract TransferOINRToBackend is Script {
    function run() external {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address backendWallet = vm.envAddress("BACKEND_WALLET");
        address oinrAddress = vm.envAddress("OINR_ADDRESS");
        address vaultManagerAddress = vm.envAddress("VAULT_MANAGER_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        oINR oinr = oINR(oinrAddress);
        VaultManager vaultManager = VaultManager(vaultManagerAddress);

        console.log("=== Current State ===");
        console.log("oINR Contract:", oinrAddress);
        console.log("VaultManager:", vaultManagerAddress);
        console.log("Current oINR owner:", oinr.owner());
        console.log("VaultManager owner:", vaultManager.owner());
        console.log("Backend Wallet:", backendWallet);

        // Check if we are the VaultManager owner
        address vmOwner = vaultManager.owner();
        address myAddress = vm.addr(deployerPrivateKey);

        console.log("\n=== Verification ===");
        console.log("My address:", myAddress);
        console.log("Am I VaultManager owner?", vmOwner == myAddress);

        if (vmOwner != myAddress) {
            console.log("\nERROR: You are not the VaultManager owner!");
            console.log("Cannot transfer oINR ownership.");
            revert("Not VaultManager owner");
        }

        // VaultManager rescueMintOINR approach won't work for changing ownership
        // So we need to check if oINR is owned by VaultManager
        address oinrOwner = oinr.owner();
        if (oinrOwner == vaultManagerAddress) {
            console.log("\n=== Transferring Ownership ===");
            console.log("oINR is owned by VaultManager");
            console.log(
                "This architecture is correct for collateralized loans"
            );
            console.log(
                "\nWARNING: For Cashfree integration, we need a different approach!"
            );
            console.log(
                "Option 1: Deploy a new oINR contract for fiat payments"
            );
            console.log(
                "Option 2: Use VaultManager.rescueMintOINR() from backend"
            );
            console.log(
                "Option 3: Grant backend wallet special minting privileges"
            );

            revert("Architecture mismatch - see logs for solutions");
        }

        vm.stopBroadcast();
    }
}
