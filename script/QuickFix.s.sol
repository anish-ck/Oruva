// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";

interface IoINR {
    function mint(address to, uint256 amount) external;
    function owner() external view returns (address);
    function transferOwnership(address newOwner) external;
}

contract QuickFix is Script {
    address constant OINR = 0x5E6883b7b37A02381325234ECbf13f0729584aD0;
    address constant VAULT_MANAGER = 0x347fe2d1A1789AeDd2cB7eFFC86377b8D208A295;
    address constant USER_WALLET = 0xbF9243289CB75d64cc4ac7439FBfFDb9BD67BaB1;
    uint256 constant AMOUNT = 1100 ether;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        IoINR oinr = IoINR(OINR);

        console.log(
            "Step 1: Transfer oINR ownership from VaultManager to deployer"
        );
        console.log("Current owner:", oinr.owner());

        // Can't do this - we're not the owner!
        // We need VaultManager to transfer it

        console.log("\n❌ Cannot proceed - deployer is not the owner");
        console.log("VaultManager is the owner and only owner can transfer");

        vm.stopBroadcast();
    }
}
