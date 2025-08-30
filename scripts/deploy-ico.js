const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying SEQICO contract...");

  // Get the contract factories
  const SEQToken = await ethers.getContractFactory("SEQToken");
  const SEQICO = await ethers.getContractFactory("SEQICO");

  // Deploy SEQ Token first (or use existing address)
  console.log("Deploying SEQ Token...");
  const initialSupply = ethers.utils.parseEther("1000000"); // 1M SEQ tokens
  const seqToken = await SEQToken.deploy(initialSupply);
  await seqToken.deployed();
  console.log("SEQ Token deployed to:", seqToken.address);

  // For Base mainnet, you would use actual USDT/USDC addresses:
  // const USDT_ADDRESS = "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2"; // Base USDT
  // const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // Base USDC
  
  // For testing, deploy mock tokens
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  
  console.log("Deploying Mock USDT...");
  const usdt = await MockUSDT.deploy();
  await usdt.deployed();
  console.log("Mock USDT deployed to:", usdt.address);

  console.log("Deploying Mock USDC...");
  const usdc = await MockUSDC.deploy();
  await usdc.deployed();
  console.log("Mock USDC deployed to:", usdc.address);

  // Set ICO prices
  const ETH_PRICE_PER_TOKEN = ethers.utils.parseEther("0.001"); // 0.001 ETH per SEQ token
  const USDT_PRICE_PER_TOKEN = ethers.utils.parseEther("1"); // $1 per SEQ token (in 18 decimals)
  const USDC_PRICE_PER_TOKEN = ethers.utils.parseEther("1"); // $1 per SEQ token (in 18 decimals)

  console.log("Deploying SEQICO...");
  const seqico = await SEQICO.deploy(
    seqToken.address,
    usdt.address,
    usdc.address,
    ETH_PRICE_PER_TOKEN,
    USDT_PRICE_PER_TOKEN,
    USDC_PRICE_PER_TOKEN
  );
  await seqico.deployed();
  console.log("SEQICO deployed to:", seqico.address);

  // Transfer tokens to ICO contract for sale
  const tokensForSale = ethers.utils.parseEther("500000"); // 500K tokens for ICO
  console.log(`Transferring ${ethers.utils.formatEther(tokensForSale)} SEQ tokens to ICO contract...`);
  await seqToken.transfer(seqico.address, tokensForSale);

  // Verify deployment
  console.log("\n=== Deployment Verification ===");
  console.log(`SEQ Token: ${seqToken.address}`);
  console.log(`SEQICO: ${seqico.address}`);
  console.log(`Mock USDT: ${usdt.address}`);
  console.log(`Mock USDC: ${usdc.address}`);
  
  console.log("\n=== ICO Configuration ===");
  console.log(`ETH Price per Token: ${ethers.utils.formatEther(ETH_PRICE_PER_TOKEN)} ETH`);
  console.log(`USDT Price per Token: $${ethers.utils.formatEther(USDT_PRICE_PER_TOKEN)}`);
  console.log(`USDC Price per Token: $${ethers.utils.formatEther(USDC_PRICE_PER_TOKEN)}`);
  console.log(`Tokens available for sale: ${ethers.utils.formatEther(await seqToken.balanceOf(seqico.address))} SEQ`);

  console.log("\n=== Security Status ===");
  const [isSecure, reason] = await seqToken.verifyNotHoneypot();
  console.log(`Security Status: ${isSecure ? "✅ Secure" : "⚠️  Not fully secure"}`);
  console.log(`Reason: ${reason}`);

  console.log("\n=== Next Steps ===");
  console.log("1. Verify contracts on block explorer");
  console.log("2. Test ICO functionality with small amounts");
  console.log("3. Consider calling seqToken.disableMinting() and renounceOwnership() for full decentralization");
  
  // For production deployment, update with real USDT/USDC addresses
  if (network.name === "base" || network.name === "baseSepolia") {
    console.log("\n⚠️  NOTE: Update USDT/USDC addresses for production deployment!");
    console.log("Base USDT: 0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2");
    console.log("Base USDC: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });