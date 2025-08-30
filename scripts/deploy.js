const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying SEQ Token to Base network...");

  // Get the contract factory
  const SEQToken = await ethers.getContractFactory("SEQToken");
  
  // Get signers for deployment
  const [deployer, ownerAddr, icoAddr] = await ethers.getSigners();

  // Set total supply (100 million tokens)
  const totalSupply = ethers.utils.parseEther("100000000");

  console.log(`Deploying with total supply: ${ethers.utils.formatEther(totalSupply)} SEQ`);
  console.log(`Owner address (10%): ${ownerAddr.address}`);
  console.log(`ICO address (90%): ${icoAddr.address}`);

  // Deploy the contract with new constructor parameters
  const seqToken = await SEQToken.deploy(totalSupply, ownerAddr.address, icoAddr.address);

  // Wait for deployment
  await seqToken.deployed();

  console.log("SEQ Token deployed to:", seqToken.address);
  console.log("Contract owner:", await seqToken.owner());

  // Verify the deployment
  const name = await seqToken.name();
  const symbol = await seqToken.symbol();
  const actualTotalSupply = await seqToken.totalSupply();
  const maxSupply = await seqToken.MAX_SUPPLY();
  
  // Check token distribution
  const ownerBalance = await seqToken.balanceOf(ownerAddr.address);
  const icoBalance = await seqToken.balanceOf(icoAddr.address);

  console.log("\n=== Deployment Verification ===");
  console.log(`Name: ${name}`);
  console.log(`Symbol: ${symbol}`);
  console.log(`Total Supply: ${ethers.utils.formatEther(actualTotalSupply)} SEQ`);
  console.log(`Max Supply: ${ethers.utils.formatEther(maxSupply)} SEQ`);
  console.log(`Owner Balance (10%): ${ethers.utils.formatEther(ownerBalance)} SEQ`);
  console.log(`ICO Balance (90%): ${ethers.utils.formatEther(icoBalance)} SEQ`);

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
  console.log(`Constructor Arguments: ${totalSupply}, ${ownerAddr.address}, ${icoAddr.address}`);
  console.log(`Network: ${network.name}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });