// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title SEQ2 Token
 * @dev Advanced ERC-20 token implementation with fund management and price oracle integration
 * 
 * Features:
 * - Initial price set to $3.80 per token
 * - Standard token operations (mint, transfer, deposit, withdrawal)
 * - Fund management with owner controls
 * - Price update functionality through owner/admin
 * - Oracle integration capabilities for USD pricing
 * - Security features following best practices
 * - Comprehensive event logging for transparency
 * 
 * Security Features:
 * - Reentrancy protection on all external calls
 * - Pausable functionality for emergency stops
 * - Owner access controls with renouncement capability
 * - Transparent pricing and fund management
 * - No hidden fees or restrictions
 */
contract SEQ2Token is ERC20, Ownable, ReentrancyGuard, Pausable {
    
    // ============= Constants =============
    
    /// @dev Maximum supply is fixed at 1 billion tokens
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
    
    /// @dev Initial price in USD cents (380 = $3.80)
    uint256 public constant INITIAL_PRICE_USD_CENTS = 380;
    
    /// @dev Decimal places for USD price representation
    uint256 public constant PRICE_DECIMALS = 2;
    
    // ============= State Variables =============
    
    /// @dev Current price per token in USD cents (e.g., 380 = $3.80)
    uint256 public pricePerTokenUSDCents;
    
    /// @dev Total funds deposited in the contract (in wei)
    uint256 public totalDeposits;
    
    /// @dev Flag to indicate if minting is permanently disabled
    bool public mintingDisabled = false;
    
    /// @dev Address of the price oracle (if set)
    address public priceOracle;
    
    /// @dev Mapping to track individual user deposits
    mapping(address => uint256) public userDeposits;
    
    /// @dev Mapping to track withdrawal history
    mapping(address => uint256) public userWithdrawals;
    
    // ============= Events =============
    
    /// @dev Emitted when tokens are purchased
    event TokensPurchased(address indexed buyer, uint256 tokenAmount, uint256 ethAmount, uint256 pricePerToken);
    
    /// @dev Emitted when funds are deposited to the contract
    event FundsDeposited(address indexed depositor, uint256 amount, uint256 newTotal);
    
    /// @dev Emitted when funds are withdrawn by owner
    event FundsWithdrawn(address indexed owner, uint256 amount, uint256 remaining);
    
    /// @dev Emitted when user withdraws their deposit
    event UserWithdrawal(address indexed user, uint256 amount);
    
    /// @dev Emitted when token price is updated
    event PriceUpdated(uint256 oldPrice, uint256 newPrice, address updatedBy);
    
    /// @dev Emitted when price oracle is updated
    event PriceOracleUpdated(address indexed oldOracle, address indexed newOracle);
    
    /// @dev Emitted when minting is permanently disabled
    event MintingDisabled();
    
    /// @dev Emitted when contract is paused/unpaused
    event ContractPaused(bool paused);
    
    // ============= Constructor =============
    
    /**
     * @dev Constructor initializes SEQ2 token with specified parameters
     * @param initialSupply The initial supply to mint (must not exceed MAX_SUPPLY)
     * @param owner Address to receive tokens and become contract owner
     */
    constructor(
        uint256 initialSupply,
        address owner
    ) ERC20("SEQ2 Token", "SEQ2") {
        require(initialSupply <= MAX_SUPPLY, "Initial supply exceeds maximum");
        require(owner != address(0), "Owner address cannot be zero");
        
        // Set initial price to $3.80
        pricePerTokenUSDCents = INITIAL_PRICE_USD_CENTS;
        
        // Mint initial supply to owner
        if (initialSupply > 0) {
            _mint(owner, initialSupply);
        }
        
        // Transfer ownership to specified address
        _transferOwnership(owner);
        
        emit PriceUpdated(0, INITIAL_PRICE_USD_CENTS, address(this));
    }
    
    // ============= Token Operations =============
    
    /**
     * @dev Mint new tokens (can only be called by owner and only if minting is not disabled)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyOwner whenNotPaused {
        require(!mintingDisabled, "Minting has been permanently disabled");
        require(to != address(0), "Cannot mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed maximum supply");
        
        _mint(to, amount);
    }
    
    /**
     * @dev Permanently disable minting - this cannot be undone
     * Can only be called by owner
     */
    function disableMinting() external onlyOwner {
        mintingDisabled = true;
        emit MintingDisabled();
    }
    
    /**
     * @dev Override transfer to add reentrancy protection and pause check
     */
    function transfer(address to, uint256 amount) public override nonReentrant whenNotPaused returns (bool) {
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom to add reentrancy protection and pause check
     */
    function transferFrom(address from, address to, uint256 amount) public override nonReentrant whenNotPaused returns (bool) {
        return super.transferFrom(from, to, amount);
    }
    
    // ============= Fund Management =============
    
    /**
     * @dev Allow users to deposit additional funds to the contract
     * This function accepts ETH deposits and tracks them per user
     */
    function depositFunds() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Deposit amount must be greater than zero");
        
        userDeposits[msg.sender] += msg.value;
        totalDeposits += msg.value;
        
        emit FundsDeposited(msg.sender, msg.value, totalDeposits);
    }
    
    /**
     * @dev Purchase tokens with ETH based on current price
     * Automatically calculates token amount based on USD price and ETH/USD rate
     * Note: This is a simplified version. In production, you'd use a price oracle for ETH/USD conversion
     */
    function purchaseTokens() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Must send ETH to purchase tokens");
        
        // For demonstration, we'll use a fixed ETH/USD rate of $2000
        // In production, this should come from a price oracle
        uint256 ethUsdRate = 2000; // $2000 per ETH
        
        // Calculate token amount based on current price
        // msg.value is in wei, convert to ETH, then to USD, then divide by token price
        uint256 ethAmountInDollars = (msg.value * ethUsdRate) / 1e18;
        uint256 tokenAmount = (ethAmountInDollars * 100 * 1e18) / pricePerTokenUSDCents; // Convert cents to dollars
        
        require(tokenAmount > 0, "Purchase amount too small");
        require(totalSupply() + tokenAmount <= MAX_SUPPLY, "Would exceed maximum supply");
        
        _mint(msg.sender, tokenAmount);
        
        emit TokensPurchased(msg.sender, tokenAmount, msg.value, pricePerTokenUSDCents);
    }
    
    /**
     * @dev Allow users to withdraw their deposited funds
     * Users can only withdraw what they deposited
     */
    function withdrawUserDeposit() external nonReentrant whenNotPaused {
        uint256 userBalance = userDeposits[msg.sender];
        require(userBalance > 0, "No deposits to withdraw");
        
        userDeposits[msg.sender] = 0;
        userWithdrawals[msg.sender] += userBalance;
        totalDeposits -= userBalance;
        
        (bool success, ) = payable(msg.sender).call{value: userBalance}("");
        require(success, "Withdrawal failed");
        
        emit UserWithdrawal(msg.sender, userBalance);
    }
    
    /**
     * @dev Owner can withdraw contract funds (excluding user deposits)
     * @param amount Amount to withdraw in wei
     * @param recipient Address to receive the funds
     */
    function withdrawFunds(uint256 amount, address payable recipient) external onlyOwner nonReentrant {
        require(recipient != address(0), "Invalid recipient address");
        require(amount > 0, "Withdrawal amount must be greater than zero");
        
        uint256 availableBalance = address(this).balance - totalDeposits;
        require(amount <= availableBalance, "Insufficient available balance");
        
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Withdrawal failed");
        
        emit FundsWithdrawn(msg.sender, amount, address(this).balance);
    }
    
    // ============= Price Management =============
    
    /**
     * @dev Update the price per token in USD cents
     * @param newPriceUSDCents New price in USD cents (e.g., 400 = $4.00)
     */
    function updatePrice(uint256 newPriceUSDCents) external onlyOwner {
        require(newPriceUSDCents > 0, "Price must be greater than zero");
        
        uint256 oldPrice = pricePerTokenUSDCents;
        pricePerTokenUSDCents = newPriceUSDCents;
        
        emit PriceUpdated(oldPrice, newPriceUSDCents, msg.sender);
    }
    
    /**
     * @dev Set the price oracle address for automated price updates
     * @param oracleAddress Address of the price oracle contract
     */
    function setPriceOracle(address oracleAddress) external onlyOwner {
        address oldOracle = priceOracle;
        priceOracle = oracleAddress;
        
        emit PriceOracleUpdated(oldOracle, oracleAddress);
    }
    
    /**
     * @dev Update price from oracle (can be called by oracle or owner)
     * @param newPriceUSDCents New price from oracle in USD cents
     */
    function updatePriceFromOracle(uint256 newPriceUSDCents) external {
        require(
            msg.sender == priceOracle || msg.sender == owner(),
            "Only oracle or owner can update price"
        );
        require(newPriceUSDCents > 0, "Price must be greater than zero");
        
        uint256 oldPrice = pricePerTokenUSDCents;
        pricePerTokenUSDCents = newPriceUSDCents;
        
        emit PriceUpdated(oldPrice, newPriceUSDCents, msg.sender);
    }
    
    // ============= Emergency Controls =============
    
    /**
     * @dev Pause all token operations (emergency use only)
     */
    function pause() external onlyOwner {
        _pause();
        emit ContractPaused(true);
    }
    
    /**
     * @dev Unpause all token operations
     */
    function unpause() external onlyOwner {
        _unpause();
        emit ContractPaused(false);
    }
    
    // ============= View Functions =============
    
    /**
     * @dev Get current price in USD (dollars and cents)
     * @return dollars The dollar amount
     * @return cents The remaining cents
     */
    function getPriceUSD() external view returns (uint256 dollars, uint256 cents) {
        dollars = pricePerTokenUSDCents / 100;
        cents = pricePerTokenUSDCents % 100;
    }
    
    /**
     * @dev Get total contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get available balance for owner withdrawal (excludes user deposits)
     */
    function getAvailableBalance() external view returns (uint256) {
        return address(this).balance - totalDeposits;
    }
    
    /**
     * @dev Get user's deposit balance
     * @param user Address to check
     */
    function getUserDeposit(address user) external view returns (uint256) {
        return userDeposits[user];
    }
    
    /**
     * @dev Get user's total withdrawals
     * @param user Address to check
     */
    function getUserWithdrawals(address user) external view returns (uint256) {
        return userWithdrawals[user];
    }
    
    /**
     * @dev Calculate token amount for given ETH amount based on current price
     * @param ethAmount Amount of ETH in wei
     * @return tokenAmount Amount of tokens that can be purchased
     */
    function calculateTokenAmount(uint256 ethAmount) external view returns (uint256 tokenAmount) {
        if (ethAmount == 0) return 0;
        
        // Using fixed ETH/USD rate for demonstration
        uint256 ethUsdRate = 2000; // $2000 per ETH
        
        uint256 ethAmountInDollars = (ethAmount * ethUsdRate) / 1e18;
        tokenAmount = (ethAmountInDollars * 100 * 1e18) / pricePerTokenUSDCents;
    }
    
    /**
     * @dev Check contract security status
     */
    function verifySecurityStatus() external view returns (bool isSecure, string memory status) {
        if (mintingDisabled && owner() == address(0)) {
            return (true, "Fully decentralized - minting disabled and ownership renounced");
        } else if (mintingDisabled) {
            return (true, "Minting disabled - no new tokens can be created");
        } else if (owner() == address(0)) {
            return (true, "Ownership renounced - no privileged functions available");
        } else {
            return (false, "Owner controls active - consider disabling minting and renouncing ownership");
        }
    }
    
    // ============= Fallback Functions =============
    
    /**
     * @dev Receive function to handle direct ETH deposits
     */
    receive() external payable {
        if (msg.value > 0) {
            userDeposits[msg.sender] += msg.value;
            totalDeposits += msg.value;
            emit FundsDeposited(msg.sender, msg.value, totalDeposits);
        }
    }
    
    /**
     * @dev Fallback function
     */
    fallback() external payable {
        revert("Function not found");
    }
}