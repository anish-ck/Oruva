// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

interface IoINR {
    function mint(address to, uint256 amount) external;
    function owner() external view returns (address);
}

interface IVaultEngine {
    function vaults(
        address user
    ) external view returns (uint256 collateral, uint256 debt);
}

contract MintMissingOINR is Script {
    address constant OINR = 0x5E6883b7b37A02381325234ECbf13f0729584aD0;
    address constant VAULT_ENGINE = 0x9Bc8A5BF079dd86F7873C44c4D1FF9CC88dDE35e;
    address constant VAULT_MANAGER = 0x347fe2d1A1789AeDd2cB7eFFC86377b8D208A295;
    address constant USER_WALLET = 0xbF9243289CB75d64cc4ac7439FBfFDb9BD67BaB1; // The affected wallet

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        IoINR oinr = IoINR(OINR);
        IVaultEngine vaultEngine = IVaultEngine(VAULT_ENGINE);

        // Check current owner
        address owner = oinr.owner();
        console.log("oINR owner:", owner);
        console.log("VaultManager:", VAULT_MANAGER);
        console.log("Match:", owner == VAULT_MANAGER);

        // Get vault debt for the affected user
        (, uint256 debt) = vaultEngine.vaults(USER_WALLET);
        console.log("\nUser:", USER_WALLET);
        console.log("Debt:", debt / 1e18, "oINR");

        if (debt > 0) {
            console.log(
                "\nMinting",
                debt / 1e18,
                "oINR to compensate for failed borrows..."
            );
            oinr.mint(USER_WALLET, debt);
            console.log("Success! Minted", debt / 1e18, "oINR to", USER_WALLET);
        } else {
            console.log("\nNo debt found, nothing to mint");
        }

        vm.stopBroadcast();
    }
}
