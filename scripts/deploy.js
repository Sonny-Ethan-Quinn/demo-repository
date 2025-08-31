const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying SEQ Token...");

  // Get the contract factory
  const SEQToken = await ethers.getContractFactory("SEQToken");

  // Deployment parameters
  const totalSupply = ethers.utils.parseEther("750000"); // 750,000 tokens
  const owner = "0xf6b6F31737f8c42ebA6Ed06E624F08aC5a4e0FC0";
  const ico = "0xf6b6F31737f8c42ebA6Ed06E624F08aC5a4e0FC0";

  console.log("📋 Deployment Configuration:");
  console.log(`Total Supply: ${ethers.utils.formatEther(totalSupply)} SEQ`);
  console.log(`Owner Address: ${owner} (receives 10%)`);
  console.log(`ICO Address: ${ico} (receives 90%)`);
  
  if (owner === ico) {
    console.log("⚠️  Note: Owner and ICO addresses are the same, so one address will receive 100% of tokens");
  }

  // Deploy the contract
  console.log("\n⏳ Deploying contract...");
  const seqToken = await SEQToken.deploy(totalSupply, owner, ico);
  await seqToken.deployed();

  console.log("\n✅ SEQ Token deployed successfully!");
  console.log(`📍 Contract Address: ${seqToken.address}`);

  // Verify deployment
  console.log("\n🔍 Verifying deployment...");
  
  const deployedTotalSupply = await seqToken.totalSupply();
  const tokenName = await seqToken.name();
  const tokenSymbol = await seqToken.symbol();
  const ownerBalance = await seqToken.balanceOf(owner);
  const icoBalance = await seqToken.balanceOf(ico);
  const contractOwner = await seqToken.owner();

  console.log(`✅ Token Name: ${tokenName}`);
  console.log(`✅ Token Symbol: ${tokenSymbol}`);
  console.log(`✅ Total Supply: ${ethers.utils.formatEther(deployedTotalSupply)} SEQ`);
  const ownerPct = (parseFloat(ethers.utils.formatEther(ownerBalance)) / parseFloat(ethers.utils.formatEther(deployedTotalSupply)) * 100).toFixed(2);
  const icoPct = (parseFloat(ethers.utils.formatEther(icoBalance)) / parseFloat(ethers.utils.formatEther(deployedTotalSupply)) * 100).toFixed(2);
  console.log(`✅ Owner Balance: ${ethers.utils.formatEther(ownerBalance)} SEQ (${ownerPct}%)`);
  console.log(`✅ ICO Balance: ${ethers.utils.formatEther(icoBalance)} SEQ (${icoPct}%)`);
  console.log(`✅ Contract Owner: ${contractOwner}`);

  // Security status check
  console.log("\n🛡️  Security Status:");
  const [isSecure, reason] = await seqToken.verifyNotHoneypot();
  console.log(`Status: ${isSecure ? "✅ Secure" : "⚠️  Not fully secure"}`);
  console.log(`Reason: ${reason}`);

  console.log("\n🎯 Next Steps:");
  console.log("1. Verify contract on block explorer");
  console.log("2. Test token transfers");
  console.log("3. For full decentralization, call:");
  console.log("   - seqToken.disableMinting()");
  console.log("   - seqToken.renounceOwnership()");

  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n📋 Contract verification command:");
    console.log(`npx hardhat verify --network ${network.name} ${seqToken.address} "${totalSupply}" "${owner}" "${ico}"`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });

