// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {VaultManager} from "../src/VaultManager.sol";

contract DeployVaultManager is Script {
    function run() external returns (VaultManager) {
        // Previously deployed contract addresses
        address vaultEngine = 0x544759a30fD8fbf6E26b2184119F49921BF3c265; // VaultEngine
        address collateralJoin = 0x248Ed726c497238c1bD8977b1E377559daE1c479; // CollateralJoin
        address oinrToken = 0x883Fa6BE70D11516dC3d9ED851278829a746840F; // oINR Token
        address priceOracle = 0xBE8b98f6b8ca2E9B643C1Bdd27f5c2A117b7dB4e; // SimplePriceOracle

        vm.startBroadcast();

        console.log("Deploying VaultManager...");
        console.log("VaultEngine:", vaultEngine);
        console.log("CollateralJoin:", collateralJoin);
        console.log("oINR Token:", oinrToken);
        console.log("Price Oracle:", priceOracle);

        VaultManager vaultManager = new VaultManager(
            vaultEngine,
            collateralJoin,
            oinrToken,
            priceOracle
        );

        console.log("VaultManager deployed at:", address(vaultManager));

        console.log("\n=== Deployment Summary ===");
        console.log("VaultManager:", address(vaultManager));
        console.log(
            "Min Collateralization Ratio:",
            vaultManager.minCollateralizationRatio(),
            "basis points (150%)"
        );

        vm.stopBroadcast();

        return vaultManager;
    }
}
