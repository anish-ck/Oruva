// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVaultEngine {
    function slip(bytes32 ilk, address usr, int256 dink, int256 dart) external;
}

interface IERC20 {
    function transferFrom(address, address, uint256) external returns (bool);
    function transfer(address, uint256) external returns (bool);
    function balanceOf(address) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
}

/// @title CollateralJoin
/// @notice Locks ERC20 collateral into VaultEngine for oINR minting
contract CollateralJoin {
    IVaultEngine public immutable vaultEngine;
    IERC20 public immutable collateral;
    bytes32 public immutable ilk; // collateral type name, e.g. "USDC-A"

    uint256 public live = 1; // 1 = active, 0 = shut down
    modifier auth() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    address public owner;

    constructor(address _vaultEngine, address _collateral, bytes32 _ilk) {
        vaultEngine = IVaultEngine(_vaultEngine);
        collateral = IERC20(_collateral);
        ilk = _ilk;
        owner = msg.sender;
    }

    /// @notice Lock collateral into the VaultEngine
    /// @param usr The user whose balance will be credited
    /// @param wad Amount of collateral (in token decimals)
    function join(address usr, uint256 wad) external {
        require(live == 1, "Join not live");
        require(collateral.transferFrom(msg.sender, address(this), wad), "Transfer failed");

        // Record the collateral in VaultEngine (dink = +wad, dart = 0)
        vaultEngine.slip(ilk, usr, int256(wad), 0);
    }

    /// @notice Unlock collateral from the VaultEngine
    function exit(address usr, uint256 wad) external {
        require(live == 1, "Join not live");

        // Decrease user collateral in VaultEngine (dink = -wad)
        vaultEngine.slip(ilk, msg.sender, -int256(wad), 0);

        require(collateral.transfer(usr, wad), "Transfer failed");
    }

    /// @notice Emergency shutdown
    function cage() external auth {
        live = 0;
    }
}
