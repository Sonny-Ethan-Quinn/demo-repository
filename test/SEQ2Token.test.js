const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SEQ2Token", function () {
  let SEQ2Token;
  let seq2Token;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy SEQ2Token contract
    SEQ2Token = await ethers.getContractFactory("SEQ2Token");
    const initialSupply = ethers.utils.parseEther("500000"); // 500,000 tokens (within 750,000 max)
    seq2Token = await SEQ2Token.deploy(initialSupply, owner.address);
    await seq2Token.deployed();
  });

  describe("Deployment", function () {
    it("Should deploy with correct initial parameters", async function () {
      expect(await seq2Token.name()).to.equal("SEQ2 Token");
      expect(await seq2Token.symbol()).to.equal("SEQ2");
      expect(await seq2Token.decimals()).to.equal(18);
      expect(await seq2Token.owner()).to.equal(owner.address);
      expect(await seq2Token.pricePerTokenUSDCents()).to.equal(380); // $3.80
    });

    it("Should mint initial supply to owner", async function () {
      const initialSupply = ethers.utils.parseEther("500000");
      expect(await seq2Token.totalSupply()).to.equal(initialSupply);
      expect(await seq2Token.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("Should have correct max supply", async function () {
      const maxSupply = await seq2Token.MAX_SUPPLY();
      expect(maxSupply).to.equal(ethers.utils.parseEther("750000")); // 750,000
    });

    it("Should reject deployment with zero owner address", async function () {
      await expect(
        SEQ2Token.deploy(
          ethers.utils.parseEther("500000"),
          ethers.constants.AddressZero
        )
      ).to.be.revertedWith("Owner address cannot be zero");
    });

    it("Should reject deployment with supply exceeding max", async function () {
      const tooMuchSupply = ethers.utils.parseEther("800000"); // 800,000 (exceeds 750,000 max)
      await expect(
        SEQ2Token.deploy(tooMuchSupply, owner.address)
      ).to.be.revertedWith("Initial supply exceeds maximum");
    });
  });

  describe("Token Operations", function () {
    it("Should allow owner to mint tokens", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      await seq2Token.connect(owner).mint(addr1.address, mintAmount);
      expect(await seq2Token.balanceOf(addr1.address)).to.equal(mintAmount);
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const mintAmount = ethers.utils.parseEther("1000");
      await expect(
        seq2Token.connect(addr1).mint(addr1.address, mintAmount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not mint beyond max supply", async function () {
      const maxSupply = await seq2Token.MAX_SUPPLY();
      const currentSupply = await seq2Token.totalSupply();
      const excessAmount = maxSupply.sub(currentSupply).add(1);
      
      await expect(
        seq2Token.connect(owner).mint(addr1.address, excessAmount)
      ).to.be.revertedWith("Would exceed maximum supply");
    });

    it("Should disable minting permanently", async function () {
      await seq2Token.connect(owner).disableMinting();
      expect(await seq2Token.mintingDisabled()).to.be.true;
      
      const mintAmount = ethers.utils.parseEther("1000");
      await expect(
        seq2Token.connect(owner).mint(addr1.address, mintAmount)
      ).to.be.revertedWith("Minting has been permanently disabled");
    });

    it("Should transfer tokens correctly", async function () {
      const transferAmount = ethers.utils.parseEther("1000");
      await seq2Token.connect(owner).transfer(addr1.address, transferAmount);
      expect(await seq2Token.balanceOf(addr1.address)).to.equal(transferAmount);
    });
  });

  describe("Fund Management", function () {
    it("Should accept fund deposits", async function () {
      const depositAmount = ethers.utils.parseEther("1");
      await seq2Token.connect(addr1).depositFunds({ value: depositAmount });
      
      expect(await seq2Token.getUserDeposit(addr1.address)).to.equal(depositAmount);
      expect(await seq2Token.totalDeposits()).to.equal(depositAmount);
      expect(await seq2Token.getContractBalance()).to.equal(depositAmount);
    });

    it("Should allow users to withdraw their deposits", async function () {
      const depositAmount = ethers.utils.parseEther("1");
      await seq2Token.connect(addr1).depositFunds({ value: depositAmount });
      
      // Check that deposit is recorded
      expect(await seq2Token.getUserDeposit(addr1.address)).to.equal(depositAmount);
      expect(await seq2Token.totalDeposits()).to.equal(depositAmount);
      
      // Withdraw deposit
      await seq2Token.connect(addr1).withdrawUserDeposit();
      
      // Check that deposit tracking is updated
      expect(await seq2Token.getUserDeposit(addr1.address)).to.equal(0);
      expect(await seq2Token.totalDeposits()).to.equal(0);
      expect(await seq2Token.getUserWithdrawals(addr1.address)).to.equal(depositAmount);
    });

    it("Should track user withdrawals", async function () {
      const depositAmount = ethers.utils.parseEther("1");
      await seq2Token.connect(addr1).depositFunds({ value: depositAmount });
      await seq2Token.connect(addr1).withdrawUserDeposit();
      
      expect(await seq2Token.getUserWithdrawals(addr1.address)).to.equal(depositAmount);
    });

    it("Should allow owner to withdraw available funds", async function () {
      // Purchase tokens to add funds to contract (not user deposits)
      const ethAmount = ethers.utils.parseEther("2");
      await seq2Token.connect(addr1).purchaseTokens({ value: ethAmount });
      
      // Add user deposit to test separation
      await seq2Token.connect(addr2).depositFunds({ value: ethers.utils.parseEther("1") });
      
      const availableBalance = await seq2Token.getAvailableBalance();
      expect(availableBalance).to.equal(ethers.utils.parseEther("2"));
      
      const initialBalance = await addr2.getBalance();
      await seq2Token.connect(owner).withdrawFunds(
        ethers.utils.parseEther("1"),
        addr2.address
      );
      
      expect(await addr2.getBalance()).to.equal(
        initialBalance.add(ethers.utils.parseEther("1"))
      );
    });

    it("Should not allow withdrawing user deposits by owner", async function () {
      await seq2Token.connect(addr1).depositFunds({ value: ethers.utils.parseEther("1") });
      
      await expect(
        seq2Token.connect(owner).withdrawFunds(
          ethers.utils.parseEther("1"),
          addr2.address
        )
      ).to.be.revertedWith("Insufficient available balance");
    });
  });

  describe("Token Purchase", function () {
    it("Should allow token purchase with ETH", async function () {
      const ethAmount = ethers.utils.parseEther("1");
      const initialBalance = await seq2Token.balanceOf(addr1.address);
      
      await seq2Token.connect(addr1).purchaseTokens({ value: ethAmount });
      
      const finalBalance = await seq2Token.balanceOf(addr1.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it("Should calculate correct token amount", async function () {
      const ethAmount = ethers.utils.parseEther("1");
      const calculatedTokens = await seq2Token.calculateTokenAmount(ethAmount);
      
      // With $2000 ETH price and $3.80 token price
      // 1 ETH = $2000, so should buy 2000/3.80 = ~526.32 tokens
      const expectedTokens = ethers.utils.parseEther("526.315789473684210526");
      expect(calculatedTokens).to.be.closeTo(expectedTokens, ethers.utils.parseEther("0.1"));
    });

    it("Should reject zero ETH purchases", async function () {
      await expect(
        seq2Token.connect(addr1).purchaseTokens({ value: 0 })
      ).to.be.revertedWith("Must send ETH to purchase tokens");
    });
  });

  describe("Price Management", function () {
    it("Should allow owner to update price", async function () {
      const newPrice = 500; // $5.00
      await seq2Token.connect(owner).updatePrice(newPrice);
      expect(await seq2Token.pricePerTokenUSDCents()).to.equal(newPrice);
    });

    it("Should not allow non-owner to update price", async function () {
      await expect(
        seq2Token.connect(addr1).updatePrice(500)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should return correct USD price breakdown", async function () {
      const [dollars, cents] = await seq2Token.getPriceUSD();
      expect(dollars).to.equal(3);
      expect(cents).to.equal(80);
    });

    it("Should allow setting price oracle", async function () {
      await seq2Token.connect(owner).setPriceOracle(addr1.address);
      expect(await seq2Token.priceOracle()).to.equal(addr1.address);
    });

    it("Should allow oracle to update price", async function () {
      await seq2Token.connect(owner).setPriceOracle(addr1.address);
      const newPrice = 420; // $4.20
      await seq2Token.connect(addr1).updatePriceFromOracle(newPrice);
      expect(await seq2Token.pricePerTokenUSDCents()).to.equal(newPrice);
    });

    it("Should not allow unauthorized oracle price updates", async function () {
      await expect(
        seq2Token.connect(addr1).updatePriceFromOracle(420)
      ).to.be.revertedWith("Only oracle or owner can update price");
    });
  });

  describe("Emergency Controls", function () {
    it("Should allow owner to pause contract", async function () {
      await seq2Token.connect(owner).pause();
      expect(await seq2Token.paused()).to.be.true;
    });

    it("Should prevent operations when paused", async function () {
      await seq2Token.connect(owner).pause();
      
      await expect(
        seq2Token.connect(owner).transfer(addr1.address, ethers.utils.parseEther("100"))
      ).to.be.revertedWith("Pausable: paused");
    });

    it("Should allow owner to unpause contract", async function () {
      await seq2Token.connect(owner).pause();
      await seq2Token.connect(owner).unpause();
      expect(await seq2Token.paused()).to.be.false;
    });
  });

  describe("Security Features", function () {
    it("Should report correct security status", async function () {
      const [isSecure, status] = await seq2Token.verifySecurityStatus();
      expect(isSecure).to.be.false
