// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "./AccountabilityNFTs.sol";

// https://docs.openzeppelin.com/contracts/4.x/api/security#ReentrancyGuard
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Accountability is ReentrancyGuard {
    // Store the NFT collection smart contract in this variable
    AccountabilityNFTs public nftContractAddress;
    
    constructor(AccountabilityNFTs _nftContractAddress) {
      // Define the NFT contract address
      nftContractAddress = _nftContractAddress;
    }
    
    struct LockedFunds {
        uint amount;     // the amount of funds locked up
        uint lockedFor;  // the time the funds were locked for
        uint lockedAt;   // the time the funds were locked at
    }

    // the wallet addres is the key that maps to a LockedFunds struct
    mapping(address => LockedFunds) public lockedFunds;
    

    // 1. Store the amount of ETH each address has deposited in this smart contract
    // this will go inside a mapping of address to uint
    // we need another mapping that stores when each user deposited their ETH
    // and for how long they want to lock up their ETH
    function deposit(uint _lockedFor) public payable {
        // First check if the user already has ETH locked up
        require(lockedFunds[msg.sender].amount == 0, "You already have ETH locked up");

        require(lockedFunds[msg.sender].amount == 0, "You already have ETH locked up");
        require(_lockedFor <= 30 days, "You can only lock up your ETH for 30 days");
        require(_lockedFor >= 1 days, "You need to lock up your ETH for at least 1 day");

        // update LockedFunds struct
        lockedFunds[msg.sender].amount = msg.value;
        lockedFunds[msg.sender].lockedAt = block.timestamp;
        lockedFunds[msg.sender].lockedFor = _lockedFor;

        // mint an NFT for the user using the mint function in the AccountabilityNFTs contract
        // nftContractAddress.mint(msg.sender);
    }
    
    // 2. withdraw function thath checks if user owns an NFT and if so, withdraws their ETH
    // if they dont, revert the transaction
    function withdraw() public nonReentrant {
        require(lockedFunds[msg.sender].amount > 0, "You don't have any ETH locked up");
        // check if the user has locked up their ETH for at least 1 day
        require(lockedFunds[msg.sender].lockedAt + lockedFunds[msg.sender].lockedFor <= block.timestamp, "You need to wait until your ETH is unlocked");
        require(nftContractAddress.balanceOf(msg.sender) > 0, "You need to own an NFT to withdraw your ETH");

        // transfer the ETH to the user
        payable(msg.sender).transfer(lockedFunds[msg.sender].amount);

        // reset the user's lockedFunds struct
        lockedFunds[msg.sender].amount = 0;
        lockedFunds[msg.sender].lockedAt = 0;
        lockedFunds[msg.sender].lockedFor = 0;
    }
}