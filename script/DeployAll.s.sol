// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {VaultEngine} from "../src/VaultEngine.sol";
import {oINR} from "../src/oINR.sol";
import {oINRJoin} from "../src/oINRJoin.sol";
import {CollateralJoin} from "../src/CollateralJoin.sol";

contract DeployAll is Script {
    function run() external {
        vm.startBroadcast();

        // 1. Deploy VaultEngine
        console.log("Deploying VaultEngine...");
        VaultEngine vaultEngine = new VaultEngine(msg.sender);
        console.log("VaultEngine deployed at:", address(vaultEngine));

        // 2. Deploy oINR Token
        console.log("Deploying oINR Token...");
        oINR oinrToken = new oINR();
        console.log("oINR Token deployed at:", address(oinrToken));

        // 3. Deploy oINRJoin
        console.log("Deploying oINRJoin...");
        oINRJoin oinrJoin = new oINRJoin(
            address(vaultEngine),
            address(oinrToken)
        );
        console.log("oINRJoin deployed at:", address(oinrJoin));

        // 4. Transfer oINR ownership to oINRJoin so it can mint/burn
        console.log("Transferring oINR ownership to oINRJoin...");
        oinrToken.transferOwnership(address(oinrJoin));

        console.log("\n=== Deployment Summary ===");
        console.log("VaultEngine:", address(vaultEngine));
        console.log("oINR Token:", address(oinrToken));
        console.log("oINRJoin:", address(oinrJoin));

        vm.stopBroadcast();
    }
}
