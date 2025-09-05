const { ethers } = require("hardhat");

async function main() {
  console.log("=== Verifying Token Supply Configurations ===\n");

  // Deploy SEQToken
  const SEQToken = await ethers.getContractFactory("SEQToken");
  const totalSupply = ethers.utils.parseEther("750000");
  const owner = "0xf6b6F31737f8c42ebA6Ed06E624F08aC5a4e0FC0";
  const ico = "0xf6b6F31737f8c42ebA6Ed06E624F08aC5a4e0FC0";
  
  const seqToken = await SEQToken.deploy(totalSupply, owner, ico);
  await seqToken.deployed();

  // Deploy SEQ2Token  
  const SEQ2Token = await ethers.getContractFactory("SEQ2Token");
  const seq2InitialSupply = ethers.utils.parseEther("500000");
  const seq2Token = await SEQ2Token.deploy(seq2InitialSupply, owner);
  await seq2Token.deployed();

  // Verify SEQToken
  const seqMaxSupply = await seqToken.MAX_SUPPLY();
  const seqTotalSupply = await seqToken.totalSupply();
  
  console.log("SEQToken:");
  console.log(`  MAX_SUPPLY: ${ethers.utils.formatEther(seqMaxSupply)} tokens`);
  console.log(`  Current Total Supply: ${ethers.utils.formatEther(seqTotalSupply)} tokens`);
  console.log(`  ✅ MAX_SUPPLY = 750,000: ${ethers.utils.formatEther(seqMaxSupply) === "750000.0" ? "YES" : "NO"}`);

  // Verify SEQ2Token
  const seq2MaxSupply = await seq2Token.MAX_SUPPLY();
  const seq2TotalSupply = await seq2Token.totalSupply();
  
  console.log("\nSEQ2Token:");
  console.log(`  MAX_SUPPLY: ${ethers.utils.formatEther(seq2MaxSupply)} tokens`);
  console.log(`  Current Total Supply: ${ethers.utils.formatEther(seq2TotalSupply)} tokens`);
  console.log(`  ✅ MAX_SUPPLY = 750,000: ${ethers.utils.formatEther(seq2MaxSupply) === "750000.0" ? "YES" : "NO"}`);

  console.log("\n=== Summary ===");
  const bothCorrect = ethers.utils.formatEther(seqMaxSupply) === "750000.0" && 
                     ethers.utils.formatEther(seq2MaxSupply) === "750000.0";
  console.log(`✅ Both tokens have MAX_SUPPLY = 750,000: ${bothCorrect ? "YES" : "NO"}`);
  
  if (bothCorrect) {
    console.log("🎉 SUCCESS: Total supply requirement of 750,000 is satisfied!");
  } else {
    console.log("❌ FAILURE: Total supply requirement not met");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });