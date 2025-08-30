// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SEQ Token
 * @dev Secure ERC-20 token implementation designed to prevent honeypot vulnerabilities
 * 
 * Security Features:
 * - No hidden minting capabilities after deployment
 * - No ability to disable transfers for specific users
 * - No arbitrary tax changes that could trap funds
 * - No blacklist mechanisms that prevent selling
 * - Transparent and immutable core functionality
 * - Owner can only renounce ownership, not gain additional privileges
 */
contract SEQToken is ERC20, Ownable, ReentrancyGuard {
    // Maximum supply is fixed and cannot be changed
    uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18; // 1 billion tokens
    
    // Flag to indicate if minting is permanently disabled
    bool public mintingDisabled = false;
    
    // Events for transparency
    event MintingDisabled();
    event OwnershipRenounced();
    
    /**
     * @dev Constructor that distributes tokens between owner and ICO addresses
     * @param totalSupply The total supply to mint (must not exceed MAX_SUPPLY)
     * @param owner Address to receive 10% of tokens
     * @param ico Address to receive 90% of tokens
     */
    constructor(
        uint256 totalSupply,
        address owner,
        address ico
    ) ERC20("SEQ Token", "SEQ") {
        require(totalSupply <= MAX_SUPPLY, "Total supply exceeds maximum");
        require(owner != address(0), "Owner address cannot be zero");
        require(ico != address(0), "ICO address cannot be zero");
        
        uint256 ownerAmount = (totalSupply * 10) / 100; // 10%
        uint256 icoAmount = totalSupply - ownerAmount;  // 90%
        
        _mint(owner, ownerAmount);
        _mint(ico, icoAmount);
        
        // Transfer ownership to the specified owner address
        _transferOwnership(owner);
    }
    
    /**
     * @dev Mint new tokens (can only be called by owner and only if minting is not disabled)
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(!mintingDisabled, "Minting has been permanently disabled");
        require(totalSupply() + amount <= MAX_SUPPLY, "Would exceed maximum supply");
        _mint(to, amount);
    }
    
    /**
     * @dev Permanently disable minting - this cannot be undone
     * Can only be called by owner
     */
    function disableMinting() public onlyOwner {
        mintingDisabled = true;
        emit MintingDisabled();
    }
    
    /**
     * @dev Renounce ownership permanently - this cannot be undone
     * After calling this, no one can mint new tokens or call owner functions
     */
    function renounceOwnership() public override onlyOwner {
        super.renounceOwnership();
        emit OwnershipRenounced();
    }
    
    /**
     * @dev Override transfer to add reentrancy protection
     */
    function transfer(address to, uint256 amount) public override nonReentrant returns (bool) {
        return super.transfer(to, amount);
    }
    
    /**
     * @dev Override transferFrom to add reentrancy protection
     */
    function transferFrom(address from, address to, uint256 amount) public override nonReentrant returns (bool) {
        return super.transferFrom(from, to, amount);
    }
    
    /**
     * @dev No hidden fees or taxes - transfers always send the full amount
     * This function explicitly shows there are no hidden mechanics
     */
    function getTransferAmount(uint256 amount) public pure returns (uint256) {
        return amount; // Always returns the full amount - no fees
    }
    
    /**
     * @dev Check if an address can transfer tokens
     * Always returns true - no blacklisting mechanism
     */
    function canTransfer(address) public pure returns (bool) {
        return true; // Anyone can always transfer
    }
    
    /**
     * @dev Get the actual transfer tax (always 0%)
     */
    function getTransferTax() public pure returns (uint256) {
        return 0; // No transfer tax
    }
    
    /**
     * @dev Verify this is not a honeypot by checking key properties
     */
    function verifyNotHoneypot() public view returns (bool isSecure, string memory reason) {
        if (mintingDisabled && owner() == address(0)) {
            return (true, "Minting disabled and ownership renounced - fully decentralized");
        } else if (mintingDisabled) {
            return (true, "Minting disabled - no new tokens can be created");
        } else if (owner() == address(0)) {
            return (true, "Ownership renounced - no privileged functions available");
        } else {
            return (false, "Owner can still mint tokens - consider calling disableMinting() and renounceOwnership()");
        }
    }
}