# SEQICO - Secure Initial Coin Offering Contract

## Overview

SEQICO is a secure Initial Coin Offering (ICO) contract that enables the sale of SEQ tokens using multiple payment methods while maintaining the highest security standards.

## Features

### Multi-Currency Support
- **ETH**: Direct Ethereum payments with automatic refunds for overpayment
- **USDT**: Tether (USDT) payments with 6-decimal precision handling
- **USDC**: USD Coin (USDC) payments with 6-decimal precision handling

### Security Features
- ✅ **Input Validation**: All purchase amounts must be greater than zero
- ✅ **Balance Verification**: Ensures sufficient SEQ tokens are available before sale
- ✅ **Allowance Checks**: Validates ERC20 token approvals before transfers
- ✅ **Owner Access Control**: Critical functions restricted to contract owner
- ✅ **Event Logging**: All purchases logged for transparency and auditability
- ✅ **Excess Refunds**: Automatic ETH refund for overpayments

### Owner Functions
- `setSEQToken(address)`: Update the SEQ token contract address
- `withdrawETH(address)`: Withdraw collected ETH to specified address
- `withdrawERC20(address, address)`: Withdraw any ERC20 tokens to specified address

## Usage

### For Buyers

#### ETH Purchase
```solidity
// Calculate required ETH
uint256 tokenAmount = 1000 * 10**18; // 1000 SEQ tokens
uint256 requiredETH = pricePerTokenETH * tokenAmount / 10**18;

// Purchase tokens (excess ETH automatically refunded)
seqico.buyWithETH{value: requiredETH}(tokenAmount);
```

#### USDT Purchase
```solidity
// Approve USDT spending first
uint256 tokenAmount = 1000 * 10**18; // 1000 SEQ tokens
uint256 requiredUSDT = pricePerTokenUSDT * tokenAmount / 10**18 / 10**12; // Adjust for 6 decimals
usdt.approve(address(seqico), requiredUSDT);

// Purchase tokens
seqico.buyWithUSDT(tokenAmount);
```

#### USDC Purchase
```solidity
// Approve USDC spending first
uint256 tokenAmount = 1000 * 10**18; // 1000 SEQ tokens
uint256 requiredUSDC = pricePerTokenUSDC * tokenAmount / 10**18 / 10**12; // Adjust for 6 decimals
usdc.approve(address(seqico), requiredUSDC);

// Purchase tokens
seqico.buyWithUSDC(tokenAmount);
```

### For Contract Owner

#### Configure ICO
```solidity
// Deploy SEQICO with initial parameters
SEQICO seqico = new SEQICO(
    seqTokenAddress,
    usdtAddress,
    usdcAddress,
    0.001 ether,  // 0.001 ETH per token
    1 ether,      // $1 per token (18 decimals)
    1 ether       // $1 per token (18 decimals)
);

// Transfer tokens to ICO contract
seqToken.transfer(address(seqico), tokensForSale);
```

#### Withdraw Funds
```solidity
// Withdraw collected ETH
seqico.withdrawETH(payable(ownerAddress));

// Withdraw collected USDT
seqico.withdrawERC20(usdtAddress, ownerAddress);

// Withdraw collected USDC
seqico.withdrawERC20(usdcAddress, ownerAddress);
```

## Price Calculation

### ETH Prices
Prices are stored in wei (18 decimals). For example:
- `pricePerTokenETH = 0.001 ether` means 0.001 ETH per SEQ token

### USDT/USDC Prices
Prices are stored in 18-decimal format but converted to 6-decimal format during calculation:
- `pricePerTokenUSDT = 1 ether` means $1 per SEQ token
- Actual USDT transfer amount = `pricePerTokenUSDT * tokenAmount / 1e18 / 1e12`

## Events

### TokensPurchased
```solidity
event TokensPurchased(address indexed buyer, uint256 amount, string payment);
```

Emitted when tokens are successfully purchased. Parameters:
- `buyer`: Address of the token purchaser
- `amount`: Number of tokens purchased (in wei units)
- `payment`: Payment method used ("ETH", "USDT", or "USDC")

## Security Considerations

1. **Token Availability**: Contract checks if sufficient SEQ tokens are available before processing purchases
2. **Input Validation**: All functions validate that purchase amounts are greater than zero
3. **Access Control**: Owner functions are protected by OpenZeppelin's `onlyOwner` modifier
4. **ERC20 Safety**: USDT/USDC purchases require prior approval, following the ERC20 standard
5. **Overflow Protection**: Uses Solidity 0.8.4+ built-in overflow protection
6. **Integration Security**: Designed to work seamlessly with the secure SEQ token implementation

## Testing

The contract includes comprehensive tests covering:
- ETH purchases with exact and excess payments
- USDT purchases with approval requirements
- USDC purchases with approval requirements
- Owner function access control
- Input validation and error handling
- Integration with SEQ token security features
- Event emission verification
- Edge cases and multiple purchase scenarios

Run tests with:
```bash
npx hardhat test test/SEQICO.test.js
```

## Deployment

1. Deploy SEQ token first
2. Deploy SEQICO with token addresses and pricing
3. Transfer SEQ tokens to SEQICO contract
4. Verify contracts on block explorer
5. Test with small amounts before full launch

For production deployment on Base:
```bash
npx hardhat run scripts/deploy-ico.js --network base
```

## Production Notes

- Update USDT/USDC addresses for target network (Base mainnet addresses provided in deployment script)
- Consider calling `disableMinting()` and `renounceOwnership()` on SEQ token for full decentralization
- Verify all contracts on block explorer for transparency
- Test all payment methods with small amounts before announcing ICO