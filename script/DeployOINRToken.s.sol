// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {oINR} from "../src/oINR.sol";

contract DeployOINRToken is Script {
    function run() external returns (oINR) {
        vm.startBroadcast();

        console.log("Deploying oINR Token...");
        oINR oinr = new oINR();
        console.log("oINR Token deployed at:", address(oinr));
        console.log("Owner:", oinr.owner());

        vm.stopBroadcast();

        return oinr;
    }
}
