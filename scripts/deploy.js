/**
 * SEQ Token Deployment Script
 * 
 * This script deploys the SEQ Token with the following configuration:
 * - Total Supply: 1,000,000 SEQ tokens
 * - ICO Token Price: $2.78 per SEQ token
 * - Token Distribution: 10% to owner (100,000 SEQ), 90% to ICO (900,000 SEQ)
 * - Both owner and ICO use the same address for initial setup
 */

const { ethers } = require("hardhat");

async function main() {
  console.log("=== SEQ Token Deployment ===\n");

  // ICO Configuration
  const TOTAL_SUPPLY = "1000000"; // 1,000,000 SEQ tokens
  const ICO_PRICE_USD = 2.78; // $2.78 per SEQ token
  
  // Owner and ICO recipient address
  const OWNER_ICO_ADDRESS = "0xC217804689327649D4Fd89C9a269395084728BEF";
  
  console.log("Deployment Configuration:");
  console.log(`Total Supply: ${TOTAL_SUPPLY} SEQ tokens`);
  console.log(`ICO Price: $${ICO_PRICE_USD} per SEQ token`);
  console.log(`Owner/ICO Address: ${OWNER_ICO_ADDRESS}`);
  console.log(`Owner Allocation (10%): ${(parseFloat(TOTAL_SUPPLY) * 0.1).toLocaleString()} SEQ`);
  console.log(`ICO Allocation (90%): ${(parseFloat(TOTAL_SUPPLY) * 0.9).toLocaleString()} SEQ`);
  console.log(`Total ICO Value: $${(parseFloat(TOTAL_SUPPLY) * 0.9 * ICO_PRICE_USD).toLocaleString()}\n`);

  // Get the contract factory
  const SEQToken = await ethers.getContractFactory("SEQToken");
  
  // Convert total supply to wei (18 decimals)
  const totalSupplyWei = ethers.utils.parseEther(TOTAL_SUPPLY);
  
  console.log("Deploying SEQ Token...");
  
  // Deploy the contract with the specified parameters
  const seqToken = await SEQToken.deploy(
    totalSupplyWei,
    OWNER_ICO_ADDRESS, // owner address (receives 10%)
    OWNER_ICO_ADDRESS  // ico address (receives 90%)
  );
  
  // Wait for deployment to complete
  await seqToken.deployed();
  
  console.log(`SEQ Token deployed to: ${seqToken.address}`);
  
  // Verify deployment
  console.log("\n=== Deployment Verification ===");
  const totalSupply = await seqToken.totalSupply();
  const ownerBalance = await seqToken.balanceOf(OWNER_ICO_ADDRESS);
  const tokenName = await seqToken.name();
  const tokenSymbol = await seqToken.symbol();
  
  console.log(`Token Name: ${tokenName}`);
  console.log(`Token Symbol: ${tokenSymbol}`);
  console.log(`Total Supply: ${ethers.utils.formatEther(totalSupply)} SEQ`);
  console.log(`Owner/ICO Balance: ${ethers.utils.formatEther(ownerBalance)} SEQ`);
  
  // Security verification
  console.log("\n=== Security Verification ===");
  try {
    const [isSecure, reason] = await seqToken.verifyNotHoneypot();
    console.log(`Security Status: ${isSecure ? "✅ Secure" : "⚠️  Not fully secure"}`);
    console.log(`Reason: ${reason}`);
  } catch (error) {
    console.log("Security verification function not available in this contract version");
  }
  
  console.log("\n=== ICO Information ===");
  console.log(`💰 ICO Token Price: $${ICO_PRICE_USD} per SEQ`);
  console.log(`🎯 ICO Tokens Available: ${(parseFloat(TOTAL_SUPPLY) * 0.9).toLocaleString()} SEQ`);
  console.log(`💵 Total ICO Value: $${(parseFloat(TOTAL_SUPPLY) * 0.9 * ICO_PRICE_USD).toLocaleString()}`);
  console.log(`📍 ICO Tokens Held At: ${OWNER_ICO_ADDRESS}`);
  
  console.log("\n=== Next Steps ===");
  console.log("1. Verify contract on block explorer");
  console.log("2. Set up ICO contract or manual distribution mechanism"); 
  console.log("3. Consider calling disableMinting() for security");
  console.log("4. Consider calling renounceOwnership() for full decentralization");
  console.log(`5. ICO participants can purchase SEQ tokens at $${ICO_PRICE_USD} each`);
  
  return seqToken.address;
}

// Run the deployment
main()
  .then((address) => {
    console.log(`\n✅ Deployment completed successfully!`);
    console.log(`Contract Address: ${address}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exit(1);
  });