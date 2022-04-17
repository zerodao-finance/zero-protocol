'use strict';

const hre = require('hardhat');
const gasnow = require('ethers-gasnow');

hre.ethers.providers.BaseProvider.prototype.getGasPrice = gasnow.createGetGasPrice();

module.exports = async () => {
  const [ signer ] = await hre.ethers.getSigners();
  console.log(await hre.deployments.deploy('BadgerBridgeZeroController', {
    contractName: 'BadgerBridgeZeroController',
    args: [],
    libraries: {},
    from: await signer.getAddress()
  }));
};
