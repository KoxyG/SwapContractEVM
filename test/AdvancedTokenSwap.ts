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

    return { AK4Token };
  }

  async function deployGUZToken() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const erc20Token = await hre.ethers.getContractFactory("GUZToken");
    const GUZToken = await erc20Token.deploy();

    return { GUZToken };
  }

  async function deployW3BToken() {
    const [owner, otherAccount] = await hre.ethers.getSigners();

    const erc20Token = await hre.ethers.getContractFactory("W3BToken");
    const W3BToken = await erc20Token.deploy();

    return { W3BToken };
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
      const amountToDeposit = 100;
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
   
  });

  
});
