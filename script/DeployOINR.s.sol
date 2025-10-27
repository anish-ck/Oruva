// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {oINR} from "../src/oINR.sol";

contract DeployOINR is Script {
    function run() external returns (oINR) {
        // Start broadcasting transactions
        vm.startBroadcast();

        // Deploy the oINR contract
        oINR oinr = new oINR();

        // Stop broadcasting
        vm.stopBroadcast();

        return oinr;
    }
}
