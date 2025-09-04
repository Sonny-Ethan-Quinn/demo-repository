// Gas estimation script for SEQICO operations
// Run with: npx hardhat run scripts/estimate-gas.js --network localhost

const { ethers } = require("hardhat");

async function main() {
  console.log("=== SEQICO Gas Estimation ===\n");

  // Deploy contracts for estimation (mock scenario)
  const SEQToken = await ethers.getContractFactory("SEQToken");
  const SEQICO = await ethers.getContractFactory("SEQICO");
  const MockUSDT = await ethers.getContractFactory("MockUSDT");

  console.log("Estimating deployment gas costs...");
  
  // Estimate deployment gas
  const seqTokenDeployGas = await SEQToken.signer.estimateGas(
    SEQToken.getDeployTransaction(ethers.utils.parseEther("1000000"))
  );
  console.log(`SEQ Token deployment: ~${seqTokenDeployGas.toString()} gas`);

  const usdtDeployGas = await MockUSDT.signer.estimateGas(MockUSDT.getDeployTransaction());
  console.log(`Mock USDT deployment: ~${usdtDeployGas.toString()} gas`);

  // For SEQICO, we need to provide constructor parameters
  const seqicoDeployGas = await SEQICO.signer.estimateGas(
    SEQICO.getDeployTransaction(
      ethers.constants.AddressZero, // seqToken (placeholder)
      ethers.constants.AddressZero, // usdt (placeholder)
      ethers.constants.AddressZero, // usdc (placeholder)
      ethers.utils.parseEther("0.001"), // ETH price
      ethers.utils.parseEther("1"), // USDT price
      ethers.utils.parseEther("1")  // USDC price
    )
  );
  console.log(`SEQICO deployment: ~${seqicoDeployGas.toString()} gas`);

  // Calculate total deployment cost
  const totalDeployGas = seqTokenDeployGas.add(usdtDeployGas).add(seqicoDeployGas);
  console.log(`Total deployment gas: ~${totalDeployGas.toString()} gas`);

  // Estimate gas costs at different gas prices
  console.log("\n=== Cost Estimates (Full Deployment) ===");
  const gasPrices = [1, 5, 10, 20, 50]; // gwei
  
  for (const gasPrice of gasPrices) {
    const gasPriceWei = ethers.utils.parseUnits(gasPrice.toString(), "gwei");
    const costWei = totalDeployGas.mul(gasPriceWei);
    const costEth = ethers.utils.formatEther(costWei);
    console.log(`At ${gasPrice} gwei: ${costEth} ETH`);
  }

  console.log("\n=== Individual Operation Gas Estimates ===");
  
  // For operation estimates, we'll show typical values
  // (actual deployment would be needed for precise estimates)
  const operations = {
    "ETH Purchase": "~80,000 gas",
    "USDT Purchase": "~90,000 gas (includes ERC20 transfer)",
    "USDC Purchase": "~90,000 gas (includes ERC20 transfer)",
    "Withdraw ETH": "~30,000 gas",
    "Withdraw ERC20": "~50,000 gas",
    "Set SEQ Token": "~25,000 gas"
  };

  for (const [operation, estimate] of Object.entries(operations)) {
    console.log(`${operation}: ${estimate}`);
  }

  console.log("\n=== Base Network Considerations ===");
  console.log("• Base typically has lower gas costs than Ethereum mainnet");
  console.log("• Average gas price on Base: 0.001-0.01 gwei");
  console.log("• Transaction costs are usually under $0.01");
  console.log("• Fast confirmation times (2-second blocks)");

  console.log("\n=== Optimization Tips ===");
  console.log("• Batch operations when possible");
  console.log("• Consider gas-efficient ERC20 tokens for lower costs");
  console.log("• Monitor Base network gas prices for optimal deployment timing");
  console.log("• Use CREATE2 for deterministic addresses if needed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });