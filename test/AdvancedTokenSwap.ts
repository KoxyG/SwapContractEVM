import {
  time,
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import hre from "hardhat";

describe("Lock", function () {
  
  async function deployAK4Token() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const erc20Token = await hre.ethers.getContractFactory("AK4Token");
    const AK4Token = await erc20Token.deploy();

    return { AK4Token, owner };
  }

  async function deployGUZToken() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const erc20Token = await hre.ethers.getContractFactory("GUZToken");
    const GUZToken = await erc20Token.deploy();

    return { GUZToken };
  }

  async function deployW3BToken() {
    const [buyer] = await hre.ethers.getSigners();

    const erc20Token = await hre.ethers.getContractFactory("W3BToken");
    const W3BToken = await erc20Token.deploy();

    return { W3BToken, buyer };
  }

  async function deployAdvancedTokenSwap() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const advancedTokenSwap = await hre.ethers.getContractFactory("AdvancedTokenSwap");
    const AdvancedTokenSwap = await advancedTokenSwap.deploy();

    return { AdvancedTokenSwap };
  }



  describe("Deployment", function () {
    it("Deposit 100 AK4Token successfully", async function () {
      // Deploy contracts
      const { AK4Token } = await loadFixture(deployAK4Token);
      const { GUZToken } = await loadFixture(deployGUZToken);
      const { W3BToken } = await loadFixture(deployW3BToken);
      const { AdvancedTokenSwap } = await loadFixture(deployAdvancedTokenSwap);

      // Approve token transfer
      const amountToDeposit = 1000;
      await AK4Token.approve(AdvancedTokenSwap, amountToDeposit);

      // Deposit tokens
      const depositTx = await AdvancedTokenSwap.depositToken(
        AK4Token,
        amountToDeposit,
        [GUZToken, W3BToken]
      );

      await depositTx.wait();

     
      const depositDetails = await AdvancedTokenSwap.getDepositDetails(1);

      expect(depositDetails.amountDeposited).to.equal(amountToDeposit);
      expect(depositDetails.tokenDeposited).to.equal(AK4Token);

      
    });

    it("Deposit 200 GUZToken successfully", async function () {
      // Deploy contracts
      const { AK4Token } = await loadFixture(deployAK4Token);
      const { GUZToken } = await loadFixture(deployGUZToken);
      const { W3BToken } = await loadFixture(deployW3BToken);
      const { AdvancedTokenSwap } = await loadFixture(deployAdvancedTokenSwap);

      // Approve token transfer
      const amountToDeposit = 200;
      await GUZToken.approve(AdvancedTokenSwap, amountToDeposit);

      // Deposit tokens
      const depositTx = await AdvancedTokenSwap.depositToken(
        GUZToken,
        amountToDeposit,
        [AK4Token, W3BToken]
      );

      await depositTx.wait();

     
      const depositDetails = await AdvancedTokenSwap.getDepositDetails(1);

      expect(depositDetails.amountDeposited).to.equal(amountToDeposit);
      expect(depositDetails.tokenDeposited).to.equal(GUZToken);  
    });

    it("Purchase 50 AK4Token with 100 W3BToken successfully", async function () {
      // Deploy contracts
      const { AK4Token, owner } = await loadFixture(deployAK4Token);
      const { GUZToken } = await loadFixture(deployGUZToken);
      const { W3BToken, buyer } = await loadFixture(deployW3BToken);
      const { AdvancedTokenSwap } = await loadFixture(deployAdvancedTokenSwap);
    
      // Get signers
      const [signer1] = await hre.ethers.getSigners();
    
      // First, deposit AK4Tokens
      const depositAmount = 100;
      await AK4Token.approve(AdvancedTokenSwap, depositAmount);
      await AdvancedTokenSwap.depositToken(AK4Token, depositAmount, [W3BToken, GUZToken]);
    
      // Prepare for purchase
      const purchaseAmount = 100;
      const receiveAmount = 50;
    

      await W3BToken.connect(buyer).approve(AdvancedTokenSwap, purchaseAmount);
    
      // Buyer purchases AK4Tokens
      await expect(AdvancedTokenSwap.connect(buyer).purchaseToken(
        1,
        W3BToken,
        purchaseAmount,
        receiveAmount
      )).to.emit(AdvancedTokenSwap, "TokenPurchased");
  
    });

   
  });

  
});
