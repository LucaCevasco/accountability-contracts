import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import "@nomicfoundation/hardhat-toolbox";
import { expect } from "chai";

import { ethers } from "hardhat"

const oneWeek = 604800;
const amountToTest = ethers.utils.parseEther("1.0");

describe("Accountability contract", function () {
  async function deployContractAccountability() {
    const AccountabilityFactory = await ethers.getContractFactory("Accountability");
    const AccountabilityNFTsFactory = await ethers.getContractFactory("AccountabilityNFTs");

    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const accountabilityNFTs = await AccountabilityNFTsFactory.deploy(
      "AccountabilityNFTs",
      "ANFT",
      owner.address,
      0,
      owner.address,
    );

    await accountabilityNFTs.deployed();

    const accountability = await AccountabilityFactory.deploy(accountabilityNFTs.address);

    await accountability.deployed();

    console.log("AccountabilityNFTs deployed to:", accountabilityNFTs.address);
    console.log("Accountability deployed to:", accountability.address);

    return { accountability, accountabilityNFTs, owner, addr1, addr2, addr3 };
  }

  it("Should be able to deposit funds", async function () {
    const { accountability, owner } = await loadFixture(deployContractAccountability);

    await accountability.deposit(oneWeek, { value: amountToTest });

    const depositedFunds = (await accountability.lockedFunds(owner.address)).amount;
    const lockedTime = (await accountability.lockedFunds(owner.address)).lockedFor;

    expect(depositedFunds).to.equal(amountToTest);
    expect(lockedTime).to.equal(oneWeek);

  });

  it("Should reject a withdrawal if the user doesn't have an NFT from the contract or the time hasnt passed yet", async function () {
    const { accountability } = await loadFixture(deployContractAccountability);

    await accountability.deposit(oneWeek, { value: amountToTest });

    // reject withdrawal if the time hasnt passed yet
    await expect(accountability.withdraw()).to.be.revertedWith("You need to wait until your ETH is unlocked");

    // simulate passing the time for one week
    await ethers.provider.send("evm_increaseTime", [oneWeek]);

    // reject withdrawal if the user doesn't have an NFT from the contract
    await expect(accountability.withdraw()).to.be.revertedWith("You need to own an NFT to withdraw your ETH");
  });

  it("Should reject a withdrawal if the user has 0 funds", async function () {
    const { accountability } = await loadFixture(deployContractAccountability);

    await expect(accountability.withdraw()).to.be.revertedWith("You don't have any ETH locked up");
  });

  // Succesfully withdraw funds if the user has an NFT and the time has passed
  it("Should be able to withdraw funds", async function () {
    const { owner, accountabilityNFTs, accountability } = await loadFixture(deployContractAccountability);

    await accountability.deposit(oneWeek, { value: amountToTest });

    await accountabilityNFTs.mintTo(owner.address, "URI");

    // simulate passing the time for one week
    await ethers.provider.send("evm_increaseTime", [oneWeek]);

    // Now we should be able to withdraw the funds
    await accountability.withdraw();

    // Expect the lockedFunds mapping to have 0 funds
    const depositedFunds = (await accountability.lockedFunds(owner.address)).amount;
    expect(depositedFunds).to.equal(0);

  });
  // maybe lets try replicate some kind of reentrancy attack
});