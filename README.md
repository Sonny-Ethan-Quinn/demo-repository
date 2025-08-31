# SEQ Token - Secure DeFi Token for Base Blockchain

This repository contains the **SEQ Token** - a secure ERC-20 token implementation designed specifically to prevent honeypot vulnerabilities commonly found on the Base blockchain.

## 🔒 Security Features

The SEQ token has been designed with security as the top priority, implementing comprehensive protections against common honeypot attack vectors:

- ✅ **No Hidden Minting**: Transparent minting functions with clear limitations
- ✅ **No Transfer Restrictions**: No blacklisting or selective transfer blocking
- ✅ **Zero Hidden Fees**: No transfer taxes or hidden fee mechanisms
- ✅ **No Ownership Backdoors**: Standard OpenZeppelin ownership with clear renouncement path
- ✅ **Reentrancy Protection**: All transfer functions protected against reentrancy attacks
- ✅ **Transparent Functions**: Built-in verification functions for security status
- ✅ **Decentralization Path**: Clear path to full decentralization via ownership renouncement

## 🚀 ICO Features

The SEQICO contract provides a secure Initial Coin Offering (ICO) implementation with multiple payment options:

### 💎 ICO Pricing Information
- **Token Price**: $2.78 per SEQ token
- **Total Supply**: 750,000 SEQ tokens
- **ICO Allocation**: 675,000 SEQ tokens (90% of total supply)
- **Owner Allocation**: 75,000 SEQ tokens (10% of total supply)
- **Total ICO Value**: $1,876,500

### 🛡️ Security Features
- 💰 **Multi-Currency Support**: Accept ETH, USDT, and USDC payments
- 🔒 **Secure Price Management**: Owner-controlled pricing with transparent calculations
- 💸 **Automatic Refunds**: Excess ETH automatically refunded to buyers
- 📊 **Event Logging**: All purchases logged for transparency
- 🛡️ **Input Validation**: Comprehensive checks for amounts, balances, and approvals
- 👥 **Owner Controls**: Secure withdrawal functions for collected funds
- 🔐 **Integration Security**: Seamless integration with secure SEQ token

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Token Deployment
The SEQ Token uses a three-parameter constructor for secure distribution:

```solidity
constructor(
    uint256 totalSupply,  // Total tokens to create
    address owner,        // Receives 10% of tokens + ownership
    address ico          // Receives 90% of tokens
)
```

**Distribution:**
- 10% of tokens go to the owner address
- 90% of tokens go to the ICO address
- Contract ownership is transferred to the owner address

### Security Verification
```bash
./verify-security.sh
```

### Compile Contracts
```bash
npx hardhat compile
```

### Run Security Tests
```bash
npx hardhat test
```

### Deploy to Base Network
```bash
# Deploy SEQ Token with ICO configuration
# - Total Supply: 750,000 SEQ tokens
# - ICO Price: $2.78 per SEQ token
# - Owner/ICO Address: 0xC217804689327649D4Fd89C9a269395084728BEF
npx hardhat run scripts/deploy.js --network base

# Deploy ICO Contract (optional - for automated sales)
npx hardhat run scripts/deploy-ico.js --network base
```

**Current Deployment Configuration:**
- **Total Supply**: 750,000 SEQ tokens  
- **ICO Token Price**: $2.78 per SEQ token
- **Distribution**: 75,000 SEQ to owner (10%), 675,000 SEQ for ICO (90%)
- **Owner/ICO Address**: `0xC217804689327649D4Fd89C9a269395084728BEF`
- **Total ICO Value**: $1,876,500

### ICO Security Verification
```bash
./verify-ico-security.sh
```

## 📁 Repository Structure

- `contracts/SEQToken.sol` - Main secure token contract
- `contracts/SEQICO.sol` - Secure ICO contract for token sales
- `contracts/MockTokens.sol` - Mock USDT/USDC tokens for testing
- `contracts/MaliciousReentrancy.sol` - Test contract for reentrancy protection
- `test/SEQToken.test.js` - Comprehensive security test suite
- `test/SEQICO.test.js` - ICO functionality test suite
- `scripts/deploy.js` - SEQ Token deployment script
- `scripts/deploy-ico.js` - ICO deployment script with security verification
- `SECURITY.md` - Detailed security documentation
- `verify-security.sh` - Automated security verification tool
- `verify-ico-security.sh` - ICO security verification tool

## 🛡️ Security Verification

The token includes a built-in security verification function:

```solidity
function verifyNotHoneypot() public view returns (bool isSecure, string memory reason)
```

This function analyzes the current state of the contract and provides transparency about its security status.

## 🌐 Network Support

- **Base Mainnet** (Chain ID: 8453)
- **Base Sepolia Testnet** (Chain ID: 84532)
- **Local Hardhat Network** (Chain ID: 1337)

## 📖 Documentation

For detailed security analysis and implementation details, see [SECURITY.md](SECURITY.md).

For ICO contract details and usage instructions, see [SEQICO.md](SEQICO.md).

## ⚠️ Important Security Notice

Always verify smart contracts on block explorers before interacting with them. This implementation prioritizes transparency and user safety over advanced features.

---

*This demo repository showcases best practices for secure token development on Base blockchain.*