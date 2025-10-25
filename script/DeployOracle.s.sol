// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {SimplePriceOracle} from "../src/SimplePriceOracle.sol";

contract DeployOracle is Script {
    function run() external returns (SimplePriceOracle) {
        vm.startBroadcast();

        console.log("Deploying SimplePriceOracle...");

        SimplePriceOracle oracle = new SimplePriceOracle();

        console.log("SimplePriceOracle deployed at:", address(oracle));

        vm.stopBroadcast();

        return oracle;
    }
}
