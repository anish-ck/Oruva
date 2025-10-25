// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {VaultManager} from "../src/VaultManager.sol";
import {VaultEngine} from "../src/VaultEngine.sol";
import {SimplePriceOracle} from "../src/SimplePriceOracle.sol";
import {oINR} from "../src/oINR.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {CollateralJoin} from "../src/CollateralJoin.sol";

/// @title VaultManagerTest
/// @notice Comprehensive tests for the Oruva DeFi Bank system
contract VaultManagerTest is Test {
    VaultManager public vaultManager;
    VaultEngine public vaultEngine;
    SimplePriceOracle public oracle;
    oINR public oinrToken;
    MockUSDC public mockUSDC;
    CollateralJoin public collateralJoin;

    address public user1 = address(0x1);
    address public user2 = address(0x2);
    address public owner = address(this);

    // Constants
    uint256 constant INITIAL_USDC = 10000 * 10 ** 6; // 10,000 USDC
    uint256 constant USDC_PRICE = 83e18; // 83 INR per USDC
    uint256 constant MIN_RATIO = 15000; // 150%

    event Deposited(address indexed user, uint256 amount);
    event Borrowed(address indexed user, uint256 amount);
    event Repaid(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event OINRPurchased(
        address indexed user,
        uint256 oinrAmount,
        uint256 usdcPaid
    );

    function setUp() public {
        // Deploy contracts in correct order
        mockUSDC = new MockUSDC();
        vaultEngine = new VaultEngine(owner);
        oinrToken = new oINR();
        collateralJoin = new CollateralJoin(
            address(vaultEngine),
            address(mockUSDC),
            "USDC-A"
        );
        oracle = new SimplePriceOracle();

        // Deploy VaultManager
        vaultManager = new VaultManager(
            address(vaultEngine),
            address(collateralJoin),
            address(oinrToken),
            address(oracle)
        );

        // Setup permissions
        vaultEngine.setVaultManager(address(vaultManager));
        oinrToken.transferOwnership(address(vaultManager));

        // Set USDC price in oracle
        oracle.setPrice(address(mockUSDC), USDC_PRICE);

        // Give users initial USDC
        mockUSDC.mint(user1, INITIAL_USDC);
        mockUSDC.mint(user2, INITIAL_USDC);

        // Label addresses for better trace output
        vm.label(user1, "User1");
        vm.label(user2, "User2");
        vm.label(address(vaultManager), "VaultManager");
        vm.label(address(vaultEngine), "VaultEngine");
        vm.label(address(oinrToken), "oINR");
        vm.label(address(mockUSDC), "MockUSDC");
        vm.label(address(oracle), "Oracle");
    }

    /*//////////////////////////////////////////////////////////////
                            DEPOSIT TESTS
    //////////////////////////////////////////////////////////////*/

    function testDeposit() public {
        uint256 depositAmount = 1000 * 10 ** 6; // 1000 USDC

        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), depositAmount);

        vm.expectEmit(true, false, false, true);
        emit Deposited(user1, depositAmount);

        vaultManager.deposit(depositAmount);
        vm.stopPrank();

        // Verify vault state
        (uint256 collateral, uint256 debt) = vaultEngine.vaults(user1);
        assertEq(collateral, depositAmount, "Collateral not recorded");
        assertEq(debt, 0, "Debt should be zero");

        // Verify USDC was transferred
        assertEq(mockUSDC.balanceOf(user1), INITIAL_USDC - depositAmount);
        assertEq(mockUSDC.balanceOf(address(vaultManager)), depositAmount);
    }

    function testDepositZeroAmount() public {
        vm.startPrank(user1);
        vm.expectRevert("Amount must be > 0");
        vaultManager.deposit(0);
        vm.stopPrank();
    }

    function testDepositWithoutApproval() public {
        vm.startPrank(user1);
        vm.expectRevert();
        vaultManager.deposit(1000 * 10 ** 6);
        vm.stopPrank();
    }

    function testMultipleDeposits() public {
        uint256 deposit1 = 500 * 10 ** 6;
        uint256 deposit2 = 300 * 10 ** 6;

        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), deposit1 + deposit2);

        vaultManager.deposit(deposit1);
        vaultManager.deposit(deposit2);
        vm.stopPrank();

        (uint256 collateral, ) = vaultEngine.vaults(user1);
        assertEq(collateral, deposit1 + deposit2);
    }

    /*//////////////////////////////////////////////////////////////
                            BORROW TESTS
    //////////////////////////////////////////////////////////////*/

    function testBorrow() public {
        uint256 depositAmount = 1000 * 10 ** 6; // 1000 USDC
        uint256 borrowAmount = 50000 * 10 ** 18; // 50,000 oINR

        // Deposit first
        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), depositAmount);
        vaultManager.deposit(depositAmount);

        vm.expectEmit(true, false, false, true);
        emit Borrowed(user1, borrowAmount);

        vaultManager.borrow(borrowAmount);
        vm.stopPrank();

        // Verify vault state
        (, uint256 debt) = vaultEngine.vaults(user1);
        assertEq(debt, borrowAmount, "Debt not recorded");

        // Verify oINR was minted
        assertEq(oinrToken.balanceOf(user1), borrowAmount);
    }

    function testBorrowMaxAmount() public {
        uint256 depositAmount = 1000 * 10 ** 6; // 1000 USDC
        // Max borrow = (1000 * 83 * 10000) / 15000 = 55,333.33 oINR
        uint256 maxBorrow = 55333 * 10 ** 18;

        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), depositAmount);
        vaultManager.deposit(depositAmount);
        vaultManager.borrow(maxBorrow);
        vm.stopPrank();

        (, uint256 debt) = vaultEngine.vaults(user1);
        assertEq(debt, maxBorrow);
    }

    function testBorrowExceedsCollateral() public {
        uint256 depositAmount = 1000 * 10 ** 6; // 1000 USDC
        uint256 excessiveBorrow = 60000 * 10 ** 18; // Too much!

        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), depositAmount);
        vaultManager.deposit(depositAmount);

        vm.expectRevert("Insufficient collateralization");
        vaultManager.borrow(excessiveBorrow);
        vm.stopPrank();
    }

    function testBorrowWithoutCollateral() public {
        vm.startPrank(user1);
        vm.expectRevert("No collateral deposited");
        vaultManager.borrow(1000 * 10 ** 18);
        vm.stopPrank();
    }

    function testBorrowZeroAmount() public {
        uint256 depositAmount = 1000 * 10 ** 6;

        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), depositAmount);
        vaultManager.deposit(depositAmount);

        vm.expectRevert("Amount must be > 0");
        vaultManager.borrow(0);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                            REPAY TESTS
    //////////////////////////////////////////////////////////////*/

    function testRepay() public {
        uint256 depositAmount = 1000 * 10 ** 6;
        uint256 borrowAmount = 50000 * 10 ** 18;

        // Setup: Deposit and borrow
        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), depositAmount);
        vaultManager.deposit(depositAmount);
        vaultManager.borrow(borrowAmount);

        // Repay
        oinrToken.approve(address(vaultManager), borrowAmount);

        vm.expectEmit(true, false, false, true);
        emit Repaid(user1, borrowAmount);

        vaultManager.repay(borrowAmount);
        vm.stopPrank();

        // Verify debt cleared
        (, uint256 debt) = vaultEngine.vaults(user1);
        assertEq(debt, 0, "Debt should be zero");

        // Verify oINR was burned
        assertEq(oinrToken.balanceOf(user1), 0);
    }

    function testPartialRepay() public {
        uint256 depositAmount = 1000 * 10 ** 6;
        uint256 borrowAmount = 50000 * 10 ** 18;
        uint256 repayAmount = 20000 * 10 ** 18;

        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), depositAmount);
        vaultManager.deposit(depositAmount);
        vaultManager.borrow(borrowAmount);

        oinrToken.approve(address(vaultManager), repayAmount);
        vaultManager.repay(repayAmount);
        vm.stopPrank();

        (, uint256 debt) = vaultEngine.vaults(user1);
        assertEq(debt, borrowAmount - repayAmount);
    }

    function testRepayExceedsDebt() public {
        uint256 depositAmount = 1000 * 10 ** 6;
        uint256 borrowAmount = 50000 * 10 ** 18;
        uint256 excessRepay = 60000 * 10 ** 18;

        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), depositAmount);
        vaultManager.deposit(depositAmount);
        vaultManager.borrow(borrowAmount);

        oinrToken.approve(address(vaultManager), excessRepay);
        vm.expectRevert("Repay amount exceeds debt");
        vaultManager.repay(excessRepay);
        vm.stopPrank();
    }

    function testRepayWithoutDebt() public {
        vm.startPrank(user1);
        vm.expectRevert("Repay amount exceeds debt");
        vaultManager.repay(1000 * 10 ** 18);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                            WITHDRAW TESTS
    //////////////////////////////////////////////////////////////*/

    function testWithdraw() public {
        uint256 depositAmount = 1000 * 10 ** 6;

        // Deposit
        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), depositAmount);
        vaultManager.deposit(depositAmount);

        // Withdraw
        vm.expectEmit(true, false, false, true);
        emit Withdrawn(user1, depositAmount);

        vaultManager.withdraw(depositAmount);
        vm.stopPrank();

        // Verify vault cleared
        (uint256 collateral, ) = vaultEngine.vaults(user1);
        assertEq(collateral, 0);

        // Verify USDC returned
        assertEq(mockUSDC.balanceOf(user1), INITIAL_USDC);
    }

    function testWithdrawWithDebt() public {
        uint256 depositAmount = 1000 * 10 ** 6;
        uint256 borrowAmount = 50000 * 10 ** 18;

        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), depositAmount);
        vaultManager.deposit(depositAmount);
        vaultManager.borrow(borrowAmount);

        // Try to withdraw all - should fail
        vm.expectRevert("Withdrawal would under-collateralize vault");
        vaultManager.withdraw(depositAmount);
        vm.stopPrank();
    }

    function testPartialWithdrawWithDebt() public {
        uint256 depositAmount = 1000 * 10 ** 6;
        uint256 borrowAmount = 40000 * 10 ** 18;
        uint256 withdrawAmount = 200 * 10 ** 6; // Small withdrawal

        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), depositAmount);
        vaultManager.deposit(depositAmount);
        vaultManager.borrow(borrowAmount);

        // This should succeed as ratio stays healthy
        vaultManager.withdraw(withdrawAmount);
        vm.stopPrank();

        (uint256 collateral, ) = vaultEngine.vaults(user1);
        assertEq(collateral, depositAmount - withdrawAmount);
    }

    function testWithdrawExceedsCollateral() public {
        uint256 depositAmount = 1000 * 10 ** 6;

        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), depositAmount);
        vaultManager.deposit(depositAmount);

        vm.expectRevert("Insufficient collateral");
        vaultManager.withdraw(depositAmount + 1);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        BUY OINR TESTS
    //////////////////////////////////////////////////////////////*/

    function testBuyOINR() public {
        uint256 oinrAmount = 8300 * 10 ** 18; // 8,300 oINR
        uint256 expectedUSDC = 100 * 10 ** 6; // Should cost 100 USDC

        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), expectedUSDC);

        vm.expectEmit(true, false, false, true);
        emit OINRPurchased(user1, oinrAmount, expectedUSDC);

        vaultManager.buyOINR(oinrAmount);
        vm.stopPrank();

        // Verify user received oINR
        assertEq(oinrToken.balanceOf(user1), oinrAmount);

        // Verify USDC was paid
        assertEq(mockUSDC.balanceOf(user1), INITIAL_USDC - expectedUSDC);
    }

    function testBuyOINRLargeAmount() public {
        uint256 oinrAmount = 83000 * 10 ** 18; // 83,000 oINR
        uint256 expectedUSDC = 1000 * 10 ** 6; // 1000 USDC

        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), expectedUSDC);
        vaultManager.buyOINR(oinrAmount);
        vm.stopPrank();

        assertEq(oinrToken.balanceOf(user1), oinrAmount);
    }

    function testBuyOINRSmallAmount() public {
        uint256 oinrAmount = 83 * 10 ** 18; // 83 oINR
        uint256 expectedUSDC = 1 * 10 ** 6; // 1 USDC

        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), expectedUSDC);
        vaultManager.buyOINR(oinrAmount);
        vm.stopPrank();

        assertEq(oinrToken.balanceOf(user1), oinrAmount);
    }

    function testBuyOINRWithoutApproval() public {
        vm.startPrank(user1);
        vm.expectRevert();
        vaultManager.buyOINR(8300 * 10 ** 18);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        INTEGRATION TESTS
    //////////////////////////////////////////////////////////////*/

    function testCompleteUserFlow() public {
        uint256 depositAmount = 1000 * 10 ** 6; // 1000 USDC
        uint256 borrowAmount = 50000 * 10 ** 18; // 50,000 oINR

        vm.startPrank(user1);

        // 1. Deposit
        mockUSDC.approve(address(vaultManager), depositAmount);
        vaultManager.deposit(depositAmount);

        // 2. Borrow
        vaultManager.borrow(borrowAmount);
        assertEq(oinrToken.balanceOf(user1), borrowAmount);

        // 3. Simulate spending oINR (transfer to user2)
        oinrToken.transfer(user2, borrowAmount);
        assertEq(oinrToken.balanceOf(user1), 0);

        // 4. Buy back oINR
        uint256 requiredUSDC = (borrowAmount * 10 ** 6) / USDC_PRICE;
        mockUSDC.approve(address(vaultManager), requiredUSDC);
        vaultManager.buyOINR(borrowAmount);

        // 5. Repay debt
        oinrToken.approve(address(vaultManager), borrowAmount);
        vaultManager.repay(borrowAmount);

        // 6. Withdraw collateral
        vaultManager.withdraw(depositAmount);

        vm.stopPrank();

        // Verify final state
        (uint256 collateral, uint256 debt) = vaultEngine.vaults(user1);
        assertEq(collateral, 0, "Collateral should be zero");
        assertEq(debt, 0, "Debt should be zero");

        // User2 should have the oINR
        assertEq(oinrToken.balanceOf(user2), borrowAmount);
    }

    function testMultipleUsers() public {
        uint256 depositAmount = 1000 * 10 ** 6;
        uint256 borrowAmount = 40000 * 10 ** 18;

        // User 1 deposits and borrows
        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), depositAmount);
        vaultManager.deposit(depositAmount);
        vaultManager.borrow(borrowAmount);
        vm.stopPrank();

        // User 2 deposits and borrows
        vm.startPrank(user2);
        mockUSDC.approve(address(vaultManager), depositAmount);
        vaultManager.deposit(depositAmount);
        vaultManager.borrow(borrowAmount);
        vm.stopPrank();

        // Verify both vaults are independent
        (uint256 coll1, uint256 debt1) = vaultEngine.vaults(user1);
        (uint256 coll2, uint256 debt2) = vaultEngine.vaults(user2);

        assertEq(coll1, depositAmount);
        assertEq(coll2, depositAmount);
        assertEq(debt1, borrowAmount);
        assertEq(debt2, borrowAmount);

        // Both should have oINR
        assertEq(oinrToken.balanceOf(user1), borrowAmount);
        assertEq(oinrToken.balanceOf(user2), borrowAmount);
    }

    /*//////////////////////////////////////////////////////////////
                        VIEW FUNCTION TESTS
    //////////////////////////////////////////////////////////////*/

    function testGetVaultInfo() public {
        uint256 depositAmount = 1000 * 10 ** 6;
        uint256 borrowAmount = 50000 * 10 ** 18;

        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), depositAmount);
        vaultManager.deposit(depositAmount);
        vaultManager.borrow(borrowAmount);
        vm.stopPrank();

        (
            uint256 collateral,
            uint256 debt,
            uint256 collateralValueINR,
            uint256 ratio,
            bool isHealthy
        ) = vaultManager.getVaultInfo(user1);

        assertEq(collateral, depositAmount);
        assertEq(debt, borrowAmount);
        assertEq(collateralValueINR, 83000 * 10 ** 18); // 1000 USDC * 83
        assertEq(ratio, 16600); // 166%
        assertTrue(isHealthy);
    }

    function testGetVaultInfoEmpty() public view {
        (
            uint256 collateral,
            uint256 debt,
            uint256 collateralValueINR,
            uint256 ratio,
            bool isHealthy
        ) = vaultManager.getVaultInfo(user1);

        assertEq(collateral, 0);
        assertEq(debt, 0);
        assertEq(collateralValueINR, 0);
        assertEq(ratio, type(uint256).max);
        assertTrue(isHealthy);
    }

    function testCheckBorrowCapacity() public {
        uint256 depositAmount = 1000 * 10 ** 6;

        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), depositAmount);
        vaultManager.deposit(depositAmount);
        vm.stopPrank();

        (bool canBorrow, uint256 maxBorrowable) = vaultManager
            .checkBorrowCapacity(user1, 50000 * 10 ** 18);

        assertTrue(canBorrow);
        assertEq(maxBorrowable, 55333333333333333333333); // ~55,333 oINR
    }

    function testCheckBorrowCapacityExceeds() public {
        uint256 depositAmount = 1000 * 10 ** 6;
        uint256 excessiveAmount = 60000 * 10 ** 18;

        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), depositAmount);
        vaultManager.deposit(depositAmount);
        vm.stopPrank();

        (bool canBorrow, ) = vaultManager.checkBorrowCapacity(
            user1,
            excessiveAmount
        );

        assertFalse(canBorrow);
    }

    /*//////////////////////////////////////////////////////////////
                        ORACLE TESTS
    //////////////////////////////////////////////////////////////*/

    function testOraclePriceUpdate() public {
        uint256 newPrice = 85 * 10 ** 18; // Update to 85 INR per USDC

        oracle.setPrice(address(mockUSDC), newPrice);

        assertEq(oracle.getPrice(address(mockUSDC)), newPrice);
    }

    function testBorrowAfterPriceChange() public {
        uint256 depositAmount = 1000 * 10 ** 6;

        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), depositAmount);
        vaultManager.deposit(depositAmount);
        vm.stopPrank();

        // Increase USDC price
        oracle.setPrice(address(mockUSDC), 90 * 10 ** 18);

        // Should be able to borrow more now
        vm.prank(user1);
        vaultManager.borrow(60000 * 10 ** 18);

        (, uint256 debt) = vaultEngine.vaults(user1);
        assertEq(debt, 60000 * 10 ** 18);
    }

    /*//////////////////////////////////////////////////////////////
                        EDGE CASES
    //////////////////////////////////////////////////////////////*/

    function testDepositBorrowRepayMultipleTimes() public {
        vm.startPrank(user1);

        // First cycle
        mockUSDC.approve(address(vaultManager), 500 * 10 ** 6);
        vaultManager.deposit(500 * 10 ** 6);
        vaultManager.borrow(20000 * 10 ** 18);

        // Second deposit
        mockUSDC.approve(address(vaultManager), 500 * 10 ** 6);
        vaultManager.deposit(500 * 10 ** 6);
        vaultManager.borrow(20000 * 10 ** 18);

        // Partial repay
        oinrToken.approve(address(vaultManager), 10000 * 10 ** 18);
        vaultManager.repay(10000 * 10 ** 18);

        vm.stopPrank();

        (uint256 collateral, uint256 debt) = vaultEngine.vaults(user1);
        assertEq(collateral, 1000 * 10 ** 6);
        assertEq(debt, 30000 * 10 ** 18);
    }

    function testVerySmallAmounts() public {
        uint256 smallDeposit = 1 * 10 ** 6; // 1 USDC
        uint256 smallBorrow = 50 * 10 ** 18; // 50 oINR

        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), smallDeposit);
        vaultManager.deposit(smallDeposit);
        vaultManager.borrow(smallBorrow);
        vm.stopPrank();

        (, uint256 debt) = vaultEngine.vaults(user1);
        assertEq(debt, smallBorrow);
    }

    /*//////////////////////////////////////////////////////////////
                        FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    function testFuzzDeposit(uint256 amount) public {
        // Bound to reasonable amounts
        amount = bound(amount, 1 * 10 ** 6, INITIAL_USDC);

        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), amount);
        vaultManager.deposit(amount);
        vm.stopPrank();

        (uint256 collateral, ) = vaultEngine.vaults(user1);
        assertEq(collateral, amount);
    }

    function testFuzzBorrow(
        uint256 depositAmount,
        uint256 borrowAmount
    ) public {
        depositAmount = bound(depositAmount, 100 * 10 ** 6, INITIAL_USDC);

        // Max borrow based on deposit
        uint256 maxBorrow = (depositAmount * USDC_PRICE * 10000) /
            (10 ** 6 * MIN_RATIO);
        borrowAmount = bound(borrowAmount, 1 * 10 ** 18, maxBorrow);

        vm.startPrank(user1);
        mockUSDC.approve(address(vaultManager), depositAmount);
        vaultManager.deposit(depositAmount);
        vaultManager.borrow(borrowAmount);
        vm.stopPrank();

        (, uint256 debt) = vaultEngine.vaults(user1);
        assertEq(debt, borrowAmount);
    }
}
