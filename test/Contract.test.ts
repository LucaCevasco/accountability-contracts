import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import "@nomicfoundation/hardhat-toolbox";
import { expect } from "chai";

import { ethers } from "hardhat"

describe("Accountability contract", function () {
  // Should be able to deploy the contract
  async function deployContractAccountability() {
    const AccountabilityFactory = await ethers.getContractFactory("Accountability");
    const AccountabilityNFTsFactory = await ethers.getContractFactory("AccountabilityNFTs");

    const [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const accountabilityNFTs = await AccountabilityNFTsFactory.deploy();

    await accountabilityNFTs.deployed();

    const accountability = await AccountabilityFactory.deploy(accountabilityNFTs.address);

    await accountability.deployed();

    console.log("AccountabilityNFTs deployed to:", accountabilityNFTs.address);
    console.log("Accountability deployed to:", accountability.address);

    return { accountability, accountabilityNFTs, owner, addr1, addr2, addr3 };
  }

  // should be able to deposit funds using the deposit function
  it("Should be able to deposit funds", async function () {
    const { accountability, accountabilityNFTs, owner, addr1, addr2, addr3 } = await loadFixture(deployContractAccountability);
    await accountability.deposit({ value: 1000 });
  });
  // should reject a withdrawal if the user doesn't have an NFT from the contract

  // should reject a withdrawal if the user has 0 funds

  // maybe lets try replicate some kind of reentrancy attack
});