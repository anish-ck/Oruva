// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";

/// @title VerifySetup
/// @notice Verify all contracts are properly configured
contract VerifySetup is Script {
    // Contract addresses
    address constant VAULT_ENGINE = 0x544759a30fD8fbf6E26b2184119F49921BF3c265;
    address constant OINR_TOKEN = 0x883Fa6BE70D11516dC3d9ED851278829a746840F;
    address constant VAULT_MANAGER = 0x22E1AE8A85e76e94683D668c0107b69eF18a62cA;
    address constant PRICE_ORACLE = 0xBE8b98f6b8ca2E9B643C1Bdd27f5c2A117b7dB4e;
    address constant MOCK_USDC = 0x6BF62E80CaF83847eD57233Ee119673F8fF7aB5c;
    address constant COLLATERAL_JOIN =
        0x248Ed726c497238c1bD8977b1E377559daE1c479;

    function run() external pure {
        console.log("=== Oruva DeFi Bank - Setup Verification ===\n");

        console.log("Contract Addresses:");
        console.log("-------------------");
        console.log("VaultEngine:", VAULT_ENGINE);
        console.log("VaultManager:", VAULT_MANAGER);
        console.log("oINR Token:", OINR_TOKEN);
        console.log("PriceOracle:", PRICE_ORACLE);
        console.log("MockUSDC:", MOCK_USDC);
        console.log("CollateralJoin:", COLLATERAL_JOIN);

        console.log("\nOracle Configuration:");
        console.log("--------------------");
        console.log("1 USDC = 83 INR");
        console.log("Min Collateral Ratio: 150%");

        console.log("\nHow It Works:");
        console.log("-------------");
        console.log("1. Deposit: User deposits MockUSDC collateral");
        console.log(
            "2. Borrow: User borrows oINR (max 66.67% of collateral value)"
        );
        console.log("   Example: 1000 USDC = 83,000 INR");
        console.log("   Max Borrow: 55,333 oINR (83,000 / 1.5)");
        console.log("3. Repay: User repays oINR debt");
        console.log("4. Withdraw: User withdraws collateral");

        console.log("\nExplorer Links:");
        console.log("---------------");
        console.log("VaultManager:");
        console.log("https://evm-testnet.flowscan.io/address/", VAULT_MANAGER);
        console.log("\noINR Token:");
        console.log("https://evm-testnet.flowscan.io/address/", OINR_TOKEN);

        console.log("\n=== System Ready for Hackathon Demo! ===");
    }
}
