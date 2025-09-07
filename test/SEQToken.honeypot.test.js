const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SEQToken Honeypot Prevention Tests", function () {
  let SEQToken;
  let seqToken;
  let owner, user1, user2, maliciousUser;

  beforeEach(async function () {
    [owner, user1, user2, maliciousUser] = await ethers.getSigners();

    SEQToken = await ethers.getContractFactory("SEQToken");
    const totalSupply = ethers.utils.parseEther("500000");
    seqToken = await SEQToken.deploy(totalSupply, owner.address, user1.address);
    await seqToken.deployed();
  });

  describe("Honeypot Attack Vector Prevention", function () {
    
    it("Should prevent honeypot attack: hidden buy/sell restrictions", async function () {
      // Transfer tokens to users to simulate buying
      const amount = ethers.utils.parseEther("1000");
      await seqToken.connect(owner).transfer(user1.address, amount);
      await seqToken.connect(owner).transfer(user2.address, amount);
      
      // All users should be able to transfer freely (simulate selling)
      expect(await seqToken.canTransfer(user1.address)).to.be.true;
      expect(await seqToken.canTransfer(user2.address)).to.be.true;
      expect(await seqToken.canTransfer(maliciousUser.address)).to.be.true;
      
      // Users should be able to transfer tokens back (sell)
      await seqToken.connect(user1).transfer(user2.address, ethers.utils.parseEther("100"));
      await seqToken.connect(user2).transfer(user1.address, ethers.utils.parseEther("50"));
    });

    it("Should prevent honeypot attack: hidden taxation on transfers", async function () {
      const transferAmount = ethers.utils.parseEther("1000");
      
      // Transfer should send exactly the amount specified - no hidden taxes
      const user1InitialBalance = await seqToken.balanceOf(user1.address);
      const user2InitialBalance = await seqToken.balanceOf(user2.address);
      
      await seqToken.connect(user1).transfer(user2.address, transferAmount);
      
      const user1FinalBalance = await seqToken.balanceOf(user1.address);
      const user2FinalBalance = await seqToken.balanceOf(user2.address);
      
      // Verify no hidden fees were taken
      expect(user1FinalBalance).to.equal(user1InitialBalance.sub(transferAmount));
      expect(user2FinalBalance).to.equal(user2InitialBalance.add(transferAmount));
      
      // Verify tax functions return 0
      expect(await seqToken.getTransferTax()).to.equal(0);
      expect(await seqToken.getTransferAmount(transferAmount)).to.equal(transferAmount);
    });

    it("Should prevent honeypot attack: blacklisting mechanism", async function () {
      // No matter what, canTransfer should always return true
      expect(await seqToken.canTransfer(ethers.constants.AddressZero)).to.be.true;
      expect(await seqToken.canTransfer(maliciousUser.address)).to.be.true;
      expect(await seqToken.canTransfer("0x000000000000000000000000000000000000dEaD")).to.be.true;
      
      // Malicious user should be able to receive and send tokens
      const amount = ethers.utils.parseEther("100");
      await seqToken.connect(owner).transfer(maliciousUser.address, amount);
      await seqToken.connect(maliciousUser).transfer(user1.address, amount.div(2));
    });

    it("Should prevent honeypot attack: sudden ownership privilege escalation", async function () {
      // Owner should not be able to gain additional privileges beyond what's documented
      const initialOwner = await seqToken.owner();
      
      // The only owner functions should be: mint, disableMinting, renounceOwnership
      // Test that there are no hidden owner functions that could trap user funds
      
      // Owner cannot prevent specific users from transferring
      const amount = ethers.utils.parseEther("100");
      await seqToken.connect(owner).transfer(user1.address, amount);
      await seqToken.connect(user1).transfer(user2.address, amount);
      
      // Owner cannot modify transfer behavior after deployment
      expect(await seqToken.getTransferTax()).to.equal(0);
      expect(await seqToken.canTransfer(user1.address)).to.be.true;
    });

    it("Should prevent honeypot attack: fake renounceOwnership", async function () {
      // Verify that renounceOwnership actually removes all privileges
      expect(await seqToken.owner()).to.equal(owner.address);
      
      await seqToken.connect(owner).renounceOwnership();
      
      // After renouncing, owner should be zero address
      expect(await seqToken.owner()).to.equal(ethers.constants.AddressZero);
      
      // All owner functions should be disabled
      await expect(
        seqToken.connect(owner).mint(user1.address, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      await expect(
        seqToken.connect(owner).disableMinting()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should prevent honeypot attack: unlimited minting", async function () {
      const maxSupply = await seqToken.MAX_SUPPLY();
      const currentSupply = await seqToken.totalSupply();
      const remainingMintable = maxSupply.sub(currentSupply);
      
      // Should not be able to mint beyond max supply
      const excessAmount = remainingMintable.add(ethers.utils.parseEther("1"));
      await expect(
        seqToken.connect(owner).mint(user1.address, excessAmount)
      ).to.be.revertedWith("Would exceed maximum supply");
      
      // After disabling minting, no new tokens can be created
      await seqToken.connect(owner).disableMinting();
      await expect(
        seqToken.connect(owner).mint(user1.address, ethers.utils.parseEther("1"))
      ).to.be.revertedWith("Minting has been permanently disabled");
    });

    it("Should prevent honeypot attack: reentrancy during transfers", async function () {
      // Deploy the malicious contract that attempts reentrancy
      const MaliciousReentrancy = await ethers.getContractFactory("MaliciousReentrancy");
      const maliciousContract = await MaliciousReentrancy.deploy(seqToken.address);
      await maliciousContract.deployed();
      
      // Give the malicious contract some tokens
      const amount = ethers.utils.parseEther("100");
      await seqToken.connect(owner).transfer(maliciousContract.address, amount);
      
      const initialBalance = await seqToken.balanceOf(maliciousContract.address);
      expect(initialBalance).to.equal(amount);
      
      // Attempt reentrancy attack - should not drain extra tokens
      await maliciousContract.attemptReentrancy();
      
      // Contract should have transferred all its tokens but not more
      const finalBalance = await seqToken.balanceOf(maliciousContract.address);
      expect(finalBalance).to.equal(0);
    });

    it("Should have comprehensive security status reporting", async function () {
      // Initially not fully secure because owner can still mint
      let [isSecure, reason] = await seqToken.verifyNotHoneypot();
      expect(isSecure).to.be.false;
      expect(reason).to.include("Owner can still mint tokens");
      
      // After disabling minting, should be more secure
      await seqToken.connect(owner).disableMinting();
      [isSecure, reason] = await seqToken.verifyNotHoneypot();
      expect(isSecure).to.be.true;
      expect(reason).to.include("Minting disabled");
      
      // After renouncing ownership, should be fully secure
      await seqToken.connect(owner).renounceOwnership();
      [isSecure, reason] = await seqToken.verifyNotHoneypot();
      expect(isSecure).to.be.true;
      expect(reason).to.include("fully decentralized");
    });
  });
});