// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {VaultEngine} from "../src/VaultEngine.sol";

contract DeployVaultEngine is Script {
    function run() external returns (VaultEngine) {
        // Start broadcasting transactions
        vm.startBroadcast();

        // Deploy the VaultEngine contract with deployer as manager
        // msg.sender will be the deployer during broadcast
        VaultEngine vaultEngine = new VaultEngine(msg.sender);

        // Stop broadcasting
        vm.stopBroadcast();

        return vaultEngine;
    }
}
