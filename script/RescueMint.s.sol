// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

interface IVaultManager {
    function rescueMintOINR(address to, uint256 amount) external;
}

contract RescueMint is Script {
    address constant VAULT_MANAGER = 0x347fe2d1A1789AeDd2cB7eFFC86377b8D208A295;
    address constant USER_WALLET = 0xbF9243289CB75d64cc4ac7439FBfFDb9BD67BaB1;
    uint256 constant AMOUNT = 1100 ether; // 1100 oINR

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        IVaultManager vaultManager = IVaultManager(VAULT_MANAGER);

        console.log("Minting 1100 oINR to:", USER_WALLET);
        console.log("Through VaultManager:", VAULT_MANAGER);

        vaultManager.rescueMintOINR(USER_WALLET, AMOUNT);

        console.log("Success! Minted 1100 oINR");

        vm.stopBroadcast();
    }
}
