// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IVaultEngine {
    struct Vault {
        uint256 collateral;
        uint256 debt;
    }
    function vaults(
        address user
    ) external view returns (uint256 collateral, uint256 debt);
    function increaseCollateral(address user, uint256 amount) external;
    function decreaseCollateral(address user, uint256 amount) external;
    function increaseDebt(address user, uint256 amount) external;
    function decreaseDebt(address user, uint256 amount) external;
}

interface IoINR {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface ICollateralJoin {
    function collateral() external view returns (address);
}

interface IERC20 {
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function decimals() external view returns (uint8);
}

interface IPriceOracle {
    function getPrice(address token) external view returns (uint256);
    function getValueInINR(
        address token,
        uint256 amount,
        uint256 tokenDecimals
    ) external view returns (uint256);
}

/// @title VaultManager
/// @notice Unified interface for managing collateralized vaults with price oracle integration
/// @dev Handles deposits, borrows, repays, and withdrawals with real-time pricing
contract VaultManager is ReentrancyGuard, Ownable {
    IVaultEngine public immutable vaultEngine;
    ICollateralJoin public immutable collateralJoin;

    IERC20 public immutable collateralToken;
    IoINR public immutable oinrToken;
    IPriceOracle public priceOracle;

    uint8 public immutable collateralDecimals;

    // Collateralization ratio (e.g., 150% = 15000 basis points)
    uint256 public minCollateralizationRatio = 15000; // 150%
    uint256 public constant RATIO_PRECISION = 10000; // 100%
    uint256 public constant PRICE_PRECISION = 1e18; // Oracle price precision

    // Events
    event Deposited(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event OINRPurchased(
        address indexed user,
        uint256 oinrAmount,
        uint256 usdcPaid
    );
    event CollateralizationRatioUpdated(uint256 newRatio);
    event PriceOracleUpdated(
        address indexed oldOracle,
        address indexed newOracle
    );

    constructor(
        address _vaultEngine,
        address _collateralJoin,
        address _oinrToken,
        address _priceOracle
    ) Ownable(msg.sender) {
        vaultEngine = IVaultEngine(_vaultEngine);
        collateralJoin = ICollateralJoin(_collateralJoin);
        oinrToken = IoINR(_oinrToken);
        priceOracle = IPriceOracle(_priceOracle);

        collateralToken = IERC20(collateralJoin.collateral());
        collateralDecimals = collateralToken.decimals();
    }

    /// @notice Deposit collateral into vault
    /// @param amount Amount of collateral to deposit
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");

        // Transfer collateral from user to this contract
        require(
            collateralToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        // Update vault engine
        vaultEngine.increaseCollateral(msg.sender, amount);

        emit Deposited(msg.sender, amount);
    }

    /// @notice Borrow oINR against collateral
    /// @param amount Amount of oINR to borrow (18 decimals)
    function borrow(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(address(priceOracle) != address(0), "Oracle not set");

        // Get current vault state
        (uint256 collateral, uint256 debt) = vaultEngine.vaults(msg.sender);
        require(collateral > 0, "No collateral deposited");

        // Calculate new debt
        uint256 newDebt = debt + amount;

        // Get collateral value in INR using oracle
        uint256 collateralValueINR = priceOracle.getValueInINR(
            address(collateralToken),
            collateral,
            collateralDecimals
        );

        // Check collateralization ratio
        // collateralValueINR (18 decimals) >= newDebt (18 decimals) * ratio / RATIO_PRECISION
        require(
            collateralValueINR * RATIO_PRECISION >=
                newDebt * minCollateralizationRatio,
            "Insufficient collateralization"
        );

        // Increase debt in vault engine
        vaultEngine.increaseDebt(msg.sender, amount);

        // Mint oINR directly to user
        oinrToken.mint(msg.sender, amount);

        emit Borrowed(msg.sender, amount);
    }

    /// @notice Repay oINR debt
    /// @param amount Amount of oINR to repay
    function repay(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");

        // Get current vault state
        (, uint256 debt) = vaultEngine.vaults(msg.sender);
        require(debt >= amount, "Repay amount exceeds debt");

        // Burn oINR from user
        oinrToken.burn(msg.sender, amount);

        // Decrease debt in vault engine
        vaultEngine.decreaseDebt(msg.sender, amount);

        emit Repaid(msg.sender, amount);
    }

    /// @notice Buy oINR with USDC (for users who spent their borrowed oINR and need to buy back)
    /// @param oinrAmount Amount of oINR to buy (18 decimals)
    /// @dev User pays USDC at oracle price to get oINR, then can repay their debt
    function buyOINR(uint256 oinrAmount) external nonReentrant {
        require(oinrAmount > 0, "Amount must be > 0");
        require(address(priceOracle) != address(0), "Oracle not set");

        // Get USDC price in INR (e.g., 83 INR per USDC with 18 decimals precision)
        uint256 usdcPriceInINR = priceOracle.getPrice(address(collateralToken));
        require(usdcPriceInINR > 0, "Invalid price");

        // Calculate required USDC amount
        // Formula: usdcAmount = (oinrAmount * 1e6) / usdcPriceInINR
        // Example: Buy 83 oINR → Need 1 USDC (1e6)
        //          usdcAmount = (83e18 * 1e6) / 83e18 = 1e6
        uint256 usdcAmount = (oinrAmount * (10 ** collateralDecimals)) /
            usdcPriceInINR;
        require(usdcAmount > 0, "Amount too small");

        // Transfer USDC from user to this contract
        require(
            collateralToken.transferFrom(msg.sender, address(this), usdcAmount),
            "USDC transfer failed"
        );

        // Mint oINR to user
        oinrToken.mint(msg.sender, oinrAmount);

        emit OINRPurchased(msg.sender, oinrAmount, usdcAmount);
    }

    /// @notice Withdraw collateral from vault
    /// @param amount Amount of collateral to withdraw
    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(address(priceOracle) != address(0), "Oracle not set");

        // Get current vault state
        (uint256 collateral, uint256 debt) = vaultEngine.vaults(msg.sender);
        require(collateral >= amount, "Insufficient collateral");

        // Calculate remaining collateral after withdrawal
        uint256 remainingCollateral = collateral - amount;

        // If there's debt, ensure remaining collateral is sufficient
        if (debt > 0) {
            uint256 remainingValueINR = priceOracle.getValueInINR(
                address(collateralToken),
                remainingCollateral,
                collateralDecimals
            );

            require(
                remainingValueINR * RATIO_PRECISION >=
                    debt * minCollateralizationRatio,
                "Withdrawal would under-collateralize vault"
            );
        }

        // Decrease collateral in vault engine
        vaultEngine.decreaseCollateral(msg.sender, amount);

        // Transfer collateral back to user
        require(
            collateralToken.transfer(msg.sender, amount),
            "Transfer failed"
        );

        emit Withdrawn(msg.sender, amount);
    }

    /// @notice Get vault information for a user
    /// @param user Address of the vault owner
    /// @return collateral Amount of collateral in vault
    /// @return debt Amount of oINR debt
    /// @return collateralValueINR Value of collateral in INR
    /// @return collateralizationRatio Current ratio (basis points)
    /// @return isHealthy Whether vault meets minimum ratio
    function getVaultInfo(
        address user
    )
        external
        view
        returns (
            uint256 collateral,
            uint256 debt,
            uint256 collateralValueINR,
            uint256 collateralizationRatio,
            bool isHealthy
        )
    {
        (collateral, debt) = vaultEngine.vaults(user);

        if (address(priceOracle) != address(0) && collateral > 0) {
            collateralValueINR = priceOracle.getValueInINR(
                address(collateralToken),
                collateral,
                collateralDecimals
            );
        }

        if (debt == 0) {
            collateralizationRatio = type(uint256).max;
            isHealthy = true;
        } else {
            // ratio = (collateralValueINR / debt) * RATIO_PRECISION
            collateralizationRatio =
                (collateralValueINR * RATIO_PRECISION) /
                debt;
            isHealthy = collateralizationRatio >= minCollateralizationRatio;
        }
    }

    /// @notice Check if a vault can borrow a specific amount
    /// @param user Address of the vault owner
    /// @param borrowAmount Amount user wants to borrow
    /// @return canBorrow Whether the borrow is allowed
    /// @return maxBorrowable Maximum amount that can be borrowed
    function checkBorrowCapacity(
        address user,
        uint256 borrowAmount
    ) external view returns (bool canBorrow, uint256 maxBorrowable) {
        (uint256 collateral, uint256 debt) = vaultEngine.vaults(user);

        if (address(priceOracle) != address(0) && collateral > 0) {
            uint256 collateralValueINR = priceOracle.getValueInINR(
                address(collateralToken),
                collateral,
                collateralDecimals
            );

            // Max borrowable = (collateralValueINR * RATIO_PRECISION) / minCollateralizationRatio
            maxBorrowable =
                (collateralValueINR * RATIO_PRECISION) /
                minCollateralizationRatio;

            if (maxBorrowable > debt) {
                maxBorrowable = maxBorrowable - debt;
            } else {
                maxBorrowable = 0;
            }
        }

        canBorrow = borrowAmount <= maxBorrowable;
    }

    /// @notice Update price oracle address (admin only)
    /// @param newOracle Address of the new price oracle
    function setPriceOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle address");
        address oldOracle = address(priceOracle);
        priceOracle = IPriceOracle(newOracle);
        emit PriceOracleUpdated(oldOracle, newOracle);
    }

    /// @notice Update minimum collateralization ratio (admin only)
    /// @param newRatio New ratio in basis points (e.g., 15000 = 150%)
    function setMinCollateralizationRatio(uint256 newRatio) external onlyOwner {
        require(newRatio >= RATIO_PRECISION, "Ratio must be >= 100%");
        require(newRatio <= 50000, "Ratio too high"); // Max 500%

        minCollateralizationRatio = newRatio;
        emit CollateralizationRatioUpdated(newRatio);
    }
}
