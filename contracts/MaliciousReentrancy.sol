// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./SEQToken.sol";

/**
 * @title Malicious contract for testing reentrancy protection
 * @dev This contract is used in tests to verify that the SEQ token is protected against reentrancy
 */
contract MaliciousReentrancy {
    SEQToken public token;
    
    constructor(address _token) {
        token = SEQToken(_token);
    }
    
    /**
     * @dev This function would attempt reentrancy if the token wasn't protected
     * Since SEQToken uses ReentrancyGuard, this attack vector is blocked
     */
    function attemptReentrancy() external {
        // This would normally try to call transfer again during a transfer
        // But the reentrancy guard in SEQToken prevents this
        token.transfer(msg.sender, token.balanceOf(address(this)));
    }
    
    /**
     * @dev Fallback function that could be used for reentrancy attacks
     * Again, blocked by the ReentrancyGuard in SEQToken
     */
    receive() external payable {
        // Intentionally empty - reentrancy protection makes this safe
    }
}