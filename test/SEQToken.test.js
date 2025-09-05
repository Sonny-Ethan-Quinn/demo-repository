const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SEQToken Deployment", function () {
  let SEQToken;
  let seqToken;
  let owner;
  let icoAddress;
  let addr1;
  let addr2;

  const TOTAL_SUPPLY = ethers.utils.parseEther("750000"); // 750,000 tokens
  const EXPECTED_TOTAL_SUPPLY = ethers.utils.parseEther("750000");
  const EXPECTED_OWNER_AMOUNT = ethers.utils.parseEther("75000"); // 10% of 750,000
  const EXPECTED_ICO_AMOUNT = ethers.utils.parseEther("675000"); // 90% of 750,000

  beforeEach(async function () {
    // Get signers
    [owner, icoAddress, addr1, addr2] = await ethers.getSigners();
    
    // Get the contract factory
    SEQToken = await ethers.getContractFactory("SEQToken");
  });

  describe("Deployment with different addresses", function () {
    beforeEach(async function () {
      // Deploy with different owner and ICO addresses
      seqToken = await SEQToken.deploy(TOTAL_SUPPLY, owner.address, icoAddress.address);
      await seqToken.deployed();
    });

    it("Should deploy with correct total supply of 750,000 tokens", async function () {
      const deployedTotalSupply = await seqToken.totalSupply();
      expect(deployedTotalSupply).to.equal(EXPECTED_TOTAL_SUPPLY);
    });

    it("Should distribute 10% (75,000 tokens) to owner address", async function () {
      const ownerBalance = await seqToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(EXPECTED_OWNER_AMOUNT);
    });

    it("Should distribute 90% (675,000 tokens) to ICO address", async function () {
      const icoBalance = await seqToken.balanceOf(icoAddress.address);
      expect(icoBalance).to.equal(EXPECTED_ICO_AMOUNT);
    });

    it("Should validate 10%/90% distribution percentages", async function () {
      const deployedTotalSupply = await seqToken.totalSupply();
      const ownerBalance = await seqToken.balanceOf(owner.address);
      const icoBalance = await seqToken.balanceOf(icoAddress.address);

      // Calculate percentages
      const ownerPct = (parseFloat(ethers.utils.formatEther(ownerBalance)) / parseFloat(ethers.utils.formatEther(deployedTotalSupply)) * 100);
      const icoPct = (parseFloat(ethers.utils.formatEther(icoBalance)) / parseFloat(ethers.utils.formatEther(deployedTotalSupply)) * 100);

      expect(ownerPct).to.be.closeTo(10, 0.01); // 10% ± 0.01%
      expect(icoPct).to.be.closeTo(90, 0.01); // 90% ± 0.01%
    });

    it("Should ensure total distribution equals total supply", async function () {
      const deployedTotalSupply = await seqToken.totalSupply();
      const ownerBalance = await seqToken.balanceOf(owner.address);
      const icoBalance = await seqToken.balanceOf(icoAddress.address);

      expect(ownerBalance.add(icoBalance)).to.equal(deployedTotalSupply);
      expect(ownerBalance.add(icoBalance)).to.equal(EXPECTED_TOTAL_SUPPLY);
    });

    it("Should have correct token name and symbol", async function () {
      expect(await seqToken.name()).to.equal("SEQ Token");
      expect(await seqToken.symbol()).to.equal("SEQ");
    });

    it("Should set contract owner correctly", async function () {
      expect(await seqToken.owner()).to.equal(owner.address);
    });
  });

  describe("Deployment with same address for owner and ICO", function () {
    beforeEach(async function () {
      // Deploy with same address for both owner and ICO (like in original deployment script)
      seqToken = await SEQToken.deploy(TOTAL_SUPPLY, owner.address, owner.address);
      await seqToken.deployed();
    });

    it("Should distribute all 750,000 tokens to the single address", async function () {
      const ownerBalance = await seqToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(EXPECTED_TOTAL_SUPPLY);
    });

    it("Should still maintain total supply of 750,000 tokens", async function () {
      const deployedTotalSupply = await seqToken.totalSupply();
      expect(deployedTotalSupply).to.equal(EXPECTED_TOTAL_SUPPLY);
    });
  });

  describe("Security validation", function () {
    beforeEach(async function () {
      seqToken = await SEQToken.deploy(TOTAL_SUPPLY, owner.address, icoAddress.address);
      await seqToken.deployed();
    });

    it("Should have security verification function", async function () {
      const [isSecure, reason] = await seqToken.verifyNotHoneypot();
      expect(typeof isSecure).to.equal("boolean");
      expect(typeof reason).to.equal("string");
      expect(reason).to.include("Owner can still mint tokens");
    });
  });
});