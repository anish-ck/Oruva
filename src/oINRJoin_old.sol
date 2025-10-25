// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVaultEngineJoin {
    function slip(bytes32 ilk, address usr, int256 dink, int256 dart) external;
}

interface IoINR {
    function mint(address, uint256) external;
    function burn(address, uint256) external;
    function transferFrom(address, address, uint256) external returns (bool);
}

/// @title oINRJoin
/// @notice Handles minting/burning oINR from VaultEngine
contract oINRJoin {
    IVaultEngineJoin public immutable vaultEngine;
    IoINR public immutable oINR;
    bytes32 public constant ILK = "oINR-A";

    address public owner;
    uint256 public live = 1;

    modifier auth() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor(address _vaultEngine, address _oINR) {
        vaultEngine = IVaultEngineJoin(_vaultEngine);
        oINR = IoINR(_oINR);
        owner = msg.sender;
    }

    /// @notice Mint oINR when user borrows
    /// @param usr The borrower
    /// @param wad Amount of oINR to mint
    function join(address usr, uint256 wad) external {
        require(live == 1, "Join not live");
        oINR.mint(usr, wad);
        vaultEngine.slip(ILK, usr, 0, int256(wad));
    }

    /// @notice Burn oINR when user repays
    function exit(address usr, uint256 wad) external {
        require(live == 1, "Join not live");

        // User must have approved this contract to burn
        oINR.transferFrom(msg.sender, address(this), wad);
        oINR.burn(address(this), wad);

        vaultEngine.slip(ILK, usr, 0, -int256(wad));
    }

    function cage() external auth {
        live = 0;
    }
}
