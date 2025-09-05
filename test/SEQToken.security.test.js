const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SEQToken Security Tests", function () {
  let SEQToken;
  let seqToken;
  let owner, addr1, addr2, ico;

  beforeEach(async function () {
    [owner, addr1, addr2, ico] = await ethers.getSigners();

    // Deploy SEQToken contract with less than max supply to test minting
    SEQToken = await ethers.getContractFactory("SEQToken");
    const totalSupply = ethers.utils.parseEther("500000"); // 500,000 tokens (less than max)
    seqToken = await SEQToken.deploy(totalSupply, owner.address, ico.address);
    await seqToken.deployed();
  });

  describe("Anti-Honeypot Security Features", function () {
    
    it("Should have transparent minting function with MAX_SUPPLY limit", async function () {
      const maxSupply = await seqToken.MAX_SUPPLY();
      expect(maxSupply).to.equal(ethers.utils.parseEther("750000"));
      
      // Owner can mint tokens up to remaining capacity
      const currentSupply = await seqToken.totalSupply();
      const remainingCapacity = maxSupply.sub(currentSupply);
      const mintAmount = ethers.utils.parseEther("1000");
      
      if (remainingCapacity.gte(mintAmount)) {
        await seqToken.connect(owner).mint(addr1.address, mintAmount);
        expect(await seqToken.balanceOf(addr1.address)).to.equal(mintAmount);
      }
      
      // Should reject minting beyond max supply
      const excessAmount = maxSupply.add(ethers.utils.parseEther("1"));
      await expect(
        seqToken.connect(owner).mint(addr1.address, excessAmount)
      ).to.be.revertedWith("Would exceed maximum supply");
    });

    it("Should have no transfer restrictions - canTransfer always returns true", async function () {
      // Test canTransfer for different addresses
      expect(await seqToken.canTransfer(owner.address)).to.be.true;
      expect(await seqToken.canTransfer(addr1.address)).to.be.true;
      expect(await seqToken.canTransfer(addr2.address)).to.be.true;
      expect(await seqToken.canTransfer(ethers.constants.AddressZero)).to.be.true;
    });

    it("Should have no hidden fees or taxes", async function () {
      // Test getTransferTax always returns 0
      expect(await seqToken.getTransferTax()).to.equal(0);
      
      // Test getTransferAmount returns full amount
      const testAmount = ethers.utils.parseEther("100");
      expect(await seqToken.getTransferAmount(testAmount)).to.equal(testAmount);
    });

    it("Should allow normal transfers without restrictions", async function () {
      // Transfer from owner to addr1
      const transferAmount = ethers.utils.parseEther("1000");
      const ownerInitialBalance = await seqToken.balanceOf(owner.address);
      
      await seqToken.connect(owner).transfer(addr1.address, transferAmount);
      
      expect(await seqToken.balanceOf(addr1.address)).to.equal(transferAmount);
      expect(await seqToken.balanceOf(owner.address)).to.equal(
        ownerInitialBalance.sub(transferAmount)
      );
    });

    it("Should have reentrancy protection on transfers", async function () {
      // Deploy malicious reentrancy contract
      const MaliciousReentrancy = await ethers.getContractFactory("MaliciousReentrancy");
      const maliciousContract = await MaliciousReentrancy.deploy(seqToken.address);
      await maliciousContract.deployed();
      
      // Transfer some tokens to malicious contract
      const amount = ethers.utils.parseEther("100");
      await seqToken.connect(owner).transfer(maliciousContract.address, amount);
      
      // Try to perform reentrancy attack - should not revert due to reentrancy guard
      // The reentrancy guard prevents multiple calls, making the attack ineffective
      await maliciousContract.attemptReentrancy();
      
      // Verify the attack didn't drain more tokens than expected
      expect(await seqToken.balanceOf(maliciousContract.address)).to.equal(0);
    });

    it("Should have proper ownership controls with renunciation capability", async function () {
      // Initially owner should be the deployer
      expect(await seqToken.owner()).to.equal(owner.address);
      
      // Only owner can call owner functions
      await expect(
        seqToken.connect(addr1).mint(addr2.address, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
      
      // Owner can renounce ownership
      await seqToken.connect(owner).renounceOwnership();
      expect(await seqToken.owner()).to.equal(ethers.constants.AddressZero);
      
      // After renouncing, no one can call owner functions
      await expect(
        seqToken.connect(owner).mint(addr1.address, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow permanent minting disabling", async function () {
      // Initially minting should be enabled
      expect(await seqToken.mintingDisabled()).to.be.false;
      
      // Owner can disable minting
      await expect(seqToken.connect(owner).disableMinting())
        .to.emit(seqToken, "MintingDisabled");
      
      expect(await seqToken.mintingDisabled()).to.be.true;
      
      // After disabling, minting should fail
      await expect(
        seqToken.connect(owner).mint(addr1.address, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("Minting has been permanently disabled");
    });

    it("Should have proper security verification function", async function () {
      // Initially should report as not fully secure (owner can still mint)
      let [isSecure, reason] = await seqToken.verifyNotHoneypot();
      expect(isSecure).to.be.false;
      expect(reason).to.include("Owner can still mint tokens");
      
      // After disabling minting
      await seqToken.connect(owner).disableMinting();
      [isSecure, reason] = await seqToken.verifyNotHoneypot();
      expect(isSecure).to.be.true;
      expect(reason).to.include("Minting disabled");
      
      // After renouncing ownership
      await seqToken.connect(owner).renounceOwnership();
      [isSecure, reason] = await seqToken.verifyNotHoneypot();
      expect(isSecure).to.be.true;
      expect(reason).to.include("fully decentralized");
    });
  });

  describe("Basic Token Functionality", function () {
    it("Should deploy with correct parameters", async function () {
      expect(await seqToken.name()).to.equal("SEQ Token");
      expect(await seqToken.symbol()).to.equal("SEQ");
      expect(await seqToken.decimals()).to.equal(18);
      
      const totalSupply = await seqToken.totalSupply();
      expect(totalSupply).to.equal(ethers.utils.parseEther("500000"));
      
      // Check distribution: 10% to owner, 90% to ICO
      const ownerBalance = await seqToken.balanceOf(owner.address);
      const icoBalance = await seqToken.balanceOf(ico.address);
      
      expect(ownerBalance).to.equal(ethers.utils.parseEther("50000")); // 10%
      expect(icoBalance).to.equal(ethers.utils.parseEther("450000")); // 90%
    });

    it("Should handle transferFrom with allowances correctly", async function () {
      const amount = ethers.utils.parseEther("1000");
      
      // Owner approves addr1 to spend tokens
      await seqToken.connect(owner).approve(addr1.address, amount);
      expect(await seqToken.allowance(owner.address, addr1.address)).to.equal(amount);
      
      // addr1 transfers from owner to addr2
      await seqToken.connect(addr1).transferFrom(owner.address, addr2.address, amount);
      
      expect(await seqToken.balanceOf(addr2.address)).to.equal(amount);
      expect(await seqToken.allowance(owner.address, addr1.address)).to.equal(0);
    });
  });
});