# Demo Repository - Multi-Project Development Environment

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

This repository contains two main projects:
1. **SEQ Token Smart Contract Project** - A secure ERC-20 token implementation designed to prevent honeypot vulnerabilities on the Base blockchain (Hardhat-based with Node.js, Solidity, and JavaScript testing)
2. **Python API Client Project** - A comprehensive Mistral AI integration client with GitHub authentication (Python-based with comprehensive testing)

## Working Effectively

### Prerequisites and Dependencies

#### Node.js Project (Smart Contracts)
- Node.js v20+ and npm are required and pre-installed
- Internet connectivity is required for Solidity compiler downloads
- Run dependency installation:
  ```bash
  npm install
  ```
  **NEVER CANCEL**: Takes 45+ seconds (actual: ~40s). Set timeout to 120+ seconds. Multiple npm warnings are expected and normal.

#### Python Project (API Client)
- Python 3.6+ required (3.12.3 pre-installed)
- Optional dependency for full functionality:
  ```bash
  pip install mistralai
  ```
  **TIMING**: Takes 10-30 seconds. Set timeout to 60+ seconds.
- Required for full functionality: GitHub Personal Access Token
  ```bash
  export GITHUB_TOKEN="your_github_personal_access_token_here"
  ```

### Core Development Commands

#### Smart Contract Development
- Compile contracts:
  ```bash
  npx hardhat compile
  ```
  **NEVER CANCEL**: Takes 2-30+ seconds on first run (downloads Solidity compiler). Set timeout to 300+ seconds.
  **KNOWN LIMITATION**: Fails without internet connectivity due to compiler download requirements.

- Run security test suite:
  ```bash
  npx hardhat test
  ```
  **NEVER CANCEL**: Takes 1-15+ seconds. Set timeout to 60+ seconds.
  **PREREQUISITE**: Requires successful compilation first.

- Run specific test files:
  ```bash
  npx hardhat test test/SEQToken.security.test.js    # Security tests - WORKS
  npx hardhat test test/SEQToken.honeypot.test.js    # Honeypot prevention tests - WORKS
  npx hardhat test test/SEQ2Token.test.js            # SEQ2 advanced token tests
  ```
  **NOTE**: `test/SEQToken.test.js` is actually a deployment script, not a test file.
  **NOTE**: `test/SEQICO.test.js` may have parameter configuration issues.

- Security verification tools:
  ```bash
  ./verify-security.sh        # SEQ Token security verification
  ./verify-ico-security.sh    # SEQICO security verification
  ```
  **NEVER CANCEL**: Takes 1-30+ seconds each. Runs tests and provides security checklist.

#### Python API Development
- Run test suites:
  ```bash
  cd apis && python3 test_mistral_client_simple.py  # Basic tests - ALWAYS WORKS
  cd apis && python3 test_mistral_client.py         # Full test suite (takes longer)
  ```
  **TIMING**: Simple tests take 0.1 seconds, full tests may take 60+ seconds. Set timeout to 300+ seconds for full tests.

- Run API client:
  ```bash
  cd apis && python3 mistral_client.py
  ```
  **PREREQUISITE**: Requires GITHUB_TOKEN environment variable. Without it, shows helpful error message.
  **TIMING**: Immediate startup, interactive mode can run indefinitely.

### Local Development Network
- Start local Hardhat network:
  ```bash
  npx hardhat node
  ```
  **NEVER CANCEL**: Runs indefinitely. Use async=true and appropriate session management.

- Deploy to local network (in separate terminal):
  ```bash
  npx hardhat run scripts/deploy.js              # SEQ Token deployment - WORKS
  npx hardhat run scripts/deploy-seq2.js         # SEQ2 Token deployment
  npx hardhat run scripts/deploy-ico.js          # ICO deployment (may have issues)
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
   npx hardhat test test/SEQToken.security.test.js
   npx hardhat test test/SEQToken.honeypot.test.js
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

### Python API Validation Requirements
After making changes to Python API components, ALWAYS run through these validation scenarios:

1. **Basic Functionality Test**:
   ```bash
   cd apis && python3 test_mistral_client_simple.py
   ```
   Verify all tests pass (should take ~0.1 seconds).

2. **Token Validation Test**:
   ```bash
   cd apis && python3 mistral_client.py
   ```
   Without GITHUB_TOKEN, should show helpful error message with setup instructions.

3. **Full Test Suite** (optional):
   ```bash
   cd apis && python3 test_mistral_client.py
   ```
   **WARNING**: May take 60+ seconds. Use timeout of 300+ seconds.

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

### Smart Contract Files
- `contracts/SEQToken.sol` - Main secure token implementation with anti-honeypot features
- `contracts/SEQ2Token.sol` - Advanced token contract with fund management features
- `contracts/SEQICO.sol` - Secure ICO contract for token sales
- `contracts/MockTokens.sol` - Mock USDT/USDC tokens for testing
- `contracts/MaliciousReentrancy.sol` - Test contract for validating reentrancy protection

### Python API Files
- `apis/mistral_client.py` - Comprehensive Mistral AI client with GitHub authentication
- `apis/test_mistral_client.py` - Full test suite for Mistral client (comprehensive but slow)
- `apis/test_mistral_client_simple.py` - Basic test suite (fast, always works)
- `apis/README.md` - Detailed documentation for Python API usage

### Test Files
- `test/SEQToken.security.test.js` - Comprehensive security test suite (150+ lines) - **WORKS**
- `test/SEQToken.honeypot.test.js` - Honeypot prevention test suite - **WORKS**
- `test/SEQ2Token.test.js` - Advanced token functionality tests
- `test/SEQICO.test.js` - ICO functionality test suite (may have parameter issues)
- `test/SEQToken.test.js` - **NOTE**: This is actually a deployment script, not a test file
- `test/Lock.js.disabled` - Standard Hardhat template test (disabled)

### Deployment and Scripts
- `scripts/deploy.js` - SEQ Token deployment script with security verification - **WORKS**
- `scripts/deploy-seq2.js` - SEQ2 Token deployment script
- `scripts/deploy-ico.js` - ICO deployment script (may have configuration issues)
- `scripts/interact-ico.js` - ICO interaction utilities
- `scripts/interact-seq2.js` - SEQ2 interaction utilities
- `scripts/estimate-gas.js` - Gas estimation utilities
- `scripts/verify-supply.js` - Supply verification utilities
- `verify-security.sh` - Automated security verification tool - **WORKS**
- `verify-ico-security.sh` - ICO security verification tool - **WORKS**

### Configuration Files
- `hardhat.config.js` - Hardhat configuration with Base network support
- `package.json` - Dependencies including Hardhat, OpenZeppelin, ethers.js
- `.gitignore` - Excludes node_modules, cache, artifacts, .env files

### Documentation
- `README.md` - Project overview and quick start guide
- `SECURITY.md` - Detailed security analysis and audit results
- `SEQ2Token.md` - Documentation for advanced SEQ2 token
- `SEQICO.md` - Documentation for ICO contract
- `HONEYPOT_SECURITY_REPORT.md` - Security analysis report
- `index.html` - Simple landing page for GitHub Pages

## Common Issues and Limitations

### Smart Contract Project Issues

#### Network Connectivity Issues
- **Compiler Download Failures**: `npx hardhat compile` fails without internet access
  - Error: "Couldn't download compiler version list"
  - **Workaround**: Ensure internet connectivity or use pre-compiled artifacts
  - **Never skip compilation** - it's required for testing and deployment

#### Test File Issues
- **SEQToken.test.js is a deployment script**: Use `test/SEQToken.security.test.js` or `test/SEQToken.honeypot.test.js` for actual tests
- **SEQICO.test.js has parameter issues**: May fail with "missing argument" errors
- **Working test files**: `SEQToken.security.test.js`, `SEQToken.honeypot.test.js`, `SEQ2Token.test.js`

#### Security Warnings
- npm audit shows 25 vulnerabilities (expected in Hardhat projects)
- **Do not run** `npm audit fix --force` as it may break Hardhat compatibility
- These are primarily in development dependencies and don't affect contract security

### Python API Project Issues

#### Missing Dependencies
- **ImportError: No module named 'mistralai'**: Install with `pip install mistralai`
- **GITHUB_TOKEN not set**: Export token with `export GITHUB_TOKEN="your_token_here"`
- **Invalid token format**: Ensure token starts with `ghp_`, `gho_`, `ghu_`, or `ghs_`

#### Test Performance
- **Simple tests**: Always work, take ~0.1 seconds
- **Full test suite**: May take 60+ seconds, use appropriate timeouts
- **Interactive mode**: Can run indefinitely, requires proper session management

### Expected Timing
- `npm install`: 40-45 seconds (NEVER CANCEL, set 120+ second timeout)
- `npx hardhat compile`: 2-30 seconds first time (NEVER CANCEL, set 300+ second timeout)
- `npx hardhat test`: 1-15 seconds (NEVER CANCEL, set 60+ second timeout)
- `./verify-security.sh`: 1-30 seconds (NEVER CANCEL)
- `./verify-ico-security.sh`: 0.2-10 seconds (NEVER CANCEL)
- `python3 test_mistral_client_simple.py`: 0.1 seconds
- `python3 test_mistral_client.py`: 60+ seconds (NEVER CANCEL, set 300+ second timeout)

## Path to Decentralization

The SEQ token includes a clear path to full decentralization:

1. **After deployment**: Call `disableMinting()` to permanently prevent new token creation
2. **Final step**: Call `renounceOwnership()` to remove all owner privileges
3. **Verification**: Contract becomes fully immutable and decentralized

## Additional Context

### GitHub Workflows
- `.github/workflows/auto-assign.yml` - Auto-assigns issues to sonnyquinn24
- `.github/workflows/proof-html.yml` - Validates HTML files in repository

### Python API Setup and Usage
For the Python Mistral AI client:

1. **Install Dependencies** (optional, for full functionality):
   ```bash
   pip install mistralai
   ```

2. **Set up GitHub Token**:
   ```bash
   export GITHUB_TOKEN="your_github_personal_access_token_here"
   ```

3. **Run Client**:
   ```bash
   cd apis && python3 mistral_client.py
   ```

4. **Test Client**:
   ```bash
   cd apis && python3 test_mistral_client_simple.py  # Fast, always works
   cd apis && python3 test_mistral_client.py         # Comprehensive but slow
   ```

### Quick Reference Commands
```bash
# Smart Contract Development Cycle
npm install                                    # 40+ seconds
npx hardhat compile                           # 2-30+ seconds  
npx hardhat test test/SEQToken.security.test.js  # 1+ seconds
npx hardhat test test/SEQToken.honeypot.test.js  # 1+ seconds
./verify-security.sh                          # 1+ seconds
./verify-ico-security.sh                      # 0.2+ seconds

# Deployment cycle  
npx hardhat run scripts/deploy.js             # Local deployment - WORKS
npx hardhat run scripts/deploy.js --network base  # Production deployment

# Python API Development Cycle
cd apis && python3 test_mistral_client_simple.py  # 0.1 seconds - ALWAYS WORKS
cd apis && python3 mistral_client.py              # Interactive mode
```

### Important Files to Check After Changes
- **Smart Contracts**: Always run the full test suite after modifying any `.sol` files
  ```bash
  npx hardhat test test/SEQToken.security.test.js
  npx hardhat test test/SEQToken.honeypot.test.js
  ```
- **Python API**: Always run basic tests after modifying Python files
  ```bash
  cd apis && python3 test_mistral_client_simple.py
  ```
- Check `SECURITY.md` if security features are modified
- Update `README.md` if adding new functionality
- Verify `hardhat.config.js` if changing network configurations
- Update `apis/README.md` if changing Python API functionality

Remember: This project prioritizes security and transparency over advanced features. Always validate that changes maintain the anti-honeypot properties of the tokens and the secure API practices of the Python client.