// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/oINR.sol";

contract GrantMinterRole is Script {
    function run() external {
        // Load environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address backendWallet = vm.envAddress("BACKEND_WALLET");
        address oinrAddress = vm.envAddress("OINR_ADDRESS");

        vm.startBroadcast(deployerPrivateKey);

        oINR oinr = oINR(oinrAddress);

        console.log("Transferring oINR ownership to backend wallet...");
        console.log("oINR Contract:", oinrAddress);
        console.log("Current Owner:", oinr.owner());
        console.log("Backend Wallet:", backendWallet);

        // Transfer ownership to backend wallet
        oinr.transferOwnership(backendWallet);

        console.log("New Owner:", oinr.owner());
        console.log("Ownership transferred successfully!");

        vm.stopBroadcast();
    }
}
