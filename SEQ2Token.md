# SEQ2 Token - Advanced Token Contract with Fund Management

## Overview

The SEQ2 Token is an advanced ERC-20 token implementation designed with comprehensive fund management features, price control mechanisms, and security best practices. Built on Ethereum/Base blockchain, it provides a robust foundation for all standard and advanced token management features.

## Key Features

### 🎯 Core Token Features
- **ERC-20 Compliance**: Full compatibility with standard token interfaces
- **Initial Price**: Set to $3.80 per token at deployment
- **Maximum Supply**: 1 billion tokens (1,000,000,000 SEQ2)
- **Mintable**: Owner can mint tokens until minting is disabled
- **Pausable**: Emergency pause functionality for all operations

### 💰 Fund Management
- **User Deposits**: Allow users to deposit ETH to the contract
- **Individual Tracking**: Track deposits and withdrawals per user
- **Owner Withdrawals**: Owner can withdraw available funds (excluding user deposits)
- **Separation of Funds**: User deposits are protected from owner withdrawals

### 🔄 Token Purchase System
- **ETH Purchases**: Users can buy tokens directly with ETH
- **Automatic Calculation**: Token amounts calculated based on current USD price
- **Price Integration**: Uses configurable ETH/USD rate for conversions

### 💲 Price Management
- **Dynamic Pricing**: Owner can update token price at any time
- **Oracle Support**: Integration with price oracles for automated updates
- **USD Denomination**: Prices stored and displayed in USD cents
- **Price History**: Events logged for all price changes

### 🛡️ Security Features
- **Reentrancy Protection**: All external calls protected against reentrancy attacks
- **Access Controls**: Owner-only functions with clear permissions
- **Emergency Pause**: Ability to pause all operations in emergencies
- **Transparent Functions**: All key functions emit events for transparency
- **Ownership Renouncement**: Owner can permanently renounce control

## Contract Architecture

### State Variables

```solidity
// Core token parameters
uint256 public constant MAX_SUPPLY = 1_000_000_000 * 10**18;
uint256 public constant INITIAL_PRICE_USD_CENTS = 380; // $3.80

// Price and fund management
uint256 public pricePerTokenUSDCents;  // Current price in USD cents
uint256 public totalDeposits;          // Total user deposits
address public priceOracle;            // Price oracle address

// User tracking
mapping(address => uint256) public userDeposits;     // Individual deposits
mapping(address => uint256) public userWithdrawals;  // Withdrawal history

// Control flags
bool public mintingDisabled;           // Minting status
```

### Key Functions

#### Token Operations
- `mint(address to, uint256 amount)`: Mint new tokens (owner only)
- `disableMinting()`: Permanently disable minting (owner only)
- `transfer/transferFrom`: Enhanced transfers with reentrancy protection

#### Fund Management
- `depositFunds()`: Deposit ETH to the contract
- `withdrawUserDeposit()`: Withdraw user's own deposits
- `withdrawFunds(uint256 amount, address recipient)`: Owner withdraws available funds
- `purchaseTokens()`: Purchase tokens with ETH

#### Price Management
- `updatePrice(uint256 newPriceUSDCents)`: Update token price (owner only)
- `setPriceOracle(address oracleAddress)`: Set price oracle (owner only)
- `updatePriceFromOracle(uint256 newPriceUSDCents)`: Oracle price update

#### Emergency Controls
- `pause()`: Pause all operations (owner only)
- `unpause()`: Resume all operations (owner only)

#### View Functions
- `getPriceUSD()`: Get current price in dollars and cents
- `getContractBalance()`: Get total contract ETH balance
- `getAvailableBalance()`: Get balance available for owner withdrawal
- `calculateTokenAmount(uint256 ethAmount)`: Calculate tokens for ETH amount

## Deployment

### Requirements
- Node.js v20+ and npm
- Hardhat development environment
- Solidity ^0.8.24

### Deploy SEQ2 Token

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test test/SEQ2Token.test.js

# Deploy to local network
npx hardhat run scripts/deploy-seq2.js

# Deploy to testnet (configure network in hardhat.config.js)
npx hardhat run scripts/deploy-seq2.js --network baseSepolia
```

### Deployment Parameters

The constructor requires:
- `initialSupply`: Number of tokens to mint initially (max 1 billion)
- `owner`: Address that will own the contract and receive initial tokens

```javascript
// Example deployment
const initialSupply = ethers.utils.parseEther("100000000"); // 100M tokens
const ownerAddress = "0x..."; // Owner address
const seq2Token = await SEQ2Token.deploy(initialSupply, ownerAddress);
```

## Usage Examples

### For Users

#### Deposit Funds
```javascript
// Deposit 1 ETH to the contract
await seq2Token.depositFunds({ value: ethers.utils.parseEther("1") });
```

#### Purchase Tokens
```javascript
// Buy tokens with 1 ETH (amount calculated automatically)
await seq2Token.purchaseTokens({ value: ethers.utils.parseEther("1") });
```

#### Withdraw Deposits
```javascript
// Withdraw all deposited funds
await seq2Token.withdrawUserDeposit();
```

### For Contract Owner

#### Update Token Price
```javascript
// Set price to $5.00 (500 cents)
await seq2Token.updatePrice(500);
```

#### Mint New Tokens
```javascript
// Mint 1000 tokens to address
await seq2Token.mint(userAddress, ethers.utils.parseEther("1000"));
```

#### Withdraw Contract Funds
```javascript
// Withdraw 1 ETH to specified address
await seq2Token.withdrawFunds(
  ethers.utils.parseEther("1"),
  recipientAddress
);
```

#### Emergency Controls
```javascript
// Pause all operations
await seq2Token.pause();

// Resume operations
await seq2Token.unpause();

// Permanently disable minting
await seq2Token.disableMinting();
```

### Oracle Integration

#### Set Price Oracle
```javascript
// Set oracle address
await seq2Token.setPriceOracle(oracleAddress);
```

#### Oracle Price Update
```javascript
// Oracle updates price to $4.20 (420 cents)
await seq2Token.connect(oracleAccount).updatePriceFromOracle(420);
```

## Security Considerations

### ✅ Security Features
- **Reentrancy Protection**: All functions use OpenZeppelin's ReentrancyGuard
- **Access Control**: Owner functions properly protected
- **Fund Separation**: User deposits cannot be withdrawn by owner
- **Emergency Pause**: Can halt all operations if needed
- **Event Logging**: All important actions emit events
- **Input Validation**: All functions validate inputs

### 🔒 Best Practices Implemented
- **No Hidden Fees**: Transparent pricing and transfers
- **No Blacklisting**: Anyone can transfer tokens
- **Audit Trail**: Complete event history for all operations
- **Gradual Decentralization**: Path to renounce ownership
- **Oracle Integration**: Professional price management

### ⚠️ Important Notes
- **ETH/USD Rate**: Currently uses fixed $2000/ETH rate for demonstrations
- **Production Oracle**: Replace with professional oracle (Chainlink, etc.)
- **Gas Costs**: Consider gas optimization for high-frequency operations
- **Testing**: Thoroughly test on testnet before mainnet deployment

## Testing

The contract includes comprehensive tests covering:

### Test Categories
- **Deployment**: Parameter validation and initial state
- **Token Operations**: Minting, transfers, and supply limits
- **Fund Management**: Deposits, withdrawals, and fund separation
- **Price Management**: Price updates and oracle integration
- **Security**: Access controls, reentrancy protection, pause functionality
- **Edge Cases**: Zero values, invalid inputs, boundary conditions

### Run Tests
```bash
# Run all SEQ2 tests
npx hardhat test test/SEQ2Token.test.js

# Run with gas reporting
REPORT_GAS=true npx hardhat test test/SEQ2Token.test.js

# Run specific test category
npx hardhat test test/SEQ2Token.test.js --grep "Price Management"
```

## Events

The contract emits comprehensive events for transparency:

### Token Events
- `TokensPurchased(buyer, tokenAmount, ethAmount, pricePerToken)`
- `MintingDisabled()`

### Fund Events
- `FundsDeposited(depositor, amount, newTotal)`
- `FundsWithdrawn(owner, amount, remaining)`
- `UserWithdrawal(user, amount)`

### Price Events
- `PriceUpdated(oldPrice, newPrice, updatedBy)`
- `PriceOracleUpdated(oldOracle, newOracle)`

### Control Events
- `ContractPaused(paused)`
- `OwnershipTransferred(previousOwner, newOwner)`

## Roadmap

### Phase 1: Core Features ✅
- [x] Basic ERC-20 functionality
- [x] Fund management system
- [x] Price control mechanisms
- [x] Security implementations

### Phase 2: Oracle Integration 🔄
- [x] Oracle interface support
- [ ] Chainlink price feed integration
- [ ] Multi-oracle support
- [ ] Price update automation

### Phase 3: Advanced Features 📋
- [ ] Staking mechanisms
- [ ] Governance integration
- [ ] Multi-signature controls
- [ ] Cross-chain bridge support

### Phase 4: Decentralization 🎯
- [ ] Governance token distribution
- [ ] DAO integration
- [ ] Community voting
- [ ] Ownership transition

## Support and Documentation

- **Contract Code**: `/contracts/SEQ2Token.sol`
- **Tests**: `/test/SEQ2Token.test.js`
- **Deployment**: `/scripts/deploy-seq2.js`
- **Security**: Following OpenZeppelin standards
- **Best Practices**: Based on established DeFi patterns

For questions, issues, or contributions, please refer to the repository documentation and testing suite.

---

**Note**: This implementation provides Ethereum-based functionality equivalent to the requested TON smart contract requirements, adapted for the existing Ethereum/Hardhat development environment in this repository.