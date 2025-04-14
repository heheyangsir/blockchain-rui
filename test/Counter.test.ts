import { expect } from "chai";
import hre from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("Counter", function () {
  async function deployCounterFixture() {
    // 部署 Counter 合约
    const [owner, otherAccount] = await hre.viem.getWalletClients();
    const counter = await hre.viem.deployContract("Counter", []);

    return { counter, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should initialize count to 0", async function () {
      const { counter } = await loadFixture(deployCounterFixture);

      const count = await counter.read.get();
      expect(count).to.equal(0n);
    });
  });

  describe("Testing Add() Methods", function () {
    it("Should increment count by 1 when add is called", async function () {
      const { counter } = await loadFixture(deployCounterFixture);

      const bcount = await counter.read.get();
      console.log("Count before add:", bcount);

      await counter.write.add();
      const acount = await counter.read.get();
      console.log("Count after add:", acount);

      expect(acount).to.equal(bcount + 1n);
    });

    it("Should allow multiple increments", async function () {
      const { counter } = await loadFixture(deployCounterFixture);

      await counter.write.add();
      await counter.write.add();
      const count = await counter.read.get();
      expect(count).to.equal(2n);
    });
  });
});
