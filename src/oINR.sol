// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Basic ERC20 token pegged to INR
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract oINR is ERC20, Ownable {
    constructor() ERC20("Oruva INR Stablecoin", "oINR") Ownable(msg.sender) {}

    // Only owner (Vault, Treasury, or Admin) can mint/burn
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}
