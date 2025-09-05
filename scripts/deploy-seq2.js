// SEQ2 Token Deployment Script
// Run with: npx hardhat run scripts/deploy-seq2.js --network localhost

const { ethers } = require("hardhat");

async function main() {
  console.log("=== SEQ2 Token Deployment ===");
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH");
  
  // Deployment parameters
  const initialSupply = ethers.utils.parseEther("100000000"); // 100 million tokens
  const ownerAddress = deployer.address; // Owner will be the deployer
  
  console.log("\n=== Deployment Parameters ===");
  console.log("Initial Supply:", ethers.utils.formatEther(initialSupply), "SEQ2");
  console.log("Owner Address:", ownerAddress);
  console.log("Initial Price: $3.80 USD");
  
  // Deploy SEQ2Token contract
  console.log("\n=== Deploying SEQ2Token Contract ===");
  const SEQ2Token = await ethers.getContractFactory("SEQ2Token");
  const seq2Token = await SEQ2Token.deploy(initialSupply, ownerAddress);
  
  await seq2Token.deployed();
  
  console.log("SEQ2Token deployed to:", seq2Token.address);
  console.log("Transaction hash:", seq2Token.deployTransaction.hash);
  
  // Verify deployment
  console.log("\n=== Verifying Deployment ===");
  const tokenName = await seq2Token.name();
  const tokenSymbol = await seq2Token.symbol();
  const tokenDecimals = await seq2Token.decimals();
  const tokenTotalSupply = await seq2Token.totalSupply();
  const tokenMaxSupply = await seq2Token.MAX_SUPPLY();
  const tokenPrice = await seq2Token.pricePerTokenUSDCents();
  const tokenOwner = await seq2Token.owner();
  
  console.log("Token Name:", tokenName);
  console.log("Token Symbol:", tokenSymbol);
  console.log("Token Decimals:", tokenDecimals);
  console.log("Total Supply:", ethers.utils.formatEther(tokenTotalSupply), tokenSymbol);
  console.log("Max Supply:", ethers.utils.formatEther(tokenMaxSupply), tokenSymbol);
  console.log("Price per Token:", (tokenPrice / 100).toFixed(2), "USD");
  console.log("Contract Owner:", tokenOwner);
  
  // Check security status
  console.log("\n=== Security Status ===");
  const [isSecure, securityStatus] = await seq2Token.verifySecurityStatus();
  console.log("Is Secure:", isSecure);
  console.log("Security Status:", securityStatus);
  
  // Display price information
  const [dollars, cents] = await seq2Token.getPriceUSD();
  console.log("Current Price: $" + dollars + "." + (cents < 10 ? "0" + cents : cents));
  
  // Test fund management functions
  console.log("\n=== Testing Fund Management ===");
  console.log("Contract Balance:", ethers.utils.formatEther(await seq2Token.getContractBalance()), "ETH");
  console.log("Available Balance:", ethers.utils.formatEther(await seq2Token.getAvailableBalance()), "ETH");
  console.log("Total Deposits:", ethers.utils.formatEther(await seq2Token.totalDeposits()), "ETH");
  
  // Test token purchase calculation
  const testEthAmount = ethers.utils.parseEther("1"); // 1 ETH
  const calculatedTokens = await seq2Token.calculateTokenAmount(testEthAmount);
  console.log("\nToken Purchase Test:");
  console.log("1 ETH would buy:", ethers.utils.formatEther(calculatedTokens), tokenSymbol, "tokens");
  
  console.log("\n=== Deployment Complete ===");
  console.log("Contract Address:", seq2Token.address);
  console.log("Owner Address:", tokenOwner);
  console.log("Initial Price: $3.80");
  console.log("Ready for operations!");
  
  // Save deployment info to file
  const deploymentInfo = {
    contractAddress: seq2Token.address,
    deploymentBlock: seq2Token.deployTransaction.blockNumber,
    deploymentTx: seq2Token.deployTransaction.hash,
    owner: tokenOwner,
    initialSupply: ethers.utils.formatEther(tokenTotalSupply),
    initialPrice: "$3.80",
    deployedAt: new Date().toISOString()
  };
  
  console.log("\n=== Deployment Information ===");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  return seq2Token;
}

// Handle deployment errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });