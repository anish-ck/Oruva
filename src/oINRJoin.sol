// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VaultEngine.sol";
import {oINR} from "./oINR.sol";

contract oINRJoin {
    VaultEngine public immutable vaultEngine;
    oINR public immutable stable;

    constructor(address _vaultEngine, address _stable) {
        vaultEngine = VaultEngine(_vaultEngine);
        stable = oINR(_stable);
    }

    function mint(uint256 amount) external {
        vaultEngine.increaseDebt(msg.sender, amount);
        stable.mint(msg.sender, amount);
    }

    function repay(uint256 amount) external {
        stable.burn(msg.sender, amount);
        vaultEngine.decreaseDebt(msg.sender, amount);
    }
}
