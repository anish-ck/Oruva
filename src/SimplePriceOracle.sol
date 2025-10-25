// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title SimplePriceOracle
/// @notice Mock price oracle for MVP/testing
/// @dev In production, use Chainlink or Band Protocol
contract SimplePriceOracle is Ownable {
    // Price precision (18 decimals)
    uint256 public constant PRECISION = 1e18;

    // Mapping: token address => price in INR (with 18 decimals)
    mapping(address => uint256) public prices;

    event PriceUpdated(
        address indexed token,
        uint256 oldPrice,
        uint256 newPrice
    );

    constructor() Ownable(msg.sender) {}

    /// @notice Set price for a token
    /// @param token Address of the token
    /// @param priceInINR Price in INR (with 18 decimals)
    /// @dev Example: 1 USDC = 83 INR → priceInINR = 83e18
    function setPrice(address token, uint256 priceInINR) external onlyOwner {
        require(token != address(0), "Invalid token address");
        require(priceInINR > 0, "Price must be > 0");

        uint256 oldPrice = prices[token];
        prices[token] = priceInINR;

        emit PriceUpdated(token, oldPrice, priceInINR);
    }

    /// @notice Batch set prices for multiple tokens
    function setPrices(
        address[] calldata tokens,
        uint256[] calldata pricesInINR
    ) external onlyOwner {
        require(tokens.length == pricesInINR.length, "Length mismatch");

        for (uint256 i = 0; i < tokens.length; i++) {
            require(tokens[i] != address(0), "Invalid token address");
            require(pricesInINR[i] > 0, "Price must be > 0");

            uint256 oldPrice = prices[tokens[i]];
            prices[tokens[i]] = pricesInINR[i];

            emit PriceUpdated(tokens[i], oldPrice, pricesInINR[i]);
        }
    }

    /// @notice Get price of a token in INR
    /// @param token Address of the token
    /// @return priceInINR Price with 18 decimals
    function getPrice(
        address token
    ) external view returns (uint256 priceInINR) {
        priceInINR = prices[token];
        require(priceInINR > 0, "Price not set");
    }

    /// @notice Calculate value in INR for given token amount
    /// @param token Address of the token
    /// @param amount Amount of tokens (in token's decimals)
    /// @param tokenDecimals Decimals of the token (e.g., 6 for USDC)
    /// @return valueInINR Value in INR (with 18 decimals)
    function getValueInINR(
        address token,
        uint256 amount,
        uint256 tokenDecimals
    ) external view returns (uint256 valueInINR) {
        uint256 priceInINR = prices[token];
        require(priceInINR > 0, "Price not set");

        // Normalize amount to 18 decimals, then multiply by price
        // Example: 1000 USDC (6 decimals) at 83 INR
        // = 1000 * 10^6 * 83 * 10^18 / 10^6 = 83000 * 10^18
        if (tokenDecimals < 18) {
            valueInINR =
                (amount * priceInINR * 10 ** (18 - tokenDecimals)) /
                PRECISION;
        } else if (tokenDecimals > 18) {
            valueInINR =
                (amount * priceInINR) /
                (PRECISION * 10 ** (tokenDecimals - 18));
        } else {
            valueInINR = (amount * priceInINR) / PRECISION;
        }
    }
}
