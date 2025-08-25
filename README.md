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

## 🚀 Quick Start

### Installation
```bash
npm install
```

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
npx hardhat run scripts/deploy.js --network base
```

## 📁 Repository Structure

- `contracts/SEQToken.sol` - Main secure token contract
- `contracts/MaliciousReentrancy.sol` - Test contract for reentrancy protection
- `test/SEQToken.test.js` - Comprehensive security test suite
- `scripts/deploy.js` - Deployment script with security verification
- `SECURITY.md` - Detailed security documentation
- `verify-security.sh` - Automated security verification tool

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

## ⚠️ Important Security Notice

Always verify smart contracts on block explorers before interacting with them. This implementation prioritizes transparency and user safety over advanced features.

---

*This demo repository showcases best practices for secure token development on Base blockchain.*
