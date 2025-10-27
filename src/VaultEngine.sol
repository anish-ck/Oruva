// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VaultEngine {
    struct Vault {
        uint256 collateral; // amount of collateral locked
        uint256 debt; // oINR borrowed
    }

    mapping(address => Vault) public vaults;
    address public vaultManager; // only manager can modify
    address public owner; // can transfer management

    modifier onlyManager() {
        require(msg.sender == vaultManager, "not manager");
        _;
    }
    modifier onlyOwner() {
        require(msg.sender == owner, "not owner");
        _;
    }

    event VaultManagerUpdated(
        address indexed oldManager,
        address indexed newManager
    );

    constructor(address _manager) {
        vaultManager = _manager;
        owner = msg.sender;
    }

    function setVaultManager(address newManager) external onlyOwner {
        require(newManager != address(0), "invalid address");
        address oldManager = vaultManager;
        vaultManager = newManager;
        emit VaultManagerUpdated(oldManager, newManager);
    }

    function increaseCollateral(
        address user,
        uint256 amount
    ) external onlyManager {
        vaults[user].collateral += amount;
    }

    function decreaseCollateral(
        address user,
        uint256 amount
    ) external onlyManager {
        vaults[user].collateral -= amount;
    }

    function increaseDebt(address user, uint256 amount) external onlyManager {
        vaults[user].debt += amount;
    }

    function decreaseDebt(address user, uint256 amount) external onlyManager {
        vaults[user].debt -= amount;
    }
}
