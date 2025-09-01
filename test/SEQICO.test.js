const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SEQICO Contract Tests", function () {
  let SEQToken, SEQICO, MockUSDT, MockUSDC;
  let seqToken, seqico, usdt, usdc;
  let owner, buyer1, buyer2, addrs;

  // Price constants (in wei for ETH, adjusted for token decimals)
  const ETH_PRICE_PER_TOKEN = ethers.utils.parseEther("0.001"); // 0.001 ETH per SEQ token
  const USDT_PRICE_PER_TOKEN = ethers.utils.parseEther("1"); // $1 per SEQ token (in 18 decimal format)
  const USDC_PRICE_PER_TOKEN = ethers.utils.parseEther("1"); // $1 per SEQ token (in 18 decimal format)

  beforeEach(async function () {
    [owner, buyer1, buyer2, ...addrs] = await ethers.getSigners();

    // Deploy SEQ Token
    SEQToken = await ethers.getContractFactory("SEQToken");
    seqToken = await SEQToken.deploy(
      ethers.utils.parseEther("1000000"), // 1M SEQ tokens total supply
      owner.address, // owner gets 10%
      owner.address  // for testing, owner gets the ICO tokens too
    );

    // Deploy Mock USDT and USDC
    MockUSDT = await ethers.getContractFactory("MockUSDT");
    MockUSDC = await ethers.getContractFactory("MockUSDC");
    
    usdt = await MockUSDT.deploy();
    usdc = await MockUSDC.deploy();

    // Deploy SEQICO
    SEQICO = await ethers.getContractFactory("SEQICO");
    seqico = await SEQICO.deploy(
      seqToken.address,
      usdt.address,
      usdc.address,
      ETH_PRICE_PER_TOKEN,
      USDT_PRICE_PER_TOKEN,
      USDC_PRICE_PER_TOKEN
    );

    // Transfer SEQ tokens to ICO contract for sale
    const tokensForSale = ethers.utils.parseEther("100000"); // 100K tokens for sale
    await seqToken.transfer(seqico.address, tokensForSale);

    // Give buyers some USDT and USDC for testing
    await usdt.mint(buyer1.address, 10000 * 10**6); // 10K USDT
    await usdt.mint(buyer2.address, 10000 * 10**6); // 10K USDT
    await usdc.mint(buyer1.address, 10000 * 10**6); // 10K USDC
    await usdc.mint(buyer2.address, 10000 * 10**6); // 10K USDC
  });

  describe("Deployment", function () {
    it("Should deploy with correct initial settings", async function () {
      expect(await seqico.seqToken()).to.equal(seqToken.address);
      expect(await seqico.usdt()).to.equal(usdt.address);
      expect(await seqico.usdc()).to.equal(usdc.address);
      expect(await seqico.pricePerTokenETH()).to.equal(ETH_PRICE_PER_TOKEN);
      expect(await seqico.pricePerTokenUSDT()).to.equal(USDT_PRICE_PER_TOKEN);
      expect(await seqico.pricePerTokenUSDC()).to.equal(USDC_PRICE_PER_TOKEN);
      expect(await seqico.owner()).to.equal(owner.address);
    });

    it("Should have SEQ tokens available for sale", async function () {
      const tokensForSale = ethers.utils.parseEther("100000");
      expect(await seqToken.balanceOf(seqico.address)).to.equal(tokensForSale);
    });
  });

  describe("ETH Purchases", function () {
    it("Should allow buying tokens with ETH", async function () {
      const tokenAmount = ethers.utils.parseEther("1000"); // Buy 1000 SEQ tokens
      const requiredETH = ETH_PRICE_PER_TOKEN.mul(tokenAmount).div(ethers.utils.parseEther("1"));
      
      const initialBalance = await seqToken.balanceOf(buyer1.address);
      
      await expect(
        seqico.connect(buyer1).buyWithETH(tokenAmount, { value: requiredETH })
      ).to.emit(seqico, "TokensPurchased")
        .withArgs(buyer1.address, tokenAmount, "ETH");

      expect(await seqToken.balanceOf(buyer1.address)).to.equal(initialBalance.add(tokenAmount));
    });

    it("Should refund excess ETH", async function () {
      const tokenAmount = ethers.utils.parseEther("1000");
      const requiredETH = ETH_PRICE_PER_TOKEN.mul(tokenAmount).div(ethers.utils.parseEther("1"));
      const excessETH = ethers.utils.parseEther("0.1");
      const totalSent = requiredETH.add(excessETH);

      const initialETHBalance = await buyer1.getBalance();
      
      const tx = await seqico.connect(buyer1).buyWithETH(tokenAmount, { value: totalSent });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);

      const finalETHBalance = await buyer1.getBalance();
      
      // Should only pay required ETH + gas, excess should be refunded
      expect(finalETHBalance).to.equal(initialETHBalance.sub(requiredETH).sub(gasUsed));
    });

    it("Should reject insufficient ETH", async function () {
      const tokenAmount = ethers.utils.parseEther("1000");
      const insufficientETH = ethers.utils.parseEther("0.0001");

      await expect(
        seqico.connect(buyer1).buyWithETH(tokenAmount, { value: insufficientETH })
      ).to.be.revertedWith("Insufficient ETH sent");
    });

    it("Should reject zero amount purchase", async function () {
      await expect(
        seqico.connect(buyer1).buyWithETH(0, { value: ethers.utils.parseEther("0.1") })
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should reject purchase when not enough SEQ tokens available", async function () {
      const tokenAmount = ethers.utils.parseEther("200000"); // More than available
      const requiredETH = ETH_PRICE_PER_TOKEN.mul(tokenAmount).div(ethers.utils.parseEther("1"));

      await expect(
        seqico.connect(buyer1).buyWithETH(tokenAmount, { value: requiredETH })
      ).to.be.revertedWith("Not enough SEQ tokens");
    });
  });

  describe("USDT Purchases", function () {
    it("Should allow buying tokens with USDT", async function () {
      const tokenAmount = ethers.utils.parseEther("1000"); // Buy 1000 SEQ tokens
      const requiredUSDT = USDT_PRICE_PER_TOKEN.mul(tokenAmount).div(ethers.utils.parseEther("1"));
      const requiredUSDTAdjusted = requiredUSDT.div(10**12); // Convert to 6 decimals

      // Approve USDT spending
      await usdt.connect(buyer1).approve(seqico.address, requiredUSDTAdjusted);

      const initialBalance = await seqToken.balanceOf(buyer1.address);
      
      await expect(
        seqico.connect(buyer1).buyWithUSDT(tokenAmount)
      ).to.emit(seqico, "TokensPurchased")
        .withArgs(buyer1.address, tokenAmount, "USDT");

      expect(await seqToken.balanceOf(buyer1.address)).to.equal(initialBalance.add(tokenAmount));
    });

    it("Should reject USDT purchase without approval", async function () {
      const tokenAmount = ethers.utils.parseEther("1000");

      await expect(
        seqico.connect(buyer1).buyWithUSDT(tokenAmount)
      ).to.be.revertedWith("Approve USDT first");
    });

    it("Should reject zero amount USDT purchase", async function () {
      await expect(
        seqico.connect(buyer1).buyWithUSDT(0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("USDC Purchases", function () {
    it("Should allow buying tokens with USDC", async function () {
      const tokenAmount = ethers.utils.parseEther("1000"); // Buy 1000 SEQ tokens
      const requiredUSDC = USDC_PRICE_PER_TOKEN.mul(tokenAmount).div(ethers.utils.parseEther("1"));
      const requiredUSDCAdjusted = requiredUSDC.div(10**12); // Convert to 6 decimals

      // Approve USDC spending
      await usdc.connect(buyer1).approve(seqico.address, requiredUSDCAdjusted);

      const initialBalance = await seqToken.balanceOf(buyer1.address);
      
      await expect(
        seqico.connect(buyer1).buyWithUSDC(tokenAmount)
      ).to.emit(seqico, "TokensPurchased")
        .withArgs(buyer1.address, tokenAmount, "USDC");

      expect(await seqToken.balanceOf(buyer1.address)).to.equal(initialBalance.add(tokenAmount));
    });

    it("Should reject USDC purchase without approval", async function () {
      const tokenAmount = ethers.utils.parseEther("1000");

      await expect(
        seqico.connect(buyer1).buyWithUSDC(tokenAmount)
      ).to.be.revertedWith("Approve USDC first");
    });

    it("Should reject zero amount USDC purchase", async function () {
      await expect(
        seqico.connect(buyer1).buyWithUSDC(0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Owner Functions", function () {
    it("Should allow owner to update SEQ token address", async function () {
      const newSEQToken = await SEQToken.deploy(
        ethers.utils.parseEther("1000"),
        owner.address,
        owner.address
      );
      
      await seqico.setSEQToken(newSEQToken.address);
      expect(await seqico.seqToken()).to.equal(newSEQToken.address);
    });

    it("Should not allow non-owner to update SEQ token address", async function () {
      const newSEQToken = await SEQToken.deploy(
        ethers.utils.parseEther("1000"),
        owner.address,
        owner.address
      );
      
      await expect(
        seqico.connect(buyer1).setSEQToken(newSEQToken.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow owner to withdraw ETH", async function () {
      // First, make a purchase to have ETH in the contract
      const tokenAmount = ethers.utils.parseEther("1000");
      const requiredETH = ETH_PRICE_PER_TOKEN.mul(tokenAmount).div(ethers.utils.parseEther("1"));
      
      await seqico.connect(buyer1).buyWithETH(tokenAmount, { value: requiredETH });

      const initialBalance = await owner.getBalance();
      const contractBalance = await ethers.provider.getBalance(seqico.address);

      await seqico.withdrawETH(owner.address);

      const finalBalance = await owner.getBalance();
      expect(finalBalance).to.be.gt(initialBalance.add(contractBalance).sub(ethers.utils.parseEther("0.01"))); // Account for gas
    });

    it("Should allow owner to withdraw ERC20 tokens", async function () {
      // First, make a USDT purchase to have USDT in the contract
      const tokenAmount = ethers.utils.parseEther("1000");
      const requiredUSDT = USDT_PRICE_PER_TOKEN.mul(tokenAmount).div(ethers.utils.parseEther("1"));
      const requiredUSDTAdjusted = requiredUSDT.div(10**12);

      await usdt.connect(buyer1).approve(seqico.address, requiredUSDTAdjusted);
      await seqico.connect(buyer1).buyWithUSDT(tokenAmount);

      const initialUSDTBalance = await usdt.balanceOf(owner.address);
      const contractUSDTBalance = await usdt.balanceOf(seqico.address);

      await seqico.withdrawERC20(usdt.address, owner.address);

      const finalUSDTBalance = await usdt.balanceOf(owner.address);
      expect(finalUSDTBalance).to.equal(initialUSDTBalance.add(contractUSDTBalance));
    });

    it("Should not allow non-owner to withdraw ETH", async function () {
      await expect(
        seqico.connect(buyer1).withdrawETH(buyer1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should not allow non-owner to withdraw ERC20", async function () {
      await expect(
        seqico.connect(buyer1).withdrawERC20(usdt.address, buyer1.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Integration with SEQ Token Security", function () {
    it("Should work with secure SEQ token transfers", async function () {
      const tokenAmount = ethers.utils.parseEther("1000");
      const requiredETH = ETH_PRICE_PER_TOKEN.mul(tokenAmount).div(ethers.utils.parseEther("1"));

      // Verify SEQ token security functions work
      expect(await seqToken.canTransfer(buyer1.address)).to.be.true;
      expect(await seqToken.getTransferTax()).to.equal(0);
      expect(await seqToken.getTransferAmount(tokenAmount)).to.equal(tokenAmount);

      // Make purchase
      await seqico.connect(buyer1).buyWithETH(tokenAmount, { value: requiredETH });

      // Verify buyer received full amount (no fees)
      expect(await seqToken.balanceOf(buyer1.address)).to.equal(tokenAmount);
    });

    it("Should maintain SEQ token security after purchase", async function () {
      const tokenAmount = ethers.utils.parseEther("1000");
      const requiredETH = ETH_PRICE_PER_TOKEN.mul(tokenAmount).div(ethers.utils.parseEther("1"));

      await seqico.connect(buyer1).buyWithETH(tokenAmount, { value: requiredETH });

      // Buyer should be able to transfer normally
      await seqToken.connect(buyer1).transfer(buyer2.address, ethers.utils.parseEther("500"));
      expect(await seqToken.balanceOf(buyer2.address)).to.equal(ethers.utils.parseEther("500"));
      expect(await seqToken.balanceOf(buyer1.address)).to.equal(ethers.utils.parseEther("500"));
    });
  });

  describe("Edge Cases", function () {
    it("Should handle multiple purchases from same buyer", async function () {
      const tokenAmount = ethers.utils.parseEther("500");
      const requiredETH = ETH_PRICE_PER_TOKEN.mul(tokenAmount).div(ethers.utils.parseEther("1"));

      // First purchase
      await seqico.connect(buyer1).buyWithETH(tokenAmount, { value: requiredETH });
      expect(await seqToken.balanceOf(buyer1.address)).to.equal(tokenAmount);

      // Second purchase
      await seqico.connect(buyer1).buyWithETH(tokenAmount, { value: requiredETH });
      expect(await seqToken.balanceOf(buyer1.address)).to.equal(tokenAmount.mul(2));
    });

    it("Should handle mixed payment method purchases", async function () {
      const tokenAmount = ethers.utils.parseEther("500");
      
      // Buy with ETH
      const requiredETH = ETH_PRICE_PER_TOKEN.mul(tokenAmount).div(ethers.utils.parseEther("1"));
      await seqico.connect(buyer1).buyWithETH(tokenAmount, { value: requiredETH });

      // Buy with USDT
      const requiredUSDT = USDT_PRICE_PER_TOKEN.mul(tokenAmount).div(ethers.utils.parseEther("1"));
      const requiredUSDTAdjusted = requiredUSDT.div(10**12);
      await usdt.connect(buyer1).approve(seqico.address, requiredUSDTAdjusted);
      await seqico.connect(buyer1).buyWithUSDT(tokenAmount);

      expect(await seqToken.balanceOf(buyer1.address)).to.equal(tokenAmount.mul(2));
    });

    it("Should emit correct events for all purchase types", async function () {
      const tokenAmount = ethers.utils.parseEther("100");

      // ETH purchase
      const requiredETH = ETH_PRICE_PER_TOKEN.mul(tokenAmount).div(ethers.utils.parseEther("1"));
      await expect(
        seqico.connect(buyer1).buyWithETH(tokenAmount, { value: requiredETH })
      ).to.emit(seqico, "TokensPurchased").withArgs(buyer1.address, tokenAmount, "ETH");

      // USDT purchase
      const requiredUSDT = USDT_PRICE_PER_TOKEN.mul(tokenAmount).div(ethers.utils.parseEther("1"));
      const requiredUSDTAdjusted = requiredUSDT.div(10**12);
      await usdt.connect(buyer1).approve(seqico.address, requiredUSDTAdjusted);
      await expect(
        seqico.connect(buyer1).buyWithUSDT(tokenAmount)
      ).to.emit(seqico, "TokensPurchased").withArgs(buyer1.address, tokenAmount, "USDT");

      // USDC purchase
      const requiredUSDC = USDC_PRICE_PER_TOKEN.mul(tokenAmount).div(ethers.utils.parseEther("1"));
      const requiredUSDCAdjusted = requiredUSDC.div(10**12);
      await usdc.connect(buyer1).approve(seqico.address, requiredUSDCAdjusted);
      await expect(
        seqico.connect(buyer1).buyWithUSDC(tokenAmount)
      ).to.emit(seqico, "TokensPurchased").withArgs(buyer1.address, tokenAmount, "USDC");
    });
  });
});