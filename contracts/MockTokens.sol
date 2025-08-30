// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDT
 * @dev Mock USDT token for testing SEQICO functionality
 */
contract MockUSDT is ERC20 {
    constructor() ERC20("Mock USDT", "USDT") {
        _mint(msg.sender, 1000000 * 10**6); // 1M USDT with 6 decimals
    }
    
    function decimals() public view virtual override returns (uint8) {
        return 6; // USDT has 6 decimals
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

/**
 * @title MockUSDC
 * @dev Mock USDC token for testing SEQICO functionality
 */
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "USDC") {
        _mint(msg.sender, 1000000 * 10**6); // 1M USDC with 6 decimals
    }
    
    function decimals() public view virtual override returns (uint8) {
        return 6; // USDC has 6 decimals
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}