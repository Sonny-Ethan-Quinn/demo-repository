// Example interaction script for SEQICO
// Run with: npx hardhat run scripts/interact-ico.js --network localhost

const { ethers } = require("hardhat");

async function main() {
  console.log("=== SEQ ICO Interaction Script ===\n");
  
  // Get signers
  const [buyer] = await ethers.getSigners();
  console.log("Buyer address:", buyer.address);
  console.log("Buyer ETH balance:", ethers.utils.formatEther(await buyer.getBalance()));

  // For demonstration, deploy contracts (in production, use actual addresses)
  console.log("\n=== Deploying Contracts for Demo ===");
  
  // Deploy SEQ Token
  const SEQToken = await ethers.getContractFactory("SEQToken");
  const seqToken = await SEQToken.deploy(
    ethers.utils.parseEther("1000000"), // 1M tokens
    buyer.address, // owner
    buyer.address  // ICO address (buyer will hold ICO tokens)
  );
  console.log("SEQ Token deployed to:", seqToken.address);

  // Deploy Mock USDT and USDC
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  
  const usdt = await MockUSDT.deploy();
  const usdc = await MockUSDC.deploy();
  console.log("Mock USDT deployed to:", usdt.address);
  console.log("Mock USDC deployed to:", usdc.address);

  // Deploy SEQICO
  const SEQICO = await ethers.getContractFactory("SEQICO");
  const seqico = await SEQICO.deploy(
    seqToken.address,
    usdt.address,
    usdc.address,
    ethers.utils.parseEther("0.001"), // 0.001 ETH per token
    ethers.utils.parseEther("1"),     // $1 per token (USDT)
    ethers.utils.parseEther("1")      // $1 per token (USDC)
  );
  console.log("SEQICO deployed to:", seqico.address);

  // Transfer tokens to ICO contract for sale
  const tokensForSale = ethers.utils.parseEther("500000");
  await seqToken.transfer(seqico.address, tokensForSale);
  console.log(`Transferred ${ethers.utils.formatEther(tokensForSale)} SEQ tokens to ICO`);

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

  // Execute purchase
  console.log("\nExecuting ETH purchase...");
  const tx = await seqico.buyWithETH(tokenAmount, { value: requiredETH });
  await tx.wait();
  console.log("Purchase completed! Transaction hash:", tx.hash);
  
  const finalSEQBalance = await seqToken.balanceOf(buyer.address);
  console.log("Final SEQ balance:", ethers.utils.formatEther(finalSEQBalance));
  console.log("Tokens received:", ethers.utils.formatEther(finalSEQBalance.sub(initialSEQBalance)));

  // Example: USDT Purchase
  console.log("\n=== USDT Purchase Example ===");
  const usdtTokenAmount = ethers.utils.parseEther("100"); // Buy 100 SEQ with USDT
  const requiredUSDT = await seqico.pricePerTokenUSDT();
  const requiredUSDTForPurchase = requiredUSDT.mul(usdtTokenAmount).div(ethers.utils.parseEther("1")).div(10**12);
  
  console.log("USDT required:", requiredUSDTForPurchase.toString(), "USDT (6 decimals)");
  
  // Approve and purchase with USDT
  console.log("Approving USDT...");
  await usdt.approve(seqico.address, requiredUSDTForPurchase);
  
  console.log("Executing USDT purchase...");
  const usdtTx = await seqico.buyWithUSDT(usdtTokenAmount);
  await usdtTx.wait();
  console.log("USDT purchase completed! Transaction hash:", usdtTx.hash);
  
  // Example: USDC Purchase  
  console.log("\n=== USDC Purchase Example ===");
  const usdcTokenAmount = ethers.utils.parseEther("50"); // Buy 50 SEQ with USDC
  const requiredUSDC = await seqico.pricePerTokenUSDC();
  const requiredUSDCForPurchase = requiredUSDC.mul(usdcTokenAmount).div(ethers.utils.parseEther("1")).div(10**12);
  
  console.log("USDC required:", requiredUSDCForPurchase.toString(), "USDC (6 decimals)");
  
  // Approve and purchase with USDC
  console.log("Approving USDC...");
  await usdc.approve(seqico.address, requiredUSDCForPurchase);
  
  console.log("Executing USDC purchase...");
  const usdcTx = await seqico.buyWithUSDC(usdcTokenAmount);
  await usdcTx.wait();
  console.log("USDC purchase completed! Transaction hash:", usdcTx.hash);

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