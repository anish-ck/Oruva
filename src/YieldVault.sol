// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title YieldVault
 * @notice Users deposit tokens (USDC/oINR) and earn passive yield
 * @dev Simple yield vault with simulated APY for MVP
 */
contract YieldVault is Ownable, ReentrancyGuard {
    IERC20 public immutable depositToken;
    
    // APY in basis points (e.g., 500 = 5%)
    uint256 public apyBasisPoints = 500; // 5% APY
    
    struct Deposit {
        uint256 amount;
        uint256 depositTime;
        uint256 lastClaimTime;
    }
    
    mapping(address => Deposit) public deposits;
    
    uint256 public totalDeposited;
    
    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event YieldClaimed(address indexed user, uint256 yield);
    event APYUpdated(uint256 newAPY);
    
    constructor(address _depositToken) Ownable(msg.sender) {
        depositToken = IERC20(_depositToken);
    }
    
    /**
     * @notice Deposit tokens into the vault to earn yield
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        
        // Transfer tokens from user to vault
        require(
            depositToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        // If user already has a deposit, claim pending yield first
        if (deposits[msg.sender].amount > 0) {
            _claimYield(msg.sender);
        }
        
        // Update deposit
        deposits[msg.sender].amount += amount;
        deposits[msg.sender].depositTime = block.timestamp;
        deposits[msg.sender].lastClaimTime = block.timestamp;
        
        totalDeposited += amount;
        
        emit Deposited(msg.sender, amount);
    }
    
    /**
     * @notice Withdraw deposited tokens (principal only)
     */
    function withdraw(uint256 amount) external nonReentrant {
        Deposit storage userDeposit = deposits[msg.sender];
        require(userDeposit.amount >= amount, "Insufficient balance");
        
        // Claim pending yield first
        _claimYield(msg.sender);
        
        // Update deposit
        userDeposit.amount -= amount;
        totalDeposited -= amount;
        
        // Transfer tokens back to user
        require(
            depositToken.transfer(msg.sender, amount),
            "Transfer failed"
        );
        
        emit Withdrawn(msg.sender, amount);
    }
    
    /**
     * @notice Claim earned yield without withdrawing principal
     */
    function claimYield() external nonReentrant {
        _claimYield(msg.sender);
    }
    
    /**
     * @notice Internal function to calculate and transfer yield
     */
    function _claimYield(address user) internal {
        uint256 yield = calculateYield(user);
        
        if (yield > 0) {
            deposits[user].lastClaimTime = block.timestamp;
            
            // Transfer yield to user
            require(
                depositToken.transfer(user, yield),
                "Yield transfer failed"
            );
            
            emit YieldClaimed(user, yield);
        }
    }
    
    /**
     * @notice Calculate pending yield for a user
     * @dev Simple interest calculation: (principal * APY * time) / (365 days * 10000)
     */
    function calculateYield(address user) public view returns (uint256) {
        Deposit memory userDeposit = deposits[user];
        
        if (userDeposit.amount == 0) {
            return 0;
        }
        
        uint256 timeElapsed = block.timestamp - userDeposit.lastClaimTime;
        
        // Calculate yield: (amount * APY * timeElapsed) / (365 days * 10000)
        // APY is in basis points (500 = 5%)
        uint256 yield = (userDeposit.amount * apyBasisPoints * timeElapsed) / 
                       (365 days * 10000);
        
        return yield;
    }
    
    /**
     * @notice Get user's deposit info including pending yield
     */
    function getUserInfo(address user) external view returns (
        uint256 depositedAmount,
        uint256 pendingYield,
        uint256 depositTime,
        uint256 lastClaimTime
    ) {
        Deposit memory userDeposit = deposits[user];
        return (
            userDeposit.amount,
            calculateYield(user),
            userDeposit.depositTime,
            userDeposit.lastClaimTime
        );
    }
    
    /**
     * @notice Update APY (owner only)
     */
    function updateAPY(uint256 newAPY) external onlyOwner {
        require(newAPY <= 10000, "APY cannot exceed 100%");
        apyBasisPoints = newAPY;
        emit APYUpdated(newAPY);
    }
    
    /**
     * @notice Owner can fund the vault for yield distribution
     */
    function fundVault(uint256 amount) external onlyOwner {
        require(
            depositToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
    }
    
    /**
     * @notice Get current APY as percentage (e.g., 500 = 5%)
     */
    function getAPY() external view returns (uint256) {
        return apyBasisPoints; // Returns basis points (500 = 5%)
    }
}
