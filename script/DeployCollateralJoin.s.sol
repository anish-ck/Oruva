// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {CollateralJoin} from "../src/CollateralJoin.sol";
import {MockUSDC} from "../src/MockUSDC.sol";

contract DeployCollateralJoin is Script {
    function run() external returns (CollateralJoin, MockUSDC) {
        // Already deployed VaultEngine address
        address vaultEngine = 0x093508073622aE8233D71621ed72F204Da36Bb5E;

        // Collateral type identifier (e.g., "USDC-A", "WETH-A")
        bytes32 ilk = bytes32("USDC-A");

        vm.startBroadcast();

        // Deploy Mock USDC for testing
        console.log("Deploying Mock USDC...");
        MockUSDC mockUSDC = new MockUSDC();
        console.log("Mock USDC deployed at:", address(mockUSDC));

        console.log("Deploying CollateralJoin...");
        console.log("VaultEngine:", vaultEngine);
        console.log("Collateral Token:", address(mockUSDC));

        CollateralJoin collateralJoin = new CollateralJoin(
            vaultEngine,
            address(mockUSDC),
            ilk
        );

        console.log("CollateralJoin deployed at:", address(collateralJoin));

        console.log("\n=== Deployment Summary ===");
        console.log("Mock USDC:", address(mockUSDC));
        console.log("CollateralJoin:", address(collateralJoin));
        console.log("VaultEngine:", vaultEngine);

        vm.stopBroadcast();

        return (collateralJoin, mockUSDC);
    }
}
