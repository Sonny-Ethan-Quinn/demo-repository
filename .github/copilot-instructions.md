# SEQ Token - Secure DeFi Token Repository

**ALWAYS follow these instructions first and only fallback to additional search and context gathering if the information here is incomplete or found to be in error.**

This repository contains the SEQ Token - a secure ERC-20 token implementation designed to prevent honeypot vulnerabilities on the Base blockchain. It uses Hardhat for smart contract development, testing, and deployment.

## Working Effectively

### Prerequisites and Setup
- Node.js v20+ and npm are pre-installed in the environment
- Install dependencies: `npm install` -- takes 60+ seconds. NEVER CANCEL. Set timeout to 180+ seconds.
- **CRITICAL LIMITATION**: Hardhat compilation fails due to network restrictions preventing Solidity compiler download from binaries.soliditylang.org

### Build and Compile
- **PRIMARY BUILD COMMAND**: `npx hardhat compile` -- **FAILS due to network restrictions**
- Error message: "Couldn't download compiler version list. Please check your internet connection"
- **WORKAROUND**: The project cannot be compiled in environments with restricted internet access
- Document any compilation requirements as: "Compilation requires unrestricted internet access to download Solidity compiler v0.8.4"

### Testing
- **TEST COMMAND**: `npx hardhat test` -- **FAILS due to compilation dependency**
- Security verification: `./verify-security.sh` -- takes under 1 second. Always succeeds with security checklist output.
- **NEVER CANCEL**: If running in unrestricted environment, allow 5+ minutes for complete test suite

### Security Verification
- Always run: `./verify-security.sh` to get security status and deployment instructions
- This script bypasses compilation issues and provides comprehensive security checklist
- Outputs useful deployment commands and security verification steps

### Deployment Commands (require compilation)
- Local deployment: `npx hardhat run scripts/deploy.js`
- Base network: `npx hardhat run scripts/deploy.js --network base`
- **NOTE**: All deployment commands require successful compilation first

## Validation and Testing

### Manual Validation Scenarios
Since compilation fails in restricted environments, validate changes by:

1. **Code Review**: Examine Solidity contracts in `/contracts/` for security patterns
2. **Test Logic Review**: Verify test cases in `/test/SEQToken.test.js` cover security scenarios
3. **Configuration Check**: Ensure `hardhat.config.js` has correct network settings
4. **Script Validation**: Review deployment logic in `scripts/deploy.js`

### Essential Manual Validation Workflows

**When modifying SEQToken.sol, always verify:**
- `transfer()` and `transferFrom()` functions include `nonReentrant` modifier
- `getTransferAmount()` always returns the full amount (no hidden fees)
- `canTransfer()` always returns true (no blacklisting)
- `getTransferTax()` always returns 0 (no transfer taxes)
- `verifyNotHoneypot()` logic correctly checks minting and ownership status
- MAX_SUPPLY constant remains at 1 billion tokens
- Constructor validates initialSupply <= MAX_SUPPLY

**When modifying test files, ensure coverage of:**
- Normal transfer scenarios (owner to user, user to user)
- No-fee verification (`getTransferAmount` returns full amount)
- No-blacklist verification (`canTransfer` always true)
- Reentrancy protection (malicious contract tests)
- Security status verification (`verifyNotHoneypot` different states)
- Edge cases (zero transfers, max supply deployment)

**When modifying deployment scripts, verify:**
- Initial supply validation against MAX_SUPPLY
- Security status check after deployment
- Clear instructions for `disableMinting()` and `renounceOwnership()`
- Network-specific configurations are correct

### Security Validation Checklist
Always verify these security features are maintained:
- ✅ No hidden minting functions beyond MAX_SUPPLY
- ✅ No transfer restrictions or blacklisting capabilities  
- ✅ No hidden fees or taxes on transfers
- ✅ No ownership backdoors beyond standard renouncement
- ✅ Reentrancy protection on all transfer functions
- ✅ Transparent verification functions available
- ✅ Clear path to full decentralization via ownership renouncement

### Build Timing Expectations
- **npm install**: 60-120 seconds (many deprecation warnings expected)
- **npx hardhat compile**: Immediate failure in restricted environment, 30-60 seconds in unrestricted
- **npx hardhat test**: Depends on compilation success, 2-5 minutes for full test suite
- **./verify-security.sh**: Under 1 second (always succeeds)

## Repository Structure

### Key Directories and Files
```
/
├── .github/
│   ├── workflows/               # GitHub Actions (auto-assign, proof-html)
│   └── copilot-instructions.md  # This file - GitHub Copilot instructions
├── contracts/
│   ├── SEQToken.sol            # Main secure token contract
│   └── MaliciousReentrancy.sol # Test contract for security validation
├── test/
│   ├── SEQToken.test.js        # Comprehensive security test suite
│   └── Lock.js                 # Example Hardhat test (unused)
├── scripts/
│   └── deploy.js               # Deployment script with security verification
├── ignition/modules/
│   └── Lock.js                 # Hardhat ignition deployment module
├── hardhat.config.js           # Hardhat configuration (Base network support)
├── package.json                # Dependencies (no custom scripts defined)
├── verify-security.sh          # Security verification tool
├── README.md                   # Project overview and quick start
├── SECURITY.md                 # Detailed security analysis
└── index.html                  # Simple web page
```

### Important Configuration Files
- **hardhat.config.js**: Contains Base mainnet (8453) and Sepolia testnet (84532) configurations
- **verify-security.sh**: Executable security verification script
- **package.json**: No custom npm scripts defined, uses standard Hardhat commands

## Common Tasks and Commands

### Quick Status Check
```bash
# Always start with dependency installation
npm install  # 60+ seconds, expect deprecation warnings

# Security verification (always works)
./verify-security.sh

# Check current directory structure
ls -la
```

### Development Workflow
```bash
# 1. Install dependencies (if not done)
npm install

# 2. Verify security status
./verify-security.sh

# 3. Attempt compilation (will fail in restricted environment)
npx hardhat compile

# 4. Run tests (requires compilation)
npx hardhat test

# 5. Deploy locally (requires compilation)
npx hardhat run scripts/deploy.js
```

### Network Deployment (when compilation works)
```bash
# Configure private key in hardhat.config.js first
# Uncomment and set: accounts: [process.env.PRIVATE_KEY]

# Deploy to Base mainnet
npx hardhat run scripts/deploy.js --network base

# Deploy to Base Sepolia testnet  
npx hardhat run scripts/deploy.js --network baseSepolia
```

## Common Command Outputs (for reference)

### npm install output (expected)
```
added 584 packages, and audited 620 packages in 1m
111 packages are looking for funding
25 vulnerabilities (6 low, 11 moderate, 5 high, 3 critical)
```

### ./verify-security.sh output
```
🔍 SEQ Token Security Verification Tool
=======================================
📋 Security Checklist for SEQ Token:
✅ No hidden minting functions
✅ No transfer restrictions or blacklisting  
✅ No hidden fees or taxes
✅ No ownership backdoors
✅ Reentrancy protection enabled
✅ Transparent and verifiable functions
✅ Path to full decentralization available
```

### Directory listing
```
.github/     contracts/   hardhat.config.js  package.json      test/
.gitignore   ignition/    index.html         scripts/          verify-security.sh
README.md    node_modules/ package-lock.json SECURITY.md
```

## Environment Limitations

### Known Issues
- **Hardhat compilation fails** due to network restrictions preventing Solidity compiler download
- **All test commands fail** as they depend on successful compilation
- **Deployment commands fail** as they require compiled contracts

### Working Around Limitations
- Use `./verify-security.sh` for security verification (always works)
- Manually review Solidity code in `/contracts/` directory
- Validate test logic in `/test/` directory without execution
- Review deployment scripts in `/scripts/` directory
- Use README.md and SECURITY.md for comprehensive documentation

## Critical Reminders

- **NEVER CANCEL npm install** - takes 60+ seconds with many warnings
- **NEVER CANCEL compilation attempts** - may take 5+ minutes in unrestricted environments
- **ALWAYS run ./verify-security.sh** first for project status
- **Set 3+ minute timeouts** for any Hardhat commands
- **Use ./verify-security.sh** as primary validation tool in restricted environments
- **Document network limitation** when compilation fails: "Requires unrestricted internet access"

## Additional Context

### Project Purpose
SEQ Token is a demonstration of secure DeFi token development practices, specifically designed to prevent common honeypot vulnerabilities found on Base blockchain.

### Security Features
- Fixed MAX_SUPPLY of 1 billion tokens
- Reentrancy protection using OpenZeppelin
- No hidden minting after disableMinting() call
- No transfer restrictions or fees
- Clear ownership renouncement path for full decentralization

### Development Stack
- **Smart Contracts**: Solidity ^0.8.4
- **Development Framework**: Hardhat ^2.19.0
- **Testing**: Chai + Ethereum Waffle
- **Dependencies**: OpenZeppelin Contracts v4.9.0
- **Networks**: Base Mainnet (8453), Base Sepolia (84532), Local Hardhat (1337)