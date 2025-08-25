const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying SEQ Token to Base network...");

  // Get the contract factory
  const SEQToken = await ethers.getContractFactory("SEQToken");

  // Set initial supply (100 million tokens)
  const initialSupply = ethers.utils.parseEther("100000000");

  console.log(`Deploying with initial supply: ${ethers.utils.formatEther(initialSupply)} SEQ`);

  // Deploy the contract
  const seqToken = await SEQToken.deploy(initialSupply);

  // Wait for deployment
  await seqToken.deployed();

  console.log("SEQ Token deployed to:", seqToken.address);
  console.log("Deployer address:", await seqToken.owner());

  // Verify the deployment
  const name = await seqToken.name();
  const symbol = await seqToken.symbol();
  const totalSupply = await seqToken.totalSupply();
  const maxSupply = await seqToken.MAX_SUPPLY();

  console.log("\n=== Deployment Verification ===");
  console.log(`Name: ${name}`);
  console.log(`Symbol: ${symbol}`);
  console.log(`Total Supply: ${ethers.utils.formatEther(totalSupply)} SEQ`);
  console.log(`Max Supply: ${ethers.utils.formatEther(maxSupply)} SEQ`);

  // Check security status
  const [isSecure, reason] = await seqToken.verifyNotHoneypot();
  console.log(`\nSecurity Status: ${isSecure ? "✅ Secure" : "⚠️  Not fully secure"}`);
  console.log(`Reason: ${reason}`);

  console.log("\n=== Security Recommendations ===");
  console.log("1. Call disableMinting() to permanently prevent new token creation");
  console.log("2. Call renounceOwnership() to make the token fully decentralized");
  console.log("3. Verify the contract on Basescan for transparency");

  // Display contract addresses for verification
  console.log("\n=== For Contract Verification ===");
  console.log(`Contract Address: ${seqToken.address}`);
  console.log(`Constructor Arguments: ${initialSupply}`);
  console.log(`Network: ${network.name}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });