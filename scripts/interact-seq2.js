// SEQ2 Token Interaction Script
// Run with: npx hardhat run scripts/interact-seq2.js --network localhost

const { ethers } = require("hardhat");

async function main() {
  console.log("=== SEQ2 Token Interaction Examples ===");
  
  // Get accounts
  const [owner, user1, user2, user3] = await ethers.getSigners();
  console.log("Owner Address:", owner.address);
  console.log("User1 Address:", user1.address);
  console.log("User2 Address:", user2.address);
  
  // Deploy a new contract for this demonstration
  console.log("Deploying SEQ2Token for interaction...");
  const SEQ2Token = await ethers.getContractFactory("SEQ2Token");
  const initialSupply = ethers.utils.parseEther("1000000"); // 1 million tokens
  const seq2Token = await SEQ2Token.deploy(initialSupply, owner.address);
  await seq2Token.deployed();
  console.log("SEQ2Token deployed at:", seq2Token.address);
  
  console.log("\n=== Contract Information ===");
  console.log("Contract Address:", seq2Token.address);
  console.log("Token Name:", await seq2Token.name());
  console.log("Token Symbol:", await seq2Token.symbol());
  console.log("Total Supply:", ethers.utils.formatEther(await seq2Token.totalSupply()), "SEQ2");
  console.log("Max Supply:", ethers.utils.formatEther(await seq2Token.MAX_SUPPLY()), "SEQ2");
  
  // Display current price
  const priceUSDCents = await seq2Token.pricePerTokenUSDCents();
  const [dollars, cents] = await seq2Token.getPriceUSD();
  console.log("Current Price:", priceUSDCents, "cents ($" + dollars + "." + (cents < 10 ? "0" + cents : cents) + ")");
  
  // Display fund information
  console.log("\n=== Fund Information ===");
  console.log("Contract Balance:", ethers.utils.formatEther(await seq2Token.getContractBalance()), "ETH");
  console.log("Available Balance:", ethers.utils.formatEther(await seq2Token.getAvailableBalance()), "ETH");
  console.log("Total User Deposits:", ethers.utils.formatEther(await seq2Token.totalDeposits()), "ETH");
  
  // Display security status
  const [isSecure, securityStatus] = await seq2Token.verifySecurityStatus();
  console.log("\n=== Security Status ===");
  console.log("Is Secure:", isSecure);
  console.log("Status:", securityStatus);
  
  console.log("\n=== Example 1: Fund Deposit ===");
  const depositAmount = ethers.utils.parseEther("1"); // 1 ETH
  console.log("Depositing", ethers.utils.formatEther(depositAmount), "ETH from User1...");
  
  // Uncomment to execute:
  /*
  const tx1 = await seq2Token.connect(user1).depositFunds({ value: depositAmount });
  await tx1.wait();
  console.log("Deposit successful! Transaction:", tx1.hash);
  console.log("User1 Deposit Balance:", ethers.utils.formatEther(await seq2Token.getUserDeposit(user1.address)), "ETH");
  */
  
  console.log("\n=== Example 2: Token Purchase ===");
  const purchaseAmount = ethers.utils.parseEther("0.5"); // 0.5 ETH
  const calculatedTokens = await seq2Token.calculateTokenAmount(purchaseAmount);
  console.log("Purchasing tokens with", ethers.utils.formatEther(purchaseAmount), "ETH");
  console.log("Expected tokens:", ethers.utils.formatEther(calculatedTokens), "SEQ2");
  
  // Uncomment to execute:
  /*
  const tx2 = await seq2Token.connect(user2).purchaseTokens({ value: purchaseAmount });
  await tx2.wait();
  console.log("Purchase successful! Transaction:", tx2.hash);
  console.log("User2 Token Balance:", ethers.utils.formatEther(await seq2Token.balanceOf(user2.address)), "SEQ2");
  */
  
  console.log("\n=== Example 3: Price Update (Owner Only) ===");
  const newPrice = 420; // $4.20
  console.log("Updating price to", (newPrice / 100).toFixed(2), "USD...");
  
  // Uncomment to execute:
  /*
  const tx3 = await seq2Token.connect(owner).updatePrice(newPrice);
  await tx3.wait();
  console.log("Price update successful! Transaction:", tx3.hash);
  const [newDollars, newCents] = await seq2Token.getPriceUSD();
  console.log("New Price: $" + newDollars + "." + (newCents < 10 ? "0" + newCents : newCents));
  */
  
  console.log("\n=== Example 4: Token Minting (Owner Only) ===");
  const mintAmount = ethers.utils.parseEther("10000"); // 10,000 tokens
  console.log("Minting", ethers.utils.formatEther(mintAmount), "SEQ2 tokens to User3...");
  
  // Uncomment to execute:
  /*
  const tx4 = await seq2Token.connect(owner).mint(user3.address, mintAmount);
  await tx4.wait();
  console.log("Minting successful! Transaction:", tx4.hash);
  console.log("User3 Token Balance:", ethers.utils.formatEther(await seq2Token.balanceOf(user3.address)), "SEQ2");
  */
  
  console.log("\n=== Example 5: Oracle Integration ===");
  console.log("Setting price oracle to User1 address (demonstration)...");
  
  // Uncomment to execute:
  /*
  const tx5 = await seq2Token.connect(owner).setPriceOracle(user1.address);
  await tx5.wait();
  console.log("Oracle set! Transaction:", tx5.hash);
  console.log("Oracle Address:", await seq2Token.priceOracle());
  
  // Oracle updates price
  const oraclePrice = 450; // $4.50
  const tx6 = await seq2Token.connect(user1).updatePriceFromOracle(oraclePrice);
  await tx6.wait();
  console.log("Oracle price update successful! Transaction:", tx6.hash);
  const [oracleDollars, oracleCents] = await seq2Token.getPriceUSD();
  console.log("Oracle Price: $" + oracleDollars + "." + (oracleCents < 10 ? "0" + oracleCents : oracleCents));
  */
  
  console.log("\n=== Example 6: User Withdrawal ===");
  console.log("User1 withdrawing their deposit...");
  
  // Uncomment to execute:
  /*
  const userDeposit = await seq2Token.getUserDeposit(user1.address);
  if (userDeposit.gt(0)) {
    const tx7 = await seq2Token.connect(user1).withdrawUserDeposit();
    await tx7.wait();
    console.log("Withdrawal successful! Transaction:", tx7.hash);
    console.log("User1 Remaining Deposit:", ethers.utils.formatEther(await seq2Token.getUserDeposit(user1.address)), "ETH");
    console.log("User1 Total Withdrawals:", ethers.utils.formatEther(await seq2Token.getUserWithdrawals(user1.address)), "ETH");
  } else {
    console.log("User1 has no deposits to withdraw");
  }
  */
  
  console.log("\n=== Example 7: Owner Fund Withdrawal ===");
  console.log("Owner withdrawing available funds...");
  
  // Uncomment to execute:
  /*
  const availableBalance = await seq2Token.getAvailableBalance();
  if (availableBalance.gt(0)) {
    const withdrawAmount = ethers.utils.parseEther("0.1"); // 0.1 ETH
    if (withdrawAmount.lte(availableBalance)) {
      const tx8 = await seq2Token.connect(owner).withdrawFunds(withdrawAmount, owner.address);
      await tx8.wait();
      console.log("Owner withdrawal successful! Transaction:", tx8.hash);
      console.log("Remaining Available Balance:", ethers.utils.formatEther(await seq2Token.getAvailableBalance()), "ETH");
    } else {
      console.log("Requested amount exceeds available balance");
    }
  } else {
    console.log("No funds available for withdrawal");
  }
  */
  
  console.log("\n=== Example 8: Emergency Controls ===");
  console.log("Demonstrating pause/unpause functionality...");
  
  // Uncomment to execute:
  /*
  // Pause the contract
  const tx9 = await seq2Token.connect(owner).pause();
  await tx9.wait();
  console.log("Contract paused! Transaction:", tx9.hash);
  console.log("Contract Paused Status:", await seq2Token.paused());
  
  // Try to transfer while paused (should fail)
  try {
    await seq2Token.connect(user2).transfer(user3.address, ethers.utils.parseEther("100"));
  } catch (error) {
    console.log("Transfer failed while paused (expected):", error.reason);
  }
  
  // Unpause the contract
  const tx10 = await seq2Token.connect(owner).unpause();
  await tx10.wait();
  console.log("Contract unpaused! Transaction:", tx10.hash);
  console.log("Contract Paused Status:", await seq2Token.paused());
  */
  
  console.log("\n=== Example 9: Security Operations ===");
  console.log("Demonstrating security controls...");
  
  // Uncomment to execute:
  /*
  // Disable minting permanently
  const tx11 = await seq2Token.connect(owner).disableMinting();
  await tx11.wait();
  console.log("Minting disabled permanently! Transaction:", tx11.hash);
  console.log("Minting Disabled:", await seq2Token.mintingDisabled());
  
  // Check new security status
  const [newIsSecure, newSecurityStatus] = await seq2Token.verifySecurityStatus();
  console.log("New Security Status:", newIsSecure);
  console.log("New Status Message:", newSecurityStatus);
  */
  
  console.log("\n=== Current Balances Summary ===");
  console.log("Owner SEQ2 Balance:", ethers.utils.formatEther(await seq2Token.balanceOf(owner.address)), "SEQ2");
  console.log("User1 SEQ2 Balance:", ethers.utils.formatEther(await seq2Token.balanceOf(user1.address)), "SEQ2");
  console.log("User2 SEQ2 Balance:", ethers.utils.formatEther(await seq2Token.balanceOf(user2.address)), "SEQ2");
  console.log("User3 SEQ2 Balance:", ethers.utils.formatEther(await seq2Token.balanceOf(user3.address)), "SEQ2");
  
  console.log("\nUser1 Deposit:", ethers.utils.formatEther(await seq2Token.getUserDeposit(user1.address)), "ETH");
  console.log("User2 Deposit:", ethers.utils.formatEther(await seq2Token.getUserDeposit(user2.address)), "ETH");
  console.log("User3 Deposit:", ethers.utils.formatEther(await seq2Token.getUserDeposit(user3.address)), "ETH");
  
  console.log("\n=== Usage Instructions ===");
  console.log("To execute any of the above examples:");
  console.log("1. Uncomment the relevant transaction code");
  console.log("2. Update the contract address at the top of this script");
  console.log("3. Run: npx hardhat run scripts/interact-seq2.js --network localhost");
  console.log("\n⚠️  Important Notes:");
  console.log("• Always test on a local network first");
  console.log("• Verify contract address before executing transactions");
  console.log("• Check gas prices for mainnet deployments");
  console.log("• Review transaction details before confirming");
  console.log("• Keep private keys secure and never commit them to code");
  
  console.log("\n=== Advanced Features ===");
  console.log("The SEQ2 Token supports:");
  console.log("✅ ERC-20 standard compliance");
  console.log("✅ Fund deposit and withdrawal system");
  console.log("✅ Token purchase with automatic price calculation");
  console.log("✅ Dynamic price updates by owner");
  console.log("✅ Oracle integration for automated pricing");
  console.log("✅ Emergency pause/unpause functionality");
  console.log("✅ Comprehensive event logging");
  console.log("✅ Security features and access controls");
  console.log("✅ Path to decentralization (disable minting, renounce ownership)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Interaction script failed:", error);
    process.exit(1);
  });