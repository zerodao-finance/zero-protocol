'use strict'

const hre = require('hardhat');
const { ethers } = hre;

(async () => {
  const badger = await hre.ethers.getContract('BadgerBridgeZeroController');
  const [ signer ] = await hre.ethers.getSigners();
  const value = await signer.provider.getStorageAt(badger.address, ethers.utils.hexlify(ethers.BigNumber.from(ethers.utils.solidityKeccak256(['string'], ['eip1967.proxy.admin'])).sub(1)))
  console.log(ethers.utils.getAddress(value));
})().catch(console.error);

