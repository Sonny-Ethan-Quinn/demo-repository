# SEQ Token - Secure DeFi Token Smart Contract Project

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

This repository contains the SEQ Token - a secure ERC-20 token implementation designed to prevent honeypot vulnerabilities on the Base blockchain. It's a Hardhat-based smart contract development project using Node.js, Solidity, and JavaScript testing.

## Working Effectively

### Prerequisites and Dependencies
- Node.js v20+ and npm are required and pre-installed
- Internet connectivity is required for Solidity compiler downloads
- Run dependency installation:
  ```bash
  npm install
  ```
  **NEVER CANCEL**: Takes 60+ seconds. Set timeout to 120+ seconds. Multiple npm warnings are expected and normal.

### Core Development Commands
- Compile contracts:
  ```bash
  npx hardhat compile
  ```
  **NEVER CANCEL**: Takes 30+ seconds on first run (downloads Solidity compiler). Set timeout to 300+ seconds.
  **KNOWN LIMITATION**: Fails without internet connectivity due to compiler download requirements.

- Run security test suite:
  ```bash
  npx hardhat test
  ```
  **NEVER CANCEL**: Takes 15+ seconds. Set timeout to 60+ seconds.
  **PREREQUISITE**: Requires successful compilation first.

- Run specific test file:
  ```bash
  npx hardhat test test/SEQToken.test.js
  ```

- Security verification tool:
  ```bash
  ./verify-security.sh
  ```
  **NEVER CANCEL**: Takes 30+ seconds. Runs tests and provides security checklist.

### Local Development Network
- Start local Hardhat network:
  ```bash
  npx hardhat node
  ```
  **NEVER CANCEL**: Runs indefinitely. Use async=true and appropriate session management.

- Deploy to local network (in separate terminal):
  ```bash
  npx hardhat run scripts/deploy.js
  ```

### Production Deployment
- Deploy to Base mainnet:
  ```bash
  npx hardhat run scripts/deploy.js --network base
  ```
  **PREREQUISITE**: Requires private key configuration in hardhat.config.js

- Deploy to Base testnet:
  ```bash
  npx hardhat run scripts/deploy.js --network baseSepolia
  ```

## Validation and Testing

### CRITICAL: Manual Validation Requirements
After making any changes to smart contracts, ALWAYS run through these complete validation scenarios:

1. **Token Deployment Validation**:
   ```bash
   npx hardhat run scripts/deploy.js
   ```
   Verify output shows:
   - Correct token name: "SEQ Token"
   - Correct symbol: "SEQ"
   - Initial supply matches deployment parameter
   - Security status check passes

2. **Security Features Validation**:
   Run the security test suite and verify all tests pass:
   ```bash
   npx hardhat test test/SEQToken.test.js
   ```
   Key scenarios that MUST pass:
   - Normal transfers work without restrictions
   - No hidden fees or taxes applied
   - Reentrancy protection functions
   - Minting controls work correctly
   - Ownership can be renounced

3. **Transfer Functionality Validation**:
   ```javascript
   // In hardhat console (npx hardhat console):
   const token = await ethers.getContractAt("SEQToken", "<deployed-address>");
   const [owner, addr1] = await ethers.getSigners();
   
   // Test normal transfer
   await token.transfer(addr1.address, ethers.parseEther("1000"));
   console.log("Transfer successful");
   
   // Verify no fees
   const amount = await token.getTransferAmount(ethers.parseEther("1000"));
   console.log("Full amount transferred:", ethers.formatEther(amount));
   ```

### Security Verification Commands
- Check if token is secure:
  ```javascript
  const [isSecure, reason] = await token.verifyNotHoneypot();
  console.log(`Secure: ${isSecure}, Reason: ${reason}`);
  ```

- Verify no transfer restrictions:
  ```javascript
  const canTransfer = await token.canTransfer(userAddress);
  const transferTax = await token.getTransferTax();
  console.log(`Can transfer: ${canTransfer}, Tax: ${transferTax}%`);
  ```

## Repository Structure and Navigation

### Key Contract Files
- `contracts/SEQToken.sol` - Main secure token implementation with anti-honeypot features
- `contracts/MaliciousReentrancy.sol` - Test contract for validating reentrancy protection

### Test Files
- `test/SEQToken.test.js` - Comprehensive security test suite (150+ lines)
- `test/Lock.js` - Standard Hardhat template test (can be ignored)

### Deployment and Scripts
- `scripts/deploy.js` - Production deployment script with security verification
- `verify-security.sh` - Automated security verification tool

### Configuration Files
- `hardhat.config.js` - Hardhat configuration with Base network support
- `package.json` - Dependencies including Hardhat, OpenZeppelin, ethers.js
- `.gitignore` - Excludes node_modules, cache, artifacts, .env files

### Documentation
- `README.md` - Project overview and quick start guide
- `SECURITY.md` - Detailed security analysis and audit results
- `index.html` - Simple landing page for GitHub Pages

## Common Issues and Limitations

### Network Connectivity Issues
- **Compiler Download Failures**: `npx hardhat compile` fails without internet access
  - Error: "Couldn't download compiler version list"
  - **Workaround**: Ensure internet connectivity or use pre-compiled artifacts
  - **Never skip compilation** - it's required for testing and deployment

### Security Warnings
- npm audit shows 25 vulnerabilities (expected in Hardhat projects)
- **Do not run** `npm audit fix --force` as it may break Hardhat compatibility
- These are primarily in development dependencies and don't affect contract security

### Expected Timing
- `npm install`: 60+ seconds (NEVER CANCEL, set 120+ second timeout)
- `npx hardhat compile`: 30+ seconds first time (NEVER CANCEL, set 300+ second timeout)
- `npx hardhat test`: 15+ seconds (NEVER CANCEL, set 60+ second timeout)
- `./verify-security.sh`: 30+ seconds (NEVER CANCEL)

## Path to Decentralization

The SEQ token includes a clear path to full decentralization:

1. **After deployment**: Call `disableMinting()` to permanently prevent new token creation
2. **Final step**: Call `renounceOwnership()` to remove all owner privileges
3. **Verification**: Contract becomes fully immutable and decentralized

## Additional Context

### GitHub Workflows
- `.github/workflows/auto-assign.yml` - Auto-assigns issues to sonnyquinn24
- `.github/workflows/proof-html.yml` - Validates HTML files in repository

### Quick Reference Commands
```bash
# Full development cycle
npm install                                    # 60+ seconds
npx hardhat compile                           # 30+ seconds  
npx hardhat test                              # 15+ seconds
./verify-security.sh                          # 30+ seconds

# Deployment cycle  
npx hardhat run scripts/deploy.js             # Local deployment
npx hardhat run scripts/deploy.js --network base  # Production deployment
```

### Important Files to Check After Changes
- Always run the full test suite after modifying `contracts/SEQToken.sol`
- Check `SECURITY.md` if security features are modified
- Update `README.md` if adding new functionality
- Verify `hardhat.config.js` if changing network configurations

Remember: This project prioritizes security and transparency over advanced features. Always validate that changes maintain the anti-honeypot properties of the token.