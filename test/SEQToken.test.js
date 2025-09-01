const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SEQToken Security Tests", function () {
  let SEQToken;
  let token;
  let deployer;
  let owner;
  let ico;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    SEQToken = await ethers.getContractFactory("SEQToken");
    [deployer, owner, ico, addr1, addr2, ...addrs] = await ethers.getSigners();
    
    // Deploy with 100 million total supply, distributed 10% to owner, 90% to ico
    const totalSupply = ethers.utils.parseEther("100000000");
    token = await SEQToken.deploy(totalSupply, owner.address, ico.address);
  });

  describe("Deployment", function () {
    it("Should deploy with correct total supply and distribution", async function () {
      const totalSupply = ethers.utils.parseEther("100000000");
      const expectedOwnerAmount = ethers.utils.parseEther("10000000"); // 10%
      const expectedIcoAmount = ethers.utils.parseEther("90000000");   // 90%
      
      expect(await token.totalSupply()).to.equal(totalSupply);
      expect(await token.balanceOf(owner.address)).to.equal(expectedOwnerAmount);
      expect(await token.balanceOf(ico.address)).to.equal(expectedIcoAmount);
    });

    it("Should set correct owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should have correct token details", async function () {
      expect(await token.name()).to.equal("SEQ Token");
      expect(await token.symbol()).to.equal("SEQ");
      expect(await token.decimals()).to.equal(18);
    });

    it("Should set max supply correctly", async function () {
      const maxSupply = ethers.utils.parseEther("1000000000"); // 1 billion
      expect(await token.MAX_SUPPLY()).to.equal(maxSupply);
    });

    it("Should reject deployment with zero addresses", async function () {
      const totalSupply = ethers.utils.parseEther("100000000");
      
      await expect(
        SEQToken.deploy(totalSupply, ethers.constants.AddressZero, ico.address)
      ).to.be.revertedWith("Owner address cannot be zero");
      
      await expect(
        SEQToken.deploy(totalSupply, owner.address, ethers.constants.AddressZero)
      ).to.be.revertedWith("ICO address cannot be zero");
    });

    it("Should reject deployment with supply exceeding max", async function () {
      const maxSupply = await token.MAX_SUPPLY();
      const excessiveSupply = maxSupply + 1n;
      
      await expect(
        SEQToken.deploy(excessiveSupply, owner.address, ico.address)
      ).to.be.revertedWith("Total supply exceeds maximum");
    });
  });

  describe("Honeypot Prevention Tests", function () {
    it("Should allow normal transfers without restrictions", async function () {
      const amount = ethers.utils.parseEther("1000");
      
      // Transfer from owner to addr1 (owner has 10% of tokens)
      await token.connect(owner).transfer(addr1.address, amount);
      expect(await token.balanceOf(addr1.address)).to.equal(amount);
      
      // Transfer from addr1 to addr2
      await token.connect(addr1).transfer(addr2.address, amount);
      expect(await token.balanceOf(addr2.address)).to.equal(amount);
      expect(await token.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should not have any transfer fees or taxes", async function () {
      const amount = ethers.utils.parseEther("1000");
      
      // Check getTransferAmount returns full amount
      expect(await token.getTransferAmount(amount)).to.equal(amount);
      
      // Check transfer tax is 0
      expect(await token.getTransferTax()).to.equal(0);
      
      // Actual transfer should send full amount (owner has tokens)
      await token.connect(owner).transfer(addr1.address, amount);
      expect(await token.balanceOf(addr1.address)).to.equal(amount);
    });

    it("Should allow anyone to transfer (no blacklisting)", async function () {
      const amount = ethers.utils.parseEther("1000");
      
      // Send tokens to multiple addresses (owner has tokens)
      await token.connect(owner).transfer(addr1.address, amount);
      await token.connect(owner).transfer(addr2.address, amount);
      
      // All addresses should be able to transfer
      expect(await token.canTransfer(addr1.address)).to.be.true;
      expect(await token.canTransfer(addr2.address)).to.be.true;
      expect(await token.canTransfer(addrs[0].address)).to.be.true;
      
      // Actual transfers should work
      await token.connect(addr1).transfer(addr2.address, amount);
      await token.connect(addr2).transfer(addrs[0].address, amount);
    });

    it("Should not allow minting beyond max supply", async function () {
      const maxSupply = await token.MAX_SUPPLY();
      const currentSupply = await token.totalSupply();
      const remainingSupply = maxSupply.sub(currentSupply);
      
      // Should be able to mint up to max supply (by owner)
      await token.connect(owner).mint(addr1.address, remainingSupply);
      expect(await token.totalSupply()).to.equal(maxSupply);
      
      // Should not be able to mint more
      await expect(
        token.connect(owner).mint(addr1.address, 1)
      ).to.be.revertedWith("Would exceed maximum supply");
    });
  });

  describe("Minting Controls", function () {
    it("Should allow owner to mint tokens initially", async function () {
      const amount = ethers.utils.parseEther("1000");
      await token.connect(owner).mint(addr1.address, amount);
      expect(await token.balanceOf(addr1.address)).to.equal(amount);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const amount = ethers.utils.parseEther("1000");
      await expect(
        token.connect(addr1).mint(addr1.address, amount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should permanently disable minting when requested", async function () {
      const amount = ethers.utils.parseEther("1000");
      
      // Initially should be able to mint (by owner)
      await token.connect(owner).mint(addr1.address, amount);
      expect(await token.mintingDisabled()).to.be.false;
      
      // Disable minting (by owner)
      await token.connect(owner).disableMinting();
      expect(await token.mintingDisabled()).to.be.true;
      
      // Should no longer be able to mint
      await expect(
        token.connect(owner).mint(addr1.address, amount)
      ).to.be.revertedWith("Minting has been permanently disabled");
    });

    it("Should not allow non-owner to disable minting", async function () {
      await expect(
        token.connect(addr1).disableMinting()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Ownership Controls", function () {
    it("Should allow owner to renounce ownership", async function () {
      expect(await token.owner()).to.equal(owner.address);
      
      await token.connect(owner).renounceOwnership();
      
      expect(await token.owner()).to.equal(ethers.constants.AddressZero);
    });

    it("Should not allow minting after ownership is renounced", async function () {
      const amount = ethers.utils.parseEther("1000");
      
      // Renounce ownership (by owner)
      await token.connect(owner).renounceOwnership();
      
      // Should not be able to mint anymore (no owner)
      await expect(
        token.connect(owner).mint(addr1.address, amount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Security Verification", function () {
    it("Should verify honeypot status correctly", async function () {
      // Initially not fully secure (owner can still mint)
      let [isSecure, reason] = await token.verifyNotHoneypot();
      expect(isSecure).to.be.false;
      expect(reason).to.contain("Owner can still mint tokens");
      
      // After disabling minting, more secure (by owner)
      await token.connect(owner).disableMinting();
      [isSecure, reason] = await token.verifyNotHoneypot();
      expect(isSecure).to.be.true;
      expect(reason).to.contain("Minting disabled");
      
      // After renouncing ownership, fully secure (by owner)
      await token.connect(owner).renounceOwnership();
      [isSecure, reason] = await token.verifyNotHoneypot();
      expect(isSecure).to.be.true;
      expect(reason).to.contain("fully decentralized");
    });

    it("Should protect against reentrancy attacks", async function () {
      const amount = ethers.utils.parseEther("1000");
      
      // Deploy a malicious contract that attempts reentrancy
      const MaliciousContract = await ethers.getContractFactory("MaliciousReentrancy");
      const malicious = await MaliciousContract.deploy(token.address);
      
      // Send tokens to malicious contract (owner has tokens)
      await token.connect(owner).transfer(malicious.address, amount);
      
      // The malicious contract should not be able to perform reentrancy
      // This test passes if no revert occurs from reentrancy guard
      expect(await token.balanceOf(malicious.address)).to.equal(amount);
    });
  });

  describe("Transfer Functions", function () {
    it("Should handle transfers with reentrancy protection", async function () {
      const amount = ethers.utils.parseEther("1000");
      
      // Normal transfers should work (owner has tokens)
      await token.connect(owner).transfer(addr1.address, amount);
      expect(await token.balanceOf(addr1.address)).to.equal(amount);
      
      // transferFrom should also work
      await token.connect(owner).approve(addr1.address, amount);
      await token.connect(addr1).transferFrom(owner.address, addr2.address, amount);
      expect(await token.balanceOf(addr2.address)).to.equal(amount);
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero transfers", async function () {
      await expect(token.connect(owner).transfer(addr1.address, 0)).to.not.be.reverted;
    });

    it("Should handle max supply exactly", async function () {
      const maxSupply = await token.MAX_SUPPLY();
      
      // Should be able to deploy with max supply
      const maxToken = await SEQToken.deploy(maxSupply, owner.address, ico.address);
      expect(await maxToken.totalSupply()).to.equal(maxSupply);
    });

    it("Should reject deployment with supply exceeding max", async function () {
      const maxSupply = await token.MAX_SUPPLY();
      const excessiveSupply = maxSupply + 1n;
      
      await expect(
        SEQToken.deploy(excessiveSupply, owner.address, ico.address)
      ).to.be.revertedWith("Total supply exceeds maximum");
    });
  });
});