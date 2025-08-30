// Example interaction script for SEQICO
// Run with: npx hardhat run scripts/interact-ico.js --network localhost

const { ethers } = require("hardhat");

async function main() {
  // Replace with your deployed contract addresses
  const SEQICO_ADDRESS = "0x..."; // Replace with actual SEQICO address
  const USDT_ADDRESS = "0x...";   // Replace with actual USDT address
  const USDC_ADDRESS = "0x...";   // Replace with actual USDC address

  // Get signers
  const [buyer] = await ethers.getSigners();
  console.log("Buyer address:", buyer.address);
  console.log("Buyer ETH balance:", ethers.utils.formatEther(await buyer.getBalance()));

  // Get contract instances
  const seqico = await ethers.getContractAt("SEQICO", SEQICO_ADDRESS);
  const seqToken = await ethers.getContractAt("SEQToken", await seqico.seqToken());
  
  console.log("\n=== ICO Contract Information ===");
  console.log("SEQICO Address:", seqico.address);
  console.log("SEQ Token Address:", await seqico.seqToken());
  console.log("ETH Price per Token:", ethers.utils.formatEther(await seqico.pricePerTokenETH()), "ETH");
  console.log("USDT Price per Token:", ethers.utils.formatEther(await seqico.pricePerTokenUSDT()), "USDT");
  console.log("USDC Price per Token:", ethers.utils.formatEther(await seqico.pricePerTokenUSDC()), "USDC");
  
  const tokensAvailable = await seqToken.balanceOf(seqico.address);
  console.log("Tokens available for sale:", ethers.utils.formatEther(tokensAvailable), "SEQ");

  // Example: Buy 1000 SEQ tokens with ETH
  console.log("\n=== Example ETH Purchase ===");
  const tokenAmount = ethers.utils.parseEther("1000");
  const pricePerToken = await seqico.pricePerTokenETH();
  const requiredETH = pricePerToken.mul(tokenAmount).div(ethers.utils.parseEther("1"));
  
  console.log("Tokens to buy:", ethers.utils.formatEther(tokenAmount), "SEQ");
  console.log("Required ETH:", ethers.utils.formatEther(requiredETH), "ETH");
  
  // Check initial balance
  const initialSEQBalance = await seqToken.balanceOf(buyer.address);
  console.log("Initial SEQ balance:", ethers.utils.formatEther(initialSEQBalance));

  // Execute purchase (uncomment to actually execute)
  /*
  console.log("Executing purchase...");
  const tx = await seqico.buyWithETH(tokenAmount, { value: requiredETH });
  await tx.wait();
  console.log("Purchase completed! Transaction hash:", tx.hash);
  
  const finalSEQBalance = await seqToken.balanceOf(buyer.address);
  console.log("Final SEQ balance:", ethers.utils.formatEther(finalSEQBalance));
  console.log("Tokens received:", ethers.utils.formatEther(finalSEQBalance.sub(initialSEQBalance)));
  */

  // Example: USDT Purchase setup
  console.log("\n=== Example USDT Purchase Setup ===");
  console.log("For USDT purchases:");
  console.log("1. Get USDT tokens from exchange or faucet");
  console.log("2. Approve SEQICO contract to spend your USDT:");
  console.log(`   usdt.approve("${seqico.address}", amount)`);
  console.log("3. Call buyWithUSDT(tokenAmount)");
  
  // Example: USDC Purchase setup
  console.log("\n=== Example USDC Purchase Setup ===");
  console.log("For USDC purchases:");
  console.log("1. Get USDC tokens from exchange or faucet");
  console.log("2. Approve SEQICO contract to spend your USDC:");
  console.log(`   usdc.approve("${seqico.address}", amount)`);
  console.log("3. Call buyWithUSDC(tokenAmount)");

  // Security verification
  console.log("\n=== Security Verification ===");
  const [isSecure, reason] = await seqToken.verifyNotHoneypot();
  console.log(`Security Status: ${isSecure ? "✅ Secure" : "⚠️  Not fully secure"}`);
  console.log(`Reason: ${reason}`);
  
  console.log("\n=== Important Notes ===");
  console.log("• Always verify contract addresses on block explorer");
  console.log("• Start with small test purchases");
  console.log("• Check token balances and allowances before purchasing");
  console.log("• Excess ETH is automatically refunded");
  console.log("• All purchases are logged in TokensPurchased events");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });